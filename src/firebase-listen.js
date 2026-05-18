// ╔════════════════════════════════════════════════════════════════════════╗
// ║ FIREBASE LISTENER — SSE en tiempo real con fallback a polling         ║
// ╚════════════════════════════════════════════════════════════════════════╝
//
// Provee `createListener(FB_DB_URL, FB_API_KEY)` que devuelve una función
// con la misma firma que el polling original:
//
//   listen(path, onData, onError) => unlistenFn
//
// El callback recibe SIEMPRE el objeto completo bajo el path raíz, igual
// que con polling. Internamente el listener mantiene un cache del estado
// actual y aplica los `patch`s parciales sobre ese cache antes de notificar.
//
// Estrategia:
//   1. Intenta conectar por SSE (EventSource).
//      - En web usa el EventSource nativo del browser.
//      - En Android/iOS usa react-native-sse.
//   2. Si SSE falla 3 veces consecutivas (sin recibir nada), cae a polling.
//   3. La detección de plataforma se hace DENTRO de la función para evitar
//      el bug viejo de Platform.OS evaluado a nivel de módulo.
//
// NOTA SOBRE AUTH: el SSE va sin ?auth= porque Firebase rechaza con 401
// cuando ?auth= no es un JWT válido (FB_API_KEY no lo es). Funciona porque
// las reglas de la Realtime DB están abiertas. El polling de fallback sí
// lleva auth para mantener el comportamiento original.

import { Platform } from 'react-native';
import RNEventSource from 'react-native-sse';

// ── Aplicar un patch parcial sobre un cache (mutativo controlado) ──────
// Firebase manda patches con paths absolutos relativos al path suscripto.
// Ejemplo: si suscribiste a "salas/ABCD/jugadores", un patch puede venir
// con path="/p_xxx/lastSeen" y data=1776751581834.
//
// Esta función navega el cache hasta el lugar correcto, crea los objetos
// intermedios si no existen, y setea el valor.
//
// IMPORTANTE: cuando Firebase emite value=null significa "borrado" (ej:
// un array que quedó vacío, o un nodo eliminado). NO borramos la key del
// cache: la preservamos con valor null. Así el consumer puede distinguir
// "nunca vino info" (key undefined) de "fue borrado" (key=null) y limpiar
// su state local en el segundo caso.
function applyPatch(cache, relPath, value){
  // Normalizar el path: "/p_xxx/lastSeen" → ["p_xxx", "lastSeen"]
  const segments = (relPath || "/").split("/").filter(Boolean);

  if(segments.length === 0){
    // Patch a la raíz: el value es un objeto que se mergea al cache
    if(value === null || value === undefined) return null;
    if(typeof value !== 'object' || Array.isArray(value)) return value;
    const merged = { ...(cache && typeof cache === 'object' ? cache : {}) };
    for(const k of Object.keys(value)){
      // Preservar null (borrado explícito) en vez de delete: el consumer
      // necesita poder distinguir "no vino" (undefined) de "fue borrado" (null).
      merged[k] = value[k];
    }
    return merged;
  }

  // Patch a un sub-path: navegar y setear
  // IMPORTANTE: al clonar nodos intermedios, hay que preservar arrays (no
  // reemplazarlos por {}). Si lo hacemos, perdemos todos los hermanos.
  // Ej: si el cache tiene enemies:[A,B,C] y llega un patch a enemies/1/currentHp,
  // necesitamos clonar enemies como [...arr], NO como {}, para no perder A y C.
  const cloneNode = (node) => {
    if(Array.isArray(node)) return [...node];
    if(node && typeof node === 'object') return { ...node };
    return {};
  };

  const root = cloneNode(cache);
  let cursor = root;
  for(let i = 0; i < segments.length - 1; i++){
    const seg = segments[i];
    cursor[seg] = cloneNode(cursor[seg]);
    cursor = cursor[seg];
  }
  const lastSeg = segments[segments.length - 1];
  // NOTA: cuando Firebase borra un nodo (escribir array vacío, por ejemplo,
  // hace que el nodo desaparezca), emite value=null. NO borramos la key del
  // cache con `delete`, porque el consumer necesita distinguir:
  //   - key ausente     = nunca existió (no vino info)
  //   - key con null    = fue borrada explícitamente (hay que limpiar local)
  // Si `delete`ásemos, el effect de onRemoteState leería undefined y no
  // actualizaría el state local, dejándolo desincronizado.
  cursor[lastSeg] = (value === undefined) ? null : value;
  return root;
}

export function createListener(FB_DB_URL, FB_API_KEY){

  // ── Polling clásico (red de seguridad) ──────────────────────────────────
  function startPolling(path, onData, onError){
    const url = `${FB_DB_URL}/${path}.json?auth=${FB_API_KEY}`;
    let lastData = null;
    let active = true;

    const poll = async () => {
      while(active){
        try{
          const r = await fetch(url);
          if(r.ok){
            const json = await r.json();
            const str = JSON.stringify(json);
            if(str !== lastData){
              lastData = str;
              if(json !== null) onData({ path:"/", data: json });
            }
          }
        }catch(e){ if(onError) onError(e); }
        await new Promise(res => setTimeout(res, 2000));
      }
    };
    poll();
    return ()=>{ active = false; };
  }

  // ── SSE (tiempo real real) ──────────────────────────────────────────────
  function startSSE(path, onData, onError, onFatalError){
    const url = `${FB_DB_URL}/${path}.json`;
    const isWeb = Platform.OS === 'web';
    const platformLabel = isWeb ? 'web' : Platform.OS;

    let es = null;
    let receivedAny = false;
    let errorCount = 0;
    // Cache local del estado completo bajo el path suscripto.
    // Se inicializa con el primer `put` y se actualiza con `patch`s.
    let cache = null;

    try{
      if(isWeb){
        es = new EventSource(url);
      } else {
        es = new RNEventSource(url, {
          headers: { 'Accept': 'text/event-stream' },
        });
      }
      console.log(`[FB.listen][${platformLabel}] SSE conectando a ${path}`);
    }catch(e){
      console.warn(`[FB.listen][${platformLabel}] no se pudo crear EventSource:`, e?.message || e);
      if(onFatalError) onFatalError(e);
      return ()=>{};
    }

    // Firebase emite por SSE:
    //   put     → reemplazo: data = { path: "/sub/path", data: {...} }
    //   patch   → merge:     data = { path: "/sub/path", data: {...} }
    //   keep-alive → ignorar
    //   cancel / auth_revoked → conexión cortada por el server

    const handlePut = (rawData) => {
      try{
        const parsed = JSON.parse(rawData);
        const relPath = parsed?.path || "/";
        const value = parsed?.data;

        if(relPath === "/"){
          // Reemplazo total del estado bajo el path suscripto
          cache = value;
        } else {
          // Reemplazo de un sub-path: misma lógica que patch pero pisando
          cache = applyPatch(cache, relPath, value);
        }

        if(!receivedAny){
          console.log(`[FB.listen][${platformLabel}] primer evento recibido (${path})`);
          receivedAny = true;
        }
        errorCount = 0;
        if(cache !== null && cache !== undefined){
          onData({ path: "/", data: cache });
        }
      }catch(e){
        console.warn(`[FB.listen][${platformLabel}] error parseando put:`, e?.message || e);
        if(onError) onError(e);
      }
    };

    const handlePatch = (rawData) => {
      try{
        const parsed = JSON.parse(rawData);
        const relPath = parsed?.path || "/";
        const value = parsed?.data;

        cache = applyPatch(cache, relPath, value);
        receivedAny = true;
        errorCount = 0;
        if(cache !== null && cache !== undefined){
          onData({ path: "/", data: cache });
        }
      }catch(e){
        console.warn(`[FB.listen][${platformLabel}] error parseando patch:`, e?.message || e);
        if(onError) onError(e);
      }
    };

    if(isWeb){
      es.addEventListener('put',   (e) => handlePut(e.data));
      es.addEventListener('patch', (e) => handlePatch(e.data));
      es.addEventListener('keep-alive', () => {});
      es.addEventListener('cancel', (e) => {
        console.warn(`[FB.listen][${platformLabel}] cancel:`, e?.data);
        if(onError) onError(new Error('SSE cancel'));
      });
      es.addEventListener('auth_revoked', () => {
        console.warn(`[FB.listen][${platformLabel}] auth_revoked`);
        if(onError) onError(new Error('SSE auth_revoked'));
      });
      es.onerror = (e) => {
        errorCount++;
        if(onError) onError(e);
        if(!receivedAny && errorCount >= 3){
          if(onFatalError) onFatalError(new Error('SSE failed 3 times without data'));
        }
      };
    } else {
      es.addEventListener('put',   (e) => handlePut(e.data));
      es.addEventListener('patch', (e) => handlePatch(e.data));
      es.addEventListener('error', (e) => {
        errorCount++;
        console.warn(`[FB.listen][${platformLabel}] error #${errorCount}:`, e?.message || e?.type);
        if(onError) onError(e);
        if(!receivedAny && errorCount >= 3){
          if(onFatalError) onFatalError(new Error('SSE failed 3 times without data'));
        }
      });
    }

    return ()=>{
      try{ es && es.close && es.close(); }catch(e){}
    };
  }

  // ── Listener público: SSE primero, fallback a polling ──────────────────
  return function listen(path, onData, onError){
    let currentUnlisten = null;
    let stopped = false;

    const fallbackToPolling = (reason) => {
      if(stopped) return;
      console.warn('[FB.listen] SSE failed, falling back to polling:', reason?.message || reason);
      if(currentUnlisten) currentUnlisten();
      currentUnlisten = startPolling(path, onData, onError);
    };

    currentUnlisten = startSSE(path, onData, onError, fallbackToPolling);

    return ()=>{
      stopped = true;
      if(currentUnlisten) currentUnlisten();
    };
  };
}