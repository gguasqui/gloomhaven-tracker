import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Screens extraídas ────────────────────────────────────────────────────────
import HomeScreen from "./src/screens/HomeScreen";
import SavedGamesScreen from "./src/screens/SavedGamesScreen";
import ScenarioSelector from "./src/screens/ScenarioSelector";
import CampaignConfigScreen from "./src/screens/CampaignConfigScreen";
import ClassUnlockScreen from "./src/screens/ClassUnlockScreen";
import ScenarioRoadmap from "./ScenarioRoadmap";

// ── Componentes extraídos ────────────────────────────────────────────────────
import ClassSelector from "./src/components/ClassSelector";
import InitiativeBar from "./src/components/InitiativeBar";
import NewEnemyInitPopup from "./src/components/NewEnemyInitPopup";

// ── Componentes del tracker ──────────────────────────────────────────────────
import LevelModal from "./src/screens/GloomhavenTracker/components/LevelModal";
import NoStockAlert from "./src/screens/GloomhavenTracker/components/NoStockAlert";
import WoundDeathsPopup from "./src/screens/GloomhavenTracker/components/WoundDeathsPopup";
import ShareSalaModal from "./src/screens/GloomhavenTracker/components/ShareSalaModal";
import ScenarioPickerModal from "./src/screens/GloomhavenTracker/components/ScenarioPickerModal";
import AllMonstersModal from "./src/screens/GloomhavenTracker/components/AllMonstersModal";
import TrackerHeader from "./src/screens/GloomhavenTracker/components/TrackerHeader";
import AddBar from "./src/screens/GloomhavenTracker/components/AddBar";
import EnemyCard from "./src/screens/GloomhavenTracker/components/EnemyCard";

// ── Hooks del tracker ────────────────────────────────────────────────────────
import useFirebaseSync from "./src/screens/GloomhavenTracker/hooks/useFirebaseSync";
import useEnemyActions from "./src/screens/GloomhavenTracker/hooks/useEnemyActions";

// ── Contextos ────────────────────────────────────────────────────────────────
import { MultiplayerContext, MultiplayerProvider } from "./src/contexts/MultiplayerContext";
import { CampaignContext, CampaignProvider, useAvailableClasses } from "./src/contexts/CampaignContext";

// ── Utils ────────────────────────────────────────────────────────────────────
// (FB y genSalaId movidos a useFirebaseSync; otros consumidores los importan directamente)
import {
  isBossType, hasEliteType, getHp, getMonstersForScenario,
} from "./src/utils/enemyHelpers";

// ── Estilos compartidos del tracker ──────────────────────────────────────────
import { trackerStyles as ss } from "./src/styles/trackerStyles";
// (pk ya no se importa: solo lo usaban los pickers, ahora extraídos)
// (pickNumber movido a useEnemyActions, ya no se importa en App.js)

// ── Imports RN que el tracker sigue usando ───────────────────────────────────
import {
  View, Text, TouchableOpacity, ScrollView,
  Platform, StatusBar, useWindowDimensions,
  PanResponder, Share, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// ── Datos centralizados ──────────────────────────────────────────────────────
import {
  BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  SAVES_KEY, AUTOSAVE_KEY, MAX_MANUAL_SAVES,
  ENEMY_TYPES, SCENARIOS,
} from "./src/data";

// (STATUS_ROW1/ROW2 movidos a ./src/screens/GloomhavenTracker/components/EnemyCard.js)

// ═══════════════════════════════════════════════════════════════════════════════
// TRACKER PRINCIPAL (pendiente de refactor en Pasos 4 y 5)
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA 3 — TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
function GloomhavenTracker({ scenarioNum, onBack, classes=[], saveId=null, initialState=null }){
  const insets  = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Modo visualización (solo lectura) — no se persiste, se resetea a false al re-abrir
  const [viewerMode, setViewerMode] = useState(false);

  const cardWidth    = isLandscape ? Math.min(width*0.35,280) : Math.min(width*0.55,200);
  const snapInterval = cardWidth + 12;

  // Monstruos disponibles según escenario
  const scenarioMonsters = scenarioNum ? getMonstersForScenario(scenarioNum) : [];
  const allTypes         = Object.keys(ENEMY_TYPES).sort();
  // Lista para el selector principal: si es escenario, solo los del escenario; si es libre, todos
  const availableTypes   = scenarioNum
    ? allTypes.filter(t => scenarioMonsters.includes(t))
    : allTypes;
  const defaultType      = availableTypes[0] || allTypes[0];

  const [scenarioLvl,  setScenarioLvl]  = useState(0);
  const [levelModal,   setLevelModal]   = useState(!initialState); // no abrir si es partida guardada
  const [enemies,      setEnemies]      = useState([]);
  const [selectedType, setSelectedType] = useState(defaultType);
  const [variant,      setVariant]      = useState("normal");
  const players = Math.max(2, Math.min(4, classes.length)); // deriva de cantidad de clases
  const [pendingDmg,   setPendingDmg]   = useState({});
  const [editingNum,   setEditingNum]   = useState(null);
  const [numDraft,     setNumDraft]     = useState("");
  const [woundDeaths,  setWoundDeaths]  = useState([]);
  const [noStockAlert,  setNoStockAlert]  = useState(false);
  const [saveConfirm,   setSaveConfirm]   = useState(false); // feedback "Guardado ✓"
  const currentSaveId = React.useRef(saveId); // id de la partida actual (manual save)

  // Multiplayer context
  const { salaId, isHost, online, jugadores, crearSala, salirDeSala,
          pushGameState, onRemoteState } = React.useContext(MultiplayerContext);
  const [shareVisible, setShareVisible] = React.useState(false);
  const [sharingCode,  setSharingCode]  = React.useState(null);
  const [joiningMsg,   setJoiningMsg]   = React.useState("");

  // ── (Writers Firebase y enemiesRef movidos a useFirebaseSync) ──────────────


  // ── INICIATIVA (declarados antes de buildSaveState y useEffects) ──────────
  const [initOrder,    setInitOrder]    = useState(
    classes.map(c=>({kind:"class",id:c}))
  );
  const [monsterOrder, setMonsterOrder] = useState([]);
  const [activeTurnId,      setActiveTurnId]      = useState(null);
  const [doneTurnIds,       setDoneTurnIds]       = useState([]);
  const [turnStartStatuses, setTurnStartStatuses] = useState({});
  const [initNumbers,   setInitNumbers]   = useState({});
  const [roundActive,   setRoundActive]   = useState(false);
  const [newEnemyPopup, setNewEnemyPopup] = useState(null);
  const [popupOrder,    setPopupOrder]    = useState([]);
  const popupOrderRef = React.useRef([]);
  const [skipThisRound, setSkipThisRound] = useState([]);

  // ── Serializar estado completo de la partida ─────────────────────────────
  const buildSaveState = () => ({
    enemies, initOrder, monsterOrder, activeTurnId, doneTurnIds,
    roundActive, initNumbers, skipThisRound, scenarioLvl,
    scenarioNum, classes,
  });

  // ── SINCRONIZACIÓN FIREBASE + AUTOGUARDADO LOCAL ─────────────────────────
  // Hook que agrupa: writers granulares, autoSave, push parcial a Firebase,
  // y aplicación de estado remoto recibido vía onRemoteState.
  const {
    enemiesRef,
    writeEnemyField,
    writeEnemiesArray, writeInitOrderArray, writeMonsterOrderArray,
  } = useFirebaseSync({
    enemies, setEnemies,
    initOrder, setInitOrder,
    monsterOrder, setMonsterOrder,
    activeTurnId, setActiveTurnId,
    doneTurnIds, setDoneTurnIds,
    roundActive, setRoundActive,
    initNumbers, setInitNumbers,
    skipThisRound, setSkipThisRound,
    scenarioLvl, setScenarioLvl,
    online, salaId, onRemoteState, viewerMode,
    scenarioNum, classes, currentSaveId,
    buildSaveState,
  });

  // ── HIDRATAR initialState AL MONTAR ──────────────────────────────────────
  // Cuando se entra desde "Continuar partida" o "Partidas guardadas", el estado
  // serializado llega como prop `initialState`. Acá se aplica una sola vez al
  // montar el tracker para restaurar enemigos, orden, turnos, etc.
  // (Mismo patrón que onRemoteState en useFirebaseSync, pero para carga local.)
  React.useEffect(()=>{
    if(!initialState) return;
    const s = initialState;
    const toArr = (v) => !v ? [] : (Array.isArray(v) ? v : Object.values(v));
    if(s.enemies){
      const arr = toArr(s.enemies).filter(Boolean);
      setEnemies(arr.map(e=>({...e, statuses: Array.isArray(e.statuses)?e.statuses:[]})));
    }
    if(s.initOrder)     setInitOrder(toArr(s.initOrder).filter(x=>x&&x.kind&&x.id));
    if(s.monsterOrder)  setMonsterOrder(toArr(s.monsterOrder).filter(Boolean));
    if(s.activeTurnId!==undefined) setActiveTurnId(s.activeTurnId);
    if(s.doneTurnIds)   setDoneTurnIds(toArr(s.doneTurnIds).filter(Boolean));
    if(s.roundActive!==undefined)  setRoundActive(s.roundActive);
    if(s.initNumbers)   setInitNumbers(s.initNumbers);
    if(s.skipThisRound) setSkipThisRound(toArr(s.skipThisRound).filter(Boolean));
    if(s.scenarioLvl!==undefined)  setScenarioLvl(s.scenarioLvl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ── Compartir sala ────────────────────────────────────────────────────────
  const compartirSala = async () => {
    let code = salaId;
    if(!code){
      // Crear la sala ahora
      code = await crearSala(buildSaveState());
      setSharingCode(code);
    } else {
      setSharingCode(code);
    }
    setShareVisible(true);
  };

  const handleShareCode = (code) => {
    Share.share({
      message: `Unite a mi partida de Gloomhaven 🗡️
Código: ${code}

Abrí la app → Conectarse a partida → ingresá el código`,
      title: "Partida de Gloomhaven",
    });
  };

  // ── Guardado manual ───────────────────────────────────────────────────────
  const saveManually = async () => {
    try {
      const raw  = await AsyncStorage.getItem(SAVES_KEY);
      const arr  = raw ? JSON.parse(raw) : [];
      const id   = currentSaveId.current || ("save_"+Date.now());
      currentSaveId.current = id;
      // Si ya existe una con ese id, actualizarla; si no, agregar
      const idx  = arr.findIndex(s=>s.id===id);
      const save = {
        id, timestamp: Date.now(),
        scenarioNum, classes, scenarioLvl,
        isAutosave: false,
        gameState: buildSaveState(),
      };
      if(idx>=0) arr[idx]=save; else arr.push(save);
      // Limitar a MAX_MANUAL_SAVES
      arr.sort((a,b)=>b.timestamp-a.timestamp);
      const trimmed = arr.slice(0, MAX_MANUAL_SAVES);
      await AsyncStorage.setItem(SAVES_KEY, JSON.stringify(trimmed));
      setSaveConfirm(true);
      setTimeout(()=>setSaveConfirm(false), 2000);
    } catch(e){}
  };

  // ── Restaurar desde initialState si se retoma una partida ────────────────
  // (La hidratación inicial está arriba en el primer useEffect del componente.)
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [allPickerOpen,setAllPickerOpen]= useState(false); // picker "todos los enemigos"

  // ── (updateEnemy, removeEnemy y pickNumberFor movidos a useEnemyActions) ──

  const selIsBoss   = isBossType(selectedType);
  const selHasElite = hasEliteType(selectedType);
  const effVar      = selIsBoss?"boss":variant==="boss"?"normal":variant==="elite"&&!selHasElite?"normal":variant;
  const prevHp      = getHp(selectedType,effVar,scenarioLvl,players);
  const prevBaseHp  = effVar==="boss"?ENEMY_TYPES[selectedType]?.boss?.[Math.min(scenarioLvl,7)]??0:null;

  // ── Cantidad máxima de fichas por tipo ──────────────────────────────────────
  // Stock y helpers movidos a ./src/screens/GloomhavenTracker/ENEMY_STOCK.js


  // Detectar si el turno activo es de un jugador/clase
  const activeIsClass = activeTurnId ? activeTurnId.startsWith("class:") : false;

  const handleNewEnemyDuringRound = (type, eid) => {
    if(!roundActive) return;

    if(activeIsClass){
      // TURNO DE JUGADOR: no es invocación, revelar sala
      const avatarExists = initOrder.some(i=>i.id===type&&i.kind==="monster");

      if(avatarExists){
        // El avatar ya existe en INI — respetar su posición
        // Si ya jugó este tipo esta ronda → quitarlo de done para que juegue de nuevo al final
        const tid = "monster:"+type;
        if(doneTurnIds.includes(tid)){
          setDoneTurnIds(prev=>prev.filter(id=>id!==tid));
        }
      } else {
        // Tipo nuevo o avatar desapareció (todos eliminados) → popup de INI
        // Si el tipo estuvo antes, restaurar en su posición original del orden
        const prevPos = monsterOrder.indexOf(type);
        const cur = initOrder.filter(i=>i&&i.kind);
        let withNew;
        if(prevPos>=0){
          // Reinsertar en posición relativa correcta según monsterOrder
          let insertAt = cur.length;
          for(let i=0;i<cur.length;i++){
            if(cur[i].kind==="monster"){
              const cp=monsterOrder.indexOf(cur[i].id);
              if(cp>prevPos){insertAt=i;break;}
            }
          }
          withNew=[...cur.slice(0,insertAt),{kind:"monster",id:type},...cur.slice(insertAt)];
          setInitOrder(withNew);
          writeInitOrderArray(withNew);
          // Quitar de done si había jugado antes de ser eliminado
          const tid="monster:"+type;
          if(doneTurnIds.includes(tid)) setDoneTurnIds(prev=>prev.filter(id=>id!==tid));
        } else {
          // Tipo completamente nuevo → popup de INI para ubicarlo
          withNew=[...cur,{kind:"monster",id:type}];
          setPopupOrder(withNew);
          popupOrderRef.current=withNew;
          setNewEnemyPopup({type,enemyId:eid});
        }
      }
    } else {
      // TURNO DE MONSTRUO: siempre es invocación
      setEnemies(prev=>{
        const next=prev.map(e=>e.id===eid?{...e,summoned:true}:e);
        writeEnemiesArray(next);
        return next;
      });
      const avatarExists = initOrder.some(i=>i.id===type&&i.kind==="monster");
      if(!avatarExists){
        // Primer enemigo de su tipo: no actúa esta ronda, se agrega la siguiente
        setSkipThisRound(prev=>[...prev,type]);
      }
      // Si ya había del tipo: los existentes siguen su curso, el nuevo es solo invocación
    }
  };

  // ── (addEnemy/addEnemyVariant y useEffect monsterOrder movidos a useEnemyActions) ──


  // ── ACCIONES DE ENEMIGOS ─────────────────────────────────────────────────
  // Hook que agrupa CRUD + acciones de combate + sync de monsterOrder/initOrder.
  const {
    updateEnemy, removeEnemy,
    addEnemy, addEnemyVariant,
    adjustPending, commitDamage, applyHeal, toggleStatus, applyTrap,
    startEditNum, commitNum,
  } = useEnemyActions({
    enemies, setEnemies,
    pendingDmg, setPendingDmg,
    editingNum, setEditingNum,
    numDraft, setNumDraft,
    setNoStockAlert,
    setMonsterOrder, setInitOrder, roundActive,
    selectedType, effVar, scenarioLvl, players,
    handleNewEnemyDuringRound,
    enemiesRef,
    writeEnemyField, writeEnemiesArray,
    writeInitOrderArray, writeMonsterOrderArray,
  });

  // ── (adjustPending, commitDamage, applyHeal, toggleStatus movidos a useEnemyActions) ──

  // ── Asignar número de iniciativa pre-ronda ─────────────────────────────────
  const onSetInitNumber = (turnId) => {
    setInitNumbers(prev=>{
      if(prev[turnId]!=null){
        // Ya tiene número → quitarlo y reordenar los siguientes
        const num = prev[turnId];
        const next = {...prev};
        delete next[turnId];
        // Restar 1 a todos los mayores
        Object.keys(next).forEach(k=>{ if(next[k]>num) next[k]--; });
        return next;
      } else {
        // Asignar el siguiente número disponible
        const used = Object.values(prev).filter(Boolean);
        const nextNum = used.length>0 ? Math.max(...used)+1 : 1;
        return {...prev,[turnId]:nextNum};
      }
    });
  };

  // ── Iniciar ronda: ordenar avatares y activar el primer turno ─────────────────
  const onStartRound = () => {
    // Calcular el orden ya aquí para poder activar el primero sincrónicamente
    // (B3: solo cuentan tipos con al menos un enemigo vivo)
    const currentVis = initOrder.filter(i=>
      i&&i.kind&&(i.kind==="class"||enemies.some(e=>e.type===i.id&&e.currentHp>0))
    );
    const sorted = [...currentVis].sort((a,b)=>{
      const ka=a.kind+":"+a.id, kb=b.kind+":"+b.id;
      const na=initNumbers[ka]??999, nb=initNumbers[kb]??999;
      return na-nb;
    });
    const first = sorted[0] || null;

    setInitOrder(sorted);
    writeInitOrderArray(sorted);
    setInitNumbers({});
    setRoundActive(true);
    setDoneTurnIds([]);
    setTurnStartStatuses({});
    setSkipThisRound([]);
    // Activar el primer turno directamente
    if(first) setActiveTurnId(first.kind+":"+first.id);
  };

  // ── Confirmar iniciativa del nuevo enemigo ──────────────────────────────────
  const onConfirmNewEnemy = (newOrder) => {
    if(!newEnemyPopup) return;
    // Aplicar el nuevo orden — el nuevo tipo NO está en doneTurnIds,
    // así que handleNext lo encontrará y le dará su turno cuando corresponda,
    // sin importar si quedó antes o después del jugador activo
    setInitOrder(newOrder);
    writeInitOrderArray(newOrder);
    setNewEnemyPopup(null);
  };

  // Resetear iniciativa: clases primero, luego monstruos. Limpiar summoned de la ronda anterior.
  const resetInitiative=()=>{
    const classItems = classes.map(c=>({kind:"class",id:c}));
    const monsterItems = monsterOrder.map(t=>({kind:"monster",id:t}));
    const next=[...classItems,...monsterItems];
    setInitOrder(next);
    writeInitOrderArray(next);
    setActiveTurnId(null);
    setDoneTurnIds([]);
    setTurnStartStatuses({});
    setInitNumbers({});
    setRoundActive(false);
    setSkipThisRound([]);
    // Los invocados de esta ronda pasan a "done" (siguiente ronda ya pueden jugar)
    // "done" significa: mostrar borde en avatar, sin banner, pueden jugar normalmente
    setEnemies(prev=>{
      const next=prev.map(e=>e.summoned===true?{...e,summoned:"done"}:e);
      writeEnemiesArray(next);
      return next;
    });
  };

  // Tap en avatar: inicia turno de ese personaje/enemigo
  const TEMP_STATS = ["muddle","immobilize","disarm","strengthen","invisible","stun"];

  // Al FIN del turno de un monstruo: limpiar solo los estados que YA TENÍA al inicio
  // Los que se aplicaron durante el turno sobreviven hasta el siguiente
  const finishMonsterTurn = (monsterType) => {
    const startingStatuses = turnStartStatuses[monsterType] || [];
    setEnemies(prev=>{
      const next=prev.map(e=>{
        if(e.type!==monsterType) return e;
        // Quitar solo los TEMP que estaban al inicio del turno
        const newStatuses = e.statuses.filter(s=>
          !TEMP_STATS.includes(s) || !startingStatuses.includes(s)
        );
        return {...e, statuses:newStatuses};
      });
      writeEnemiesArray(next);
      return next;
    });
    setTurnStartStatuses(prev=>{ const n={...prev}; delete n[monsterType]; return n; });
  };

  const onAvatarTap = (item) => {
    const turnId = item.kind+":"+item.id;

    // Tap en el activo actual → termina su turno, lo agrega a done
    if(activeTurnId === turnId){
      if(item.kind==="monster") finishMonsterTurn(item.id);
      setDoneTurnIds(prev=>[...new Set([...prev, turnId])]);
      setActiveTurnId(null);
      return;
    }

    const vis = initOrder.filter(x=>x&&x.kind&&(x.kind==="class"||enemies.some(e=>e.type===x.id&&e.currentHp>0)));
    const tappedIdx  = vis.findIndex(x=>x.kind===item.kind&&x.id===item.id);
    const activeIdx  = activeTurnId ? vis.findIndex(x=>x.kind+":"+x.id===activeTurnId) : -1;
    const isDone     = doneTurnIds.includes(turnId);

    if(isDone){
      // Tap en avatar que ya jugó → reactivar: quitar de done ese y todos los que
      // están entre él y el activo actual (hacia atrás en el orden)
      // El activo actual NO se finaliza — sigue siendo el turno activo
      const fromIdx = tappedIdx;
      const toIdx   = activeIdx >= 0 ? activeIdx : vis.length;
      const toReactivate = vis
        .slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1)
        .map(x=>x.kind+":"+x.id);
      setDoneTurnIds(prev=>prev.filter(id=>!toReactivate.includes(id)));
      // El nuevo activo es el avatar tocado
      setActiveTurnId(turnId);
      return;
    }

    // Tap en avatar pendiente (no done, no activo) → avanzar a ese turno
    // Finalizar el activo anterior si lo hay
    if(activeTurnId){
      const [prevKind, prevId] = activeTurnId.split(":");
      if(prevKind==="monster") finishMonsterTurn(prevId);
      setDoneTurnIds(prev=>[...new Set([...prev, activeTurnId])]);
    }

    setActiveTurnId(turnId);

    // Inicio del turno de un monstruo: snapshot de sus estados temporales actuales
    if(item.kind==="monster"){
      const currentStatuses = enemies
        .filter(e=>e.type===item.id&&e.currentHp>0)
        .flatMap(e=>e.statuses.filter(s=>TEMP_STATS.includes(s)));
      const uniqueStatuses = [...new Set(currentStatuses)];
      setTurnStartStatuses(prev=>({...prev,[item.id]:uniqueStatuses}));

      // Aplicar herida al inicio del turno. Los que mueren (HP llega a 0)
      // se purgan del array en el mismo batch — purga inmediata global.
      const died = enemies.filter(e=>
        e.type===item.id && e.currentHp>0 && e.statuses.includes("wound") && Math.max(0,e.currentHp-1)===0
      ).map(e=>({type:e.type,number:e.number,variant:e.variant}));

      setEnemies(prev=>{
        const next=prev
          .map(e=>{
            if(e.type!==item.id||!e.statuses.includes("wound")||e.currentHp<=0) return e;
            return {...e,currentHp:Math.max(0,e.currentHp-1)};
          })
          .filter(e=>e.currentHp>0);
        writeEnemiesArray(next);
        return next;
      });

      if(died.length>0){
        const vOrd={elite:0,normal:1,boss:2};
        died.sort((a,b)=>{
          const vd=(vOrd[a.variant]??1)-(vOrd[b.variant]??1); if(vd!==0) return vd;
          const na=parseInt(a.number),nb=parseInt(b.number);
          if(!isNaN(na)&&!isNaN(nb)) return na-nb;
          return a.number.localeCompare(b.number);
        });
        setWoundDeaths(died);
      }
    }
  };

  const startRound=()=>{
    // Wound tick al inicio de ronda: los que mueren se purgan inmediatamente.
    const died=enemies
      .filter(e=>e.currentHp>0&&e.statuses.includes("wound")&&Math.max(0,e.currentHp-1)===0)
      .map(e=>({type:e.type,number:e.number,variant:e.variant}));

    setEnemies(prev=>{
      const next=prev
        .map(e=>{
          if(!e.statuses.includes("wound")||e.currentHp<=0) return e;
          return {...e,currentHp:Math.max(0,e.currentHp-1)};
        })
        .filter(e=>e.currentHp>0);
      writeEnemiesArray(next);
      return next;
    });

    if(died.length>0){
      const vOrd={elite:0,normal:1,boss:2};
      died.sort((a,b)=>{
        const vd=(vOrd[a.variant]??1)-(vOrd[b.variant]??1); if(vd!==0) return vd;
        const na=parseInt(a.number),nb=parseInt(b.number);
        if(!isNaN(na)&&!isNaN(nb)) return na-nb;
        return a.number.localeCompare(b.number);
      });
      setWoundDeaths(died);
    }
    // startRound solo aplica herida al inicio — el orden se maneja con onStartRound
    // resetear sin cambiar roundActive (lo maneja onStartRound)
  };

  // FIN DE RONDA: termina el turno activo (si hay), resetea escudos, resetea iniciativa
  const endRound=()=>{
    if(activeTurnId){
      const [prevKind,prevId]=activeTurnId.split(":");
      if(prevKind==="monster") finishMonsterTurn(prevId);
    }
    setEnemies(prev=>{
      // Reset de escudos al fin de ronda. Los muertos ya fueron purgados
      // en el momento de morir (purga inmediata global), así que no hace
      // falta filtrarlos acá.
      const next=prev.map(e=>({...e,shield:0}));
      writeEnemiesArray(next);
      return next;
    });
    // Agregar al initOrder cualquier tipo que fue saltado esta ronda (invocaciones)
    setInitOrder(prev=>{
      const existingIds=prev.map(x=>x.id);
      const toAdd=skipThisRound.filter(t=>!existingIds.includes(t)).map(t=>({kind:"monster",id:t}));
      if(toAdd.length===0) return prev;
      const next=[...prev,...toAdd];
      writeInitOrderArray(next);
      return next;
    });
    resetInitiative();
  };
  // ── (applyTrap, startEditNum, commitNum movidos a useEnemyActions) ──
  // (hpPct y hpColor movidos a ./components/EnemyCard.js)


  const vBtn=(v,label,available)=>{
    const active=effVar===v;
    const colors={normal:ACCENT,elite:"#8B6914",boss:"#8B0000"};
    const bgIdle={normal:"#FFFFFF",elite:"#FFE650",boss:"#FFE0E0"};
    return(
      <TouchableOpacity disabled={!available} onPress={()=>available&&setVariant(v)}
        style={[ss.variantBtn,isLandscape&&ss.variantBtnSm,{
          borderColor:active?colors[v]:BORDER,
          borderWidth:active?3:1.5,
          backgroundColor:bgIdle[v],
          opacity:available?1:0.4,
        }]}>
        <Text style={{color:colors[v],fontWeight:active?"bold":"500",fontSize:isLandscape?11:12}}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Agrupar cards (B3: solo vivos)
  const groupMap={};
  enemies.filter(e=>e.currentHp>0).forEach(e=>{
    const key=e.variant==="boss"?`boss||${e.type}`:e.type;
    if(!groupMap[key]) groupMap[key]={type:e.type,isBossGroup:e.variant==="boss",cards:[]};
    groupMap[key].cards.push(e);
  });
  const groups=Object.values(groupMap).sort((a,b)=>{
    if(a.isBossGroup!==b.isBossGroup) return a.isBossGroup?1:-1;
    return a.type.localeCompare(b.type);
  });
  const vOrder={elite:0,normal:1,boss:2};
  groups.forEach(g=>g.cards.sort((a,b)=>{
    const vd=(vOrder[a.variant]??1)-(vOrder[b.variant]??1); if(vd!==0) return vd;
    const na=parseInt(a.number),nb=parseInt(b.number);
    if(!isNaN(na)&&!isNaN(nb)) return na-nb;
    return a.number.localeCompare(b.number);
  }));

  const scenarioData = scenarioNum ? SCENARIOS.find(s=>s.num===scenarioNum) : null;

  // ── (ScenarioPickerModal y AllMonstersModal movidos a ./components/) ─────────

  // ── HEADER landscape ────────────────────────────────────────────────────────
  // ── (TrackerHeader y AddBar movidos a ./components/) ─────────────────────────


  // ── (LevelModal movido a ./components/) ─────────────────────────────────────


  return(
    <View style={[ss.root,{paddingTop:isLandscape?0:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <LevelModal
        visible={levelModal}
        onClose={()=>setLevelModal(false)}
        scenarioLvl={scenarioLvl}
        setScenarioLvl={setScenarioLvl}
      />
      <ScenarioPickerModal
        visible={pickerOpen}
        onClose={()=>setPickerOpen(false)}
        scenarioNum={scenarioNum}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        setVariant={setVariant}
        allTypes={allTypes}
        availableTypes={availableTypes}
        onOpenAllPicker={()=>{setPickerOpen(false);setTimeout(()=>setAllPickerOpen(true),250);}}
        height={height}
      />
      <AllMonstersModal
        visible={allPickerOpen}
        onClose={()=>setAllPickerOpen(false)}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        setVariant={setVariant}
        allTypes={allTypes}
        scenarioMonsters={scenarioMonsters}
        height={height}
      />

      <NoStockAlert
        visible={noStockAlert}
        onClose={()=>setNoStockAlert(false)}
      />

      <WoundDeathsPopup
        deaths={woundDeaths}
        onClose={()=>setWoundDeaths([])}
        isLandscape={isLandscape}
        height={height}
      />

      <ShareSalaModal
        visible={shareVisible}
        onClose={()=>setShareVisible(false)}
        online={online}
        salaId={salaId}
        jugadores={jugadores}
        sharingCode={sharingCode}
        onShareCode={handleShareCode}
      />

      <TrackerHeader
        isLandscape={isLandscape}
        insets={insets}
        scenarioData={scenarioData}
        online={online}
        jugadores={jugadores}
        onBack={onBack}
        onShare={compartirSala}
        onSave={saveManually}
        onOpenLevel={()=>setLevelModal(true)}
        saveConfirm={saveConfirm}
        scenarioLvl={scenarioLvl}
      />
      <AddBar
        isLandscape={isLandscape}
        insets={insets}
        selectedType={selectedType}
        selIsBoss={selIsBoss}
        selHasElite={selHasElite}
        onOpenPicker={()=>setPickerOpen(true)}
        onAddBoss={addEnemy}
        onAddNormal={()=>addEnemyVariant("normal")}
        onAddElite={()=>addEnemyVariant("elite")}
      />


      {/* ══ SECCIÓN INICIATIVA ══════════════════════════════════════════════ */}
      <InitiativeBar
        initOrder={initOrder}
        setInitOrder={(next)=>{ setInitOrder(next); writeInitOrderArray(next); }}
        enemies={enemies}
        onAvatarTap={onAvatarTap}
        activeTurnId={activeTurnId}
        doneTurnIds={doneTurnIds}
        onEndRound={endRound}
        roundActive={roundActive}
        initNumbers={initNumbers}
        onSetInitNumber={onSetInitNumber}
        onStartRound={onStartRound}
        newEnemyPopup={newEnemyPopup}
        onConfirmNewEnemy={onConfirmNewEnemy}
        skipThisRound={skipThisRound}
        popupOrder={popupOrder}
        setPopupOrder={setPopupOrder}
        popupOrderRef={popupOrderRef}
        viewerMode={viewerMode}
      />

      <ScrollView
        style={ss.scroll}
        contentContainerStyle={[ss.scrollInner,{paddingBottom:insets.bottom+20,paddingLeft:insets.left+16,paddingRight:insets.right+16}]}
        keyboardShouldPersistTaps="handled"
      >
        {enemies.length===0&&(
          <View style={ss.empty}>
            <Text style={{fontSize:48,marginBottom:10}}>🏚️</Text>
            <Text style={{fontSize:16,color:TEXT,marginBottom:4}}>No hay enemigos en el tablero.</Text>
            <Text style={{fontSize:12,color:"#C4B090"}}>Seleccioná un tipo y presioná +</Text>
          </View>
        )}

        {groups.map(group=>{
          const elC=group.cards.filter(e=>e.variant==="elite").length;
          const nmC=group.cards.filter(e=>e.variant==="normal").length;
          const badges=group.isBossGroup
            ?[{label:"💀 Jefe",color:"#8B0000",bg:"#FFE0E044"}]
            :[...(elC>0?[{label:`⭐ Élite ×${elC}`,color:"#8B6914",bg:"#FFF8D6"}]:[]),
              ...(nmC>0?[{label:`⚪ Normal ×${nmC}`,color:MUTED,bg:"#EDE4D0"}]:[])];

          return(
            <View key={group.isBossGroup?`boss||${group.type}`:group.type} style={ss.group}>
              <View style={ss.groupHeader}>
                <Text style={ss.groupTitle}>{group.type}</Text>
                {badges.map(b=>(
                  <View key={b.label} style={[ss.groupBadge,{backgroundColor:b.bg,borderColor:b.color+"44"}]}>
                    <Text style={{fontSize:11,color:b.color}}>{b.label}</Text>
                  </View>
                ))}
                <View style={ss.groupLine}/>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={ss.carousel}
                snapToInterval={snapInterval} decelerationRate="fast">
                {group.cards.map(enemy=>(
                  <EnemyCard
                    key={enemy.id}
                    enemy={enemy}
                    cardWidth={cardWidth}
                    viewerMode={viewerMode}
                    scenarioLvl={scenarioLvl}
                    players={players}
                    enemies={enemies}
                    pendingDmg={pendingDmg}
                    editingNum={editingNum}
                    numDraft={numDraft}
                    setNumDraft={setNumDraft}
                    setPendingDmg={setPendingDmg}
                    updateEnemy={updateEnemy}
                    removeEnemy={removeEnemy}
                    commitDamage={commitDamage}
                    applyHeal={applyHeal}
                    applyTrap={applyTrap}
                    toggleStatus={toggleStatus}
                    adjustPending={adjustPending}
                    startEditNum={startEditNum}
                    commitNum={commitNum}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View style={[ss.footer,
        isLandscape
          ? {paddingTop:4, paddingBottom:Math.max(insets.bottom,4), flexDirection:"row", alignItems:"center"}
          : {paddingBottom:insets.bottom+6, flexDirection:"row", alignItems:"center"}
      ]}>
        <Text style={[ss.footerTxt,{flex:1, textAlign:isLandscape?"left":"center", paddingLeft:isLandscape?12:0}]}>
          Herida: −1 HP al inicio del turno · Veneno: +1 al daño del ataque
        </Text>
        <TouchableOpacity
          onPress={()=>setViewerMode(v=>!v)}
          style={{paddingHorizontal:12, paddingVertical:4}}
          hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Ionicons
            name={viewerMode?"eye":"eye-outline"}
            size={22}
            color={viewerMode?ACCENT:"#C4B090"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATOR RAÍZ
// ═══════════════════════════════════════════════════════════════════════════════
function AppNavigator(){
  const [history, setHistory] = useState([{screen:"home", scenarioNum:null, classes:[], saveId:null, initialState:null}]);
  const current = history[history.length-1];
  const {screen, scenarioNum, classes, saveId, initialState} = current;

  const navigate = (screen, scenarioNum=null, classes=[], saveId=null, initialState=null) => {
    setHistory(prev => [...prev, {screen, scenarioNum, classes, saveId, initialState}]);
  };
  const goBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0,-1) : prev);
  };

  const [showClassModal, setShowClassModal] = useState(false);
  const [pendingScenario, setPendingScenario] = useState(null);

  const openClassModal = (scNum=null) => {
    setPendingScenario(scNum);
    setShowClassModal(true);
  };

  if(screen==="savedGames"){
    return(
      <SavedGamesScreen
        onBack={goBack}
        onResume={(save)=>{
          navigate("tracker", save.scenarioNum, save.classes||[], save.id, save.gameState);
        }}
      />
    );
  }
  if(screen==="scenarioSelect"){
    return(
      <>
        <ScenarioSelector
          onBack={goBack}
          onSelect={(sc)=>openClassModal(sc.num)}
        />
        <ClassSelector
          visible={showClassModal}
          onBack={()=>setShowClassModal(false)}
          onConfirm={(cls)=>{ setShowClassModal(false); navigate("tracker", pendingScenario, cls); }}
        />
      </>
    );
  }
  if(screen==="tracker"){
    return(
      <GloomhavenTracker
        scenarioNum={scenarioNum}
        classes={classes}
        onBack={goBack}
        saveId={saveId}
        initialState={initialState}
      />
    );
  }
  if(screen==="campaignConfig"){
    return <CampaignConfigScreen onBack={goBack} onClassUnlock={()=>navigate("classConfig")}/>;
  }
  if(screen==="classConfig"){
    return <ClassUnlockScreen onBack={goBack}/>;
  }
  if(screen==="roadmap"){
    return <ScenarioRoadmap onBack={goBack}/>;
  }
  return(
    <>
      <HomeScreen
        onFreePlay={()=>openClassModal(null)}
        onSelectScenario={()=>navigate("scenarioSelect")}
        onCampaignConfig={()=>navigate("campaignConfig")}
        onSavedGames={()=>navigate("savedGames")}
        onRoadmap={()=>navigate("roadmap")}
        onContinue={async ()=>{
          try{
            const raw = await AsyncStorage.getItem(AUTOSAVE_KEY);
            if(!raw) return;
            const save = JSON.parse(raw);
            navigate("tracker", save.scenarioNum, save.classes||[], save.id, save.gameState);
          }catch(e){}
        }}
        onJoinGame={(gameState, salaId)=>{
          const sc = gameState?.scenarioNum||null;
          const cls = gameState?.classes||[];
          navigate("tracker", sc, cls, null, gameState);
        }}
      />
      <ClassSelector
        visible={showClassModal}
        onBack={()=>setShowClassModal(false)}
        onConfirm={(cls)=>{ setShowClassModal(false); navigate("tracker", pendingScenario, cls); }}
      />
    </>
  );
}

export default function App(){
  return(
    <SafeAreaProvider>
      <CampaignProvider>
        <MultiplayerProvider>
          <AppNavigator/>
        </MultiplayerProvider>
      </CampaignProvider>
    </SafeAreaProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// (Estilos `pk` movidos a ./src/screens/GloomhavenTracker/styles.js)
// ═══════════════════════════════════════════════════════════════════════════════