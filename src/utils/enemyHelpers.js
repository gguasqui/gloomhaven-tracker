// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE ENEMIGOS — HP, escudo, tipos, monstruos por escenario
// ═══════════════════════════════════════════════════════════════════════════════
import { ENEMY_TYPES, ID_TO_NAME, SCENARIO_MONSTERS } from "../data";

export const isBossType   = (t) => { const d=ENEMY_TYPES[t]; return d&&d.boss&&d.boss.length>0; };
export const hasEliteType = (t) => { const d=ENEMY_TYPES[t]; return d&&d.elite&&d.elite.length>0; };

export function getHp(type,variant,lvl,players=2){
  const d=ENEMY_TYPES[type]; if(!d) return 10;
  if(variant==="boss") return (d.boss?.[Math.min(lvl,7)]??10)*players;
  return (variant==="elite"?d.elite:d.normal)?.[Math.min(lvl,7)]??10;
}

export function getDefaultShield(type,variant,lvl){
  const d=ENEMY_TYPES[type]; if(!d) return 0;
  const arr=variant==="elite"?d.shieldElite:variant==="boss"?d.shieldBoss:d.shieldNormal;
  return arr?(arr[Math.min(lvl,arr.length-1)]??0):0;
}

export function getMonstersForScenario(scenarioNum){
  const ids = SCENARIO_MONSTERS[scenarioNum] || [];
  return ids.map(id => ID_TO_NAME[id]).filter(Boolean);
}

// ── ID counter global ────────────────────────────────────────────────────────
// Prefijo único por instancia del módulo (por cliente) para evitar colisiones
// en multiplayer cuando dos dispositivos generan IDs en paralelo.
// Sin esto, cliente A y cliente B podrían crear enemigos con id=1 cada uno y al
// sincronizar por Firebase se duplicarían keys en React.
const CLIENT_PREFIX = "e" + Math.random().toString(36).slice(2, 8) + "_";
let idCounter = 0;
export const newId = () => CLIENT_PREFIX + (++idCounter);

// ── Variantes de enemigo (colores y labels) ──────────────────────────────────
export const VS = {
  normal:{border:"#B89A60",hBg:()=>"#FFFFFF",bBg:"#FFFFFF",bBorder:()=>"#9A7840",label:"Normal",tc:"#3D2200"},
  elite: {border:"#C9920A",hBg:()=>"#FFF0A0",bBg:"#FFE650",bBorder:()=>"#C9920A",label:"Élite",  tc:"#6B4800"},
  boss:  {border:"#8B0000",hBg:()=>"#FFE0E0",bBg:"#FFD0D0",bBorder:()=>"#8B0000",label:"Jefe",   tc:"#6B0000"},
};