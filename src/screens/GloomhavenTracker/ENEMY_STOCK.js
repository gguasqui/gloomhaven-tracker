// ═══════════════════════════════════════════════════════════════════════════════
// STOCK DE FICHAS POR TIPO DE ENEMIGO
// Valores según las cajas físicas de Gloomhaven
// ═══════════════════════════════════════════════════════════════════════════════
import { isBossType } from "../../utils/enemyHelpers";

export const ENEMY_STOCK = {
  // 10 fichas
  "Duende Negro":               10,
  "Duende del Bosque":          10,
  "Huesos Vivientes":           10,
  "Cieno":                      10,
  "Explorador Infestor":        10,
  "Víbora Gigante":             10,
  "Terror de las Profundidades":10,
  // 6 fichas
  "Arquera Bandido":             6,
  "Guardia Bandido":             6,
  "Arquero de la Ciudad":        6,
  "Guardia de la Ciudad":        6,
  "Sectario":                    6,
  "Sabueso":                     6,
  "Arquero Inox":                6,
  "Guardia Inox":                6,
  "Cadáver Viviente":            6,
  "Espíritu Viviente":           6,
  "Acechador":                   6,
  "Chamán Infestor":             6,
  "Demonio de Noche":            6,
  "Demonio de Viento":           6,
  "Demonio de Fuego":            6,
  "Demonio de Hielo":            6,
  "Demonio de Tierra":           6,
  "Demonio de Sol":              6,
  "Draco Escupidor":             6,
  "Draco Desgarrador":           6,
  "Artillería Antigua":          6,
  "Gólem de Piedra":             6,
  // 4 fichas
  "Oso de Cueva":                4,
  "Chamán Inox":                 4,
  "Cellisca Savvas":             4,
  "Río de Lava Savvas":          4,
  "Putrefacto Atormentador":     4,
  // Jefes — 1 ficha, excepto Guardaespaldas Inox = 2
  "Capitán Bandido":             1,
  "Capitán de la Guardia":       1,
  "Guardaespaldas Inox":         2,
  "Demonio Supremo":             1,
  "Draco Anciano":               1,
  "Jekserah":                    1,
  "La Penumbra":                 1,
  "El Incoloro":                 1,
  "Supervisor Implacable":       1,
  "Horror Alado":                1,
  "Jinete Oscuro":               1,
  "El Traidor":                  1,
  "El Ojo Que No Ve":            1,
};

// Para cualquier jefe no listado explícitamente, usar 1 como seguridad
export const stockOf = (type) => {
  if(type in ENEMY_STOCK) return ENEMY_STOCK[type];
  if(isBossType(type)) return 1;
  return 6;
};

// Elegir número aleatorio disponible para un tipo de enemigo
// Recibe el array de enemies actual y devuelve null si no quedan fichas
export const pickNumber = (type, enemies) => {
  const max = stockOf(type);
  const used = enemies
    .filter(e => e.type === type)
    .map(e => parseInt(e.number))
    .filter(n => !isNaN(n));
  const available = [];
  for(let i = 1; i <= max; i++) if(!used.includes(i)) available.push(i);
  if(available.length === 0) return null; // todos en uso
  return available[Math.floor(Math.random() * available.length)];
};
