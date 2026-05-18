// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTO MULTIJUGADOR
// ═══════════════════════════════════════════════════════════════════════════════
import React, { createContext } from "react";
import { FB, genSalaId } from "../utils/firebase";

// ── Constantes de limpieza ──────────────────────────────────────────────────
// SALA_TTL_MS: una sala se considera expirada después de 8 días de inactividad.
// Debe coincidir EXACTAMENTE con el TTL de las reglas de seguridad de la DB
// (rules.json: now - lastActivity < 691200000).
const SALA_TTL_MS    = 8 * 24 * 60 * 60 * 1000; // 8 días
// PLAYER_GHOST_MS: un jugador sin heartbeat por más de 60s se considera fantasma.
// Coincide con el filtro visual de listenPlayers (now - lastSeen < 60000).
const PLAYER_GHOST_MS = 60 * 1000; // 60 segundos
// MAX_SALAS_CLEANUP: cap defensivo para que la limpieza al crear sala no
// demore demasiado si hay muchas salas acumuladas.
const MAX_SALAS_CLEANUP = 50;

// ── Helper: limpiar jugadores fantasma de una sala ─────────────────────────
// Borra de salas/$sid/jugadores los entries cuyo lastSeen es viejo.
// Preserva __hostId (no es un jugador). Si el hostId apunta a un jugador
// que ya no existe, NO se toca acá: la host migration ya se encarga.
async function cleanupGhostPlayers(sid){
  try{
    const players = await FB.get(`salas/${sid}/jugadores`);
    if(!players) return;
    const now = Date.now();
    const toRemove = [];
    for(const id of Object.keys(players)){
      if(id === "__hostId") continue;
      const p = players[id];
      if(p?.lastSeen && (now - p.lastSeen) > PLAYER_GHOST_MS){
        toRemove.push(id);
      }
    }
    // Borrar en paralelo. No await individual: si una falla no afecta al resto.
    await Promise.all(toRemove.map(id =>
      FB.remove(`salas/${sid}/jugadores/${id}`)
    ));
  }catch(e){}
}

// ── Helper: limpiar salas viejas de la DB ──────────────────────────────────
// Lee salas/, identifica las que tienen lastActivity de hace más de SALA_TTL_MS
// (o creadaEn si no hay lastActivity), y las borra. Cap defensivo en
// MAX_SALAS_CLEANUP para no demorar la creación de sala si hay muchas.
async function cleanupOldSalas(){
  try{
    const salas = await FB.get("salas");
    if(!salas) return;
    const now = Date.now();
    const ids = Object.keys(salas).slice(0, MAX_SALAS_CLEANUP);
    const toRemove = [];
    for(const sid of ids){
      const sala = salas[sid];
      // Preferir lastActivity (lo que usan las reglas), caer a creadaEn si no existe
      const ts = sala?.lastActivity ?? sala?.creadaEn;
      if(ts && (now - ts) > SALA_TTL_MS){
        toRemove.push(sid);
      }
    }
    await Promise.all(toRemove.map(sid => FB.remove(`salas/${sid}`)));
  }catch(e){}
}

export const MultiplayerContext = createContext({
  salaId: null,
  isHost: false,
  online: false,
  jugadores: 0,
  crearSala: async ()=>{},
  unirseASala: async ()=>false,
  salirDeSala: ()=>{},
  pushGameState: ()=>{},
  onRemoteState: null,
});

export function MultiplayerProvider({ children }){
  const [salaId,    setSalaId]    = React.useState(null);
  const [isHost,    setIsHost]    = React.useState(false);
  const [online,    setOnline]    = React.useState(false);
  const [jugadores, setJugadores] = React.useState(0);
  const [onRemoteState, setOnRemoteState] = React.useState(null);

  const myId       = React.useRef("p_"+Date.now()+"_"+Math.random().toString(36).slice(2,6));
  const unlistenGs = React.useRef(null);
  const unlistenPl = React.useRef(null);
  const heartbeat  = React.useRef(null);
  const salaIdRef  = React.useRef(null);
  const isHostRef  = React.useRef(false);

  // ── Heartbeat: actualiza lastSeen cada 20s ────────────────────────────────
  // Si soy host, además: (a) refresco salas/$sid/lastActivity para evitar
  // que las reglas de TTL bloqueen writes, y (b) limpio jugadores fantasma
  // de la sala. Se hace solo en el host para no duplicar trabajo.
  const startHeartbeat = (sid) => {
    stopHeartbeat();
    heartbeat.current = setInterval(async ()=>{
      await FB.patch(`salas/${sid}/jugadores/${myId.current}`, { lastSeen: Date.now() });
      if(isHostRef.current){
        await FB.setField(`salas/${sid}/lastActivity`, Date.now());
        cleanupGhostPlayers(sid); // fire-and-forget
      }
    }, 20000);
  };
  const stopHeartbeat = () => {
    if(heartbeat.current){ clearInterval(heartbeat.current); heartbeat.current=null; }
  };

  // ── Escuchar lista de jugadores (para contar y host migration) ────────────
  const listenPlayers = (sid) => {
    if(unlistenPl.current) unlistenPl.current();
    unlistenPl.current = FB.listen(`salas/${sid}/jugadores`, (data)=>{
      if(!data || !data.data) return;
      const players = data.data;
      const ids = Object.keys(players||{});

      // Host migration: si el host se fue, el primer jugador conectado toma el control
      const hostId = players.__hostId;
      const now = Date.now();
      // alive = jugadores reales (excluye metadata __hostId y conexiones caídas hace >60s)
      const alive = ids.filter(id=>id!=="__hostId"&&players[id]?.lastSeen&&(now-players[id].lastSeen)<60000);
      setJugadores(alive.length);
      if(hostId && !alive.includes(hostId) && alive.length>0){
        // El host se desconectó — el primero en la lista toma el control
        const sorted = alive.sort((a,b)=>(players[a].joinedAt||0)-(players[b].joinedAt||0));
        const newHost = sorted[0];
        if(newHost === myId.current){
          FB.patch(`salas/${sid}/jugadores`, { __hostId: myId.current });
          setIsHost(true);
          isHostRef.current = true;
        }
      }
      // Actualizar si soy host
      if(players.__hostId === myId.current){
        setIsHost(true); isHostRef.current = true;
      }
    });
  };

  // ── Escuchar gameState remoto ─────────────────────────────────────────────
  const listenGameState = (sid) => {
    if(unlistenGs.current) unlistenGs.current();
    unlistenGs.current = FB.listen(`salas/${sid}/gameState`, (data)=>{
      if(!data || !data.data) return;
      // Todos reciben y aplican (sincronización bidireccional)
      setOnRemoteState(()=>data.data);
    });
  };

  // ── Crear sala (host) ─────────────────────────────────────────────────────
  // Además de crear la sala, dispara un cleanup en background de salas viejas
  // (fire-and-forget para no demorar la creación).
  const crearSala = async (gameState) => {
    cleanupOldSalas(); // fire-and-forget: corre mientras creamos la sala
    const sid = genSalaId();
    const now = Date.now();
    await FB.set(`salas/${sid}`, {
      creadaEn: now,
      lastActivity: now, // necesario para que las reglas de TTL permitan writes
      gameState,
      jugadores: {
        __hostId: myId.current,
        [myId.current]: { joinedAt: now, lastSeen: now },
      },
    });
    salaIdRef.current = sid;
    setSalaId(sid);
    setIsHost(true);
    isHostRef.current = true;
    setOnline(true);
    startHeartbeat(sid);
    listenGameState(sid);
    listenPlayers(sid);
    return sid;
  };

  // ── Unirse a sala ─────────────────────────────────────────────────────────
  // Si la sala no existe, retorna false. Si está expirada (lastActivity
  // demasiado vieja), también retorna false: las reglas de la DB
  // bloquearían el write del jugador igual, así que mejor avisar antes.
  const unirseASala = async (sid) => {
    const sala = await FB.get(`salas/${sid}`);
    if(!sala) return false;
    // Validar TTL (mismo umbral que las reglas de la DB)
    const ts = sala.lastActivity ?? sala.creadaEn;
    if(ts && (Date.now() - ts) > SALA_TTL_MS){
      return false;
    }
    await FB.patch(`salas/${sid}/jugadores`, {
      [myId.current]: { joinedAt: Date.now(), lastSeen: Date.now() },
    });
    salaIdRef.current = sid;
    setSalaId(sid);
    setIsHost(false);
    isHostRef.current = false;
    setOnline(true);
    startHeartbeat(sid);
    listenGameState(sid);
    listenPlayers(sid);
    return sala.gameState || true;
  };

  // ── Salir de sala ─────────────────────────────────────────────────────────
  const salirDeSala = async () => {
    const sid = salaIdRef.current;
    if(sid){
      await FB.remove(`salas/${sid}/jugadores/${myId.current}`);
    }
    stopHeartbeat();
    if(unlistenGs.current){ unlistenGs.current(); unlistenGs.current=null; }
    if(unlistenPl.current){ unlistenPl.current(); unlistenPl.current=null; }
    salaIdRef.current = null;
    setSalaId(null);
    setIsHost(false);
    isHostRef.current = false;
    setOnline(false);
    setJugadores(0);
    setOnRemoteState(null);
  };

  // ── Push gameState (cualquier participante puede enviar cambios) ───────────
  const pushGameState = async (state) => {
    const sid = salaIdRef.current;
    if(!sid) return;
    await FB.set(`salas/${sid}/gameState`, state);
  };

  return(
    <MultiplayerContext.Provider value={{
      salaId, isHost, online, jugadores,
      crearSala, unirseASala, salirDeSala,
      pushGameState, onRemoteState,
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
}