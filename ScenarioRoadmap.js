// ScenarioRoadmap.js — Gloomhaven tracker, escenarios 1-51
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  PanResponder, Animated, Modal, StatusBar, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROADMAP_SAVE_KEY = '@gloomhaven_roadmap';

// ─────────────────────────────────────────────────────────────────────────────
// DATOS — CORREGIDOS
// unlocks = nueva ubicación en el tablero (número en círculo en la conclusión)
// gives   = logro que se obtiene al completar (puede ser requisito de otros)
// req     = logros necesarios; ":INCOMPLETO" = NO debe estar; "|" = alternativa
// exclusive = completar este bloquea permanentemente estos otros
// ─────────────────────────────────────────────────────────────────────────────
export const SCENARIOS = {
  1:  { name:'Túmulo Negro',                  req:[],                                                           unlocks:[2],       gives:['Primeros pasos'],                                       exclusive:[] },
  2:  { name:'Guarida del Túmulo',            req:['Primeros pasos'],                                           unlocks:[3,4],     gives:[],                                                       exclusive:[] },
  3:  { name:'Campamento Inox',               req:['La comerciante huye:INCOMPLETO'],                           unlocks:[8,9],     gives:['Los planes de Jekserah'],                               exclusive:[] },
  4:  { name:'Cripta de los Malditos',        req:[],                                                           unlocks:[5,6],     gives:[],                                                       exclusive:[] },
  5:  { name:'Cripta Ruinosa',                req:[],                                                           unlocks:[10,14,19],gives:[],                                                       exclusive:[] },
  6:  { name:'Cripta Decadente',              req:[],                                                           unlocks:[8],       gives:[],                                                       exclusive:[] },
  7:  { name:'Gruta Trepidante',              req:['El poder de la mejora','La comerciante huye'],              unlocks:[20],      gives:[],                                                       exclusive:[] },
  8:  { name:'Almacén de Gloomhaven',         req:['Los planes de Jekserah','La invasión de los muertos:INCOMPLETO'], unlocks:[7,13,14], gives:['La comerciante huye'],                          exclusive:[] },
  9:  { name:'Mina de Diamantes',             req:['La comerciante huye:INCOMPLETO'],                           unlocks:[11,12],   gives:['La invasión de los muertos'],                          exclusive:[] },
  10: { name:'Plano del Poder Elemental',     req:['La grieta neutralizada:INCOMPLETO'],                        unlocks:[21,22],   gives:['El recado de un demonio'],                             exclusive:[] },
  11: { name:'Plaza de Gloomhaven A',         req:['Fin de la invasión:INCOMPLETO'],                            unlocks:[16,18],   gives:['Fin de la invasión','Gobierno de la ciudad: Económico'],exclusive:[12] },
  12: { name:'Plaza de Gloomhaven B',         req:['Fin de la invasión:INCOMPLETO'],                            unlocks:[16,18,28],gives:['Fin de la invasión'],                                  exclusive:[11] },
  13: { name:'Templo del Vidente',            req:[],                                                           unlocks:[],        gives:[],                                                       exclusive:[], special:'choose_one', unlocks_choice:[15,17,20] },
  14: { name:'Hondonada Helada',              req:[],                                                           unlocks:[],        gives:['El poder de la mejora'],                                exclusive:[] },
  15: { name:'Altar de la Fuerza',            req:[],                                                           unlocks:[],        gives:[],                                                       exclusive:[] },
  16: { name:'El Paso de la Montaña',         req:[],                                                           unlocks:[24,25],   gives:[],                                                       exclusive:[] },
  17: { name:'Isla Perdida',                  req:[],                                                           unlocks:[],        gives:[],                                                       exclusive:[] },
  18: { name:'Cloacas Abandonadas',           req:[],                                                           unlocks:[14,23,26,43], gives:[],                                                  exclusive:[] },
  19: { name:'Cripta Olvidada',               req:['El poder de la mejora'],                                    unlocks:[27],      gives:['Incensario de Romperrocas'],                            exclusive:[] },
  20: { name:'Santuario de la Nigromante',    req:['La comerciante huye'],                                      unlocks:[16,18,28],gives:[],                                                       exclusive:[] },
  21: { name:'Trono Infernal',                req:['La grieta neutralizada:INCOMPLETO'],                        unlocks:[],        gives:['La grieta neutralizada'],                               exclusive:[] },
  22: { name:'Templo de los Elementos',       req:['El recado de un demonio'],                                  unlocks:[31,35,36],gives:['Artefacto recuperado'],                                 exclusive:[] },
  23: { name:'Ruinas Profundas',              req:[],                                                           unlocks:[26],      gives:['A través de las ruinas','Tecnología antigua'],           exclusive:[] },
  24: { name:'Cámara de los Ecos',            req:[],                                                           unlocks:[30,32],   gives:['La petición de la Voz'],                                exclusive:[] },
  25: { name:'Ascenso al Risco de Hielo',     req:[],                                                           unlocks:[33,34],   gives:['La orden del draco'],                                   exclusive:[] },
  26: { name:'Antiguo Aljibe',                req:['Respiración subacuática|A través de las ruinas'],           unlocks:[22],      gives:['Tras la pista'],                                        exclusive:[] },
  27: { name:'Grieta Destructiva',            req:['Artefacto perdido:INCOMPLETO','Incensario de Romperrocas'], unlocks:[],        gives:['La grieta neutralizada'],                               exclusive:[] },
  28: { name:'Cámara Ritual Ultraterrestre',  req:['Encargo siniestro'],                                        unlocks:[29],      gives:['Una invitación'],                                       exclusive:[] },
  29: { name:'Santuario de la Penumbra',      req:['Una invitación'],                                           unlocks:[],        gives:['El filo de la oscuridad'],                              exclusive:[] },
  30: { name:'Altar de las Profundidades',    req:['La petición de la Voz'],                                    unlocks:[42],      gives:['El cetro y la Voz'],                                    exclusive:[] },
  31: { name:'Plano de la Noche',             req:['El poder de la mejora','Artefacto recuperado'],             unlocks:[37,38,39,43], gives:['Artefacto purificado'],                             exclusive:[] },
  32: { name:'Bosque Decrépito',              req:['La petición de la Voz'],                                    unlocks:[33,40],   gives:[],                                                       exclusive:[] },
  33: { name:'Armería Savvas',                req:['La petición de la Voz|La orden del draco'],                 unlocks:[40],      gives:['El tesoro de la Voz','El tesoro del draco'],            exclusive:[] },
  34: { name:'Cumbre Calcinada',              req:['La orden del draco','El draco auxiliado:INCOMPLETO'],       unlocks:[],        gives:['El draco ejecutado'],                                   exclusive:[] },
  35: { name:'Almenas de Gloomhaven A',       req:['El recado de un demonio','La grieta neutralizada:INCOMPLETO'], unlocks:[45],  gives:['Gobierno de la ciudad: Demoníaco','Artefacto perdido'], exclusive:[36] },
  36: { name:'Almenas de Gloomhaven B',       req:['El recado de un demonio','La grieta neutralizada:INCOMPLETO'], unlocks:[],    gives:['La grieta neutralizada'],                               exclusive:[35] },
  37: { name:'Fosa Maldita',                  req:['Respiración subacuática'],                                  unlocks:[47],      gives:['A través de la Fosa'],                                  exclusive:[] },
  38: { name:'Jaula de Esclavos',             req:[],                                                           unlocks:[44,48],   gives:['La ayuda de Espina Carmesí'],                           exclusive:[] },
  39: { name:'Puente Traicionero',            req:[],                                                           unlocks:[15,46],   gives:['Al otro lado del puente'],                              exclusive:[] },
  40: { name:'Antigua Red de Defensa',        req:['La petición de la Voz','El tesoro de la Voz'],              unlocks:[41],      gives:['Tecnología antigua'],                                   exclusive:[] },
  41: { name:'Tumba Ancestral',               req:['La petición de la Voz'],                                    unlocks:[],        gives:['La Voz liberada'],                                      exclusive:[] },
  42: { name:'Reino de la Voz',               req:['El cetro y la Voz','La Voz liberada:INCOMPLETO'],           unlocks:[],        gives:['La Voz silenciada'],                                    exclusive:[] },
  43: { name:'Nido de Dracos',                req:['El poder de la mejora'],                                    unlocks:[],        gives:['Respiración subacuática'],                              exclusive:[] },
  44: { name:'Asalto Tribal',                 req:['La ayuda de Espina Carmesí'],                               unlocks:[],        gives:[],                                                       exclusive:[] },
  45: { name:'Pantano Rebelde',               req:['Gobierno de la ciudad: Demoníaco'],                         unlocks:[49,50],   gives:[],                                                       exclusive:[] },
  46: { name:'Cumbre Agónica',                req:['Al otro lado del puente'],                                  unlocks:[51],      gives:['El fin de la corrupción'],                              exclusive:[] },
  47: { name:'Guarida del Ojo que No Ve',     req:['A través de la Fosa'],                                      unlocks:[51],      gives:['El fin de la corrupción'],                              exclusive:[] },
  48: { name:'Bosque Sombrío',                req:['La ayuda de Espina Carmesí'],                               unlocks:[51],      gives:['El fin de la corrupción'],                              exclusive:[] },
  49: { name:'Resistencia Rebelde',           req:['Gobierno de la ciudad: Demoníaco'],                         unlocks:[],        gives:[],                                                       exclusive:[] },
  50: { name:'Fortaleza Fantasma',            req:[],                                                           unlocks:[],        gives:[],                                                       exclusive:[] },
  51: { name:'El Vacío',                      req:['El fin de la corrupción'],                                  unlocks:[],        gives:[],                                                       exclusive:[] },
};

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA
// ─────────────────────────────────────────────────────────────────────────────
function reqSatisfied(req, achieved) {
  if (req.includes('|')) return req.split('|').some(r => reqSatisfied(r.trim(), achieved));
  if (req.endsWith(':INCOMPLETO')) return !achieved.has(req.replace(':INCOMPLETO', '').trim());
  return achieved.has(req);
}

export function computeScenarioStates(completed, manualBlocked, chosenFromSpecial) {
  // permBlocked is fully derived from completed (exclusive lists) + manualBlocked
  const permBlocked = new Set(manualBlocked);
  for (const id of completed) {
    for (const e of (SCENARIOS[id]?.exclusive || [])) permBlocked.add(e);
  }

  const achieved = new Set();
  for (const id of completed)
    for (const g of (SCENARIOS[id]?.gives || [])) achieved.add(g);

  const unlocked = new Set([1]);
  for (const id of completed) {
    const sc = SCENARIOS[id];
    if (!sc) continue;
    for (const u of sc.unlocks) unlocked.add(u);
    if (sc.special === 'choose_one') {
      const chosen = chosenFromSpecial[id];
      if (chosen) unlocked.add(chosen);
    }
  }

  const states = {};
  for (const idStr of Object.keys(SCENARIOS)) {
    const id = parseInt(idStr);
    if (permBlocked.has(id)) {
      states[id] = 'permanently_blocked';
    } else if (completed.has(id)) {
      states[id] = 'completed';
    } else if (!unlocked.has(id)) {
      states[id] = 'locked';
    } else {
      const allMet = SCENARIOS[id].req.every(r => reqSatisfied(r, achieved));
      if (allMet) {
        states[id] = 'available';
      } else {
        // Check if any INCOMPLETO req is permanently violated (logro already achieved)
        const permViolated = SCENARIOS[id].req.some(r => {
          if (r.includes('|')) return false; // OR reqs — not necessarily permanent
          if (r.endsWith(':INCOMPLETO')) {
            const logro = r.replace(':INCOMPLETO', '').trim();
            return achieved.has(logro); // logro exists → this req permanently fails
          }
          return false;
        });
        states[id] = permViolated ? 'permanently_blocked' : 'unlocked_unavailable';
      }
    }
  }
  return { states, achieved, permBlocked };
}

// Compute everSeen: replay completed in order, track which nodes became non-locked
export function computeEverSeen(completedArray, manualBlocked, chosenFromSpecial) {
  const seen = new Set();
  // At each step, compute states with completed[0..i] and union non-locked nodes
  const partial = new Set();
  // Start: only scenario 1 is unlocked
  const { states: initStates } = computeScenarioStates(partial, manualBlocked, chosenFromSpecial);
  for (const [idStr] of Object.entries(initStates)) {
    if (initStates[parseInt(idStr)] !== 'locked') seen.add(parseInt(idStr));
  }
  for (const id of completedArray) {
    partial.add(id);
    const { states } = computeScenarioStates(partial, manualBlocked, chosenFromSpecial);
    for (const [idStr] of Object.entries(states)) {
      const nid = parseInt(idStr);
      if (states[nid] !== 'locked') seen.add(nid);
    }
  }
  return seen;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:'#0f0f1e', header:'#0a0a18', accent:'#e8b86d', border:'#2a2a4a',
  available:'#1a4a2e',   availableB:'#2ecc71',
  unavailable:'#3a2a0a', unavailableB:'#e67e22',
  completed:'#3a2e0a',   completedB:'#f1c40f',
  locked:'#1a1a2e',      lockedB:'#3a3a5e',
  perm:'#2e0a0a',        permB:'#e74c3c',
  modalBg:'#161628',
};

const STATE_META = {
  available:           { label:'Disponible',    color:C.availableB   },
  unlocked_unavailable:{ label:'Faltan logros',  color:C.unavailableB },
  completed:           { label:'Completado',     color:C.completedB   },
  locked:              { label:'Bloqueado',      color:C.lockedB      },
  permanently_blocked: { label:'Bloq. perm.',    color:C.permB        },
};

function stc(st) {
  switch(st) {
    case 'available':            return { bg:C.available,   b:C.availableB,   t:C.availableB   };
    case 'unlocked_unavailable': return { bg:C.unavailable, b:C.unavailableB, t:C.unavailableB };
    case 'completed':            return { bg:C.completed,   b:C.completedB,   t:C.completedB   };
    case 'permanently_blocked':  return { bg:C.perm,        b:C.permB,        t:C.permB        };
    default:                     return { bg:C.locked,      b:C.lockedB,      t:C.lockedB      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POSICIONES DEL GRAFO — layout vertical, rama desde 1 hacia abajo
// Cada posición: [col, row]. Se renderiza como x = col*CG, y = row*RG
// Escenarios en la misma fila cuando se desprenden del mismo padre
// ─────────────────────────────────────────────────────────────────────────────
const NW = 100, NH = 52, CG = 112, RG = 82;

// Posiciones calculadas algorítmicamente respetando relaciones padre→hijo
// [col, row] donde x = col*CG, y = row*RG
const GP = {
  1:  [5.5, 0],
  2:  [5.5, 1],
  3:  [5.0, 2],   4:  [6.0, 2],
  5:  [6.0, 3],   6:  [7.0, 3],   8:  [4.0, 3],   9:  [5.0, 3],
  7:  [2.0, 4],  10:  [7.0, 4],  11:  [4.0, 4],  12:  [5.0, 4],
  13: [3.0, 4],  14:  [6.0, 4],  19:  [8.0, 4],
  15: [2.0, 5],  16:  [4.0, 5],  17:  [3.0, 5],  18:  [5.0, 5],
  20: [1.0, 5],  21:  [7.0, 5],  22:  [8.0, 5],  27:  [9.0, 5],  28: [6.0, 5],
  23: [4.0, 6],  24:  [2.0, 6],  25:  [3.0, 6],  26:  [5.0, 6],
  29: [7.0, 6],  31:  [8.0, 6],  35:  [9.0, 6],  36: [10.0, 6],  43: [6.0, 6],
  30: [0.5, 7],  32:  [1.5, 7],  33:  [2.5, 7],  34:  [3.5, 7],
  37: [6.5, 7],  38:  [7.5, 7],  39:  [8.5, 7],  45:  [9.5, 7],
  40: [1.5, 8],  41:  [1.5, 9],  42:  [0.0, 8],
  44: [7.0, 8],  46:  [9.0, 8],  47:  [6.0, 8],  48:  [8.0, 8],
  49:[10.0, 8],  50: [11.0, 8],
  51: [7.5, 9],
};

// Compute canvas bounds
const allX = Object.values(GP).map(([c]) => c * CG);
const allY = Object.values(GP).map(([, r]) => r * RG);
const CW = Math.max(...allX) + NW + 32;
const CH = Math.max(...allY) + NH + 32;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ScenarioRoadmap({ onBack }) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const [tab, setTab]           = useState('graph');
  const [completedArr, setCompArr] = useState([]); // ordered array for replay
  const [completed, setComp]       = useState(new Set());
  const [manualBlocked, setManual] = useState(new Set()); // user-explicit blocks only
  const [chosenSp, setChosenSp]    = useState({});
  const [modalId, setModalId]      = useState(null);
  const [chooseModal, setChoose]   = useState(null);
  const [spoilers, setSpoilers]    = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Autosave — load on mount
  useEffect(() => {
    AsyncStorage.getItem(ROADMAP_SAVE_KEY).then(raw => {
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        if (d.completedArr) { setCompArr(d.completedArr); setComp(new Set(d.completedArr)); }
        if (d.manualBlocked) setManual(new Set(d.manualBlocked));
        if (d.chosenSp)      setChosenSp(d.chosenSp);
        if (d.spoilers !== undefined) setSpoilers(d.spoilers);
      } catch (_) {}
    }).catch(() => {});
  }, []);

  // Autosave — persist on every change
  useEffect(() => {
    AsyncStorage.setItem(ROADMAP_SAVE_KEY, JSON.stringify({
      completedArr,
      manualBlocked: Array.from(manualBlocked),
      chosenSp,
      spoilers,
    })).catch(() => {});
  }, [completedArr, manualBlocked, chosenSp, spoilers]);

  // Keep completed Set in sync with completedArr
  useEffect(() => {
    setComp(new Set(completedArr));
  }, [completedArr]);

  // Pan / zoom — start centered on scenario #1 (GP[1]=[4,0] → canvas center x=514, y=26)
  const INIT_SCALE = 0.7;
  const initX = Math.round(screenW / 2 - (5.5 * 112 + 50) * INIT_SCALE);
  const initY = Math.round(70 - 26 * INIT_SCALE);
  const panRef = useRef({ x: initX, y: initY });
  const pan    = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
  const scRef  = useRef(0.75);
  const scAnim = useRef(new Animated.Value(0.75)).current;
  const lastD  = useRef(null);

  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: panRef.current.x, y: panRef.current.y });
      pan.setValue({ x: 0, y: 0 });
      lastD.current = null;
    },
    onPanResponderMove: (evt, gs) => {
      const t = evt.nativeEvent.touches;
      if (t.length === 2) {
        const dx = t[0].pageX - t[1].pageX, dy = t[0].pageY - t[1].pageY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (lastD.current !== null) {
          const n = Math.min(Math.max(scRef.current * d / lastD.current, 0.25), 2.5);
          scRef.current = n; scAnim.setValue(n);
        }
        lastD.current = d;
      } else {
        lastD.current = null;
        pan.setValue({ x: gs.dx, y: gs.dy });
      }
    },
    onPanResponderRelease: (_, gs) => {
      panRef.current = { x: panRef.current.x + gs.dx, y: panRef.current.y + gs.dy };
      pan.flattenOffset();
    },
  })).current;

  const zoom = d => {
    const n = Math.min(Math.max(scRef.current * d, 0.25), 2.5);
    scRef.current = n;
    Animated.spring(scAnim, { toValue: n, useNativeDriver: true }).start();
  };

  const { states, achieved, permBlocked } = computeScenarioStates(completed, manualBlocked, chosenSp);
  const everSeen = computeEverSeen(completedArr, manualBlocked, chosenSp);

  const complete = useCallback((id) => {
    const sc = SCENARIOS[id];
    setCompArr(prev => prev.includes(id) ? prev : [...prev, id]);
    setComp(prev => new Set(prev).add(id));
    if (sc.special === 'choose_one') setChoose({ fromId: id });
  }, []);

  const uncomplete = useCallback((id) => {
    // Cascade: also remove completions that become unreachable after removing id
    setCompArr(prev => {
      let arr = prev.filter(x => x !== id);
      // Iteratively remove completions that are no longer unlocked
      let changed = true;
      while (changed) {
        changed = false;
        const { states: newStates } = computeScenarioStates(new Set(arr), new Set(), chosenSp);
        const toRemove = arr.filter(x => newStates[x] === 'locked');
        if (toRemove.length > 0) {
          arr = arr.filter(x => !toRemove.includes(x));
          changed = true;
        }
      }
      return arr;
    });
    setComp(prev => {
      // Will be re-synced via the setCompArr effect, but update immediately too
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }, [chosenSp]);

  const handleTap = useCallback((id) => {
    const st = states[id];
    if (st === 'available')   complete(id);
    else if (st === 'completed') uncomplete(id);
    else setModalId(id);
  }, [states, complete, uncomplete]);

  const counts = {};
  Object.values(states).forEach(st => { counts[st] = (counts[st] || 0) + 1; });

  return (
    <View style={[g.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.header} />

      {/* Header */}
      <View style={g.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={g.back}>‹</Text>
        </TouchableOpacity>
        <Text style={g.title}>Mapa de escenarios</Text>
        {/* Reset button */}
        <TouchableOpacity onPress={() => setResetConfirm(true)} style={g.eyeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={g.eyeIcon}>🔄</Text>
        </TouchableOpacity>
        {/* Spoiler toggle */}
        <TouchableOpacity onPress={() => setSpoilers(v => !v)} style={g.eyeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={g.eyeIcon}>{spoilers ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
        <View style={g.tabs}>
          {['graph', 'table'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[g.tab, tab === t && g.tabA]}>
              <Text style={[g.tabTxt, tab === t && g.tabTxtA]}>{t === 'graph' ? 'Grafo' : 'Tabla'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'graph' ? (
        <>
          {/* Legend */}
          <View style={g.legend}>
            {Object.entries(STATE_META)
              .filter(([k]) => k !== 'permanently_blocked' && (spoilers || k !== 'locked'))
              .map(([k, v]) => (
                <View key={k} style={g.legendItem}>
                  <View style={[g.dot, { backgroundColor: v.color }]} />
                  <Text style={g.legendTxt}>{v.label} ({counts[k] || 0})</Text>
                </View>
              ))}
          </View>

          {/* Zoom buttons */}
          <View style={g.zoomRow}>
            <TouchableOpacity style={g.zBtn} onPress={() => zoom(1.2)}><Text style={g.zTxt}>+</Text></TouchableOpacity>
            <TouchableOpacity style={g.zBtn} onPress={() => zoom(0.83)}><Text style={g.zTxt}>−</Text></TouchableOpacity>
          </View>

          {/* Canvas */}
          <View style={[g.canvas, { marginBottom: insets.bottom }]} {...pr.panHandlers}>
            <Animated.View style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: scAnim }] }}>
              <View style={{ width: CW, height: CH }}>
                {renderEdges(states, spoilers, everSeen)}
                {Object.keys(SCENARIOS).map(idStr => {
                  const id  = parseInt(idStr);
                  const pos = GP[id];
                  if (!pos) return null;
                  const st  = states[id];
                  if (!spoilers && st === 'locked') return null;
                  if (st === 'permanently_blocked' && !everSeen.has(id)) return null;
                  return (
                    <Node key={id} id={id} name={SCENARIOS[id].name}
                      state={st} x={pos[0] * CG} y={pos[1] * RG}
                      onTap={handleTap} onLongPress={() => setModalId(id)} />
                  );
                })}
              </View>
            </Animated.View>
          </View>

          <View style={[g.hintBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <Text style={g.hint}>Tap disponible = completar · Tap completado = desmarcar · Long press = info</Text>
          </View>
        </>
      ) : (
        <TableView
          states={states} achieved={achieved}
          completed={completed} permBlocked={permBlocked}
          spoilers={spoilers}
          onToggleComplete={id => { completed.has(id) ? uncomplete(id) : complete(id); }}
          onTogglePerm={id => {
            if (manualBlocked.has(id)) { setManual(p => { const n = new Set(p); n.delete(id); return n; }); }
            else { setManual(p => new Set(p).add(id)); uncomplete(id); }
          }}
          insets={insets}
        />
      )}

      {/* Info Modal */}
      {modalId && (
        <InfoModal id={modalId} scenario={SCENARIOS[modalId]} state={states[modalId]} achieved={achieved}
          onClose={() => setModalId(null)}
          onComplete={() => { complete(modalId); setModalId(null); }}
          onUncomplete={() => { uncomplete(modalId); setModalId(null); }}
          onBlock={() => { setManual(p => new Set(p).add(modalId)); uncomplete(modalId); setModalId(null); }}
          onUnblock={() => { setManual(p => { const n = new Set(p); n.delete(modalId); return n; }); setModalId(null); }}
        />
      )}

      {/* Reset confirm modal */}
      <Modal visible={resetConfirm} transparent animationType="fade" onRequestClose={() => setResetConfirm(false)}>
        <View style={g.overlay}>
          <View style={[g.mbox, { padding: 24 }]}>
            <Text style={[g.mname, { marginBottom: 8 }]}>¿Reiniciar campaña?</Text>
            <Text style={[g.minfo, { marginBottom: 20 }]}>
              Se borrará todo el progreso del mapa. Esta acción no se puede deshacer.
            </Text>
            <Btn color={C.permB} label="Sí, reiniciar" onPress={() => {
              setCompArr([]);
              setComp(new Set());
              setManual(new Set());
              setChosenSp({});
              AsyncStorage.removeItem(ROADMAP_SAVE_KEY).catch(() => {});
              setResetConfirm(false);
            }} />
            <TouchableOpacity onPress={() => setResetConfirm(false)}
              style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: '#888', fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Choose-one modal (esc 13) */}
      {chooseModal && (
        <ChooseOneModal fromId={chooseModal.fromId}
          options={SCENARIOS[chooseModal.fromId].unlocks_choice || []}
          onChoose={chosen => { setChosenSp(p => ({ ...p, [chooseModal.fromId]: chosen })); setChoose(null); }}
          onSkip={() => setChoose(null)}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NODO
// ─────────────────────────────────────────────────────────────────────────────
function Node({ id, name, state, x, y, onTap, onLongPress }) {
  const col = stc(state);
  return (
    <TouchableOpacity activeOpacity={0.75}
      onPress={() => onTap(id)} onLongPress={() => onLongPress(id)}
      style={[g.node, { left: x, top: y, width: NW, minHeight: NH, backgroundColor: col.bg, borderColor: col.b }]}>
      <Text style={[g.nNum, { color: col.b }]}>#{id}</Text>
      <Text style={[g.nName, { color: col.t }]}>{name}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE VIEW
// ─────────────────────────────────────────────────────────────────────────────
function TableView({ states, achieved, completed, permBlocked, manualBlocked, spoilers, onToggleComplete, onTogglePerm, insets }) {
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    ['all', 'Todos'],
    ['available', 'Dispon.'],
    ['completed', 'Comp.'],
    ['unlocked_unavailable', 'Logros'],
    ['locked', 'Bloq.'],
    ['permanently_blocked', 'Perm.'],
  ];

  const rows = Object.entries(SCENARIOS).filter(([idStr]) => {
    const id = parseInt(idStr);
    const st = states[id];
    if (!spoilers && (st === 'locked' || st === 'permanently_blocked')) return false;
    if (filter === 'all') return true;
    return st === filter;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Filter bar — compact, fixed height */}
      <View style={g.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 6, paddingVertical: 6, alignItems: 'center' }}>
          {FILTERS.map(([k, l]) => (
            <TouchableOpacity key={k} onPress={() => setFilter(k)}
              style={[g.fBtn, filter === k && g.fBtnA]}>
              <Text style={[g.fTxt, filter === k && g.fTxtA]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Table header */}
      <View style={g.thead}>
        <Text style={[g.th, { width: 32 }]}>#</Text>
        <Text style={[g.th, { flex: 1 }]}>Nombre / Detalles</Text>
        <Text style={[g.th, { width: 72, textAlign: 'center' }]}>Estado</Text>
        <Text style={[g.th, { width: 40, textAlign: 'center' }]}>✓</Text>
        <Text style={[g.th, { width: 40, textAlign: 'center' }]}>🚫</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        {rows.map(([idStr, scenario]) => {
          const id    = parseInt(idStr);
          const st    = states[id];
          const col   = stc(st);
          const isC   = completed.has(id);
          const isP   = manualBlocked.has(id);
          return (
            <View key={id} style={[g.trow, { borderLeftColor: col.b }]}>
              <Text style={[g.tdNum, { color: col.b }]}>#{id}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[g.tdName, { color: col.t }]}>{scenario.name}</Text>
                {scenario.req.length > 0 && (
                  <View style={g.reqRow}>
                    {scenario.req.map((r, i) => {
                      const met   = reqSatisfied(r, achieved);
                      const clean = r.replace(':INCOMPLETO', ' ✗').replace('|', ' o ');
                      return (
                        <Text key={i} style={[g.chip, { color: met ? '#2ecc71' : '#e74c3c', borderColor: met ? '#2ecc71' : '#e74c3c' }]}>
                          {clean}
                        </Text>
                      );
                    })}
                  </View>
                )}
                {scenario.gives.length > 0 && <Text style={g.gives}>Da: {scenario.gives.join(' · ')}</Text>}
                {scenario.unlocks.length > 0 && <Text style={g.unlocksTxt}>Desbloquea: {scenario.unlocks.map(u => `#${u}`).join(', ')}</Text>}
                {scenario.exclusive.length > 0 && <Text style={g.exclTxt}>Bloquea: {scenario.exclusive.map(u => `#${u}`).join(', ')}</Text>}
              </View>
              <Text style={[g.tdSt, { color: col.b }]}>{STATE_META[st]?.label}</Text>
              <TouchableOpacity style={[g.tBtn, isC && { backgroundColor: '#3a2e0a' }]} onPress={() => onToggleComplete(id)}>
                <Text style={{ fontSize: 18 }}>{isC ? '⭐' : '○'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[g.tBtn, isP && { backgroundColor: '#2e0a0a' }]} onPress={() => onTogglePerm(id)}>
                <Text style={{ fontSize: 18 }}>{isP ? '🚫' : '○'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO MODAL
// ─────────────────────────────────────────────────────────────────────────────
function InfoModal({ id, scenario, state, achieved, onClose, onComplete, onUncomplete, onBlock, onUnblock }) {
  const col = stc(state);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={g.overlay}>
        <ScrollView style={g.mbox} contentContainerStyle={{ padding: 20 }}>
          <Text style={[g.mnum, { color: col.b }]}>Escenario #{id}</Text>
          <Text style={g.mname}>{scenario.name}</Text>
          <Text style={[g.mstate, { color: col.b }]}>{STATE_META[state]?.label}</Text>

          {scenario.req.length > 0 && (
            <View style={g.msec}>
              <Text style={g.msecT}>Requisitos</Text>
              {scenario.req.map((r, i) => {
                const met   = reqSatisfied(r, achieved);
                const clean = r.replace(':INCOMPLETO', ' (no tener)').replace('|', ' o ');
                return <Text key={i} style={{ fontSize: 13, color: met ? '#2ecc71' : '#e74c3c', lineHeight: 20 }}>{met ? '✓' : '✗'} {clean}</Text>;
              })}
            </View>
          )}
          {scenario.gives.length > 0 && (
            <View style={g.msec}>
              <Text style={g.msecT}>Da al completar</Text>
              <Text style={g.minfo}>{scenario.gives.join('\n')}</Text>
            </View>
          )}
          {scenario.unlocks.length > 0 && (
            <View style={g.msec}>
              <Text style={g.msecT}>Desbloquea</Text>
              <Text style={g.minfo}>{scenario.unlocks.map(u => `#${u} ${SCENARIOS[u]?.name}`).join('\n')}</Text>
            </View>
          )}
          {(scenario.unlocks_choice || []).length > 0 && (
            <View style={g.msec}>
              <Text style={g.msecT}>Elige una nueva ubicación</Text>
              <Text style={g.minfo}>{(scenario.unlocks_choice || []).map(u => `#${u} ${SCENARIOS[u]?.name}`).join('\n')}</Text>
            </View>
          )}
          {scenario.exclusive.length > 0 && (
            <View style={g.msec}>
              <Text style={g.msecT}>Bloquea permanentemente</Text>
              <Text style={[g.minfo, { color: C.permB }]}>{scenario.exclusive.map(u => `#${u} ${SCENARIOS[u]?.name}`).join('\n')}</Text>
            </View>
          )}

          <View style={{ gap: 8, marginTop: 16, marginBottom: 8 }}>
            {state === 'available'          && <Btn color={C.availableB} label="Marcar completado"          onPress={onComplete} />}
            {state === 'completed'          && <Btn color="#555"          label="Desmarcar"                  onPress={onUncomplete} />}
            {state !== 'permanently_blocked'&& <Btn color={C.permB}       label="Bloquear permanentemente"   onPress={onBlock} />}
            {state === 'permanently_blocked'&& <Btn color="#555"          label="Quitar bloqueo permanente"  onPress={onUnblock} />}
          </View>

          <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: '#555', fontSize: 13 }}>Cerrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHOOSE ONE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ChooseOneModal({ fromId, options, onChoose, onSkip }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onSkip}>
      <View style={g.overlay}>
        <View style={[g.mbox, { padding: 20 }]}>
          <Text style={g.mname}>Elegí una nueva ubicación</Text>
          <Text style={[g.minfo, { marginBottom: 16 }]}>El escenario #{fromId} revela UNA de estas. Elegí cuál:</Text>
          {options.map(oid => (
            <TouchableOpacity key={oid} onPress={() => onChoose(oid)}
              style={{ borderRadius: 8, borderWidth: 1, borderColor: C.availableB, padding: 12, marginBottom: 8 }}>
              <Text style={{ color: C.availableB, fontSize: 14, fontWeight: '600' }}>#{oid} — {SCENARIOS[oid]?.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onSkip} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: '#555', fontSize: 13 }}>Decidir después</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Btn({ label, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: color, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER EDGES
// ─────────────────────────────────────────────────────────────────────────────
function renderEdges(states, spoilers, everSeen) {
  const lines = [];
  for (const [idStr, scenario] of Object.entries(SCENARIOS)) {
    const fid = parseInt(idStr);
    const fp  = GP[fid];
    if (!fp) continue;
    const fst = states[fid];
    if (!spoilers && fst === 'locked') continue;
    if (fst === 'permanently_blocked') continue;

    const targets = [...scenario.unlocks, ...(scenario.unlocks_choice || [])];
    for (const tid of targets) {
      const tp  = GP[tid];
      if (!tp) continue;
      const tst = states[tid];
      if (!spoilers && tst === 'locked') continue;
      if (tst === 'permanently_blocked' && !everSeen.has(tid)) continue;

      const color =
        fst === 'completed' && tst === 'completed' ? '#f1c40f88' :
        fst === 'completed'                        ? '#2ecc7155' :
        '#2a2a4a88';

      const x1 = fp[0] * CG + NW / 2, y1 = fp[1] * RG + NH;
      const x2 = tp[0] * CG + NW / 2, y2 = tp[1] * RG;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      lines.push(
        <View key={`${fid}-${tid}`} style={{
          position: 'absolute', left: x1, top: y1,
          width: len, height: 2, backgroundColor: color,
          transformOrigin: '0 50%',
          transform: [{ rotate: `${angle}deg` }],
        }} />
      );
    }
  }
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const g = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  header:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.header,
              paddingHorizontal: 16, paddingVertical: 8, gap: 8,
              borderBottomWidth: 1, borderBottomColor: C.border },
  back:     { color: C.accent, fontSize: 28, lineHeight: 32 },
  title:    { flex: 1, color: C.accent, fontSize: 16, fontWeight: 'bold' },
  eyeBtn:   { padding: 4 },
  eyeIcon:  { fontSize: 20 },
  tabs:     { flexDirection: 'row', gap: 4 },
  tab:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
              backgroundColor: '#1a1a30', borderWidth: 1, borderColor: C.border },
  tabA:     { backgroundColor: C.accent },
  tabTxt:   { color: '#888', fontSize: 12, fontWeight: '600' },
  tabTxtA:  { color: '#000' },

  legend:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingVertical: 5,
              backgroundColor: '#0a0a18', gap: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  legendTxt:{ color: '#888', fontSize: 10 },

  zoomRow:  { position: 'absolute', right: 12, top: 114, zIndex: 10, gap: 6 },
  zBtn:     { backgroundColor: '#1a1a30', borderRadius: 6, width: 36, height: 36,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.border },
  zTxt:     { color: '#ccc', fontSize: 20, fontWeight: 'bold' },

  canvas:   { flex: 1, overflow: 'hidden' },
  hintBar:  { backgroundColor: C.header, borderTopWidth: 1, borderTopColor: C.border },
  hint:     { color: '#333', fontSize: 10, textAlign: 'center', paddingVertical: 4 },

  node:     { position: 'absolute', borderWidth: 1.5, borderRadius: 8,
              paddingHorizontal: 6, paddingVertical: 4,
              alignItems: 'center', justifyContent: 'center' },
  nNum:     { fontSize: 10, fontWeight: 'bold', marginBottom: 1 },
  nName:    { fontSize: 9, textAlign: 'center', lineHeight: 13 },

  // Table
  filterBar:{ backgroundColor: '#0a0a18', borderBottomWidth: 1, borderBottomColor: C.border, height: 46 },
  fBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
              borderWidth: 1, borderColor: C.border, backgroundColor: '#1a1a30' },
  fBtnA:    { backgroundColor: C.accent, borderColor: C.accent },
  fTxt:     { color: '#888', fontSize: 12 },
  fTxtA:    { color: '#000', fontWeight: 'bold' },

  thead:    { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6,
              backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: C.border },
  th:       { color: '#555', fontSize: 11, fontWeight: 'bold' },

  trow:     { flexDirection: 'row', alignItems: 'flex-start',
              paddingHorizontal: 8, paddingVertical: 8,
              borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
              gap: 6, borderLeftWidth: 3 },
  tdNum:    { width: 32, fontSize: 12, fontWeight: 'bold', paddingTop: 2 },
  tdName:   { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  tdSt:     { width: 72, fontSize: 10, paddingTop: 3, textAlign: 'right' },
  tBtn:     { width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 4 },
  reqRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 3 },
  chip:     { fontSize: 10, borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  gives:    { fontSize: 10, color: '#f1c40f88', marginTop: 1 },
  unlocksTxt:{ fontSize: 10, color: '#2ecc7188', marginTop: 1 },
  exclTxt:  { fontSize: 10, color: '#e74c3c88', marginTop: 1 },

  // Modal
  overlay:  { flex: 1, backgroundColor: '#000c', justifyContent: 'center', alignItems: 'center' },
  mbox:     { backgroundColor: C.modalBg, borderRadius: 14, width: '88%', maxWidth: 400,
              maxHeight: '85%', borderWidth: 1, borderColor: C.border },
  mnum:     { fontSize: 12, marginBottom: 2 },
  mname:    { color: C.accent, fontSize: 19, fontWeight: 'bold', marginBottom: 4 },
  mstate:   { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  msec:     { marginBottom: 10 },
  msecT:    { color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  minfo:    { color: '#ccc', fontSize: 13, lineHeight: 19 },
});
