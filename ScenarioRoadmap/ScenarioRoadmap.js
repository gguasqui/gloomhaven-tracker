// ScenarioRoadmap.js
// Pantalla de roadmap de escenarios de Gloomhaven (juego base, escenarios 1-51)
// Usar con React Native + Expo. Integrar en App.js cuando esté listo.

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  PanResponder, Animated, Dimensions, Modal, StatusBar, Platform,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DEL GRAFO
// Estado por escenario: 'locked' | 'available' | 'completed' | 'permanently_blocked'
// req: [] = ninguno, ['logro'] = necesita ese logro global
// unlocks: escenarios que se revelan al completar este
// exclusive: completar este bloquea permanentemente otros (ej: esc 11 vs 12)
// ─────────────────────────────────────────────────────────────────────────────

export const SCENARIOS = {
  1:  { name: 'Túmulo Negro',                   req: [],                                              unlocks: [2],         exclusive: [] },
  2:  { name: 'Guarida del Túmulo',              req: ['Primeros pasos'],                              unlocks: [3, 4],      exclusive: [] },
  3:  { name: 'Campamento Inox',                 req: ['La comerciante huye ✗'],                       unlocks: [8, 9],      exclusive: [] },
  4:  { name: 'Cripta de los Malditos',          req: [],                                              unlocks: [5, 6],      exclusive: [] },
  5:  { name: 'Cripta Ruinosa',                  req: [],                                              unlocks: [10, 14, 19],exclusive: [] },
  6:  { name: 'Cripta Decadente',                req: [],                                              unlocks: [8],         exclusive: [] },
  7:  { name: 'Gruta Trepidante',                req: ['El poder de la mejora', 'La comerciante huye'],unlocks: [20],        exclusive: [] },
  8:  { name: 'Almacén de Gloomhaven',           req: ['Los planes de Jekserah', 'La invasión de los muertos ✗'], unlocks: [7, 13, 14], exclusive: [] },
  9:  { name: 'Mina de Diamantes',               req: ['La comerciante huye ✗'],                       unlocks: [11, 12],    exclusive: [] },
  10: { name: 'Plano del Poder Elemental',       req: ['La grieta neutralizada ✗'],                    unlocks: [21, 22],    exclusive: [] },
  11: { name: 'Plaza de Gloomhaven A',           req: ['Fin de la invasión ✗'],                        unlocks: [16, 18],    exclusive: [12] },
  12: { name: 'Plaza de Gloomhaven B',           req: ['Fin de la invasión ✗'],                        unlocks: [16, 18, 28],exclusive: [11] },
  13: { name: 'Templo del Vidente',              req: [],                                              unlocks: [],          exclusive: [], special: 'elige_uno_de:[15,17,20]' },
  14: { name: 'Hondonada Helada',                req: [],                                              unlocks: [7, 19, 31, 43], exclusive: [] },
  15: { name: 'Altar de la Fuerza',              req: [],                                              unlocks: [],          exclusive: [] },
  16: { name: 'El Paso de la Montaña',           req: [],                                              unlocks: [24, 25],    exclusive: [] },
  17: { name: 'Isla Perdida',                    req: [],                                              unlocks: [],          exclusive: [] },
  18: { name: 'Cloacas Abandonadas',             req: [],                                              unlocks: [14, 23, 26, 43], exclusive: [] },
  19: { name: 'Cripta Olvidada',                 req: ['El poder de la mejora'],                       unlocks: [27],        exclusive: [] },
  20: { name: 'Santuario de la Nigromante',      req: ['La comerciante huye'],                         unlocks: [16, 18, 28],exclusive: [] },
  21: { name: 'Trono Infernal',                  req: ['La grieta neutralizada ✗'],                    unlocks: [],          exclusive: [] },
  22: { name: 'Templo de los Elementos',         req: ['El recado de un demonio o Tras la pista'],     unlocks: [14, 31],    exclusive: [] },
  23: { name: 'Ruinas Profundas',                req: [],                                              unlocks: [26],        exclusive: [] },
  24: { name: 'Cámara de los Ecos',              req: [],                                              unlocks: [30, 32],    exclusive: [] },
  25: { name: 'Ascenso al Risco de Hielo',       req: [],                                              unlocks: [33, 34],    exclusive: [] },
  26: { name: 'Antiguo Aljibe',                  req: ['Respiración subacuática o A través de las ruinas'], unlocks: [22], exclusive: [] },
  27: { name: 'Grieta Destructiva',              req: ['Artefacto perdido ✗', 'Incensario de Romperrocas'], unlocks: [], exclusive: [] },
  28: { name: 'Cámara Ritual Ultraterrestre',    req: ['Encargo siniestro'],                           unlocks: [29],        exclusive: [] },
  29: { name: 'Santuario de la Penumbra',        req: ['Una invitación'],                              unlocks: [],          exclusive: [] },
  30: { name: 'Altar de las Profundidades',      req: ['La petición de la Voz'],                       unlocks: [42],        exclusive: [] },
  31: { name: 'Plano de la Noche',               req: ['El poder de la mejora', 'Artefacto recuperado'], unlocks: [37, 38, 39, 43], exclusive: [] },
  32: { name: 'Bosque Decrépito',                req: ['La petición de la Voz'],                       unlocks: [33, 40],    exclusive: [] },
  33: { name: 'Armería Savvas',                  req: ['La petición de la Voz o La orden del draco'],  unlocks: [40],        exclusive: [] },
  34: { name: 'Cumbre Calcinada',                req: ['La orden del draco', 'El draco auxiliado ✗'],  unlocks: [],          exclusive: [] },
  35: { name: 'Almenas de Gloomhaven A',         req: ['El recado de un demonio', 'La grieta neutralizada ✗'], unlocks: [45], exclusive: [36] },
  36: { name: 'Almenas de Gloomhaven B',         req: ['El recado de un demonio', 'La grieta neutralizada ✗'], unlocks: [],  exclusive: [35] },
  37: { name: 'Fosa Maldita',                    req: ['Respiración subacuática'],                     unlocks: [47],        exclusive: [] },
  38: { name: 'Jaula de Esclavos',               req: [],                                              unlocks: [44, 48],    exclusive: [] },
  39: { name: 'Puente Traicionero',              req: [],                                              unlocks: [15, 46],    exclusive: [] },
  40: { name: 'Antigua Red de Defensa',          req: ['La petición de la Voz', 'El tesoro de la Voz'],unlocks: [41],        exclusive: [] },
  41: { name: 'Tumba Ancestral',                 req: ['La petición de la Voz'],                       unlocks: [],          exclusive: [] },
  42: { name: 'Reino de la Voz',                 req: ['El cetro y la Voz', 'La Voz liberada ✗'],      unlocks: [],          exclusive: [] },
  43: { name: 'Nido de Dracos',                  req: ['El poder de la mejora'],                       unlocks: [],          exclusive: [] },
  44: { name: 'Asalto Tribal',                   req: ['La ayuda de Espina Carmesí'],                  unlocks: [],          exclusive: [] },
  45: { name: 'Pantano Rebelde',                 req: ['Gobierno de la ciudad: Demoníaco'],             unlocks: [49, 50],    exclusive: [] },
  46: { name: 'Cumbre Agónica',                  req: ['Al otro lado del puente'],                     unlocks: [51],        exclusive: [] },
  47: { name: 'Guarida del Ojo que No Ve',       req: ['A través de la Fosa'],                         unlocks: [51],        exclusive: [] },
  48: { name: 'Bosque Sombrío',                  req: ['La ayuda de Espina Carmesí'],                  unlocks: [51],        exclusive: [] },
  49: { name: 'Resistencia Rebelde',             req: ['Gobierno de la ciudad: Demoníaco'],             unlocks: [],          exclusive: [] },
  50: { name: 'Fortaleza Fantasma',              req: [],                                              unlocks: [],          exclusive: [] },
  51: { name: 'El Vacío',                        req: ['El fin de la corrupción'],                     unlocks: [],          exclusive: [] },
};

// Posiciones en la grilla lógica (col, row) — basadas en el flujo narrativo del juego
// El canvas tiene 18 columnas × 14 filas
export const POSITIONS = {
  1:  [2,  1],
  2:  [2,  3],
  3:  [0,  5],   4:  [4,  5],
  5:  [4,  7],   6:  [6,  5],
  7:  [10, 7],   8:  [8,  7],
  9:  [2,  7],
  10: [4,  9],   11: [6,  9],   12: [8,  9],
  13: [10, 5],
  14: [4, 11],   15: [12, 7],   16: [6, 11],   17: [14, 7],
  18: [8, 11],   19: [2,  9],   20: [10, 3],
  21: [4, 11],   22: [6, 11],   23: [8, 13],
  24: [6, 13],   25: [8, 13],
  26: [10,13],   27: [0, 11],   28: [8, 11],
  29: [10,13],   30: [6, 13],   31: [12,11],
  32: [6, 13],   33: [8, 13],   34: [10,13],
  35: [12,13],   36: [14,13],   37: [8, 13],
  38: [6, 13],   39: [10,11],   40: [8, 13],
  41: [10,13],   42: [6, 13],   43: [4, 13],
  44: [8, 13],   45: [14,11],   46: [12,11],
  47: [10,13],   48: [10,13],   49: [16,11],   50: [16,13],
  51: [14,13],
};

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA DE ESTADOS
// ─────────────────────────────────────────────────────────────────────────────

// logros globales que se obtienen al completar ciertos escenarios
const ACHIEVEMENT_BY_SCENARIO = {
  2:  ['Primeros pasos'],
  3:  ['La comerciante huye ✗'],  // marca que este logro se PIERDE (bloqueado)
  9:  ['La invasión de los muertos'],
  11: ['Fin de la invasión', 'Gobierno de la ciudad: Económico'],
  12: ['Fin de la invasión'],
  19: ['Incensario de Romperrocas'],
  20: ['La comerciante huye'],
  21: ['La grieta neutralizada'],
  22: ['Artefacto recuperado'],
  23: ['A través de las ruinas'],
  24: ['La petición de la Voz'],
  26: ['Tras la pista'],
  27: ['La grieta neutralizada'],
  28: ['Una invitación', 'Encargo siniestro'],
  29: ['El filo de la oscuridad'],
  30: ['El cetro y la Voz'],
  31: ['Artefacto purificado'],
  32: ['A través de las ruinas'],
  33: ['El tesoro de la Voz', 'El tesoro del draco'],
  34: ['El draco ejecutado'],
  35: ['Gobierno de la ciudad: Demoníaco', 'Artefacto perdido'],
  36: ['La grieta neutralizada', 'Gobierno de la ciudad: Demoníaco'],
  37: ['A través de la Fosa'],
  38: ['La ayuda de Espina Carmesí'],
  39: ['Al otro lado del puente'],
  40: ['Tecnología antigua'],
  41: ['La Voz liberada'],
  42: ['La Voz silenciada'],
  43: ['Respiración subacuática'],
  46: ['El fin de la corrupción'],
  47: ['El fin de la corrupción'],
  48: ['El fin de la corrupción'],
  7:  ['El poder de la mejora'],
  10: ['El recado de un demonio'],
  14: ['El poder de la mejora'],
};

function computeAchievements(completed) {
  const achieved = new Set();
  for (const id of completed) {
    const ach = ACHIEVEMENT_BY_SCENARIO[id] || [];
    for (const a of ach) achieved.add(a);
  }
  return achieved;
}

function hasReq(reqList, achieved) {
  if (reqList.length === 0) return true;
  // "o" separates alternatives
  return reqList.every(req => {
    if (req.includes(' o ')) {
      return req.split(' o ').some(r => achieved.has(r.trim()));
    }
    // ✗ means "this achievement must NOT be present" (global INCOMPLETE)
    if (req.endsWith(' ✗')) {
      const name = req.slice(0, -2).trim();
      return !achieved.has(name);
    }
    return achieved.has(req);
  });
}

export function computeScenarioStates(completed, permanentlyBlocked) {
  const achieved = computeAchievements(completed);
  const states = {};

  // First find all unlocked scenario numbers
  const unlockedByCompletion = new Set([1]); // scenario 1 always starts unlocked
  for (const id of completed) {
    for (const u of (SCENARIOS[id]?.unlocks || [])) {
      unlockedByCompletion.add(u);
    }
    // special: esc 13 unlocks one of 15,17,20 (player picks)
  }

  for (const [idStr, scenario] of Object.entries(SCENARIOS)) {
    const id = parseInt(idStr);
    if (permanentlyBlocked.has(id)) {
      states[id] = 'permanently_blocked';
    } else if (completed.has(id)) {
      states[id] = 'completed';
    } else if (!unlockedByCompletion.has(id)) {
      states[id] = 'locked';
    } else if (!hasReq(scenario.req, achieved)) {
      states[id] = 'unlocked_unavailable'; // desbloqueado pero faltan logros
    } else {
      states[id] = 'available';
    }
  }
  return states;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  bg:                  '#1a1a2e',
  node_locked:         '#2a2a3e',
  node_locked_border:  '#3a3a5e',
  node_available:      '#1a4a2e',
  node_available_brd:  '#2ecc71',
  node_unavailable:    '#4a3a1a',
  node_unavailable_brd:'#e67e22',
  node_completed:      '#4a3a1a',
  node_completed_brd:  '#f1c40f',
  node_perm_blocked:   '#3a1a1a',
  node_perm_blocked_brd:'#c0392b',
  text_locked:         '#555577',
  text_available:      '#2ecc71',
  text_unavailable:    '#e67e22',
  text_completed:      '#f1c40f',
  text_perm_blocked:   '#c0392b',
  edge_default:        '#2a2a4e',
  edge_available:      '#2ecc7155',
  edge_completed:      '#f1c40f88',
  header:              '#0f0f23',
  accent:              '#e8b86d',
  btn_bg:              '#2a2a4e',
  btn_text:            '#ccc',
  modal_bg:            '#1e1e3a',
};

const STATE_LABELS = {
  locked:              '🔒 Bloqueado',
  available:           '✅ Disponible',
  unlocked_unavailable:'⏳ Faltan logros',
  completed:           '⭐ Completado',
  permanently_blocked: '❌ Bloqueado perm.',
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT DEL GRAFO
// Posiciones refinadas para que el grafo sea navegable y parecido al tablero
// ─────────────────────────────────────────────────────────────────────────────
const NODE_W = 90;
const NODE_H = 50;
const COL_GAP = 110;
const ROW_GAP = 70;

// Posiciones absolutas en el canvas (px)
const GRAPH_POSITIONS = {
  1:  [1*COL_GAP,  0*ROW_GAP],
  2:  [1*COL_GAP,  1*ROW_GAP],
  3:  [0*COL_GAP,  2*ROW_GAP],
  4:  [2*COL_GAP,  2*ROW_GAP],
  5:  [2*COL_GAP,  3*ROW_GAP],
  6:  [3*COL_GAP,  2*ROW_GAP],
  7:  [5*COL_GAP,  3*ROW_GAP],
  8:  [4*COL_GAP,  3*ROW_GAP],
  9:  [0*COL_GAP,  3*ROW_GAP],
  10: [2*COL_GAP,  4*ROW_GAP],
  11: [3*COL_GAP,  4*ROW_GAP],
  12: [4*COL_GAP,  4*ROW_GAP],
  13: [5*COL_GAP,  2*ROW_GAP],
  14: [2*COL_GAP,  5*ROW_GAP],
  15: [6*COL_GAP,  3*ROW_GAP],
  16: [3*COL_GAP,  5*ROW_GAP],
  17: [7*COL_GAP,  2*ROW_GAP],
  18: [4*COL_GAP,  5*ROW_GAP],
  19: [1*COL_GAP,  4*ROW_GAP],
  20: [5*COL_GAP,  1*ROW_GAP],
  21: [2*COL_GAP,  5*ROW_GAP],
  22: [3*COL_GAP,  5*ROW_GAP],
  23: [4*COL_GAP,  6*ROW_GAP],
  24: [3*COL_GAP,  6*ROW_GAP],
  25: [4*COL_GAP,  6*ROW_GAP],
  26: [5*COL_GAP,  6*ROW_GAP],
  27: [0*COL_GAP,  5*ROW_GAP],
  28: [4*COL_GAP,  5*ROW_GAP],
  29: [5*COL_GAP,  6*ROW_GAP],
  30: [3*COL_GAP,  7*ROW_GAP],
  31: [6*COL_GAP,  5*ROW_GAP],
  32: [3*COL_GAP,  7*ROW_GAP],
  33: [4*COL_GAP,  7*ROW_GAP],
  34: [5*COL_GAP,  7*ROW_GAP],
  35: [6*COL_GAP,  7*ROW_GAP],
  36: [7*COL_GAP,  7*ROW_GAP],
  37: [4*COL_GAP,  6*ROW_GAP],
  38: [3*COL_GAP,  6*ROW_GAP],
  39: [5*COL_GAP,  5*ROW_GAP],
  40: [4*COL_GAP,  7*ROW_GAP],
  41: [5*COL_GAP,  8*ROW_GAP],
  42: [3*COL_GAP,  8*ROW_GAP],
  43: [2*COL_GAP,  7*ROW_GAP],
  44: [4*COL_GAP,  8*ROW_GAP],
  45: [7*COL_GAP,  5*ROW_GAP],
  46: [6*COL_GAP,  6*ROW_GAP],
  47: [5*COL_GAP,  7*ROW_GAP],
  48: [5*COL_GAP,  8*ROW_GAP],
  49: [8*COL_GAP,  5*ROW_GAP],
  50: [8*COL_GAP,  7*ROW_GAP],
  51: [7*COL_GAP,  8*ROW_GAP],
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ScenarioRoadmap({ onBack }) {
  const [completed, setCompleted]       = useState(new Set());
  const [permBlocked, setPermBlocked]   = useState(new Set());
  const [selectedId, setSelectedId]     = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Pan & Zoom
  const pan   = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const panOffset   = useRef({ x: 0, y: 0 });
  const scaleValue  = useRef(1);
  const lastDist    = useRef(null);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: panOffset.current.x, y: panOffset.current.y });
      pan.setValue({ x: 0, y: 0 });
      lastDist.current = null;
    },
    onPanResponderMove: (evt, gs) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        // pinch
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastDist.current !== null) {
          const delta = dist / lastDist.current;
          const next  = Math.min(Math.max(scaleValue.current * delta, 0.3), 3);
          scaleValue.current = next;
          scale.setValue(next);
        }
        lastDist.current = dist;
      } else {
        lastDist.current = null;
        pan.setValue({ x: gs.dx, y: gs.dy });
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) < 5 && Math.abs(gs.dy) < 5 && gs.numberActiveTouches === 0) {
        // tap — handled by node
      }
      panOffset.current = {
        x: panOffset.current.x + gs.dx,
        y: panOffset.current.y + gs.dy,
      };
      pan.flattenOffset();
    },
  })).current;

  const states = computeScenarioStates(completed, permBlocked);

  const handleZoom = useCallback((delta) => {
    const next = Math.min(Math.max(scaleValue.current * delta, 0.3), 3);
    scaleValue.current = next;
    Animated.spring(scale, { toValue: next, useNativeDriver: true }).start();
  }, [scale]);

  const handleNodeTap = useCallback((id) => {
    const st = states[id];
    if (st === 'completed') {
      // Desmarcar
      setCompleted(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else if (st === 'available') {
      // Marcar completado
      const scenario = SCENARIOS[id];
      // Manejar exclusivos: bloquear permanentemente los alternativos
      const newPerm = new Set(permBlocked);
      for (const excl of scenario.exclusive) newPerm.add(excl);
      setPermBlocked(newPerm);
      setCompleted(prev => new Set(prev).add(id));
    } else if (st === 'locked' || st === 'unlocked_unavailable' || st === 'permanently_blocked') {
      // Mostrar modal con info
      setSelectedId(id);
      setModalVisible(true);
    }
  }, [states, permBlocked]);

  const handleLongPress = useCallback((id) => {
    setSelectedId(id);
    setModalVisible(true);
  }, []);

  // Canvas size
  const canvasW = 9 * COL_GAP + NODE_W + 20;
  const canvasH = 9 * ROW_GAP + NODE_H + 20;

  const selectedScenario = selectedId ? SCENARIOS[selectedId] : null;
  const selectedState    = selectedId ? states[selectedId] : null;

  // Legend counts
  const counts = { available: 0, unlocked_unavailable: 0, completed: 0, locked: 0, permanently_blocked: 0 };
  Object.values(states).forEach(s => { if (counts[s] !== undefined) counts[s]++; });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* Header */}
      <View style={s.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={s.headerTitle}>Mapa de escenarios</Text>
        <View style={s.zoomBtns}>
          <TouchableOpacity onPress={() => handleZoom(1.25)} style={s.zoomBtn}>
            <Text style={s.zoomTxt}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleZoom(0.8)} style={s.zoomBtn}>
            <Text style={s.zoomTxt}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <LegendItem color={COLORS.node_available_brd}  label={`Disponible (${counts.available})`} />
        <LegendItem color={COLORS.node_unavailable_brd} label={`Faltan logros (${counts.unlocked_unavailable})`} />
        <LegendItem color={COLORS.node_completed_brd}  label={`Completado (${counts.completed})`} />
        <LegendItem color={COLORS.node_locked_border}  label={`Bloqueado (${counts.locked})`} />
        <LegendItem color={COLORS.node_perm_blocked_brd} label={`Perm. bloq. (${counts.permanently_blocked})`} />
      </View>

      {/* Canvas */}
      <View style={s.canvasContainer} {...panResponder.panHandlers}>
        <Animated.View style={{
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        }}>
          <View style={{ width: canvasW, height: canvasH }}>
            {/* Edges */}
            {renderEdges(states)}
            {/* Nodes */}
            {Object.entries(SCENARIOS).map(([idStr]) => {
              const id  = parseInt(idStr);
              const pos = GRAPH_POSITIONS[id];
              if (!pos) return null;
              const st  = states[id];
              const sc  = SCENARIOS[id];
              return (
                <ScenarioNode
                  key={id}
                  id={id}
                  name={sc.name}
                  state={st}
                  x={pos[0]}
                  y={pos[1]}
                  onTap={handleNodeTap}
                  onLongPress={handleLongPress}
                />
              );
            })}
          </View>
        </Animated.View>
      </View>

      {/* Info hint */}
      <Text style={s.hint}>
        Tap en disponible = completar · Tap en completado = desmarcar · Tap en cualquier otro = info
      </Text>

      {/* Modal de info */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            {selectedScenario && (
              <>
                <Text style={s.modalNum}>#{selectedId}</Text>
                <Text style={s.modalName}>{selectedScenario.name}</Text>
                <View style={s.modalStateBadge}>
                  <Text style={[s.modalStateText, { color: nodeTextColor(selectedState) }]}>
                    {STATE_LABELS[selectedState]}
                  </Text>
                </View>
                {selectedScenario.req.length > 0 && (
                  <View style={s.modalSection}>
                    <Text style={s.modalSectionTitle}>Requisitos</Text>
                    {selectedScenario.req.map((r, i) => (
                      <Text key={i} style={s.modalReq}>• {r}</Text>
                    ))}
                  </View>
                )}
                {selectedScenario.unlocks.length > 0 && (
                  <View style={s.modalSection}>
                    <Text style={s.modalSectionTitle}>Desbloquea</Text>
                    <Text style={s.modalReq}>
                      {selectedScenario.unlocks.map(u => `#${u} ${SCENARIOS[u]?.name}`).join(', ')}
                    </Text>
                  </View>
                )}
                {selectedScenario.exclusive.length > 0 && (
                  <View style={s.modalSection}>
                    <Text style={s.modalSectionTitle}>Bloquea permanentemente</Text>
                    <Text style={[s.modalReq, { color: COLORS.node_perm_blocked_brd }]}>
                      {selectedScenario.exclusive.map(u => `#${u} ${SCENARIOS[u]?.name}`).join(', ')}
                    </Text>
                  </View>
                )}

                {/* Acciones desde el modal */}
                <View style={s.modalActions}>
                  {selectedState === 'available' && (
                    <TouchableOpacity
                      style={[s.modalBtn, { backgroundColor: COLORS.node_available_brd }]}
                      onPress={() => { handleNodeTap(selectedId); setModalVisible(false); }}>
                      <Text style={s.modalBtnTxt}>Marcar completado</Text>
                    </TouchableOpacity>
                  )}
                  {selectedState === 'completed' && (
                    <TouchableOpacity
                      style={[s.modalBtn, { backgroundColor: '#555' }]}
                      onPress={() => { handleNodeTap(selectedId); setModalVisible(false); }}>
                      <Text style={s.modalBtnTxt}>Desmarcar</Text>
                    </TouchableOpacity>
                  )}
                  {selectedState !== 'permanently_blocked' && selectedState !== 'locked' && (
                    <TouchableOpacity
                      style={[s.modalBtn, { backgroundColor: COLORS.node_perm_blocked_brd }]}
                      onPress={() => {
                        setPermBlocked(prev => new Set(prev).add(selectedId));
                        setCompleted(prev => { const n = new Set(prev); n.delete(selectedId); return n; });
                        setModalVisible(false);
                      }}>
                      <Text style={s.modalBtnTxt}>Bloquear permanentemente</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={s.modalClose}>
              <Text style={s.modalCloseTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function ScenarioNode({ id, name, state, x, y, onTap, onLongPress }) {
  const bgColor   = nodeBgColor(state);
  const brdColor  = nodeBorderColor(state);
  const txtColor  = nodeTextColor(state);
  const shortName = name.length > 18 ? name.substring(0, 16) + '…' : name;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onTap(id)}
      onLongPress={() => onLongPress(id)}
      style={[s.node, {
        left: x, top: y,
        width: NODE_W, height: NODE_H,
        backgroundColor: bgColor,
        borderColor: brdColor,
      }]}
    >
      <Text style={[s.nodeNum, { color: brdColor }]}>#{id}</Text>
      <Text style={[s.nodeName, { color: txtColor }]} numberOfLines={2}>{shortName}</Text>
    </TouchableOpacity>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendLabel}>{label}</Text>
    </View>
  );
}

function renderEdges(states) {
  const lines = [];
  for (const [idStr, scenario] of Object.entries(SCENARIOS)) {
    const fromId = parseInt(idStr);
    const fromPos = GRAPH_POSITIONS[fromId];
    if (!fromPos) continue;
    for (const toId of scenario.unlocks) {
      const toPos = GRAPH_POSITIONS[toId];
      if (!toPos) continue;
      const fromSt = states[fromId];
      const toSt   = states[toId];
      const color =
        fromSt === 'completed' && toSt === 'completed' ? COLORS.edge_completed :
        fromSt === 'completed' ? COLORS.edge_available :
        COLORS.edge_default;

      const x1 = fromPos[0] + NODE_W / 2;
      const y1 = fromPos[1] + NODE_H;
      const x2 = toPos[0]   + NODE_W / 2;
      const y2 = toPos[1];

      // Dibujamos la línea con una View girada (igual que el resto del app)
      const dx     = x2 - x1;
      const dy     = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle  = Math.atan2(dy, dx) * 180 / Math.PI;

      lines.push(
        <View
          key={`${fromId}-${toId}`}
          style={{
            position: 'absolute',
            left: x1,
            top:  y1,
            width: length,
            height: 2,
            backgroundColor: color,
            transformOrigin: '0 50%',
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    }
  }
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE COLOR
// ─────────────────────────────────────────────────────────────────────────────
function nodeBgColor(state) {
  switch (state) {
    case 'available':           return COLORS.node_available;
    case 'unlocked_unavailable':return COLORS.node_unavailable;
    case 'completed':           return COLORS.node_completed;
    case 'permanently_blocked': return COLORS.node_perm_blocked;
    default:                    return COLORS.node_locked;
  }
}
function nodeBorderColor(state) {
  switch (state) {
    case 'available':           return COLORS.node_available_brd;
    case 'unlocked_unavailable':return COLORS.node_unavailable_brd;
    case 'completed':           return COLORS.node_completed_brd;
    case 'permanently_blocked': return COLORS.node_perm_blocked_brd;
    default:                    return COLORS.node_locked_border;
  }
}
function nodeTextColor(state) {
  switch (state) {
    case 'available':           return COLORS.text_available;
    case 'unlocked_unavailable':return COLORS.text_unavailable;
    case 'completed':           return COLORS.text_completed;
    case 'permanently_blocked': return COLORS.text_perm_blocked;
    default:                    return COLORS.text_locked;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: COLORS.bg },
  header:          { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.header,
                     paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  backBtn:         { marginRight: 12 },
  backIcon:        { color: COLORS.accent, fontSize: 28, lineHeight: 32 },
  headerTitle:     { flex: 1, color: COLORS.accent, fontSize: 17, fontWeight: 'bold' },
  zoomBtns:        { flexDirection: 'row', gap: 8 },
  zoomBtn:         { backgroundColor: COLORS.btn_bg, borderRadius: 6, width: 36, height: 36,
                     alignItems: 'center', justifyContent: 'center' },
  zoomTxt:         { color: COLORS.btn_text, fontSize: 20, fontWeight: 'bold' },

  legend:          { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 6,
                     backgroundColor: '#111125', gap: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  legendItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:       { width: 10, height: 10, borderRadius: 5 },
  legendLabel:     { color: '#aaa', fontSize: 11 },

  canvasContainer: { flex: 1, overflow: 'hidden' },

  hint:            { color: '#444', fontSize: 10, textAlign: 'center', paddingVertical: 4,
                     backgroundColor: COLORS.header },

  node:            { position: 'absolute', borderWidth: 1.5, borderRadius: 8,
                     paddingHorizontal: 6, paddingVertical: 4,
                     alignItems: 'center', justifyContent: 'center' },
  nodeNum:         { fontSize: 10, fontWeight: 'bold', opacity: 0.9 },
  nodeName:        { fontSize: 10, textAlign: 'center', lineHeight: 13 },

  modalOverlay:    { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  modalBox:        { backgroundColor: COLORS.modal_bg, borderRadius: 12, padding: 20,
                     width: '85%', maxWidth: 380, borderWidth: 1, borderColor: '#333' },
  modalNum:        { color: '#666', fontSize: 13, marginBottom: 2 },
  modalName:       { color: COLORS.accent, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalStateBadge: { alignSelf: 'flex-start', backgroundColor: '#ffffff11', borderRadius: 6,
                     paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  modalStateText:  { fontSize: 13, fontWeight: '600' },
  modalSection:    { marginBottom: 10 },
  modalSectionTitle:{ color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  modalReq:        { color: '#ccc', fontSize: 13, lineHeight: 20 },
  modalActions:    { gap: 8, marginTop: 12, marginBottom: 8 },
  modalBtn:        { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  modalBtnTxt:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalClose:      { alignItems: 'center', marginTop: 4 },
  modalCloseTxt:   { color: '#666', fontSize: 13, padding: 6 },
});
