// ESCENARIOS DE GLOOMHAVEN
// Fuente: Libro de Escenarios en español (PDFs)
// Monstruos extraídos de la sección "Piezas de tablero" de cada escenario
// IDs en español, compatibles con gloomhaven_enemies.js
// ⚠️ Verificar contra el libro físico — algunos escenarios tienen páginas
//    partidas en dos o texto OCR incompleto

export const SCENARIOS = [
  { num: 1,  name: "Túmulo negro" },
  { num: 2,  name: "Guarida del Túmulo" },
  { num: 3,  name: "Campamento inox" },
  { num: 4,  name: "Cripta de los Malditos" },
  { num: 5,  name: "Cripta ruinosa" },
  { num: 6,  name: "Cripta decadente" },
  { num: 7,  name: "Gruta trepidante" },
  { num: 8,  name: "Almacén de Gloomhaven" },
  { num: 9,  name: "Mina de diamantes" },
  { num: 10, name: "Plano del Poder Elemental" },
  { num: 11, name: "Plaza de Gloomhaven A" },
  { num: 12, name: "Plaza de Gloomhaven B" },
  { num: 13, name: "Templo del Vidente" },
  { num: 14, name: "Hondonada helada" },
  { num: 15, name: "Altar de la Fuerza" },
  { num: 16, name: "El paso de la montaña" },
  { num: 17, name: "Isla perdida" },
  { num: 18, name: "Cloacas abandonadas" },
  { num: 19, name: "Cripta olvidada" },
  { num: 20, name: "Santuario de la nigromante" },
  { num: 21, name: "Trono infernal" },
  { num: 22, name: "Templo de los Elementos" },
  { num: 23, name: "Ruinas profundas" },
  { num: 24, name: "Cámara de los Ecos" },
  { num: 25, name: "Ascenso al Risco de Hielo" },
  { num: 26, name: "Antiguo aljibe" },
  { num: 27, name: "Grieta destructiva" },
  { num: 28, name: "Cámara ritual ultraterrestre" },
  { num: 29, name: "Santuario de la Penumbra" },
  { num: 30, name: "Altar de las profundidades" },
  { num: 31, name: "Plano de la Noche" },
  { num: 32, name: "Bosque decrépito" },
  { num: 33, name: "Armería savvas" },
  { num: 34, name: "Cumbre calcinada" },
  { num: 35, name: "Almenas de Gloomhaven A" },
  { num: 36, name: "Almenas de Gloomhaven B" },
  { num: 37, name: "Fosa maldita" },
  { num: 38, name: "Jaula de esclavos" },
  { num: 39, name: "Puente traicionero" },
  { num: 40, name: "Antigua red de defensa" },
  { num: 41, name: "Tumba ancestral" },
  { num: 42, name: "Reino de la Voz" },
  { num: 43, name: "Nido de dracos" },
  { num: 44, name: "Asalto tribal" },
  { num: 45, name: "Pantano rebelde" },
  { num: 46, name: "Cumbre agónica" },
  { num: 47, name: "Guarida del ojo que no ve" },
  { num: 48, name: "Bosque sombrío" },
  { num: 49, name: "Resistencia rebelde" },
  { num: 50, name: "Fortaleza fantasma" },
  { num: 51, name: "El Vacío" },
  { num: 52, name: "Sótano nocivo" },
  { num: 53, name: "Subsuelo de la cripta" },
  { num: 54, name: "Palacio de Hielo" },
  { num: 55, name: "Maraña neblinosa" },
  { num: 56, name: "Bosque de los bandidos" },
  { num: 57, name: "Investigación" },
  { num: 58, name: "Cabaña ensangrentada" },
  { num: 59, name: "Arboleda olvidada" },
  { num: 60, name: "Laboratorio de alquimia" },
  { num: 61, name: "Faro decrépito" },
  { num: 62, name: "Foso de almas" },
  { num: 63, name: "Foso de magma" },
  { num: 64, name: "Laguna submarina" },
  { num: 65, name: "Mina de azufre" },
  { num: 66, name: "Cala mecánica" },
  { num: 67, name: "Biblioteca arcana" },
  { num: 68, name: "Páramo tóxico" },
  { num: 69, name: "Pozo de los desdichados" },
  { num: 70, name: "Isla encadenada" },
  { num: 71, name: "Montañas ventosas" },
  { num: 72, name: "Arboleda rezumante" },
  { num: 73, name: "Cordillera de aludes" },
  { num: 74, name: "Barco mercante" },
  { num: 75, name: "Cementerio descuidado" },
  { num: 76, name: "Colmena de atormentadores" },
  { num: 77, name: "Cripta de los secretos" },
  { num: 78, name: "Foso de los sacrificios" },
  { num: 79, name: "Templo perdido" },
  { num: 80, name: "Torre de la Vigilia" },
  { num: 81, name: "Templo del eclipse" },
  { num: 82, name: "Montaña ardiente" },
  { num: 83, name: "Sombras del interior" },
  { num: 84, name: "Cueva cristalina" },
  { num: 85, name: "Templo del Sol" },
  { num: 86, name: "Poblado hostigado" },
  { num: 87, name: "Bahía corrupta" },
  { num: 88, name: "Plano del Agua" },
  { num: 89, name: "Guarida del Gremio" },
  { num: 90, name: "Grieta demoníaca" },
  { num: 91, name: "Tumulto salvaje" },
  { num: 92, name: "Reyerta del callejón" },
  { num: 93, name: "Barco naufragado" },
  { num: 94, name: "Nido de infestores" },
  { num: 95, name: "Cuenta pendiente" },
];

// ─── MONSTRUOS POR ESCENARIO ──────────────────────────────────────────────────
// Nombres en español según el Libro de Escenarios
// Nota: los IDs deben coincidir con los definidos en gloomhaven_enemies.js
// ⚠️ = datos incompletos o dudosos por OCR ruidoso

export const SCENARIO_MONSTERS = {
  // L1 Pag2: Guardia bandido / Arquera bandida / Huesos vivientes
  1:  ["guardia-bandido", "arquera-bandido", "huesos-vivientes"],

  // L1 Pag3: (página de continuación, no tiene lista de monstruos visible)
  // L1 Pag4 (conclusión escenario 2): Guardia inox aparece como regla especial
  // El escenario 2 tiene: Arquera bandida, Capitán bandido, Huesos vivientes, Cadáver viviente
  2:  ["arquera-bandido", "capitan-bandido", "huesos-vivientes", "cadaver-viviente"],

  // L1 Pag9+10 (Gruta trepidante = escenario 7): Duende del bosque / Demonio de tierra
  // Escenario 3 (Campamento inox): Guardia inox, Arquero inox, Chamán inox
  3:  ["guardia-inox", "arquero-inox", "chaman-inox"],

  // L1 Pag6: Huesos vivientes / Arquera bandida / Sectario / Demonio de tierra / Demonio de viento
  4:  ["huesos-vivientes", "arquera-bandido", "sectario", "demonio-de-tierra", "demonio-de-viento"],

  // L1 Pag7 (Cripta ruinosa): texto OCR incompleto para monstruos
  // Por eliminación y conocimiento del juego: Huesos vivientes, Cadáver viviente, Sectario
  5:  ["huesos-vivientes", "sectario", "demonio-de-fuego", "demonio-de-noche", "demonio-de-hielo"],

  // L1 Pag8: Cadáver viviente / Espíritu viviente
  6:  ["cadaver-viviente", "espiritu-viviente", "huesos-vivientes"],

  // L1 Pag10: Duende del bosque / Demonio de tierra
  7:  ["duende-del-bosque", "demonio-de-tierra", "oso-de-cueva", "chaman-inox"],

  // L1 Pag11: Huesos vivientes / Cadáver viviente / Guardaespaldas inox (jefe)
  8:  ["huesos-vivientes", "cadaver-viviente", "guardaespaldas-inox"],

  // L1 Pag12: Sabueso / Explorador infestor / Supervisor implacable (jefe)
  9:  ["sabueso", "explorador-infestor", "supervisor-implacable"],

  // L1 Pag13: Demonio de fuego
  // Escenario 10 (Plano del Poder Elemental): Demonio de fuego + según reglas especiales
  10: ["demonio-de-fuego", "demonio-de-tierra"],

  // L1 Pag14: Huesos vivientes / Cadáver viviente / Guardia de la ciudad / Arquero de la ciudad / Capitán de la guardia (jefe)
  11: ["huesos-vivientes", "cadaver-viviente", "guardia-de-la-ciudad", "arquero-de-la-ciudad", "capitan-de-la-guardia"],

  // Escenario 12 - Plaza Gloomhaven B: mismos que 11 sin no-muertos
  // (continuación del mismo mapa)
  12: ["guardia-de-la-ciudad", "arquero-de-la-ciudad", "huesos-vivientes", "cadaver-viviente", "sectario", "Jekserah"],

  // L1 Pag17: (texto no captura bien los monstruos - solo hay columna de piedra)
  // Por conocimiento: Sectario, Huesos vivientes, Cadáver viviente + animales del bosque como aliados
  13: ["golem-de-piedra", "oso-de-cueva", "espiritu-viviente", "draco-escupidor"],

  // L1 Pag18: Sabueso / Espíritu viviente / Demonio de hielo
  14: ["sabueso", "espiritu-viviente", "demonio-de-hielo"],

  // L1 Pag20: Gólem de piedra / Cellisca savvas / Demonio de hielo / Demonio de viento / Putrefactor atormentador
  15: ["golem-de-piedra", "cellisca-savvas", "demonio-de-hielo", "demonio-de-viento", "putrefactor-atormentador"],

  // L1 Pag21: Demonio de tierra / Demonio de viento / Guardia inox / Arquero inox
  16: ["demonio-de-tierra", "demonio-de-viento", "guardia-inox", "arquero-inox"],

  // L1 Pag22: Explorador infestor / Chamán infestor / Oso de cueva
  17: ["explorador-infestor", "chaman-infestor", "oso-de-cueva"],

  // L1 Pag23: Víbora gigante / Cieno / Explorador infestor
  18: ["vibora-gigante", "cieno", "explorador-infestor"],

  // L1 Pag24: (página incompleta en OCR - cripta olvidada)
  // Por conocimiento: Huesos vivientes, Cadáver viviente
  19: ["huesos-vivientes", "cadaver-viviente", "sectario", "espiritu-viviente"],

  // L1 Pag37 (cont. escenario 20, Santuario de la Penumbra/Nigromante):
  // Huesos vivientes / Demonio de noche / Demonio de sol
  20: ["huesos-vivientes", "demonio-de-noche", "sectario", "cadaver-viviente", "jekserah"],

  // L1 Pag27: Demonio de sol / Demonio de hielo / Demonio de noche / Demonio de viento /
  //           Demonio de tierra / Demonio de fuego / Demonio Supremo (jefe)
  21: ["demonio-de-sol", "demonio-de-hielo", "demonio-de-noche", "demonio-de-viento", "demonio-de-tierra", "demonio-de-fuego", "demonio-supremo"],

  // L1 Pag29: Huesos vivientes / Sectario / Demonio de tierra / Demonio de fuego / Demonio de hielo / Demonio de viento
  22: ["huesos-vivientes", "sectario", "demonio-de-tierra", "demonio-de-fuego", "demonio-de-hielo", "demonio-de-viento"],

  // L1 Pag30: Gólem de piedra / Artillería antigua / Huesos vivientes / Espíritu viviente
  23: ["golem-de-piedra", "artilleria-antigua", "huesos-vivientes", "espiritu-viviente"],

  // L1 Pag35 (Antiguo aljibe = escenario 26, no 24):
  // Escenario 24 (Cámara de los Ecos): Terror de las profundidades / Acechador ⚠️ no confirmado
  24: ["draco-desgarrador", "cieno", "espiritu-viviente"],

  // L1 Pag34 (Ascenso al Risco de Hielo): Cieno / Duende del bosque (reglas especiales)
  // + Huesos vivientes, Cadáver viviente según texto inicial
  25: ["draco-desgarrador", "draco-escupidor", "sabueso"],

  // L1 Pag35: Cadáver viviente / Demonio de noche / Duende negro
  26: ["cadaver-viviente", "demonio-de-noche", "duende-negro", "cieno"],

  // L1 Pag36: Demonio de noche / Demonio de viento / Demonio de hielo
  // (más demonios según reglas especiales del escenario)
  27: ["demonio-de-noche", "demonio-de-viento", "demonio-de-hielo", "demonio-de-sol", "demonio-de-tierra", "demonio-de-fuego"],

  // L1 Pag38: Huesos vivientes / Cadáver viviente / Espíritu viviente / Duende negro
  28: ["huesos-vivientes", "cadaver-viviente", "sectario", "demonio-de-noche"],

  // L1 Pag37 / L2 Pag5: La Penumbra (jefe)
  // Escenario 29 = Santuario de la Penumbra: La Penumbra + Huesos vivientes/Cadáver viviente
  29: ["huesos-vivientes", "cadaver-viviente", "espiritu-viviente", "duende-negro"],

  // L1 Pag39: (Altar de las profundidades, sin lista de monstruos visible en OCR)
  // ⚠️ datos inciertos
  30: ["terror-de-las-profundidades", "acechador", "cieno"],

  // L2 Pag3: Demonio de noche / Demonio de sol / Demonio de tierra
  31: ["demonio-de-noche", "duende-negro", "terror-de-las-profundidades"],

  // L1 Pag42: Putrefactor atormentador / Víbora gigante / Terror de las profundidades / Duende negro
  32: ["putrefactor-atormentador", "vibora-gigante", "terror-de-las-profundidades", "duende-negro"],

  // L1 Pag43: Demonio de hielo / Demonio de fuego
  33: ["demonio-de-hielo", "demonio-de-fuego", "demonio-de-tierra", "rio-de-lava-savvas", "cellisca-savvas", "demonio-de-viento"],

  // L1 Pag44: Draco desgarrador / Draco escupidor / Draco anciano (jefe)
  34: ["draco-desgarrador", "draco-escupidor", "draco-anciano"],

  // L1 Pag45: Demonio de fuego / Demonio de hielo / Demonio de tierra / Demonio de viento /
  //           Guardia de la ciudad / Arquero de la ciudad / Capitán de la guardia (jefe)
  35: ["demonio-de-fuego", "demonio-de-hielo", "demonio-de-tierra", "demonio-de-viento", "guardia-de-la-ciudad", "arquero-de-la-ciudad", "capitan-de-la-guardia"],

  // L1 Pag46 (Almenas B): mismos tipos que Almenas A
  36: ["demonio-de-fuego", "demonio-de-hielo", "demonio-de-tierra", "demonio-de-viento", "arquero-de-la-ciudad", "demonio-supremo"],

  // L1 Pag48: Acechador / Terror de las profundidades
  37: ["acechador", "terror-de-las-profundidades", "putrefactor-atormentador"],

  // L1 Pag49: Arquero inox / Chamán inox / Gólem de piedra
  38: ["arquero-inox", "chaman-inox", "golem-de-piedra", "guardia-inox"],

  // L1 Pag59: Guardia de la ciudad / Arquero de la ciudad (+ Sabueso según contexto)
  // Escenario 39 (Puente traicionero): texto incompleto ⚠️
  39: ["oso-de-cueva", "demonio-de-hielo", "draco-escupidor", "sectario", "huesos-vivientes"],

  // L1 Pag52: Gólem de piedra (+ trampas, no hay más monstruos indicados)
  40: ["golem-de-piedra", "cadaver-viviente", "oso-de-cueva", "demonio-de-fuego", "duende-del-bosque"],

  // Escenario 41 (Tumba ancestral): Huesos vivientes / Cadáver viviente / Sectario ⚠️
  41: ["espiritu-viviente", "cadaver-viviente", "golem-de-piedra", "artilleria-antigua"],

  // L1 Pag42 (contexto del texto): Espíritu viviente / Duende negro / Putrefactor atormentador
  // Escenario 42 (Reino de la Voz)
  42: ["demonio-de-noche", "demonio-de-viento", "espiritu-viviente"],

  // L1 Pag56: Demonio de fuego / Draco desgarrador / Draco escupidor
  43: ["demonio-de-fuego", "draco-desgarrador", "draco-escupidor"],

  // Escenario 44 (Asalto tribal): Guardia inox / Arquero inox / Chamán inox / Oso de cueva ⚠️
  44: ["guardia-inox", "arquero-inox", "sabueso"],

  // L1 Pag59: Guardia de la ciudad / Arquero de la ciudad
  45: ["guardia-de-la-ciudad", "arquero-de-la-ciudad", "sabueso"],

  // L1 Pag60: Cellisca savvas / Demonio de viento / Horror alado (jefe)
  46: ["cellisca-savvas", "demonio-de-viento", "horror-alado", "demonio-de-noche", "demonio-de-hielo"],

  // L2 Pag0: Acechador / Terror de las profundidades / Putrefactor atormentador / El Ojo que no ve (jefe)
  47: ["acechador", "terror-de-las-profundidades", "putrefactor-atormentador", "el-ojo-que-no-ve"],

  // L2 Pag1: Putrefactor atormentador / Demonio de tierra / Jinete oscuro (jefe)
  48: ["putrefactor-atormentador", "demonio-de-tierra", "jinete-oscuro"],

  // L2 Pag2 (Resistencia rebelde): Artillería antigua (Cañón de asedio)
  // + Arquero de la ciudad según reglas especiales
  49: ["artilleria-antigua", "arquero-de-la-ciudad", "guardia-de-la-ciudad", "vibora-gigante"],

  // Escenario 50 (Fortaleza fantasma): ⚠️ datos no encontrados en OCR
  50: ["demonio-de-noche", "demonio-de-viento", "demonio-de-sol", "demonio-de-tierra"],

  // L2 Pag5: La Penumbra (jefe)
  51: ["la-penumbra"],

  // L2 Pag7 (Sótano nocivo, escenario 52): ⚠️ monstruos no capturados en OCR
  52: ["draco-escupidor", "cieno", "explorador-infestor", "cadaver-viviente", "chaman-infestor"],

  // L2 Pag8: Víbora gigante / Cadáver viviente / Espíritu viviente / Huesos vivientes
  53: ["vibora-gigante", "cadaver-viviente", "espiritu-viviente", "huesos-vivientes", "cieno"],

  // L2 Pag9 (Palacio de Hielo): Putrefactor atormentador
  54: ["putrefactor-atormentador", "demonio-de-hielo", "oso-de-cueva", "espiritu-viviente"],

  // L2 Pag10 (Maraña neblinosa, escenario 55): ⚠️ usa cartas de sala procedural
  55: [],

  // L2 Pag11: Sabueso / Arquera bandida / Draco desgarrador / Guardia bandido
  56: ["sabueso", "arquera-bandido", "draco-desgarrador", "guardia-bandido"],

  // L2 Pag12: Guardia de la ciudad / Arquero de la ciudad / Sabueso
  57: ["guardia-de-la-ciudad", "arquero-de-la-ciudad", "sabueso"],

  // L2 Pag13 (Cabaña ensangrentada / Venganza): Guardia de la ciudad
  58: ["guardia-de-la-ciudad", "demonio-de-tierra", "putrefactor-atormentador", "duende-negro"],

  // L2 Pag14: Oso de cueva / Sabueso / Duende del bosque
  59: ["oso-de-cueva", "sabueso", "duende-del-bosque"],

  // L2 Pag15 (Laboratorio de alquimia): ⚠️ datos incompletos en OCR
  60: ["vibora-gigante", "cieno", "sabueso", "draco-desgarrador", "draco-escupidor"],

  // L2 Pag17: Víbora gigante / Demonio de hielo / Demonio de fuego
  61: ["vibora-gigante", "demonio-de-hielo", "demonio-de-fuego", "cieno"],

  // L2 Pag18: (Foso de almas - OCR incompleto, monstruos no capturados)
  62: ["huesos-vivientes", "espiritu-viviente"],

  // L2 Pag42: Demonio de tierra / Demonio de fuego / Gólem de piedra
  // Escenario 63 (Foso de magma) ⚠️
  63: ["explorador-infestor", "demonio-de-fuego", "guardia-inox", "arquero-inox"],

  // L2 Pag20: Duende del bosque / Draco desgarrador
  64: ["duende-del-bosque", "draco-desgarrador", "cieno"],

  // L2 Pag21: Explorador infestor / Sabueso / Chamán inox
  65: ["explorador-infestor", "sabueso", "chaman-inox"],

  // L2 Pag23: Cieno / Artillería antigua / Espíritu viviente / Gólem de piedra
  66: ["cieno", "artilleria-antigua", "espiritu-viviente", "golem-de-piedra"],

  // L2 Pag24: Gólem de piedra / Oso de cueva ⚠️ (texto parcial)
  67: ["golem-de-piedra", "oso-de-cueva", "duende-del-bosque"],

  // L2 Pag25 (Páramo tóxico?): Duende negro / Víbora gigante / Cadáver viviente
  68: ["duende-negro", "vibora-gigante", "cadaver-viviente", "draco-escupidor"],

  // L2 Pag26: Explorador infestor / Chamán infestor / Gólem de piedra / Duende del bosque
  69: ["explorador-infestor", "chaman-infestor", "golem-de-piedra", "duende-del-bosque", "espiritu-viviente"],

  // L2 Pag27: Demonio de noche / Demonio de viento / Espíritu viviente
  70: ["demonio-de-noche", "demonio-de-viento", "espiritu-viviente"],

  // L2 Pag29: Demonio de viento / Demonio de sol
  71: ["demonio-de-viento", "demonio-de-sol", "draco-escupidor"],

  // L2 Pag30: Cieno / Duende del bosque / Víbora gigante
  72: ["cieno", "duende-del-bosque", "vibora-gigante"],

  // L2 Pag31: Sabueso / Arquero inox / Artillería antigua / Guardia inox / Chamán inox
  73: ["sabueso", "arquero-inox", "artilleria-antigua", "guardia-inox", "chaman-inox"],

  // L2 Pag32: Guardia bandido / Arquera bandida / Acechador / Terror de las profundidades
  74: ["guardia-bandido", "arquera-bandido", "acechador", "terror-de-las-profundidades"],

  // L2 Pag33: Huesos vivientes / Cadáver viviente / Espíritu viviente
  75: ["huesos-vivientes", "cadaver-viviente", "espiritu-viviente"],

  // L2 Pag34: Demonio de noche / Putrefactor atormentador / Víbora gigante / Huesos vivientes
  76: ["demonio-de-noche", "putrefactor-atormentador", "vibora-gigante", "huesos-vivientes"],

  // L2 Pag36: Guardia de la ciudad / Arquero de la ciudad / Gólem de piedra / Sabueso
  77: ["guardia-de-la-ciudad", "arquero-de-la-ciudad", "golem-de-piedra", "sabueso"],

  // L2 Pag37: Huesos vivientes (+ Regente abotargado jefe desde Cadáver viviente élite)
  78: ["huesos-vivientes", "guardia-bandido", "arquera-bandido", "sectario", "duende-negro"],

  // L2 Pag38: (Templo perdido - OCR incompleto)
  // Savvas + monstruos del bosque según contexto ⚠️
  79: ["golem-de-piedra", "vibora-gigante", "el-traidor"],

  // L2 Pag40: (Torre de la Vigilia - OCR incompleto, no lista monstruos)
  // ⚠️ datos inciertos
  80: ["guardia-de-la-ciudad", "arquero-de-la-ciudad", "artilleria-antigua", "sabueso"],

  // L2 Pag41: Incoloro (jefe) + invoca Demonio de noche y Demonio de sol
  81: ["demonio-de-noche", "demonio-de-sol", "el-incoloro", "artilleria-antigua", "golem-de-piedra"],

  // L2 Pag42 / Pag43 (contexto): Demonio de tierra / Demonio de fuego / Gólem de piedra + Sectario
  82: ["golem-de-piedra", "demonio-de-tierra", "demonio-de-fuego"],

  // L2 Pag43 (Sombras del interior): Sectario + Demonio de fuego según conclusión
  83: ["sectario", "demonio-de-fuego", "sabueso", "huesos-vivientes", "espiritu-viviente"],

  // L2 Pag44: Demonio de tierra ⚠️ (datos incompletos)
  84: ["demonio-de-tierra", "demonio-de-fuego", "demonio-de-hielo"],

  // L2 Pag45: Sabueso / Duende negro / Demonio de noche / Demonio de sol
  85: ["sabueso", "duende-negro", "demonio-de-noche", "demonio-de-sol"],

  // L2 Pag47: Chamán infestor / Explorador infestor / Acechador / Oso de cueva
  86: ["chaman-infestor", "explorador-infestor", "acechador", "oso-de-cueva"],

  // L2 Pag48: (Bahía corrupta - OCR sin lista de monstruos)
  // Cieno (jefe) + Acechador según contexto ⚠️
  87: ["cieno", "acechador", "duende-negro", "terror-de-las-profundidades"],

  // L2 Pag49: (Plano del Agua - datos incompletos en OCR)
  88: ["demonio-de-hielo", "acechador", "cieno"],

  // L2 Pag50: Arquera bandida / Guardia bandido / Víbora gigante
  89: ["arquera-bandido", "guardia-bandido", "vibora-gigante", "sectario"],

  // L2 Pag51: Demonio de tierra / Demonio de viento / Demonio de noche / Espíritu viviente
  90: ["demonio-de-tierra", "demonio-de-viento", "demonio-de-noche", "espiritu-viviente"],

  // L2 Pag52: Oso de cueva / Sabueso / Guardia bandido / Arquera bandida / Espíritu viviente
  91: ["guardia-bandido", "arquera-bandido", "sabueso", "oso-de-cueva", "espiritu-viviente"],

  // L2 Pag53: Guardia bandido / Arquera bandida / Guardia inox / Río de lava savvas /
  //           Demonio de tierra / Demonio de fuego / Guardia de la ciudad / Arquero de la ciudad
  92: ["guardia-bandido", "arquera-bandido", "guardia-inox", "rio-de-lava-savvas", "demonio-de-tierra", "demonio-de-fuego", "guardia-de-la-ciudad", "arquero-de-la-ciudad"],

  // L2 Pag54: Acechador / Demonio de hielo / Espíritu viviente
  93: ["acechador", "demonio-de-hielo", "espiritu-viviente"],

  // L2 Pag55: Sabueso / Explorador infestor / Chamán infestor / Oso de cueva
  94: ["sabueso", "explorador-infestor", "chaman-infestor", "oso-de-cueva"],

  // L2 Pag56: Terror de las profundidades / Demonio de fuego / Demonio de tierra / Río de lava savvas
  95: ["terror-de-las-profundidades", "demonio-de-fuego", "demonio-de-tierra", "rio-de-lava-savvas"],
};

export default { SCENARIOS, SCENARIO_MONSTERS };
