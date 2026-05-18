// ═══════════════════════════════════════════════════════════════════════════════
// useFirebaseSync — sincronización del tracker con Firebase + AsyncStorage
//
// Provee:
//   - Writers granulares (writeEnemyField, writeEnemiesArray,
//     writeInitOrderArray, writeMonsterOrderArray)
//   - Atajos applyEnemyHp/Shield/Statuses (estado local + Firebase en una llamada)
//   - autoSave (AsyncStorage)
//   - applyingRemote (ref) y enemiesRef
//   - Effect que aplica onRemoteState (estado remoto recibido) sobre los setters
//   - Effect que dispara autoSave + push parcial a Firebase cuando cambian
//     campos NO migrados a granular (turnos, ronda, initNumbers, etc.)
//
// Diseño:
// El push parcial NO incluye enemies/initOrder/monsterOrder porque cada uno
// tiene su propio writer granular y de esa forma evitamos pisar cambios
// concurrentes en distintas zonas de la sala.
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FB } from "../../../utils/firebase";
import { AUTOSAVE_KEY } from "../../../data";

export default function useFirebaseSync({
  // estado y setters
  enemies,            setEnemies,
  initOrder,          setInitOrder,
  monsterOrder,       setMonsterOrder,
  activeTurnId,       setActiveTurnId,
  doneTurnIds,        setDoneTurnIds,
  roundActive,        setRoundActive,
  initNumbers,        setInitNumbers,
  skipThisRound,      setSkipThisRound,
  scenarioLvl,        setScenarioLvl,
  // contexto multiplayer y derivados
  online, salaId, onRemoteState,
  viewerMode,
  // info de la partida
  scenarioNum, classes,
  currentSaveId,
  // función para serializar estado completo
  buildSaveState,
}){
  // Ref auxiliar para que applyingRemote no se restablezca entre renders
  const applyingRemote = React.useRef(false);

  // hasBeenActive: se activa la primera vez que enemies tiene elementos o
  // roundActive=true. Una vez activo, queda activo hasta el unmount.
  // Distingue "estado inicial vacío" (NO guardar/pushear) de "estado terminado
  // vacío" (SÍ guardar/pushear — por ejemplo fin de ronda sin enemigos vivos).
  // Sin esto, el early return dejaba Firebase con roundActive=true viejo y
  // el próximo eco re-encendía el botón FIN localmente.
  const hasBeenActive = React.useRef(false);
  if(!hasBeenActive.current && (enemies.length > 0 || roundActive)){
    hasBeenActive.current = true;
  }

  // enemiesRef mantiene el array al día para que los writers calculen el idx
  // correcto sin depender de la closure del render donde fueron creados.
  const enemiesRef = React.useRef(enemies);
  React.useEffect(()=>{ enemiesRef.current = enemies; }, [enemies]);

  // ── ESCRITURAS GRANULARES A FIREBASE ────────────────────────────────────────

  // Escribe un campo específico de un enemigo a Firebase (path granular).
  // Solo escribe si estamos online y no estamos hidratando estado remoto.
  // Si el enemigo no existe (ya fue removido), no hace nada.
  const writeEnemyField = React.useCallback((eid, field, value) => {
    if(!online || applyingRemote.current) return;
    if(viewerMode) return; // modo viz: no escribir a Firebase
    const sid = salaId;
    if(!sid) return;
    const idx = enemiesRef.current.findIndex(e => e.id === eid);
    if(idx < 0) return;
    FB.setField(`salas/${sid}/gameState/enemies/${idx}/${field}`, value);
  }, [online, salaId, viewerMode]);

  // Helpers públicos: cambian el estado local Y escriben granular a Firebase.
  // Reemplazan llamadas directas a setEnemies(...) en handlers de UI.
  const applyEnemyHp = React.useCallback((eid, newHp) => {
    setEnemies(prev => prev.map(e => e.id===eid ? {...e, currentHp:newHp} : e));
    writeEnemyField(eid, 'currentHp', newHp);
  }, [writeEnemyField, setEnemies]);

  const applyEnemyShield = React.useCallback((eid, newShield) => {
    setEnemies(prev => prev.map(e => e.id===eid ? {...e, shield:newShield} : e));
    writeEnemyField(eid, 'shield', newShield);
  }, [writeEnemyField, setEnemies]);

  const applyEnemyStatuses = React.useCallback((eid, newStatuses) => {
    setEnemies(prev => prev.map(e => e.id===eid ? {...e, statuses:newStatuses} : e));
    writeEnemyField(eid, 'statuses', newStatuses);
  }, [writeEnemyField, setEnemies]);

  // Escribe el array entero de enemies a Firebase (solo el sub-árbol enemies,
  // NO el gameState completo). Para cambios estructurales: agregar, quitar,
  // reordenar enemigos. Sigue siendo "casi monolítico" pero acotado al sub-árbol,
  // lo que evita pisar cambios en otras zonas (turnos, iniciativa, etc.).
  const writeEnemiesArray = React.useCallback((nextEnemies) => {
    if(!online || applyingRemote.current) return;
    if(viewerMode) return;
    const sid = salaId;
    if(!sid) return;
    FB.setField(`salas/${sid}/gameState/enemies`, nextEnemies);
  }, [online, salaId, viewerMode]);

  // Mismo patrón para initOrder y monsterOrder (sub-árboles independientes).
  // Evita que un cambio en la barra de iniciativa pise cambios concurrentes
  // en enemies, turnos, etc.
  const writeInitOrderArray = React.useCallback((nextOrder) => {
    if(!online || applyingRemote.current) return;
    if(viewerMode) return;
    const sid = salaId;
    if(!sid) return;
    FB.setField(`salas/${sid}/gameState/initOrder`, nextOrder);
  }, [online, salaId, viewerMode]);

  const writeMonsterOrderArray = React.useCallback((nextOrder) => {
    if(!online || applyingRemote.current) return;
    if(viewerMode) return;
    const sid = salaId;
    if(!sid) return;
    FB.setField(`salas/${sid}/gameState/monsterOrder`, nextOrder);
  }, [online, salaId, viewerMode]);

  // ── AUTOGUARDADO LOCAL ──────────────────────────────────────────────────────
  const autoSave = React.useCallback(async (state) => {
    try {
      const save = {
        id: currentSaveId.current || ("auto_"+Date.now()),
        timestamp: Date.now(),
        scenarioNum, classes, scenarioLvl: state.scenarioLvl ?? scenarioLvl,
        isAutosave: true,
        gameState: state,
      };
      await AsyncStorage.setItem(AUTOSAVE_KEY, JSON.stringify(save));
    } catch(e){}
  }, [scenarioNum, classes, scenarioLvl, currentSaveId]);

  // ── Effect 1: AUTOSAVE LOCAL (AsyncStorage) ────────────────────────────────
  // Se dispara cuando cambia CUALQUIER pieza del estado de juego, incluyendo
  // enemies, initOrder, monsterOrder y scenarioLvl. Guarda el estado completo
  // serializado por buildSaveState para que "Continuar partida" recupere
  // exactamente lo último (HP de enemigos, orden, turnos, todo).
  React.useEffect(()=>{
    if(!hasBeenActive.current) return; // no guardar estado inicial vacío
    autoSave(buildSaveState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, initOrder, monsterOrder, doneTurnIds, activeTurnId,
      roundActive, initNumbers, skipThisRound, scenarioLvl]);

  // ── Effect 2: PUSH PARCIAL A FIREBASE ──────────────────────────────────────
  // Solo cubre campos NO migrados a writers granulares (turnos, ronda,
  // initNumbers, skipThisRound, scenarioLvl). NO incluye enemies/initOrder/
  // monsterOrder porque cada uno tiene su writer granular y de esa forma
  // evitamos pisar cambios concurrentes en distintas zonas de la sala.
  React.useEffect(()=>{
    if(!hasBeenActive.current) return; // no pushear estado inicial vacío
    if(online && !applyingRemote.current && salaId){
      FB.patch(`salas/${salaId}/gameState`, {
        activeTurnId: activeTurnId ?? null,
        doneTurnIds, roundActive, initNumbers, skipThisRound, scenarioLvl,
        scenarioNum, classes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneTurnIds, activeTurnId, roundActive, initNumbers, skipThisRound]);

  // ── APLICAR ESTADO REMOTO RECIBIDO ──────────────────────────────────────────
  // Firebase RTDB convierte arrays a objetos cuando se escriben paths granulares
  // o cuando el array tiene huecos. Hay que normalizar TODOS los arrays remotos.
  // Además, cuando un array queda vacío Firebase borra el nodo (emite null),
  // por lo que los campos pueden llegar como null: eso significa "vaciar", no
  // "ignorar". Por eso miramos si la key existe (key in s) en vez de
  // s.campo truthy.
  const toArr = (v) => {
    if(v === null || v === undefined) return [];
    if(Array.isArray(v)) return v;
    return Object.values(v);
  };
  React.useEffect(()=>{
    if(!onRemoteState || applyingRemote.current) return;
    applyingRemote.current = true;
    const s = onRemoteState;
    if("enemies" in s){
      const arr = toArr(s.enemies).filter(Boolean);
      setEnemies(arr.map(e=>({...e, statuses: Array.isArray(e.statuses)?e.statuses:[]})));
    }
    if("initOrder" in s)     setInitOrder(toArr(s.initOrder).filter(x=>x&&x.kind&&x.id));
    if("monsterOrder" in s)  setMonsterOrder(toArr(s.monsterOrder).filter(Boolean));
    if("activeTurnId" in s)  setActiveTurnId(s.activeTurnId);
    if("doneTurnIds" in s)   setDoneTurnIds(toArr(s.doneTurnIds).filter(Boolean));
    if("roundActive" in s)   setRoundActive(!!s.roundActive);
    if("initNumbers" in s)   setInitNumbers(s.initNumbers || {});
    if("skipThisRound" in s) setSkipThisRound(toArr(s.skipThisRound).filter(Boolean));
    if("scenarioLvl" in s)   setScenarioLvl(s.scenarioLvl);
    setTimeout(()=>{ applyingRemote.current=false; }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRemoteState]);

  return {
    applyingRemote, enemiesRef,
    writeEnemyField,
    applyEnemyHp, applyEnemyShield, applyEnemyStatuses,
    writeEnemiesArray, writeInitOrderArray, writeMonsterOrderArray,
    autoSave,
  };
}