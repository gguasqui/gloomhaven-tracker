import RNEventSource from 'react-native-sse';
import React, { useState, useCallback, useRef, useEffect, useContext, createContext } from "react";
import { PanResponder } from "react-native";
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Platform, StatusBar, useWindowDimensions, Image, Modal, FlatList,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Share, Linking } from "react-native";

// ── Firebase config ───────────────────────────────────────────────────────────
const FB_DB_URL = "https://gloomhaven-tracker-8d221-default-rtdb.firebaseio.com";
const FB_API_KEY = "AIzaSyDmZQFueE6ZUyrZhE3l1TKmynfdVMeW3ZE";

// ── Colores globales ──────────────────────────────────────────────────────────
const BG      = "#F5EFE4";
const CARD_BG = "#FFFDF7";
const BORDER  = "#D4C5A0";
const TEXT    = "#2C1A00";
const MUTED   = "#8B7355";
const ACCENT  = "#7B3F00";
const DARK_BG = "#3B1E08";

// ── Imágenes de monstruos ─────────────────────────────────────────────────────
const MONSTER_IMAGES = {
  "Artillería Antigua":          require("./assets/monsters/processed/ancient-artillery.png"),
  "Arquera Bandido":             require("./assets/monsters/processed/bandit-archer.png"),
  "Capitán Bandido":             require("./assets/monsters/processed/bandit-commander.png"),
  "Guardia Bandido":             require("./assets/monsters/processed/bandit-guard.png"),
  "Duende Negro":                require("./assets/monsters/processed/black-imp.png"),
  "Capitán de la Guardia":       require("./assets/monsters/processed/captain-of-guard.png"),
  "Oso de Cueva":                require("./assets/monsters/processed/cave-bear.png"),
  "Arquero de la Ciudad":        require("./assets/monsters/processed/city-archer.png"),
  "Guardia de la Ciudad":        require("./assets/monsters/processed/city-guard.png"),
  "Sectario":                    require("./assets/monsters/processed/cultist.png"),
  "Jinete Oscuro":               require("./assets/monsters/processed/dark-rider.png"),
  "Terror de las Profundidades": require("./assets/monsters/processed/deep-terror.png"),
  "Demonio de Tierra":           require("./assets/monsters/processed/earth-demon.png"),
  "Draco Anciano":               require("./assets/monsters/processed/elder-drake.png"),
  "Demonio de Fuego":            require("./assets/monsters/processed/flame-demon.png"),
  "Duende del Bosque":           require("./assets/monsters/processed/forest-imp.png"),
  "Demonio de Hielo":            require("./assets/monsters/processed/frost-demon.png"),
  "Serpiente Venenosa":          require("./assets/monsters/processed/giant-viper.png"),
  "Chamán Infestor":             require("./assets/monsters/processed/vermling-shaman.png"),
  "Sabueso":                     require("./assets/monsters/processed/hound.png"),
  "Arquero Inox":                require("./assets/monsters/processed/inox-archer.png"),
  "Guardaespaldas Inox":         require("./assets/monsters/processed/inox-bodyguard.png"),
  "Guardia Inox":                require("./assets/monsters/processed/inox-guard.png"),
  "Chamán Inox":                 require("./assets/monsters/processed/inox-shaman.png"),
  "Jekserah":                    require("./assets/monsters/processed/jekserah.png"),
  "Huesos Vivientes":            require("./assets/monsters/processed/living-bones.png"),
  "Cadáver Viviente":            require("./assets/monsters/processed/living-corpse.png"),
  "Espíritu Viviente":           require("./assets/monsters/processed/living-spirit.png"),
  "Acechador":                   require("./assets/monsters/processed/lurker.png"),
  "Supervisor Implacable":       require("./assets/monsters/processed/merciless-overseer.png"),
  "Demonio de Noche":            require("./assets/monsters/processed/night-demon.png"),
  "Cieno":                       require("./assets/monsters/processed/ooze.png"),
  "Demonio Supremo":             require("./assets/monsters/processed/prime-demon.png"),
  "Draco Desgarrador":           require("./assets/monsters/processed/rending-drake.png"),
  "Cellisca Savvas":             require("./assets/monsters/processed/savvas-icestorm.png"),
  "Río de Lava Savvas":          require("./assets/monsters/processed/savvas-lavaflow.png"),
  "Draco Escupidor":             require("./assets/monsters/processed/spitting-drake.png"),
  "Gólem de Piedra":             require("./assets/monsters/processed/stone-golem.png"),
  "Demonio de Sol":              require("./assets/monsters/processed/sun-demon.png"),
  "El Traidor":                  require("./assets/monsters/processed/the-betrayer.png"),
  "El Incoloro":                 require("./assets/monsters/processed/the-colorless.png"),
  "La Penumbra":                 require("./assets/monsters/processed/the-gloom.png"),
  "El Ojo Que No Ve":            require("./assets/monsters/processed/the-sightless-eye.png"),
  "Explorador Infestor":         require("./assets/monsters/processed/vermling-scout.png"),
  "Putrefacto Atormentador":     require("./assets/monsters/processed/harrower-infester.png"),
  "Demonio de Viento":           require("./assets/monsters/processed/wind-demon.png"),
  "Horror Alado":                require("./assets/monsters/processed/winged-horror.png"),
};

const CLASS_IMAGES = {
  "Salvaje":               require("./assets/classes/01 Brute.png"),
  "Manitas":               require("./assets/classes/02 Tinkerer.png"),
  "Tejedora de Hechizos":  require("./assets/classes/03 Spellweaver.png"),
  "Pícara":                require("./assets/classes/04 Scoundrel.png"),
  "Corazón Hueco":         require("./assets/classes/05 Cragheart.png"),
  "Ladrona Mental":        require("./assets/classes/06 Mindthief.png"),
  "Guardiana del Sol":     require("./assets/classes/07 Sun.png"),
  "Intendente":            require("./assets/classes/08 Three Spears.png"),
  "Invocadora":            require("./assets/classes/09 Circles.png"),
  "Manto Nocturno":        require("./assets/classes/10 Eclipse.png"),
  "Heraldo de la Plaga":   require("./assets/classes/11 Squidface.png"),
  "Berserker":             require("./assets/classes/12 Lightning.png"),
  "Cantora de la Verdad":  require("./assets/classes/13 MusicNote.png"),
  "Acechador del Destino": require("./assets/classes/14 AngryFace.png"),
  "Cirujano":              require("./assets/classes/15 Saw.png"),
  "Elementalista":         require("./assets/classes/16 Triangles.png"),
  "Tirano de Bestias":     require("./assets/classes/17 Two-mini.png"),
};
const CLASS_LIST = [
  // Primeras 6 (desbloqueadas desde el inicio)
  "Salvaje","Manitas","Tejedora de Hechizos","Pícara","Corazón Hueco","Ladrona Mental",
  // Clases bloqueadas
  "Guardiana del Sol","Intendente","Invocadora","Manto Nocturno","Heraldo de la Plaga",
  "Berserker","Cantora de la Verdad","Acechador del Destino","Cirujano","Elementalista","Tirano de Bestias",
];

// ── Datos de enemigos ─────────────────────────────────────────────────────────
const ENEMY_TYPES = {
  "Guardia Bandido":            { normal:[5,6,6,9,10,11,14,16],    elite:[9,9,10,10,11,12,14,14],   shieldElite:[0,1,1,2,2,2,2,3],                                              color:"#7B3F00", icon:null },
  "Arquera Bandido":            { normal:[4,5,6,6,8,10,10,13],     elite:[6,7,9,10,10,12,13,17],                                                                                color:"#7B3F00", icon:"🏹" },
  "Capitán Bandido":            { normal:[], elite:[], boss:[8,10,12,13,15,16,19,23],                                                                                            color:"#7B3F00", icon:"⚔️" },
  "Guardia de la Ciudad":       { normal:[5,5,7,8,9,10,11,13],     elite:[6,6,9,9,10,12,13,14],     shieldNormal:[0,1,1,1,1,2,2,2], shieldElite:[1,2,2,2,2,3,3,3],            color:"#4A6FA5", icon:null },
  "Arquero de la Ciudad":       { normal:[4,5,6,6,8,9,9,10],       elite:[6,6,7,8,10,11,12,13],     shieldNormal:[0,0,0,1,1,1,2,2], shieldElite:[0,1,1,2,2,2,2,3],            color:"#4A6FA5", icon:"🏹" },
  "Capitán de la Guardia":      { normal:[], elite:[], boss:[7,9,11,14,16,20,21,25],                                                                                            color:"#2E86C1", icon:"⚔️" },
  "Guardia Inox":               { normal:[5,8,9,11,12,13,16,19],   elite:[9,10,12,15,17,19,21,23],                                                                             color:"#8B4513", icon:null },
  "Arquero Inox":               { normal:[5,6,8,9,10,12,12,15],    elite:[7,8,11,13,14,17,19,23],                                                                              color:"#8B4513", icon:"🏹" },
  "Chamán Inox":                { normal:[4,6,7,9,10,13,15,16],    elite:[6,9,11,14,16,20,24,27],                                                                              color:"#8B4513", icon:"🔮" },
  "Guardaespaldas Inox":        { normal:[], elite:[], boss:[6,7,9,10,11,13,15,17],                                                                                             color:"#8B4513", icon:"🪓" },
  "Huesos Vivientes":           { normal:[5,5,5,7,7,9,10,13],      elite:[6,6,7,10,11,11,11,14],    shieldNormal:[0,1,1,1,1,1,1,1], shieldElite:[0,1,1,1,1,2,2,2],            color:"#C8B89A", icon:"💀" },
  "Cadáver Viviente":           { normal:[5,7,9,10,11,13,14,15],   elite:[10,10,13,13,15,17,21,25],                                                                            color:"#5C7A3E", icon:"🧟" },
  "Espíritu Viviente":          { normal:[2,2,2,3,3,4,4,6],        elite:[3,3,3,4,4,6,7,9],         shieldNormal:[1,2,2,2,3,3,3,3], shieldElite:[2,3,3,3,4,4,4,4],            color:"#9B59B6", icon:"👻" },
  "Explorador Infestor":        { normal:[2,3,3,5,6,8,9,11],       elite:[4,5,5,7,8,11,12,15],                                                                                 color:"#A0522D", icon:"🐀" },
  "Chamán Infestor":            { normal:[2,2,3,3,3,4,5,7],        elite:[3,3,4,5,5,6,6,8],         shieldNormal:[2,3,3,3,3,3,3,3], shieldElite:[2,3,3,3,4,4,5,5],            color:"#A0522D", icon:"🔮" },
  "Sectario":                   { normal:[4,5,7,9,10,11,14,15],    elite:[7,9,12,13,15,18,22,25],                                                                              color:"#2C2C54", icon:"🗡️" },
  "Demonio de Noche":           { normal:[3,5,6,7,8,11,14,15],     elite:[5,8,11,13,15,17,21,21],                                                                              color:"#4A235A", icon:"🌑" },
  "Demonio de Viento":          { normal:[3,3,4,5,7,9,10,11],      elite:[5,5,7,8,8,11,12,13],      shieldNormal:[1,2,2,2,2,2,3,3], shieldElite:[1,2,2,2,2,2,3,3],            color:"#85C1E9", icon:"🌪️" },
  "Demonio de Fuego":           { normal:[2,2,3,3,3,4,4,5],        elite:[3,3,4,5,5,6,7,8],         shieldNormal:[2,3,3,3,3,4,4,4], shieldElite:[3,4,4,4,4,5,5,5],            color:"#E74C3C", icon:"🔥" },
  "Demonio de Hielo":           { normal:[5,6,7,8,10,11,12,14],    elite:[10,10,12,14,18,20,22,25],                                                                            color:"#AED6F1", icon:"❄️" },
  "Demonio de Tierra":          { normal:[7,9,12,13,15,17,20,22],  elite:[10,13,18,20,21,25,27,32],                                                                            color:"#6E5A3E", icon:"🌱" },
  "Demonio de Sol":             { normal:[5,7,9,10,11,12,15,15],   elite:[9,12,13,15,16,16,18,22],  shieldNormal:[1,1,1,1,1,2,2,2], shieldElite:[1,1,1,1,1,2,2,2],            color:"#F1C40F", icon:"☀️" },
  "Demonio Supremo":            { normal:[], elite:[], boss:[8,9,10,12,14,16,20,22],                                                                                            color:"#C0392B", icon:"👿" },
  "Draco Escupidor":            { normal:[5,6,8,8,9,12,13,16],     elite:[8,9,10,12,14,16,19,21],                                                                              color:"#1E8449", icon:"🐉" },
  "Draco Desgarrador":          { normal:[5,6,7,7,9,10,11,14],     elite:[7,7,9,10,11,14,15,18],                                                                               color:"#76448A", icon:"🦎" },
  "Draco Anciano":              { normal:[], elite:[], boss:[11,12,15,16,20,22,27,29],                                                                                          color:"#8B4513", icon:"🐲" },
  "Gólem de Piedra":            { normal:[10,10,11,11,12,13,16,16],elite:[10,11,14,15,17,19,20,21], shieldNormal:[0,1,1,2,2,2,2,3], shieldElite:[1,2,2,3,3,3,3,4],            color:"#7F8C8D", icon:"🗿" },
  "Artillería Antigua":         { normal:[4,6,7,8,9,11,14,16],     elite:[7,9,11,13,13,15,16,20],                                                                              color:"#AAB7B8", icon:"💣" },
  "Oso de Cueva":               { normal:[7,9,11,13,16,17,19,22],  elite:[11,14,17,20,21,24,28,33],                                                                            color:"#6E2F1A", icon:"🐻" },
  "Sabueso":                    { normal:[4,4,6,8,8,9,11,15],      elite:[6,6,7,8,11,12,15,15],                                                                                color:"#784212", icon:"🐕" },
  "Duende del Bosque":          { normal:[1,2,2,3,3,4,4,6],        elite:[4,5,6,7,7,8,9,11],        shieldNormal:[1,1,1,1,2,2,2,2], shieldElite:[1,1,1,1,2,2,2,2],            color:"#27AE60", icon:"🧚🏻" },
  "Duende Negro":               { normal:[3,4,5,5,7,9,10,12],      elite:[4,6,8,8,11,12,14,17],                                                                                color:"#444444", icon:"😈" },
  "Serpiente Venenosa":         { normal:[2,3,4,4,6,7,8,10],       elite:[3,5,7,8,11,13,14,17],                                                                                color:"#556B2F", icon:"🐍" },
  "Terror de las Profundidades":{ normal:[3,4,4,5,6,7,8,9],        elite:[5,6,7,8,9,11,13,15],                                                                                 color:"#1F618D", icon:"🦑" },
  "Acechador":                  { normal:[5,7,9,10,10,11,12,14],   elite:[7,9,12,14,14,15,16,18],   shieldNormal:[0,0,0,0,1,1,1,1], shieldElite:[1,1,1,1,2,2,2,2],            color:"#1A5276", icon:"🦀" },
  "Cellisca Savvas":            { normal:[7,10,12,12,14,16,16,17], elite:[12,12,15,18,19,21,23,24], shieldNormal:[0,0,0,1,1,1,2,2], shieldElite:[0,1,1,1,2,2,2,3],            color:"#AED6F1", icon:"🌨️" },
  "Río de Lava Savvas":         { normal:[8,9,11,14,16,18,20,24],  elite:[13,15,18,21,24,27,30,35],                                                                            color:"#E74C3C", icon:"🌋" },
  "Putrefacto Atormentador":    { normal:[6,7,8,10,12,12,15,17],   elite:[12,12,14,17,19,21,22,26],                                                                            color:"#7D6608", icon:"🐛" },
  "Cieno":                      { normal:[4,5,7,8,9,10,12,14],     elite:[8,9,11,11,13,15,16,18],   shieldNormal:[0,1,1,1,1,1,1,1], shieldElite:[0,1,1,1,1,1,2,2],            color:"#52BE80", icon:"🟢" },
  "Jekserah":                   { normal:[], elite:[], boss:[6,7,9,12,13,15,18,22],                                                                                             color:"#8E44AD", icon:"🧙🏻‍♀️" },
  "La Penumbra":                { normal:[], elite:[], boss:[20,25,29,35,39,46,50,56],                                                                                          color:"#17202A", icon:"🌒" },
  "El Incoloro":                { normal:[], elite:[], boss:[9,10,11,12,14,15,17,19], shieldBoss:[1,1,1,1,1,1,1,1],                                                             color:"#BDC3C7", icon:"⚪" },
  "Supervisor Implacable":      { normal:[], elite:[], boss:[6,8,9,11,12,14,16,19],                                                                                             color:"#641E16", icon:"🔨" },
  "Horror Alado":               { normal:[], elite:[], boss:[6,7,8,10,12,14,17,20],                                                                                             color:"#4A235A", icon:"🦇" },
  "Jinete Oscuro":              { normal:[], elite:[], boss:[9,10,12,13,15,16,16,18],                                                                                           color:"#1A1A2E", icon:"🐴" },
  "El Traidor":                 { normal:[], elite:[], boss:[10,12,14,16,18,20,23,27],                                                                                          color:"#8B4513", icon:"🗡️" },
  "El Ojo Que No Ve":           { normal:[], elite:[], boss:[7,8,10,11,14,15,18,20],                                                                                            color:"#1A1A2E", icon:"👁️" },
};

// ── Mapeo de IDs de scenarios.js → nombre en ENEMY_TYPES ─────────────────────
const ID_TO_NAME = {
  "guardia-bandido":              "Guardia Bandido",
  "arquera-bandido":              "Arquera Bandido",
  "capitan-bandido":              "Capitán Bandido",
  "guardia-de-la-ciudad":         "Guardia de la Ciudad",
  "arquero-de-la-ciudad":         "Arquero de la Ciudad",
  "capitan-de-la-guardia":        "Capitán de la Guardia",
  "guardia-inox":                 "Guardia Inox",
  "arquero-inox":                 "Arquero Inox",
  "chaman-inox":                  "Chamán Inox",
  "guardaespaldas-inox":          "Guardaespaldas Inox",
  "huesos-vivientes":             "Huesos Vivientes",
  "cadaver-viviente":             "Cadáver Viviente",
  "espiritu-viviente":            "Espíritu Viviente",
  "explorador-infestor":          "Explorador Infestor",
  "chaman-infestor":              "Chamán Infestor",
  "sectario":                     "Sectario",
  "demonio-de-noche":             "Demonio de Noche",
  "demonio-de-viento":            "Demonio de Viento",
  "demonio-de-fuego":             "Demonio de Fuego",
  "demonio-de-hielo":             "Demonio de Hielo",
  "demonio-de-tierra":            "Demonio de Tierra",
  "demonio-de-sol":               "Demonio de Sol",
  "demonio-supremo":              "Demonio Supremo",
  "draco-escupidor":              "Draco Escupidor",
  "draco-desgarrador":            "Draco Desgarrador",
  "draco-anciano":                "Draco Anciano",
  "golem-de-piedra":              "Gólem de Piedra",
  "artilleria-antigua":           "Artillería Antigua",
  "oso-de-cueva":                 "Oso de Cueva",
  "sabueso":                      "Sabueso",
  "duende-del-bosque":            "Duende del Bosque",
  "duende-negro":                 "Duende Negro",
  "vibora-gigante":               "Serpiente Venenosa",
  "terror-de-las-profundidades":  "Terror de las Profundidades",
  "acechador":                    "Acechador",
  "cellisca-savvas":              "Cellisca Savvas",
  "rio-de-lava-savvas":           "Río de Lava Savvas",
  "putrefactor-atormentador":     "Putrefacto Atormentador",
  "cieno":                        "Cieno",
  "jekserah":                     "Jekserah",
  "la-penumbra":                  "La Penumbra",
  "el-incoloro":                  "El Incoloro",
  "supervisor-implacable":        "Supervisor Implacable",
  "horror-alado":                 "Horror Alado",
  "jinete-oscuro":                "Jinete Oscuro",
  "el-traidor":                   "El Traidor",
  "el-ojo-que-no-ve":             "El Ojo Que No Ve",
};

// ── Escenarios ────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { num:1,  name:"Túmulo negro" },           { num:2,  name:"Guarida del Túmulo" },
  { num:3,  name:"Campamento inox" },         { num:4,  name:"Cripta de los Malditos" },
  { num:5,  name:"Cripta ruinosa" },          { num:6,  name:"Cripta decadente" },
  { num:7,  name:"Gruta trepidante" },        { num:8,  name:"Almacén de Gloomhaven" },
  { num:9,  name:"Mina de diamantes" },       { num:10, name:"Plano del Poder Elemental" },
  { num:11, name:"Plaza de Gloomhaven A" },   { num:12, name:"Plaza de Gloomhaven B" },
  { num:13, name:"Templo del Vidente" },      { num:14, name:"Hondonada helada" },
  { num:15, name:"Altar de la Fuerza" },      { num:16, name:"El paso de la montaña" },
  { num:17, name:"Isla perdida" },            { num:18, name:"Cloacas abandonadas" },
  { num:19, name:"Cripta olvidada" },         { num:20, name:"Santuario de la nigromante" },
  { num:21, name:"Trono infernal" },          { num:22, name:"Templo de los Elementos" },
  { num:23, name:"Ruinas profundas" },        { num:24, name:"Cámara de los Ecos" },
  { num:25, name:"Ascenso al Risco de Hielo" },{ num:26, name:"Antiguo aljibe" },
  { num:27, name:"Grieta destructiva" },      { num:28, name:"Cámara ritual ultraterrestre" },
  { num:29, name:"Santuario de la Penumbra" },{ num:30, name:"Altar de las profundidades" },
  { num:31, name:"Plano de la Noche" },       { num:32, name:"Bosque decrépito" },
  { num:33, name:"Armería savvas" },          { num:34, name:"Cumbre calcinada" },
  { num:35, name:"Almenas de Gloomhaven A" }, { num:36, name:"Almenas de Gloomhaven B" },
  { num:37, name:"Fosa maldita" },            { num:38, name:"Jaula de esclavos" },
  { num:39, name:"Puente traicionero" },      { num:40, name:"Antigua red de defensa" },
  { num:41, name:"Tumba ancestral" },         { num:42, name:"Reino de la Voz" },
  { num:43, name:"Nido de dracos" },          { num:44, name:"Asalto tribal" },
  { num:45, name:"Pantano rebelde" },         { num:46, name:"Cumbre agónica" },
  { num:47, name:"Guarida del ojo que no ve" },{ num:48, name:"Bosque sombrío" },
  { num:49, name:"Resistencia rebelde" },     { num:50, name:"Fortaleza fantasma" },
  { num:51, name:"El Vacío" },                { num:52, name:"Sótano nocivo" },
  { num:53, name:"Subsuelo de la cripta" },   { num:54, name:"Palacio de Hielo" },
  { num:55, name:"Maraña neblinosa" },        { num:56, name:"Bosque de los bandidos" },
  { num:57, name:"Investigación" },           { num:58, name:"Cabaña ensangrentada" },
  { num:59, name:"Arboleda olvidada" },       { num:60, name:"Laboratorio de alquimia" },
  { num:61, name:"Faro decrépito" },          { num:62, name:"Foso de almas" },
  { num:63, name:"Foso de magma" },           { num:64, name:"Laguna submarina" },
  { num:65, name:"Mina de azufre" },          { num:66, name:"Cala mecánica" },
  { num:67, name:"Biblioteca arcana" },       { num:68, name:"Páramo tóxico" },
  { num:69, name:"Pozo de los desdichados" }, { num:70, name:"Isla encadenada" },
  { num:71, name:"Montañas ventosas" },       { num:72, name:"Arboleda rezumante" },
  { num:73, name:"Cordillera de aludes" },    { num:74, name:"Barco mercante" },
  { num:75, name:"Cementerio descuidado" },   { num:76, name:"Colmena de atormentadores" },
  { num:77, name:"Cripta de los secretos" },  { num:78, name:"Foso de los sacrificios" },
  { num:79, name:"Templo perdido" },          { num:80, name:"Torre de la Vigilia" },
  { num:81, name:"Templo del eclipse" },      { num:82, name:"Montaña ardiente" },
  { num:83, name:"Sombras del interior" },    { num:84, name:"Cueva cristalina" },
  { num:85, name:"Templo del Sol" },          { num:86, name:"Poblado hostigado" },
  { num:87, name:"Bahía corrupta" },          { num:88, name:"Plano del Agua" },
  { num:89, name:"Guarida del Gremio" },      { num:90, name:"Grieta demoníaca" },
  { num:91, name:"Tumulto salvaje" },         { num:92, name:"Reyerta del callejón" },
  { num:93, name:"Barco naufragado" },        { num:94, name:"Nido de infestores" },
  { num:95, name:"Cuenta pendiente" },
];

const SCENARIO_MONSTERS = {
  1:  ["guardia-bandido","arquera-bandido","huesos-vivientes"],
  2:  ["arquera-bandido","capitan-bandido","huesos-vivientes","cadaver-viviente"],
  3:  ["guardia-inox","arquero-inox","chaman-inox"],
  4:  ["huesos-vivientes","arquera-bandido","sectario","demonio-de-tierra","demonio-de-viento"],
  5:  ["huesos-vivientes","cadaver-viviente","sectario"],
  6:  ["cadaver-viviente","espiritu-viviente"],
  7:  ["duende-del-bosque","demonio-de-tierra"],
  8:  ["huesos-vivientes","cadaver-viviente","guardaespaldas-inox"],
  9:  ["sabueso","explorador-infestor","supervisor-implacable"],
  10: ["demonio-de-fuego"],
  11: ["huesos-vivientes","cadaver-viviente","guardia-de-la-ciudad","arquero-de-la-ciudad","capitan-de-la-guardia"],
  12: ["guardia-de-la-ciudad","arquero-de-la-ciudad","capitan-de-la-guardia"],
  13: ["sectario","huesos-vivientes","cadaver-viviente"],
  14: ["sabueso","espiritu-viviente","demonio-de-hielo"],
  15: ["golem-de-piedra","cellisca-savvas","demonio-de-hielo","demonio-de-viento","putrefactor-atormentador"],
  16: ["demonio-de-tierra","demonio-de-viento","guardia-inox","arquero-inox"],
  17: ["explorador-infestor","chaman-infestor","oso-de-cueva"],
  18: ["vibora-gigante","cieno","explorador-infestor"],
  19: ["huesos-vivientes","cadaver-viviente"],
  20: ["huesos-vivientes","demonio-de-noche","demonio-de-sol"],
  21: ["demonio-de-sol","demonio-de-hielo","demonio-de-noche","demonio-de-viento","demonio-de-tierra","demonio-de-fuego","demonio-supremo"],
  22: ["huesos-vivientes","sectario","demonio-de-tierra","demonio-de-fuego","demonio-de-hielo","demonio-de-viento"],
  23: ["golem-de-piedra","artilleria-antigua","huesos-vivientes","espiritu-viviente"],
  24: ["terror-de-las-profundidades","acechador"],
  25: ["huesos-vivientes","cadaver-viviente","cieno","duende-del-bosque"],
  26: ["cadaver-viviente","demonio-de-noche","duende-negro"],
  27: ["demonio-de-noche","demonio-de-viento","demonio-de-hielo","demonio-de-sol","demonio-de-tierra","demonio-de-fuego"],
  28: ["huesos-vivientes","cadaver-viviente","espiritu-viviente","duende-negro"],
  29: ["huesos-vivientes","cadaver-viviente","la-penumbra"],
  30: ["terror-de-las-profundidades","acechador"],
  31: ["demonio-de-noche","demonio-de-sol","demonio-de-tierra"],
  32: ["putrefactor-atormentador","vibora-gigante","terror-de-las-profundidades","duende-negro"],
  33: ["demonio-de-hielo","demonio-de-fuego","demonio-de-tierra","rio-de-lava-savvas","cellisca-savvas","demonio-de-viento"],
  34: ["draco-desgarrador","draco-escupidor","draco-anciano"],
  35: ["demonio-de-fuego","demonio-de-hielo","demonio-de-tierra","demonio-de-viento","guardia-de-la-ciudad","arquero-de-la-ciudad","capitan-de-la-guardia"],
  36: ["demonio-de-fuego","demonio-de-hielo","demonio-de-tierra","demonio-de-viento","arquero-de-la-ciudad","demonio-supremo"],
  37: ["acechador","terror-de-las-profundidades","putrefactor-atormentador"],
  38: ["arquero-inox","chaman-inox","golem-de-piedra","guardia-inox"],
  39: ["oso-de-cueva","demonio-de-hielo","draco-escupidor","sectario","huesos-vivientes"],
  40: ["golem-de-piedra","cadaver-viviente","oso-de-cueva","demonio-de-fuego","duende-del-bosque"],
  41: ["espiritu-viviente","cadaver-viviente","golem-de-piedra","artilleria-antigua"],
  42: ["demonio-de-noche","demonio-de-viento","espiritu-viviente"],
  43: ["demonio-de-fuego","draco-desgarrador","draco-escupidor"],
  44: ["guardia-inox","arquero-inox","sabueso"],
  45: ["guardia-de-la-ciudad","arquero-de-la-ciudad","sabueso"],
  46: ["cellisca-savvas","demonio-de-viento","horror-alado","demonio-de-noche","demonio-de-hielo"],
  47: ["acechador","terror-de-las-profundidades","putrefactor-atormentador","el-ojo-que-no-ve"],
  48: ["putrefactor-atormentador","demonio-de-tierra","jinete-oscuro"],
  49: ["artilleria-antigua","arquero-de-la-ciudad","guardia-de-la-ciudad","vibora-gigante"],
  50: ["demonio-de-noche","demonio-de-viento","demonio-de-sol","demonio-de-tierra"],
  51: ["la-penumbra"],
  52: ["draco-escupidor","cieno","explorador-infestor","cadaver-viviente","chaman-infestor"],
  53: ["vibora-gigante","cadaver-viviente","espiritu-viviente","huesos-vivientes","cieno"],
  54: ["putrefactor-atormentador","demonio-de-hielo","oso-de-cueva","espiritu-viviente"],
  55: [],
  56: ["sabueso","arquera-bandido","draco-desgarrador","guardia-bandido"],
  57: ["guardia-de-la-ciudad","arquero-de-la-ciudad","sabueso"],
  58: ["guardia-de-la-ciudad","demonio-de-tierra","putrefactor-atormentador","duende-negro"],
  59: ["oso-de-cueva","sabueso","duende-del-bosque"],
  60: ["vibora-gigante","cieno","sabueso","draco-desgarrador","draco-escupidor"],
  61: ["vibora-gigante","demonio-de-hielo","demonio-de-fuego","cieno"],
  62: ["huesos-vivientes","espiritu-viviente"],
  63: ["explorador-infestor","demonio-de-fuego","guardia-inox","arquero-inox"],
  64: ["duende-del-bosque","draco-desgarrador","cieno"],
  65: ["explorador-infestor","sabueso","chaman-inox"],
  66: ["cieno","artilleria-antigua","espiritu-viviente","golem-de-piedra"],
  67: ["golem-de-piedra","oso-de-cueva","duende-del-bosque"],
  68: ["duende-negro","vibora-gigante","cadaver-viviente","draco-escupidor"],
  69: ["explorador-infestor","chaman-infestor","golem-de-piedra","duende-del-bosque","espiritu-viviente"],
  70: ["demonio-de-noche","demonio-de-viento","espiritu-viviente"],
  71: ["demonio-de-viento","demonio-de-sol","draco-escupidor"],
  72: ["cieno","duende-del-bosque","vibora-gigante"],
  73: ["sabueso","arquero-inox","artilleria-antigua","guardia-inox","chaman-inox"],
  74: ["guardia-bandido","arquera-bandido","acechador","terror-de-las-profundidades"],
  75: ["huesos-vivientes","cadaver-viviente","espiritu-viviente"],
  76: ["demonio-de-noche","putrefactor-atormentador","vibora-gigante","huesos-vivientes"],
  77: ["guardia-de-la-ciudad","arquero-de-la-ciudad","golem-de-piedra","sabueso"],
  78: ["huesos-vivientes","guardia-bandido","arquera-bandido","sectario","duende-negro"],
  79: ["golem-de-piedra","vibora-gigante","el-traidor"],
  80: ["guardia-de-la-ciudad","arquero-de-la-ciudad","artilleria-antigua","sabueso"],
  81: ["demonio-de-noche","demonio-de-sol","el-incoloro","artilleria-antigua","golem-de-piedra"],
  82: ["golem-de-piedra","demonio-de-tierra","demonio-de-fuego"],
  83: ["sectario","demonio-de-fuego","sabueso","huesos-vivientes","espiritu-viviente"],
  84: ["demonio-de-tierra","demonio-de-fuego","demonio-de-hielo"],
  85: ["sabueso","duende-negro","demonio-de-noche","demonio-de-sol"],
  86: ["chaman-infestor","explorador-infestor","acechador","oso-de-cueva"],
  87: ["cieno","acechador","duende-negro","terror-de-las-profundidades"],
  88: ["demonio-de-hielo","acechador","cieno"],
  89: ["arquera-bandido","guardia-bandido","vibora-gigante","sectario"],
  90: ["demonio-de-tierra","demonio-de-viento","demonio-de-noche","espiritu-viviente"],
  91: ["guardia-bandido","arquera-bandido","sabueso","oso-de-cueva","espiritu-viviente"],
  92: ["guardia-bandido","arquera-bandido","guardia-inox","rio-de-lava-savvas","demonio-de-tierra","demonio-de-fuego","guardia-de-la-ciudad","arquero-de-la-ciudad"],
  93: ["acechador","demonio-de-hielo","espiritu-viviente"],
  94: ["sabueso","explorador-infestor","chaman-infestor","oso-de-cueva"],
  95: ["terror-de-las-profundidades","demonio-de-fuego","demonio-de-tierra","rio-de-lava-savvas"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const POISON_IMG  = require("./assets/status/poison.png");
const WOUND_IMG   = require("./assets/status/wound.png");
const PIERCE_IMG  = require("./assets/status/piercing.png");
const SHIELD_IMG    = require("./assets/skills/shield.png");
const ATK_IMG       = require("./assets/skills/attack-black.png");
const ATK_WHITE_IMG = require("./assets/skills/attack-white.png");
const HEAL_IMG      = require("./assets/skills/heal.png");
const RANGE_IMG     = require("./assets/skills/range.png");
const TARGET_IMG    = require("./assets/skills/target.png");
const MOVE_IMG      = require("./assets/skills/move.png");
const FLYING_IMG    = require("./assets/skills/flying.png");
const RETALIATE_IMG = require("./assets/skills/retaliation.png");
const BLESS_IMG     = require("./assets/status/bless.png");
const CURSE_IMG     = require("./assets/status/curse.png");
const PULL_IMG      = require("./assets/skills/pull.png");
const PUSH_IMG      = require("./assets/skills/push.png");
const MUDDLE_IMG    = require("./assets/status/muddle.png");

// ── Mapa de imágenes de status para skills ────────────────────────────────────
const SKILL_STATUS_IMGS = {
  poison:     require("./assets/status/poison.png"),
  wound:      require("./assets/status/wound.png"),
  muddle:     require("./assets/status/muddle.png"),
  immobilize: require("./assets/status/immobilize.png"),
  disarm:     require("./assets/status/disarm.png"),
  stun:       require("./assets/status/stun.png"),
  strengthen: require("./assets/status/strengthen.png"),
  invisible:  require("./assets/status/invisible.png"),
  bless:      require("./assets/status/bless.png"),
  curse:      require("./assets/status/curse.png"),
  pull:       require("./assets/skills/pull.png"),
  push:       require("./assets/skills/push.png"),
};

const MONSTER_SKILLS = {
  "Artillería Antigua": [
    {normal:{move:0,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:2,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:3,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:4,range:7,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:5,range:7,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:0,atk:4,range:7,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:0,atk:5,range:7,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Arquera Bandido": [
    {normal:{move:2,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
  ],
  "Guardia Bandido": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"e"},flying:null,otrasN:null,otrasE:null},
  ],
  "Duende Negro": [
    {normal:{move:1,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:1,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:1,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:1,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
  ],
  "Oso de Cueva": [
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Arquero de la Ciudad": [
    {normal:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:1,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:1,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:2,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:2,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:7,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Guardia de la Ciudad": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Sectario": [
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Jinete Oscuro": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"3+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"3+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"3+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"4+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"4+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"5+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"5+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"6+X",range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Terror de las Profundidades": [
    {normal:{move:null,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:2,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:null,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:null,atk:4,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:null,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:null,atk:5,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:null,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:null,atk:6,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},elite:{move:null,atk:6,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio de Tierra": [
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{immobilize:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{immobilize:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{immobilize:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{immobilize:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{immobilize:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Draco Anciano": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:3,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:4,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:4,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:5,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:5,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:6,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:6,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:7,range:null},statuses:{poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",pull:"x",push:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio de Fuego": [
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:4,shield:null,retaliate:2,retRange:2,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:4,shield:null,retaliate:3,retRange:2,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:5,shield:null,retaliate:3,retRange:3,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:3,retRange:2,pierce:null,target:null},elite:{move:4,atk:4,range:5,shield:null,retaliate:4,retRange:3,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:4,retRange:2,pierce:null,target:null},elite:{move:4,atk:4,range:5,shield:null,retaliate:4,retRange:3,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:4,shield:null,retaliate:4,retRange:2,pierce:null,target:null},elite:{move:4,atk:5,range:5,shield:null,retaliate:5,retRange:3,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:5,shield:null,retaliate:4,retRange:3,pierce:null,target:null},elite:{move:4,atk:5,range:6,shield:null,retaliate:5,retRange:4,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
  ],
  "Duende del Bosque": [
    {normal:{move:3,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{curse:"b"},flying:"x",otrasN:null,otrasE:null},
  ],
  "Demonio de Hielo": [
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Serpiente Venenosa": [
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Putrefacto Atormentador": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Sabueso": [
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:5,atk:2,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:5,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:6,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:6,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Arquero Inox": [
    {normal:{move:2,atk:2,range:2,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Guardia Inox": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:3,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:1,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:2,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:null,shield:null,retaliate:4,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Chamán Inox": [
    {normal:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Huesos Vivientes": [
    {normal:{move:2,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:6,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:6,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:3},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Cadáver Viviente": [
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Espíritu Viviente": [
    {normal:{move:2,atk:2,range:2,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:2,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
  ],
  "Acechador": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:1,target:2},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:1,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:1,target:2},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:2,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:2,target:2},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:2,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:2,target:2},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:3,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:2,target:2},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:3,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:3,target:2},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:4,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:3,target:2},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:4,target:2},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio de Noche": [
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
    {normal:{move:4,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:8,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:"Aplica desventaja"},
  ],
  "Cieno": [
    {normal:{move:1,atk:2,range:2,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:2,range:2,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:1,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Draco Desgarrador": [
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:6,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:6,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:6,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:5,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:6,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{wound:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Cellisca Savvas": [
    {normal:{move:2,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:2,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:2,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:3,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:3,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:5,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:4,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:4,atk:5,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:5,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:4,atk:6,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},elite:{move:4,atk:6,range:6,shield:null,retaliate:null,retRange:null,pierce:3,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Río de Lava Savvas": [
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"n",wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"e"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{poison:"b",wound:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Draco Escupidor": [
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:6,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:6,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:7,range:5,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:"x",otrasN:null,otrasE:null},
  ],
  "Gólem de Piedra": [
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:1,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:6,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:7,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio de Sol": [
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:2,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:2,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:2,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
    {normal:{move:3,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:5,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:"Ventaja",otrasE:"Ventaja"},
  ],
  "Explorador Infestor": [
    {normal:{move:3,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:1,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
  ],
  "Chamán Infestor": [
    {normal:{move:2,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:1,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:1,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:2,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:3,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{muddle:"b"},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio de Viento": [
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:3,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:2,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:3,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{disarm:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{disarm:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:3,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{disarm:"e"},flying:"x",otrasN:null,otrasE:null},
    {normal:{move:4,atk:4,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:5,atk:5,range:4,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:null,atk:null,range:null},statuses:{disarm:"e"},flying:"x",otrasN:null,otrasE:null},
  ],
  "Horror Alado": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:3,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:3,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:4,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Capitán Bandido": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:3,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:3,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:4,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{immobilize:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Jekserah": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:2,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:3,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:3,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:5,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:5,range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Demonio Supremo": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:4,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:5,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:6,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:6,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:7,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:7,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:8,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "La Penumbra": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:5,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:5,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:6,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:6,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:7,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:7,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:8,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:9,range:null},statuses:{muddle:"x",poison:"x",wound:"x",immobilize:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "El Incoloro": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:2,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:3,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:3,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:4,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:5,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:6,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:7,range:null},statuses:{muddle:"x",poison:"x",wound:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Capitán de la Guardia": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:3,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:3,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:4,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:4,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:5,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:5,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:6,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:6,range:null},statuses:{muddle:"x",wound:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Supervisor Implacable": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"i",range:null},statuses:{wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "Guardaespaldas Inox": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"1+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:2,atk:"1+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"2+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"2+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:"3+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"3+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:"4+p",range:null},statuses:{muddle:"x",poison:"x",disarm:"x",stun:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "El Traidor": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:4,range:3},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:5,range:3},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:3,atk:6,range:4},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:7,range:4},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:4,atk:8,range:4},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:8,range:5},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:9,range:5},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:5,atk:9,range:5},statuses:{poison:"x",wound:"x",disarm:"x",stun:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
  "El Ojo Que No Ve": [
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:5,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:6,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:6,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:7,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:7,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:8,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:8,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
    {normal:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},elite:{move:null,atk:null,range:null,shield:null,retaliate:null,retRange:null,pierce:null,target:null},boss:{move:0,atk:9,range:3},statuses:{muddle:"x",disarm:"x",stun:"x",pull:"x",push:"x",curse:"x"},flying:null,otrasN:null,otrasE:null},
  ],
};

const STATUS_EFFECTS = [
  { id:"poison",     icon:"☠️", label:"Veneno",       color:"#39B54A", img:require("./assets/status/poison.png") },
  { id:"wound",      icon:"🩸", label:"Herida",       color:"#E03030", img:require("./assets/status/wound.png") },
  { id:"muddle",     icon:"💫", label:"Confundido",   color:"#C8A020", img:require("./assets/status/muddle.png") },
  { id:"strengthen", icon:"💪", label:"Fortalecido",  color:"#2E86C1", img:require("./assets/status/strengthen.png") },
  { id:"immobilize", icon:"🥾", label:"Inmovilizado", color:"#8B0000", img:require("./assets/status/immobilize.png") },
  { id:"disarm",     icon:"👋", label:"Desarmado",    color:"#607B8B", img:require("./assets/status/disarm.png") },
  { id:"stun",       icon:"💥", label:"Aturdido",     color:"#1A5276", img:require("./assets/status/stun.png") },
  { id:"invisible",  icon:"👻", label:"Invisible",    color:"#1C1C1C", img:require("./assets/status/invisible.png") },
];
const STATUS_ROW1 = STATUS_EFFECTS.slice(0,4);
const STATUS_ROW2 = STATUS_EFFECTS.slice(4,8);

let idCounter = 0;
const newId = () => ++idCounter;

const isBossType   = (t) => { const d=ENEMY_TYPES[t]; return d&&d.boss&&d.boss.length>0; };
const hasEliteType = (t) => { const d=ENEMY_TYPES[t]; return d&&d.elite&&d.elite.length>0; };

function getHp(type,variant,lvl,players=2){
  const d=ENEMY_TYPES[type]; if(!d) return 10;
  if(variant==="boss") return (d.boss?.[Math.min(lvl,7)]??10)*players;
  return (variant==="elite"?d.elite:d.normal)?.[Math.min(lvl,7)]??10;
}
function getDefaultShield(type,variant,lvl){
  const d=ENEMY_TYPES[type]; if(!d) return 0;
  const arr=variant==="elite"?d.shieldElite:variant==="boss"?d.shieldBoss:d.shieldNormal;
  return arr?(arr[Math.min(lvl,arr.length-1)]??0):0;
}

// Obtener lista de nombres de monstruos para un escenario dado
function getMonstersForScenario(scenarioNum){
  const ids = SCENARIO_MONSTERS[scenarioNum] || [];
  return ids.map(id => ID_TO_NAME[id]).filter(Boolean);
}

// ── StatCounter ───────────────────────────────────────────────────────────────
function StatCounter({icon,label,value,onChange,compact=false}){
  return(
    <View style={[ss.statRow,compact&&{paddingVertical:3}]}>
      <Text style={ss.statIcon}>{icon}</Text>
      <Text style={ss.statLabel}>{label}</Text>
      <TouchableOpacity style={ss.btnSm} onPress={()=>onChange(Math.max(0,value-1))}>
        <Text style={ss.btnSmTxt}>−</Text>
      </TouchableOpacity>
      <Text style={ss.statVal}>{value}</Text>
      <TouchableOpacity style={ss.btnSm} onPress={()=>onChange(value+1)}>
        <Text style={ss.btnSmTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const VS={
  normal:{border:"#B89A60",hBg:()=>"#FFFFFF",bBg:"#FFFFFF",bBorder:()=>"#9A7840",label:"Normal",tc:"#3D2200"},
  elite: {border:"#C9920A",hBg:()=>"#FFF0A0",bBg:"#FFE650",bBorder:()=>"#C9920A",label:"Élite",  tc:"#6B4800"},
  boss:  {border:"#8B0000",hBg:()=>"#FFE0E0",bBg:"#FFD0D0",bBorder:()=>"#8B0000",label:"Jefe",   tc:"#6B0000"},
};

// ── Alias de clases bloqueadas (nombres simbólicos) ───────────────────────────
const CLASS_ALIAS = {
  "Guardiana del Sol":     "Sun",
  "Intendente":            "Three Spears",
  "Invocadora":            "Circles",
  "Manto Nocturno":        "Eclipse",
  "Heraldo de la Plaga":   "Squidface",
  "Berserker":             "Lightning",
  "Cantora de la Verdad":  "Music Note",
  "Acechador del Destino": "Angry Face",
  "Cirujano":              "Saw",
  "Elementalista":         "Triangles",
  "Tirano de Bestias":     "Two Mini",
};

const ALWAYS_UNLOCKED = ["Salvaje","Manitas","Tejedora de Hechizos","Pícara","Corazón Hueco","Ladrona Mental"];
const LOCKABLE_CLASSES = CLASS_LIST.slice(6);
const STORAGE_KEY        = "@gloomhaven_unlocked_classes";
const SAVES_KEY          = "@gloomhaven_saves";
const AUTOSAVE_KEY       = "@gloomhaven_autosave";
const MAX_MANUAL_SAVES   = 20;


// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE REST SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
const FB = {
  url: (path) => `${FB_DB_URL}/${path}.json?auth=${FB_API_KEY}`,

  async get(path){
    try{
      const r = await fetch(FB.url(path));
      if(!r.ok) return null;
      return await r.json();
    }catch(e){ return null; }
  },

  async set(path, data){
    try{
      await fetch(FB.url(path), {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data),
      });
    }catch(e){}
  },

  async patch(path, data){
    try{
      await fetch(FB.url(path), {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data),
      });
    }catch(e){}
  },

  async remove(path){
    try{
      await fetch(FB.url(path), { method:"DELETE" });
    }catch(e){}
  },

  // Escuchar cambios en tiempo real
  // Web: SSE nativo sin auth / Android: polling cada 2s (más confiable que react-native-sse)
  listen(path, onData, onError){
    if(Platform.OS === "web"){
      // Web — SSE nativo del browser
      const url = `${FB_DB_URL}/${path}.json`;
      let es;
      try{
        es = new EventSource(url);
        es.addEventListener("put", (e)=>{
          try{ onData(JSON.parse(e.data)); }catch(_){}
        });
        es.addEventListener("patch", (e)=>{
          try{ onData(JSON.parse(e.data)); }catch(_){}
        });
        es.onerror = onError||null;
      }catch(e){ if(onError) onError(e); }
      return ()=>{ try{ es?.close(); }catch(_){} };
    } else {
      // Android — polling cada 2 segundos
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
          }catch(e){}
          await new Promise(res => setTimeout(res, 2000));
        }
      };
      poll();
      return ()=>{ active = false; };
    }
  },
};

// Generar código de sala de 4 caracteres
function genSalaId(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for(let i=0;i<4;i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTO MULTIJUGADOR
// ═══════════════════════════════════════════════════════════════════════════════
const MultiplayerContext = createContext({
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

function MultiplayerProvider({ children }){
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
  const startHeartbeat = (sid) => {
    stopHeartbeat();
    heartbeat.current = setInterval(async ()=>{
      await FB.patch(`salas/${sid}/jugadores/${myId.current}`, { lastSeen: Date.now() });
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
      setJugadores(ids.length);

      // Host migration: si el host se fue, el primer jugador conectado toma el control
      const hostId = players.__hostId;
      const now = Date.now();
      const alive = ids.filter(id=>id!=="__hostId"&&players[id]?.lastSeen&&(now-players[id].lastSeen)<60000);
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
      // Solo aplicar si NO somos el host (el host es la fuente de verdad)
      if(!isHostRef.current && data.data){
        setOnRemoteState(()=>data.data);
      }
    });
  };

  // ── Crear sala (host) ─────────────────────────────────────────────────────
  const crearSala = async (gameState) => {
    const sid = genSalaId();
    await FB.set(`salas/${sid}`, {
      creadaEn: Date.now(),
      gameState,
      jugadores: {
        __hostId: myId.current,
        [myId.current]: { joinedAt: Date.now(), lastSeen: Date.now() },
      },
    });
    salaIdRef.current = sid;
    setSalaId(sid);
    setIsHost(true);
    isHostRef.current = true;
    setOnline(true);
    startHeartbeat(sid);
    listenPlayers(sid);
    return sid;
  };

  // ── Unirse a sala ─────────────────────────────────────────────────────────
  const unirseASala = async (sid) => {
    const sala = await FB.get(`salas/${sid}`);
    if(!sala) return false;
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

  // ── Push gameState (solo host) ────────────────────────────────────────────
  const pushGameState = async (state) => {
    const sid = salaIdRef.current;
    if(!sid || !isHostRef.current) return;
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

// ── Contexto de campaña ───────────────────────────────────────────────────────
const CampaignContext = createContext({ unlocked: [], toggleUnlock: ()=>{} });

function CampaignProvider({ children }){
  const [unlocked, setUnlocked] = useState([]);

  useEffect(()=>{
    AsyncStorage.getItem(STORAGE_KEY).then(val=>{
      if(val) setUnlocked(JSON.parse(val));
    }).catch(()=>{});
  },[]);

  const toggleUnlock = (cls) => {
    setUnlocked(prev=>{
      const next = prev.includes(cls) ? prev.filter(c=>c!==cls) : [...prev,cls];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(()=>{});
      return next;
    });
  };

  return(
    <CampaignContext.Provider value={{unlocked, toggleUnlock}}>
      {children}
    </CampaignContext.Provider>
  );
}

// ── Helper: clases disponibles para selección ─────────────────────────────────
function useAvailableClasses(){
  const { unlocked } = useContext(CampaignContext);
  return [...ALWAYS_UNLOCKED, ...LOCKABLE_CLASSES.filter(c=>unlocked.includes(c))];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — CONFIGURACIÓN DE CAMPAÑA (menú intermedio)
// ═══════════════════════════════════════════════════════════════════════════════
function CampaignConfigScreen({ onBack, onClassUnlock }){
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return(
    <View style={[ccfg.root,{paddingTop:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={ccfg.header}>
        <TouchableOpacity onPress={onBack} style={ccfg.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[ccfg.headerTitle,{flex:1}]}>Configuración de la campaña</Text>
      </View>

      <ScrollView contentContainerStyle={[ccfg.content,{paddingBottom:insets.bottom+24,maxWidth:Math.min(width*0.92,420),alignSelf:"center",width:"100%"}]}
        showsVerticalScrollIndicator={false}>

        <View style={ccfg.sectionRow}>
          <View style={ccfg.sectionLine}/>
          <Text style={ccfg.sectionLbl}>Personajes</Text>
          <View style={ccfg.sectionLine}/>
        </View>

        <TouchableOpacity style={ccfg.menuBtn} onPress={onClassUnlock} activeOpacity={0.85}>
          <Text style={ccfg.menuIcon}>🎭</Text>
          <View style={ccfg.menuTextBlock}>
            <Text style={ccfg.menuTitle}>Clases disponibles</Text>
            <Text style={ccfg.menuDesc}>Desbloquear clases de la campaña</Text>
          </View>
          <Text style={ccfg.menuArrow}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
const ccfg = StyleSheet.create({
  root:         { flex:1, backgroundColor:BG },
  header:       { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center",
                  paddingHorizontal:4, paddingVertical:8 },
  backBtn:      { paddingHorizontal:16, paddingVertical:12, justifyContent:"center", alignItems:"center" },
  backTxt:      { color:"#F5DEB3", fontSize:20, fontWeight:"bold", lineHeight:20, includeFontPadding:false },
  headerTitle:  { fontSize:16, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0 },
  content:      { paddingHorizontal:20, paddingTop:24 },
  sectionRow:   { flexDirection:"row", alignItems:"center", marginBottom:14 },
  sectionLine:  { flex:1, height:1, backgroundColor:BORDER },
  sectionLbl:   { fontSize:10, color:MUTED, fontWeight:"bold", letterSpacing:1.5, marginHorizontal:10 },
  menuBtn:      { backgroundColor:CARD_BG, borderRadius:12, paddingVertical:18, paddingHorizontal:20,
                  flexDirection:"row", alignItems:"center", borderWidth:1.5, borderColor:BORDER,
                  shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowRadius:4, shadowOpacity:0.15, elevation:3,
                  marginBottom:10 },
  menuIcon:     { fontSize:26, marginRight:14 },
  menuTextBlock:{ flex:1 },
  menuTitle:    { fontSize:17, fontWeight:"bold", color:TEXT },
  menuDesc:     { fontSize:12, color:MUTED, marginTop:2 },
  menuArrow:    { fontSize:22, color:MUTED, marginLeft:8 },
});


function ClassUnlockScreen({ onBack }){
  const insets = useSafeAreaInsets();
  const { unlocked, toggleUnlock } = useContext(CampaignContext);

  return(
    <View style={[cus.root,{paddingTop:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      {/* Header */}
      <View style={cus.header}>
        <TouchableOpacity onPress={onBack} style={cus.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[cus.headerTitle,{flex:1}]}>Clases disponibles</Text>
      </View>

      <ScrollView contentContainerStyle={[cus.grid,{paddingBottom:insets.bottom+24}]}
        showsVerticalScrollIndicator={false}>

        {/* Sección desbloqueadas por defecto */}
        <View style={cus.sectionRow}>
          <View style={cus.sectionLine}/>
          <Text style={cus.sectionLbl}>Iniciales</Text>
          <View style={cus.sectionLine}/>
        </View>
        <View style={cus.row}>
          {ALWAYS_UNLOCKED.map(cls=>(
            <View key={cls} style={cus.card}>
              <View style={[cus.imgWrap,cus.imgWrapUnlocked]}>
                <Image source={CLASS_IMAGES[cls]} style={cus.img}/>
              </View>
              <Text style={[cus.lbl,cus.lblUnlocked]}>{cls}</Text>
              <View style={cus.badgeUnlocked}>
                <Text style={cus.badgeTxt}>✓</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sección bloqueables */}
        <View style={[cus.sectionRow,{marginTop:20}]}>
          <View style={cus.sectionLine}/>
          <Text style={cus.sectionLbl}>Desbloqueables</Text>
          <View style={cus.sectionLine}/>
        </View>
        <Text style={cus.hint}>Tocá una clase para desbloquearla o volver a bloquearla</Text>
        <View style={cus.row}>
          {LOCKABLE_CLASSES.map(cls=>{
            const isUnlocked = unlocked.includes(cls);
            return(
              <TouchableOpacity key={cls} style={cus.card} onPress={()=>toggleUnlock(cls)} activeOpacity={0.75}>
                <View style={[cus.imgWrap, isUnlocked?cus.imgWrapUnlocked:cus.imgWrapLocked]}>
                  {isUnlocked
                    ? <Image source={CLASS_IMAGES[cls]} style={cus.img}/>
                    : <View style={cus.lockedImgWrap}>
                        <Image source={CLASS_IMAGES[cls]} style={[cus.img,{opacity:0.25}]}/>
                        <View style={cus.lockOverlay}>
                          <Text style={cus.lockIcon}>🔒</Text>
                        </View>
                      </View>
                  }
                </View>
                <Text style={[cus.lbl, isUnlocked?cus.lblUnlocked:cus.lblLocked]} numberOfLines={2}>
                  {isUnlocked ? cls : CLASS_ALIAS[cls]}
                </Text>
                {isUnlocked&&(
                  <View style={cus.badgeUnlocked}>
                    <Text style={cus.badgeTxt}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const cus = StyleSheet.create({
  root:           { flex:1, backgroundColor:BG },
  header:         { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center",
                    paddingHorizontal:4, paddingVertical:8 },
  backBtn:        { paddingHorizontal:16, paddingVertical:12, justifyContent:"center", alignItems:"center" },
  backTxt:        { color:"#F5DEB3", fontSize:20, fontWeight:"bold", lineHeight:20, includeFontPadding:false },
  headerTitle:    { fontSize:16, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0 },
  grid:           { paddingHorizontal:16, paddingTop:20 },
  sectionRow:     { flexDirection:"row", alignItems:"center", marginBottom:14 },
  sectionLine:    { flex:1, height:1, backgroundColor:BORDER },
  sectionLbl:     { fontSize:10, color:MUTED, fontWeight:"bold", letterSpacing:1.5,
                    marginHorizontal:10 },
  hint:           { fontSize:11, color:MUTED, textAlign:"center", marginBottom:14, marginTop:-8 },
  row:            { flexDirection:"row", flexWrap:"wrap", justifyContent:"center" },
  card:           { width:80, alignItems:"center", margin:6 },
  imgWrap:        { width:56, height:56, borderRadius:28, borderWidth:2, marginBottom:6,
                    justifyContent:"center", alignItems:"center", backgroundColor:"#F0E6D0" },
  imgWrapUnlocked:{ borderColor:ACCENT, borderWidth:2.5 },
  imgWrapLocked:  { borderColor:"#C4B090", borderWidth:1.5, backgroundColor:"#E8E0D0" },
  lockedImgWrap:  { width:56, height:56, justifyContent:"center", alignItems:"center" },
  lockOverlay:    { position:"absolute", top:0, left:0, right:0, bottom:0,
                    justifyContent:"center", alignItems:"center" },
  lockIcon:       { fontSize:22 },
  img:            { width:40, height:40, resizeMode:"contain" },
  lbl:            { fontSize:10, textAlign:"center", lineHeight:13 },
  lblUnlocked:    { color:TEXT, fontWeight:"bold" },
  lblLocked:      { color:MUTED },
  badgeUnlocked:  { position:"absolute", top:0, right:6, width:18, height:18, borderRadius:9,
                    backgroundColor:ACCENT, alignItems:"center", justifyContent:"center" },
  badgeTxt:       { color:"#fff", fontSize:10, fontWeight:"bold" },
});



// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — PARTIDAS GUARDADAS
// ═══════════════════════════════════════════════════════════════════════════════
function SavedGamesScreen({ onBack, onResume }){
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [saves,      setSaves]      = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);
  const [selecting,  setSelecting]  = React.useState(false);
  const [selected,   setSelected]   = React.useState(new Set());
  const [confirmDel, setConfirmDel] = React.useState(false);

  const loadSaves = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      // Ordenar más reciente primero
      arr.sort((a,b)=>b.timestamp-a.timestamp);
      setSaves(arr);
    } catch(e){ setSaves([]); }
    setLoading(false);
  };

  React.useEffect(()=>{ loadSaves(); },[]);

  const deleteSaves = async (ids) => {
    const next = saves.filter(s=>!ids.has(s.id));
    setSaves(next);
    setSelected(new Set());
    setSelecting(false);
    setConfirmDel(false);
    try { await AsyncStorage.setItem(SAVES_KEY, JSON.stringify(next)); } catch(e){}
  };

  const toggleSelect = (id) => {
    setSelected(prev=>{
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const pad = n=>String(n).padStart(2,"0");
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getTitle = (save) => {
    if(save.scenarioNum){
      const sc = SCENARIOS.find(s=>s.num===save.scenarioNum);
      return sc ? `#${sc.num} — ${sc.name}` : `Escenario ${save.scenarioNum}`;
    }
    return "Partida libre";
  };

  const allSelected = saves.length>0 && selected.size===saves.length;

  return(
    <View style={{flex:1,backgroundColor:BG}}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      {/* Header */}
      <View style={{backgroundColor:DARK_BG,flexDirection:"row",alignItems:"center",
        paddingHorizontal:8,paddingVertical:12,paddingTop:insets.top+12}}>
        <TouchableOpacity onPress={onBack} style={{paddingHorizontal:16,paddingVertical:12,justifyContent:"center",alignItems:"center"}}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={{flex:1,fontSize:14,fontWeight:"bold",color:"#F5DEB3",letterSpacing:1}}>
          Partidas guardadas
        </Text>
        {saves.length>0?(
          <TouchableOpacity onPress={()=>{ setSelecting(s=>!s); setSelected(new Set()); }}
            style={{paddingHorizontal:8,paddingVertical:6}}>
            <Text style={{color:"#F5DEB3",fontSize:12,fontWeight:"bold"}}>
              {selecting?"Cancelar":"Seleccionar"}
            </Text>
          </TouchableOpacity>
        ):<View style={{width:80}}/>}
      </View>

      {loading?(
        <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
          <Text style={{color:MUTED,fontSize:14}}>Cargando…</Text>
        </View>
      ):saves.length===0?(
        <View style={{flex:1,justifyContent:"center",alignItems:"center",padding:32}}>
          <Text style={{fontSize:36,marginBottom:16}}>🗂️</Text>
          <Text style={{color:TEXT,fontSize:16,fontWeight:"bold",textAlign:"center",marginBottom:8}}>
            No hay partidas guardadas
          </Text>
          <Text style={{color:MUTED,fontSize:13,textAlign:"center"}}>
            Guardá una partida desde el botón 💾 dentro del tracker.
          </Text>
        </View>
      ):(
        <>
          {/* Barra selección */}
          {selecting&&(
            <View style={{flexDirection:"row",alignItems:"center",
              backgroundColor:"#EDE4D0",paddingHorizontal:16,paddingVertical:8,
              borderBottomWidth:1,borderBottomColor:BORDER,gap:12}}>
              <TouchableOpacity onPress={()=>setSelected(allSelected?new Set():new Set(saves.map(s=>s.id)))}
                style={{flexDirection:"row",alignItems:"center",gap:6}}>
                <View style={{width:20,height:20,borderRadius:4,borderWidth:2,
                  borderColor:ACCENT,backgroundColor:allSelected?ACCENT:"transparent",
                  justifyContent:"center",alignItems:"center"}}>
                  {allSelected&&<Text style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>✓</Text>}
                </View>
                <Text style={{fontSize:13,color:TEXT,fontWeight:"500"}}>Seleccionar todas</Text>
              </TouchableOpacity>
              <View style={{flex:1}}/>
              {selected.size>0&&(
                <TouchableOpacity onPress={()=>setConfirmDel(true)}
                  style={{backgroundColor:"#CC2222",borderRadius:8,
                    paddingHorizontal:14,paddingVertical:6}}>
                  <Text style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>
                    Eliminar ({selected.size})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView contentContainerStyle={{padding:16,gap:10,paddingBottom:insets.bottom+24}}
            showsVerticalScrollIndicator={false}>
            {saves.map(save=>{
              const isSelected = selected.has(save.id);
              return(
                <TouchableOpacity key={save.id} activeOpacity={0.6}
                  onPress={()=>{ if(selecting) toggleSelect(save.id); else onResume(save); }}
                  onLongPress={()=>{ if(!selecting){ setSelecting(true); setSelected(new Set([save.id])); }}}
                  delayLongPress={400}
                  style={{
                    backgroundColor:CARD_BG,borderRadius:12,
                    borderWidth:isSelected?2:1.5,
                    borderColor:isSelected?ACCENT:BORDER,
                    padding:14,flexDirection:"row",alignItems:"center",gap:12,
                    elevation:2,shadowColor:"#000",shadowOffset:{width:0,height:1},
                    shadowRadius:3,shadowOpacity:0.1,
                  }}>
                    {/* Checkbox */}
                    {selecting&&(
                      <View style={{width:22,height:22,borderRadius:5,borderWidth:2,
                        borderColor:isSelected?ACCENT:BORDER,
                        backgroundColor:isSelected?ACCENT:"transparent",
                        justifyContent:"center",alignItems:"center"}}>
                        {isSelected&&<Text style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>✓</Text>}
                      </View>
                    )}
                    {/* Contenido */}
                    <View style={{flex:1}}>
                      <Text style={{fontSize:14,fontWeight:"bold",color:TEXT,marginBottom:4}}
                        numberOfLines={1}>
                        {getTitle(save)}
                      </Text>
                      {/* Avatares de clases — mismos estilos que row INI */}
                      <View style={{flexDirection:"row",flexWrap:"wrap",gap:4,marginBottom:6}}>
                        {(save.classes||[]).map((cls,i)=>(
                          <View key={i} style={[ss.initImgWrap,{borderColor:ACCENT,borderWidth:2}]}>
                            {CLASS_IMAGES[cls]
                              ?<Image source={CLASS_IMAGES[cls]} style={ss.initImg} resizeMode="contain"/>
                              :<Text style={{fontSize:12,textAlign:"center",lineHeight:36}}>👤</Text>}
                          </View>
                        ))}
                      </View>
                      <Text style={{fontSize:11,color:MUTED}}>{formatDate(save.timestamp)}</Text>

                    </View>
                    {/* Flecha o nivel */}
                    {!selecting&&(
                      <View style={{alignItems:"flex-end",gap:4}}>
                        <Text style={{fontSize:11,color:MUTED}}>NIV {save.scenarioLvl??0}</Text>
                        <Text style={{fontSize:20,color:BORDER}}>›</Text>
                      </View>
                    )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Modal confirmación eliminar */}
      <Modal visible={confirmDel} transparent animationType="fade">
        <TouchableOpacity style={[ss.modalOverlay,{justifyContent:"center",alignItems:"center"}]}
          activeOpacity={1} onPress={()=>setConfirmDel(false)}>
          <View style={[ss.modalBox,{width:"80%",maxWidth:320,padding:20}]}
            onStartShouldSetResponder={()=>true}>
            <Text style={{fontSize:16,fontWeight:"bold",color:"#CC2222",
              marginBottom:10,textAlign:"center"}}>
              Eliminar partidas
            </Text>
            <Text style={{fontSize:13,color:TEXT,textAlign:"center",marginBottom:20}}>
              {`¿Eliminás ${selected.size} partida${selected.size!==1?"s":""}? Esta acción no se puede deshacer.`}
            </Text>
            <View style={{flexDirection:"row",gap:10}}>
              <TouchableOpacity onPress={()=>setConfirmDel(false)}
                style={{flex:1,height:40,borderRadius:8,borderWidth:1.5,borderColor:BORDER,
                  justifyContent:"center",alignItems:"center"}}>
                <Text style={{fontSize:13,color:TEXT,fontWeight:"500",textAlign:"center"}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>deleteSaves(selected)}
                style={{flex:1,height:40,borderRadius:8,backgroundColor:"#CC2222",
                  justifyContent:"center",alignItems:"center"}}>
                <Text style={{fontSize:13,color:"#fff",fontWeight:"bold",textAlign:"center"}}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MODAL — CONECTARSE A PARTIDA
// ═══════════════════════════════════════════════════════════════════════════════
function JoinModal({ visible, onClose, onJoin }){
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleJoin = async () => {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(clean.length !== 4){ setError("El código debe tener 4 caracteres."); return; }
    setLoading(true);
    setError("");
    const result = await onJoin(clean);
    setLoading(false);
    if(!result) setError("No se encontró la sala. Revisá el código.");
  };

  const handleClose = () => { setCode(""); setError(""); onClose(); };

  return(
    <Modal visible={visible} transparent animationType="fade">
      <View style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",
        justifyContent:"center",alignItems:"center"}}>
        <TouchableOpacity style={{position:"absolute",top:0,left:0,right:0,bottom:0}}
          activeOpacity={1} onPress={handleClose}/>
        <View style={{backgroundColor:CARD_BG,borderRadius:20,width:"88%",maxWidth:360,
          borderWidth:1.5,borderColor:BORDER,overflow:"hidden",
          shadowColor:"#000",shadowOffset:{width:0,height:8},shadowRadius:20,
          shadowOpacity:0.4,elevation:16}}
          onStartShouldSetResponder={()=>true}>

          {/* Header */}
          <View style={{backgroundColor:DARK_BG,paddingHorizontal:20,paddingVertical:14}}>
            <Text style={{color:"#F5DEB3",fontWeight:"bold",fontSize:16}}>
              Conectarse a partida
            </Text>
            <Text style={{color:"#A0845C",fontSize:12,marginTop:2}}>
              Ingresá el código que compartió el host
            </Text>
          </View>

          <View style={{padding:20}}>
            {/* Campo de código — grande y bold */}
            <TextInput
              value={code}
              onChangeText={t=>{ setCode(t.toUpperCase()); setError(""); }}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="GH42"
              placeholderTextColor="#C4B090"
              style={{
                fontSize:48, fontWeight:"bold", textAlign:"center",
                color:TEXT, letterSpacing:12,
                borderBottomWidth:3, borderBottomColor:code.length===4?ACCENT:BORDER,
                paddingBottom:8, marginBottom:8,
              }}
            />
            {/* Guía de caracteres */}
            <Text style={{textAlign:"center",fontSize:11,color:MUTED,marginBottom:16}}>
              4 caracteres · letras y números
            </Text>

            {error?(
              <Text style={{color:"#CC2222",fontSize:13,textAlign:"center",marginBottom:12}}>
                {error}
              </Text>
            ):null}

            {/* Botones */}
            <View style={{flexDirection:"row",gap:10}}>
              <TouchableOpacity onPress={handleClose}
                style={{flex:1,height:46,borderRadius:10,borderWidth:1.5,
                  borderColor:BORDER,justifyContent:"center",alignItems:"center"}}>
                <Text style={{fontSize:14,color:TEXT,fontWeight:"500"}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleJoin} disabled={loading||code.length!==4}
                style={{flex:1,height:46,borderRadius:10,
                  backgroundColor:code.length===4?ACCENT:"#C4B090",
                  justifyContent:"center",alignItems:"center"}}>
                {loading
                  ?<Text style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>Buscando…</Text>
                  :<Text style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>Unirse</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function HomeScreen({ onFreePlay, onSelectScenario, onCampaignConfig, onSavedGames, onContinue, onJoinGame }){
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [hasAutosave, setHasAutosave] = React.useState(false);
  const [joinVisible,  setJoinVisible]  = React.useState(false);
  const { unirseASala } = React.useContext(MultiplayerContext);

  React.useEffect(()=>{
    AsyncStorage.getItem(AUTOSAVE_KEY).then(raw=>{ setHasAutosave(!!raw); }).catch(()=>{});
  },[]);

  const handleJoin = async (code) => {
    const result = await unirseASala(code);
    if(!result) return false;
    setJoinVisible(false);
    onJoinGame(result, code);
    return true;
  };

  return(
    <View style={[hs.root,{paddingTop:insets.top+20,paddingBottom:insets.bottom+20}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={hs.titleBlock}>
        <Text style={hs.titleIcon}>⚔️</Text>
        <Text style={hs.title}>Gloomhaven</Text>
        <Text style={hs.sub}>Rastreador de enemigos</Text>
      </View>

      <View style={[hs.btnWrap,{maxWidth:Math.min(width*0.85,360)}]}>
        <TouchableOpacity style={hs.btnFree} onPress={onSelectScenario} activeOpacity={0.85}>
          <Text style={hs.btnIcon}>📖</Text>
          <View style={hs.btnTextBlock}>
            <Text style={hs.btnTitle}>Jugar escenario</Text>
            <Text style={hs.btnDesc}>Enemigos filtrados por escenario</Text>
          </View>
          <Text style={hs.btnArrow}>›</Text>
        </TouchableOpacity>

        {hasAutosave&&(
          <TouchableOpacity
            style={[hs.btnFree,{backgroundColor:"#2A4A2A",borderColor:"#22A355"}]}
            onPress={onContinue} activeOpacity={0.85}>
            <Text style={hs.btnIcon}>▶️</Text>
            <View style={hs.btnTextBlock}>
              <Text style={[hs.btnTitle,{color:"#C8F0D0"}]}>Continuar partida</Text>
              <Text style={[hs.btnDesc,{color:"#88C898"}]}>Recuperá el último autoguardado</Text>
            </View>
            <Text style={[hs.btnArrow,{color:"#88C898"}]}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Configuración de campaña ── */}
        <View style={hs.configSection}>
          <TouchableOpacity style={hs.btnScenario} onPress={onCampaignConfig} activeOpacity={0.85}>
            <Text style={hs.btnIcon}>⚙️</Text>
            <View style={hs.btnTextBlock}>
              <Text style={hs.btnTitleDark}>Configuración de la campaña</Text>
              <Text style={hs.btnDescDark}>Clases, progreso y más</Text>
            </View>
            <Text style={hs.btnArrowDark}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Partida libre (separada) ── */}
        <View style={hs.freeSection}>
          <View style={hs.configHeaderRow}>
            <View style={hs.configLine}/>
            <Text style={hs.configLbl}>Modo libre</Text>
            <View style={hs.configLine}/>
          </View>
          <TouchableOpacity style={hs.btnFreeAlt} onPress={onFreePlay} activeOpacity={0.85}>
            <Text style={hs.btnIcon}>🗺️</Text>
            <View style={hs.btnTextBlock}>
              <Text style={hs.btnTitleDark}>Partida libre</Text>
              <Text style={hs.btnDescDark}>Todos los enemigos disponibles</Text>
            </View>
            <Text style={hs.btnArrowDark}>›</Text>
          </TouchableOpacity>

          {/* ── Partidas guardadas ── */}
          <TouchableOpacity style={[hs.btnFreeAlt,{borderColor:BORDER,borderWidth:1}]}
            onPress={onSavedGames} activeOpacity={0.85}>
            <Text style={hs.btnIcon}>💾</Text>
            <View style={hs.btnTextBlock}>
              <Text style={hs.btnTitleDark}>Partidas guardadas</Text>
              <Text style={hs.btnDescDark}>Retomá o eliminá partidas</Text>
            </View>
            <Text style={hs.btnArrowDark}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Conectarse a partida ── */}
        <TouchableOpacity onPress={()=>setJoinVisible(true)}
          style={{flexDirection:"row",alignItems:"center",justifyContent:"center",
            paddingVertical:14,gap:6}}>
          <Ionicons name="link-outline" size={16} color={MUTED}/>
          <Text style={{fontSize:13,color:MUTED,fontWeight:"500"}}>Conectarse a partida</Text>
        </TouchableOpacity>
      </View>

      <JoinModal
        visible={joinVisible}
        onClose={()=>setJoinVisible(false)}
        onJoin={handleJoin}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA 1b — SELECTOR DE CLASES
// ═══════════════════════════════════════════════════════════════════════════════
function ClassSelector({ visible:modalVisible, onBack, onConfirm }){
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [selected, setSelected] = useState([]);
  const availableClasses = useAvailableClasses();

  const toggle = (cls) => {
    setSelected(prev =>
      prev.includes(cls)
        ? prev.filter(c=>c!==cls)
        : prev.length < 4 ? [...prev, cls] : prev
    );
  };

  return(
    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={onBack}>
      <View style={cls_s.overlay}>
        <View style={[cls_s.box,{maxHeight:height*0.88}]}>
          {/* Header */}
          <View style={cls_s.header}>
            <Text style={cls_s.title}>¿Quiénes juegan?</Text>
            <TouchableOpacity onPress={onBack} style={{padding:6}}>
              <Text style={{fontSize:18,color:MUTED}}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={cls_s.sub}>Elegí hasta 4 clases · toca para seleccionar</Text>
          <ScrollView contentContainerStyle={cls_s.grid} showsVerticalScrollIndicator={false} style={{flexShrink:1}}>
            {availableClasses.map(cls=>{
              const on = selected.includes(cls);
              return(
                <TouchableOpacity key={cls} style={[cls_s.card,on&&cls_s.cardOn]} onPress={()=>toggle(cls)}>
                  <View style={[cls_s.imgWrap,on&&cls_s.imgWrapOn]}>
                    <Image source={CLASS_IMAGES[cls]} style={cls_s.img}/>
                  </View>
                  <Text style={[cls_s.lbl,on&&cls_s.lblOn]} numberOfLines={2}>{cls}</Text>
                  {on&&<View style={cls_s.check}><Text style={{color:"#fff",fontSize:10,fontWeight:"bold"}}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={cls_s.footer}>
            <TouchableOpacity
              style={[cls_s.confirmBtn,selected.length===0&&{opacity:0.4}]}
              onPress={()=>{ if(selected.length>0){ onConfirm(selected); setSelected([]); } }}
              activeOpacity={0.85}>
              <Text style={cls_s.confirmTxt}>
                {selected.length===0?"Seleccioná al menos una clase":`Jugar con ${selected.length} clase${selected.length>1?"s":""}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const cls_s = StyleSheet.create({
  overlay:   { flex:1, backgroundColor:"rgba(0,0,0,0.55)", justifyContent:"center", alignItems:"center" },
  box:       { backgroundColor:CARD_BG, borderRadius:16, width:"88%", overflow:"hidden",
               borderWidth:1.5, borderColor:BORDER,
               shadowColor:"#000", shadowOffset:{width:0,height:6}, shadowRadius:16, shadowOpacity:0.35, elevation:12 },
  header:    { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center",
               justifyContent:"space-between", paddingHorizontal:16, paddingVertical:12 },
  title:     { fontSize:16, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0 },
  sub:       { fontSize:12, color:MUTED, textAlign:"center", marginVertical:10, paddingHorizontal:16 },
  grid:      { flexDirection:"row", flexWrap:"wrap", paddingHorizontal:12, paddingBottom:12, justifyContent:"center" },
  card:      { width:76, alignItems:"center", margin:5, opacity:0.45 },
  cardOn:    { opacity:1 },
  imgWrap:   { width:52, height:52, borderRadius:26, borderWidth:2, borderColor:BORDER,
               backgroundColor:"#F0E6D0", marginBottom:5, justifyContent:"center", alignItems:"center" },
  imgWrapOn: { borderColor:ACCENT, borderWidth:3 },
  img:       { width:40, height:40, resizeMode:"contain" },
  lbl:       { fontSize:10, color:MUTED, textAlign:"center", lineHeight:13 },
  lblOn:     { color:TEXT, fontWeight:"bold" },
  check:     { position:"absolute", top:0, right:6, width:16, height:16, borderRadius:8,
               backgroundColor:ACCENT, alignItems:"center", justifyContent:"center" },
  footer:    { paddingHorizontal:16, paddingTop:10, paddingBottom:12, borderTopWidth:1, borderTopColor:BORDER },
  confirmBtn:{ backgroundColor:ACCENT, borderRadius:8, paddingVertical:13, alignItems:"center" },
  confirmTxt:{ color:"#FFF8E8", fontSize:14, fontWeight:"bold" },
});

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA 2 — SELECTOR DE ESCENARIO
// ═══════════════════════════════════════════════════════════════════════════════
function ScenarioSelector({ onBack, onSelect }){
  const insets  = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [inputVal, setInputVal] = useState("");
  const [inputErr, setInputErr] = useState(false);
  const listRef = useRef(null);

  const confirmInput = () => {
    const n = parseInt(inputVal);
    if(isNaN(n)||n<1||n>95){ setInputErr(true); return; }
    setInputErr(false);
    const sc = SCENARIOS.find(s=>s.num===n);
    if(sc) onSelect(sc);
  };

  const handleRowPress = (sc) => {
    onSelect(sc);
  };

  return(
    <View style={[scn.root,{backgroundColor:DARK_BG}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={{flex:1,backgroundColor:BG,marginTop:insets.top}}>
      {/* Header */}
      <View style={scn.header}>
        <TouchableOpacity onPress={onBack} style={scn.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[scn.headerTitle,{flex:1}]}>Seleccionar escenario</Text>
      </View>

      {/* Input numérico */}
      <View style={scn.inputSection}>
        <Text style={scn.inputLabel}>Número de escenario (1–95)</Text>
        <View style={scn.inputRow}>
          <TextInput
            style={[scn.input, inputErr&&scn.inputErr]}
            value={inputVal}
            onChangeText={t=>{setInputVal(t.replace(/[^0-9]/g,""));setInputErr(false);}}
            keyboardType="number-pad"
            placeholder="ej: 42"
            placeholderTextColor="#C4B090"
            maxLength={2}
            returnKeyType="go"
            onSubmitEditing={confirmInput}
          />
          <TouchableOpacity style={scn.confirmBtn} onPress={confirmInput} activeOpacity={0.85}>
            <Text style={scn.confirmTxt}>Ir</Text>
          </TouchableOpacity>
        </View>
        {inputErr&&<Text style={scn.errTxt}>Ingresá un número entre 1 y 95</Text>}
      </View>

      {/* Divisor */}
      <View style={scn.dividerRow}>
        <View style={scn.dividerLine}/>
        <Text style={scn.dividerTxt}>o elegí de la lista</Text>
        <View style={scn.dividerLine}/>
      </View>

      {/* Lista de escenarios */}
      <FlatList
        ref={listRef}
        data={SCENARIOS}
        keyExtractor={item=>String(item.num)}
        contentContainerStyle={{paddingBottom:insets.bottom+16}}
        showsVerticalScrollIndicator={false}
        renderItem={({item})=>(
          <TouchableOpacity style={scn.row} onPress={()=>handleRowPress(item)} activeOpacity={0.75}>
            <View style={scn.rowNum}>
              <Text style={scn.rowNumTxt}>{item.num}</Text>
            </View>
            <View style={scn.rowInfo}>
              <Text style={scn.rowName}>{item.name}</Text>
            </View>
            <Text style={scn.rowArrow}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={()=><View style={{height:1,backgroundColor:"#E8DFCE",marginLeft:70}}/>}
      />
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: POPUP DE INICIATIVA — nuevo enemigo se mueve con ← →
// ══════════════════════════════════════════════════════════════════════════════
function NewEnemyInitPopup({ newEnemyPopup, popupOrder, setPopupOrder, popupOrderRef,
                             doneTurnIds, activeTurnId, onConfirm }){

  const getVis = (order) => (order||[]).filter(i=>i&&i.kind);

  // Índice del nuevo en el orden actual
  const allItems = getVis(popupOrder||[]);
  const newIdx   = allItems.findIndex(i=>i.id===newEnemyPopup?.type&&i.kind==="monster");
  const newImg   = newEnemyPopup?.type ? MONSTER_IMAGES[newEnemyPopup.type] : null;
  const placed   = newIdx >= 0;

  const moveNew = (dir) => {
    const items = getVis(popupOrderRef.current);
    const idx = items.findIndex(i=>i.id===newEnemyPopup?.type&&i.kind==="monster");
    if(idx < 0) return;
    const toIdx = idx + dir;
    if(toIdx < 0 || toIdx >= items.length) return;
    const newArr = [...items];
    const [moved] = newArr.splice(idx,1);
    newArr.splice(toIdx,0,moved);
    popupOrderRef.current = newArr;
    setPopupOrder([...newArr]);
  };

  return(
    <Modal visible transparent animationType="fade">
      <View style={[ss.modalOverlay,{justifyContent:"center",alignItems:"center"}]}>
        <View style={{
          backgroundColor:CARD_BG, borderRadius:16, width:"92%", maxWidth:420,
          borderWidth:1.5, borderColor:BORDER,
          shadowColor:"#000", shadowOffset:{width:0,height:6}, shadowRadius:16,
          shadowOpacity:0.35, elevation:12,
        }}>
          {/* Header */}
          <View style={{backgroundColor:DARK_BG,borderTopLeftRadius:14,borderTopRightRadius:14,
            paddingHorizontal:16,paddingVertical:12}}>
            <Text style={{color:"#F5DEB3",fontWeight:"bold",fontSize:14,textAlign:"center"}}>
              {`Nueva iniciativa — ${newEnemyPopup?.type||""}`}
            </Text>
          </View>

          <Text style={{fontSize:12,color:MUTED,textAlign:"center",
            paddingHorizontal:16,paddingTop:10,paddingBottom:6}}>
            Usá las flechas para ubicar al nuevo enemigo según su iniciativa.
          </Text>

          {/* Fila de avatares — misma configuración que la barra de INI */}
          <View style={{paddingHorizontal:8,paddingBottom:4}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={ss.initRow}>
              {allItems.map((item)=>{
                const isNew    = item.id===newEnemyPopup?.type&&item.kind==="monster";
                const isClass  = item.kind==="class";
                const img      = isClass?CLASS_IMAGES[item.id]:MONSTER_IMAGES[item.id];
                const done     = doneTurnIds.includes(item.kind+":"+item.id);
                const isActive = activeTurnId===item.kind+":"+item.id;
                const bColor   = isNew?"#F0A500":isActive?"#F0A500":isClass?ACCENT:BORDER;
                const bWidth   = isNew||isActive?3:2;
                return(
                  <View key={`pi-${item.kind}-${item.id}`}
                    style={[ss.initAvatar, done&&!isNew&&{opacity:0.35}]}>
                    <View style={[ss.initImgWrap,{borderColor:bColor,borderWidth:bWidth},
                      isNew&&{shadowColor:"#F0A500",shadowOpacity:0.7,shadowRadius:6,elevation:6}]}>
                      {img
                        ?<Image source={img}
                           style={isClass?ss.initImg:ss.initImgFull}
                           resizeMode={isClass?"contain":"cover"}/>
                        :<Text style={{fontSize:18}}>👾</Text>}
                    </View>
                    <Text style={[ss.initAvatarLbl,
                      isNew&&{color:"#F0A500",fontWeight:"bold"},
                      isActive&&{color:ACCENT,fontWeight:"bold"}]}
                      numberOfLines={1}>
                      {item.id.split(" ")[0]}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Botones mover ← → y CTA */}
          <View style={{padding:14,paddingTop:4,gap:8}}>
            {/* Flechas */}
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity
                onPress={()=>moveNew(-1)}
                disabled={newIdx<=0}
                style={{flex:1,height:40,borderRadius:8,
                  backgroundColor:newIdx>0?"#7B3F00":"#DDD",
                  justifyContent:"center",alignItems:"center"}}>
                <Text style={{color:newIdx>0?"#fff":"#AAA",fontSize:20,fontWeight:"bold"}}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={()=>moveNew(1)}
                disabled={newIdx>=allItems.length-1}
                style={{flex:1,height:40,borderRadius:8,
                  backgroundColor:newIdx<allItems.length-1?"#7B3F00":"#DDD",
                  justifyContent:"center",alignItems:"center"}}>
                <Text style={{color:newIdx<allItems.length-1?"#fff":"#AAA",fontSize:20,fontWeight:"bold"}}>›</Text>
              </TouchableOpacity>
            </View>
            {/* Confirmar */}
            <TouchableOpacity
              style={[ss.popupBtn,{backgroundColor:"#22A355",alignSelf:"stretch"}]}
              onPress={()=>onConfirm(popupOrderRef.current)}>
              <Text style={[ss.popupBtnTxt,{textAlign:"center"}]}>Confirmar iniciativa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: BARRA DE INICIATIVA CON DRAG & DROP
// ══════════════════════════════════════════════════════════════════════════════
function InitiativeBar({ initOrder, setInitOrder, enemies, onAvatarTap, activeTurnId, doneTurnIds,
                         onEndRound, roundActive, initNumbers, onSetInitNumber, onStartRound,
                         newEnemyPopup, onConfirmNewEnemy, skipThisRound=[],
                         popupOrder, setPopupOrder, popupOrderRef }){
  const AVATAR_W   = 60;
  const FLOAT_SIZE = 52;

  const draggingRef  = React.useRef(null);
  const orderRef     = React.useRef([]);
  const enemiesRef   = React.useRef([]);
  const scrollX      = React.useRef(0);
  const barX         = React.useRef(0);
  const scrollRef    = React.useRef(null);
  const [floatPos,      setFloatPos]     = React.useState({x:0,y:0});
  const [isDragging,    setIsDragging]   = React.useState(false);
  const [showNoOrderAlert, setShowNoOrderAlert] = React.useState(false);

  React.useEffect(()=>{ orderRef.current  = initOrder; }, [initOrder]);
  React.useEffect(()=>{ enemiesRef.current = enemies;  }, [enemies]);



  const skipRef = React.useRef([]);
  React.useEffect(()=>{ skipRef.current = skipThisRound||[]; },[skipThisRound]);

  const getVis = (order) => order.filter(i=>
    i&&i.kind&&(
      i.kind==="class"||
      (enemiesRef.current.some(e=>e.type===i.id) && !skipRef.current.includes(i.id))||
      (newEnemyPopup&&i.id===newEnemyPopup.type)
    )
  );

  const reorder = (moveX) => {
    if(draggingRef.current===null) return;
    const relX   = moveX - barX.current + scrollX.current;
    const vis    = getVis(orderRef.current);
    const toIdx  = Math.max(0, Math.min(vis.length-1, Math.floor(relX/AVATAR_W)));
    const fromIdx = draggingRef.current;
    if(toIdx===fromIdx) return;
    const invis  = orderRef.current.filter(i=>i&&i.kind&&i.kind!=="class"&&!enemiesRef.current.some(e=>e.type===i.id));
    const newVis = [...vis];
    const [moved]= newVis.splice(fromIdx,1);
    newVis.splice(toIdx,0,moved);
    const newOrder = [...newVis,...invis];
    draggingRef.current = toIdx;
    orderRef.current = newOrder;
    setInitOrder(newOrder);
  };

  const pan = React.useRef(PanResponder.create({
    onStartShouldSetPanResponder:        ()=> false,
    onStartShouldSetPanResponderCapture: ()=> false,
    onMoveShouldSetPanResponder:         ()=> false,
    onMoveShouldSetPanResponderCapture:  (_,gs)=> draggingRef.current!==null && Math.abs(gs.dx)>2,
    onPanResponderGrant: (_,gs)=>{ setFloatPos({x:gs.x0-FLOAT_SIZE/2, y:-FLOAT_SIZE-10}); },
    onPanResponderMove:  (_,gs)=>{
      setFloatPos({x:gs.moveX-FLOAT_SIZE/2, y:-FLOAT_SIZE-10});
      reorder(gs.moveX);
    },
    onPanResponderRelease:   ()=>{ draggingRef.current=null; setIsDragging(false); },
    onPanResponderTerminate: ()=>{ draggingRef.current=null; setIsDragging(false); },
  })).current;

  const visible  = getVis(initOrder);
  const dragIdx  = isDragging ? draggingRef.current : null;
  const dragItem = (dragIdx!==null&&visible[dragIdx]) ? visible[dragIdx] : null;
  const dragImg  = dragItem ? (dragItem.kind==="class"?CLASS_IMAGES[dragItem.id]:MONSTER_IMAGES[dragItem.id]) : null;

  // ── Lógica del botón Siguiente / Fin / Inicio ────────────────────────────────
  const activeIdx = activeTurnId
    ? visible.findIndex(i=>i.kind+":"+i.id===activeTurnId)
    : -1;
  const isLast = activeIdx === visible.length - 1;
  const allOrdered = !roundActive && visible.every(i=>initNumbers[i.kind+":"+i.id]!=null);

  // Siguiente pendiente: busca en el orden completo el primer avatar que:
  // 1. No esté en doneTurnIds (no jugó aún esta ronda)
  // 2. No sea el activo actual
  // Esto cubre: enemigos insertados antes del activo durante el turno de un jugador
  // y enemigos de tipo existente que vuelven a habilitarse (quitar de done)
  const getNextPending = () => {
    return visible.find(i=>{
      const tid = i.kind+":"+i.id;
      return tid!==activeTurnId && !doneTurnIds.includes(tid);
    }) || null;
  };

  const nextPending = getNextPending();
  const isFin    = roundActive && activeTurnId !== null && nextPending===null;

  const handleNext = () => {
    if(isDragging) return;
    if(!roundActive){
      if(!allOrdered){ setShowNoOrderAlert(true); return; }
      onStartRound();
      return;
    }
    if(visible.length === 0){ onEndRound(); return; }
    if(activeTurnId === null){
      // Primer avatar del orden que no esté en done
      const first = visible.find(i=>!doneTurnIds.includes(i.kind+":"+i.id));
      if(first){
        onAvatarTap(first);
        const idx = visible.indexOf(first);
        scrollRef.current?.scrollTo({x:Math.max(0,idx*AVATAR_W-AVATAR_W), animated:true});
      }
      return;
    }
    if(isFin){ onEndRound(); return; }
    // Avanzar al siguiente pendiente (puede estar en cualquier posición del orden)
    if(nextPending){
      onAvatarTap(nextPending);
      const nextIdx = visible.indexOf(nextPending);
      scrollRef.current?.scrollTo({x:Math.max(0,nextIdx*AVATAR_W-AVATAR_W), animated:true});
    }
  };
  const isInicio = !roundActive;
  const btnDisabled = isInicio && !allOrdered;
  const btnLabel = !roundActive ? "Inicio" : (isFin ? "Fin" : "›");



  return(
    <View style={[ss.initSec,{overflow:"visible"}]}
      onLayout={e=>{ barX.current=e.nativeEvent.layout.x; }}
      {...pan.panHandlers}>

      {/* Alert: faltan números de iniciativa */}
      <Modal visible={showNoOrderAlert} transparent animationType="fade">
        <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={()=>setShowNoOrderAlert(false)}>
          <View style={[ss.modalBox,{width:"80%",maxWidth:320,padding:20}]} onStartShouldSetResponder={()=>true}>
            <Text style={{fontSize:16,fontWeight:"bold",color:ACCENT,marginBottom:10,textAlign:"center"}}>
              ⚠️ Orden de iniciativa
            </Text>
            <Text style={{fontSize:13,color:TEXT,textAlign:"center",marginBottom:16}}>
              {Object.keys(initNumbers).length===0
                ? "Tenés que elegir el orden de iniciativa antes de empezar la ronda."
                : "Falta seleccionar algún enemigo o personaje."}
            </Text>
            <TouchableOpacity style={[ss.popupBtn,{alignSelf:"center"}]} onPress={()=>setShowNoOrderAlert(false)}>
              <Text style={[ss.popupBtnTxt,{textAlign:"center"}]}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Popup: nuevo enemigo durante turno de jugador — elegir posición de INI */}
      {!!newEnemyPopup&&(
        <NewEnemyInitPopup
          newEnemyPopup={newEnemyPopup}
          popupOrder={popupOrder}
          setPopupOrder={setPopupOrder}
          popupOrderRef={popupOrderRef}
          doneTurnIds={doneTurnIds}
          activeTurnId={activeTurnId}
          onConfirm={onConfirmNewEnemy}
          AVATAR_W={AVATAR_W}
        />
      )}

      <Text style={ss.initLbl}>Iniciativa</Text>
      <View style={{flexDirection:"row", alignItems:"center"}}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!isDragging}
          onScroll={e=>{ scrollX.current=e.nativeEvent.contentOffset.x; }}
          scrollEventThrottle={16}
          contentContainerStyle={ss.initRow}
          style={{flex:1}}>
          {visible.map((item,idx)=>{
            if(!item||!item.kind) return null;
            const isClass   = item.kind==="class";
            const img       = isClass ? CLASS_IMAGES[item.id] : MONSTER_IMAGES[item.id];
            const turnId    = item.kind+":"+item.id;
            const isActive  = activeTurnId===turnId;
            const isDone    = doneTurnIds.includes(turnId);
            const beingDrag = isDragging && dragIdx===idx;
            const orderNum  = initNumbers?.[turnId];
            const bColor    = isActive?"#F0A500"
              : !roundActive&&orderNum!=null?"#22A355"
              : isClass?ACCENT:BORDER;
            const bWidth    = isActive||(!roundActive&&orderNum!=null)?3:2;

            return(
              <View
                key={`init-${item.kind}-${item.id}`}
                style={[ss.initAvatar,beingDrag&&{opacity:0},
                  isDone&&roundActive&&{opacity:0.35},
                  !roundActive&&orderNum==null&&{opacity:0.5}]}>
                <TouchableOpacity
                  delayLongPress={roundActive?300:99999}
                  onPress={()=>{
                    if(!roundActive){
                      // Asignar/quitar número de orden
                      onSetInitNumber(turnId);
                    } else if(!isDragging){
                      onAvatarTap(item);
                    }
                  }}
                  onLongPress={()=>{ if(roundActive){ draggingRef.current=idx; setIsDragging(true); }}}
                  activeOpacity={0.75}>
                  <View style={[ss.initImgWrap,{borderColor:bColor,borderWidth:bWidth},
                    isActive&&{shadowColor:"#F0A500",shadowOpacity:0.7,shadowRadius:6,elevation:6}]}>
                    {img
                      ?<Image source={img} style={isClass?ss.initImg:ss.initImgFull} resizeMode={isClass?"contain":"cover"}/>
                      :<Text style={{fontSize:18}}>👾</Text>}
                    {/* Número de iniciativa superpuesto */}
                    {!roundActive&&orderNum!=null&&(
                      <View style={ss.initNumBadge}>
                        <Text style={ss.initNumTxt}>{orderNum}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[ss.initAvatarLbl,
                  isDone&&roundActive&&{color:"#BBBBBB"},
                  isActive&&{color:ACCENT,fontWeight:"bold"}]} numberOfLines={1}>
                  {item.id.split(" ")[0]}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Botón fijo Inicio / › / Fin */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[ss.initNextBtn, isFin&&ss.initFinBtn, isInicio&&ss.initInicioBtn,
            (isInicio&&!allOrdered)&&{opacity:0.45}]}>
          <Text style={[ss.initNextTxt, isFin&&ss.initFinTxt, isInicio&&ss.initInicioTxt]}>
            {btnLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {isDragging&&dragImg&&(
        <View pointerEvents="none" style={[ss.initFloat,{left:floatPos.x,top:floatPos.y}]}>
          <View style={{width:FLOAT_SIZE,height:FLOAT_SIZE,borderRadius:FLOAT_SIZE/2,
            overflow:"hidden",borderWidth:3,borderColor:ACCENT,backgroundColor:"#F0E6D0",
            elevation:16,shadowColor:"#000",shadowOpacity:0.5,shadowRadius:10,shadowOffset:{width:0,height:5}}}>
            <Image source={dragImg} style={{width:FLOAT_SIZE,height:FLOAT_SIZE}}
              resizeMode={dragItem?.kind==="class"?"contain":"cover"}/>
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA 3 — TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
function GloomhavenTracker({ scenarioNum, onBack, classes=[], saveId=null, initialState=null }){
  const insets  = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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
  const applyingRemote = React.useRef(false);

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

  // ── Autoguardado silencioso ───────────────────────────────────────────────
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
  }, [scenarioNum, classes, scenarioLvl]);

  // Disparar autoguardado cuando cambia el estado de juego
  React.useEffect(()=>{
    if(enemies.length===0 && !roundActive) return; // no guardar estado vacío inicial
    autoSave(buildSaveState());
    // Push a Firebase si soy host de una sala online
    if(online && isHost) pushGameState(buildSaveState());
  }, [enemies, doneTurnIds, activeTurnId, roundActive, initNumbers, skipThisRound]);

  // Aplicar estado remoto recibido (cuando soy jugador, no host)
  React.useEffect(()=>{
    if(!onRemoteState || isHost || applyingRemote.current) return;
    applyingRemote.current = true;
    const s = onRemoteState;
    if(s.enemies)       setEnemies(s.enemies.map(e=>({...e, statuses: Array.isArray(e.statuses)?e.statuses:[]})));
    if(s.initOrder)     setInitOrder(s.initOrder);
    if(s.monsterOrder)  setMonsterOrder(s.monsterOrder);
    if(s.activeTurnId!==undefined) setActiveTurnId(s.activeTurnId);
    if(s.doneTurnIds)   setDoneTurnIds(s.doneTurnIds);
    if(s.roundActive!==undefined)  setRoundActive(s.roundActive);
    if(s.initNumbers)   setInitNumbers(s.initNumbers);
    if(s.skipThisRound) setSkipThisRound(s.skipThisRound);
    if(s.scenarioLvl!==undefined)  setScenarioLvl(s.scenarioLvl);
    setTimeout(()=>{ applyingRemote.current=false; }, 300);
  }, [onRemoteState]);

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
  React.useEffect(()=>{
    if(!initialState) return;
    const s = initialState;
    if(s.enemies)       setEnemies(s.enemies.map(e=>({...e, statuses: Array.isArray(e.statuses)?e.statuses:[]})));
    if(s.initOrder)     setInitOrder(s.initOrder);
    if(s.monsterOrder)  setMonsterOrder(s.monsterOrder);
    if(s.activeTurnId!==undefined)  setActiveTurnId(s.activeTurnId);
    if(s.doneTurnIds)   setDoneTurnIds(s.doneTurnIds);
    if(s.roundActive!==undefined)   setRoundActive(s.roundActive);
    if(s.initNumbers)   setInitNumbers(s.initNumbers);
    if(s.skipThisRound) setSkipThisRound(s.skipThisRound);
    if(s.scenarioLvl!==undefined)   setScenarioLvl(s.scenarioLvl);
  }, []);
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [allPickerOpen,setAllPickerOpen]= useState(false); // picker "todos los enemigos"

  const updateEnemy =(id,patch)=>setEnemies(prev=>prev.map(e=>e.id!==id?e:{...e,...patch}));
  const removeEnemy =(id)=>{
    setEnemies(prev=>prev.filter(e=>e.id!==id));
    setPendingDmg(prev=>{const n={...prev};delete n[id];return n;});
  };

  const selIsBoss   = isBossType(selectedType);
  const selHasElite = hasEliteType(selectedType);
  const effVar      = selIsBoss?"boss":variant==="boss"?"normal":variant==="elite"&&!selHasElite?"normal":variant;
  const prevHp      = getHp(selectedType,effVar,scenarioLvl,players);
  const prevBaseHp  = effVar==="boss"?ENEMY_TYPES[selectedType]?.boss?.[Math.min(scenarioLvl,7)]??0:null;

  // ── Cantidad máxima de fichas por tipo ──────────────────────────────────────
  // Valores según cajas físicas de Gloomhaven
  const ENEMY_STOCK = {
    // 10 fichas
    "Duende Negro":               10,
    "Duende del Bosque":          10,
    "Huesos Vivientes":           10,
    "Cieno":                      10,
    "Explorador Infestor":        10,
    "Serpiente Venenosa":         10,
    "Terror de las Profundidades":10,
    // 6 fichas
    "Arquera Bandido":             6,
    "Guardia Bandido":             6,
    "Arquero de la Ciudad":        6,
    "Guardia de la Ciudad":        6,
    "Sectario":                    6,
    "Putrefacto Atormentador":     6,
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
    // 4 fichas
    "Artillería Antigua":          4,
    "Oso de Cueva":                4,
    "Chamán Inox":                 4,
    "Cellisca Savvas":             4,
    "Río de Lava Savvas":          4,
    "Gólem de Piedra":             4,
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
  const stockOf=(type)=>{
    if(type in ENEMY_STOCK) return ENEMY_STOCK[type];
    if(isBossType(type)) return 1;
    return 6;
  };

  // Elegir número aleatorio disponible para un tipo de enemigo
  const pickNumber=(type)=>{
    const max=stockOf(type);
    const used=enemies.filter(e=>e.type===type).map(e=>parseInt(e.number)).filter(n=>!isNaN(n));
    const available=[];
    for(let i=1;i<=max;i++) if(!used.includes(i)) available.push(i);
    if(available.length===0) return null; // todos en uso
    return available[Math.floor(Math.random()*available.length)];
  };

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
      setEnemies(prev=>prev.map(e=>e.id===eid?{...e,summoned:true}:e));
      const avatarExists = initOrder.some(i=>i.id===type&&i.kind==="monster");
      if(!avatarExists){
        // Primer enemigo de su tipo: no actúa esta ronda, se agrega la siguiente
        setSkipThisRound(prev=>[...prev,type]);
      }
      // Si ya había del tipo: los existentes siguen su curso, el nuevo es solo invocación
    }
  };

  // addEnemyVariant: agrega con variante específica
  const addEnemyVariant=useCallback((v)=>{
    const hp=getHp(selectedType,v,scenarioLvl,players);
    const baseShield=getDefaultShield(selectedType,v,scenarioLvl);
    const num=pickNumber(selectedType);
    if(num===null){ setNoStockAlert(true); return; }
    const eid=newId();
    setEnemies(prev=>[...prev,{id:eid,type:selectedType,variant:v,maxHp:hp,currentHp:hp,baseShield,shield:0,pierce:0,statuses:[],number:String(num),summoned:false}]);
    handleNewEnemyDuringRound(selectedType, eid);
  },[selectedType,scenarioLvl,players,enemies,roundActive,activeTurnId,initOrder]);

  const addEnemy=useCallback(()=>{
    const v=effVar,hp=getHp(selectedType,v,scenarioLvl,players);
    const baseShield=getDefaultShield(selectedType,v,scenarioLvl);
    const num=pickNumber(selectedType);
    if(num===null){ setNoStockAlert(true); return; }
    const eid=newId();
    setEnemies(prev=>[...prev,{id:eid,type:selectedType,variant:v,maxHp:hp,currentHp:hp,baseShield,shield:0,pierce:0,statuses:[],number:String(num),summoned:false}]);
    handleNewEnemyDuringRound(selectedType, eid);
  },[selectedType,effVar,scenarioLvl,players,enemies,roundActive,activeTurnId,initOrder]);

  // Cuando cambian los enemies: actualizar monsterOrder
  // Solo agregamos al initOrder si la ronda NO está activa (durante ronda activa lo maneja el popup)
  React.useEffect(()=>{
    const activeTypes=[...new Set(enemies.map(e=>e.type))];
    setMonsterOrder(prev=>{
      const newTypes=activeTypes.filter(t=>!prev.includes(t));
      const stillActive=prev.filter(t=>activeTypes.includes(t));
      const updated=[...stillActive,...newTypes];
      if(newTypes.length>0 && !roundActive){
        setInitOrder(order=>{
          const existingIds=order.map(x=>x.id);
          const toAdd=newTypes.filter(t=>!existingIds.includes(t)).map(t=>({kind:"monster",id:t}));
          return toAdd.length>0?[...order,...toAdd]:order;
        });
      }
      return updated;
    });
  },[enemies]);

  const adjustPending=(id,d)=>setPendingDmg(prev=>({...prev,[id]:Math.max(0,(prev[id]||0)+d)}));
  const commitDamage=(id)=>{
    const raw=pendingDmg[id]||0; if(!raw) return;
    setEnemies(prev=>prev.map(e=>{
      if(e.id!==id) return e;
      const totalShield=(e.baseShield||0)+e.shield;
      const eff=Math.max(0,totalShield-e.pierce),dmg=Math.max(0,raw-eff),poi=e.statuses.includes("poison")?1:0;
      return {...e,currentHp:Math.max(0,e.currentHp-dmg-poi)};
    }).filter(e=>e.currentHp>0));
    setPendingDmg(prev=>({...prev,[id]:0}));
  };
  const applyHeal=(id)=>setEnemies(prev=>prev.map(e=>{
    if(e.id!==id) return e;
    const hasWound=e.statuses.includes("wound");
    const clean=e.statuses.filter(x=>x!=="poison"&&x!=="wound");
    if(hasWound) return {...e,statuses:clean};
    return {...e,statuses:clean,currentHp:Math.min(e.maxHp,e.currentHp+1)};
  }));
  const toggleStatus=(id,st)=>setEnemies(prev=>prev.map(e=>{
    if(e.id!==id) return e;
    const has=e.statuses.includes(st);
    return {...e,statuses:has?e.statuses.filter(x=>x!==st):[...e.statuses,st]};
  }));
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
    const currentVis = initOrder.filter(i=>
      i&&i.kind&&(i.kind==="class"||enemies.some(e=>e.type===i.id))
    );
    const sorted = [...currentVis].sort((a,b)=>{
      const ka=a.kind+":"+a.id, kb=b.kind+":"+b.id;
      const na=initNumbers[ka]??999, nb=initNumbers[kb]??999;
      return na-nb;
    });
    const first = sorted[0] || null;

    setInitOrder(sorted);
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
    setNewEnemyPopup(null);
  };

  // Resetear iniciativa: clases primero, luego monstruos. Limpiar summoned de la ronda anterior.
  const resetInitiative=()=>{
    const classItems = classes.map(c=>({kind:"class",id:c}));
    const monsterItems = monsterOrder.map(t=>({kind:"monster",id:t}));
    setInitOrder([...classItems,...monsterItems]);
    setActiveTurnId(null);
    setDoneTurnIds([]);
    setTurnStartStatuses({});
    setInitNumbers({});
    setRoundActive(false);
    setSkipThisRound([]);
    // Los invocados de esta ronda pasan a "done" (siguiente ronda ya pueden jugar)
    // "done" significa: mostrar borde en avatar, sin banner, pueden jugar normalmente
    setEnemies(prev=>prev.map(e=>e.summoned===true?{...e,summoned:"done"}:e));
  };

  // Tap en avatar: inicia turno de ese personaje/enemigo
  const TEMP_STATS = ["muddle","immobilize","disarm","strengthen","invisible","stun"];

  // Al FIN del turno de un monstruo: limpiar solo los estados que YA TENÍA al inicio
  // Los que se aplicaron durante el turno sobreviven hasta el siguiente
  const finishMonsterTurn = (monsterType) => {
    const startingStatuses = turnStartStatuses[monsterType] || [];
    setEnemies(prev=>prev.map(e=>{
      if(e.type!==monsterType) return e;
      // Quitar solo los TEMP que estaban al inicio del turno
      const newStatuses = e.statuses.filter(s=>
        !TEMP_STATS.includes(s) || !startingStatuses.includes(s)
      );
      return {...e, statuses:newStatuses};
    }));
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

    // Había un turno activo anterior → finalizar ese turno y marcarlo done
    if(activeTurnId){
      const [prevKind, prevId] = activeTurnId.split(":");
      if(prevKind==="monster") finishMonsterTurn(prevId);
      setDoneTurnIds(prev=>[...new Set([...prev, activeTurnId])]);
    }

    // Activar el nuevo turno SIN marcar a nadie más como done automáticamente
    // (los avatares antes en el orden ya están en done porque se marcaron al terminar)
    setActiveTurnId(turnId);

    // Inicio del turno de un monstruo: snapshot de sus estados temporales actuales
    if(item.kind==="monster"){
      const currentStatuses = enemies
        .filter(e=>e.type===item.id)
        .flatMap(e=>e.statuses.filter(s=>TEMP_STATS.includes(s)));
      const uniqueStatuses = [...new Set(currentStatuses)];
      setTurnStartStatuses(prev=>({...prev,[item.id]:uniqueStatuses}));

      // Aplicar herida al inicio del turno
      const died = enemies.filter(e=>
        e.type===item.id && e.statuses.includes("wound") && Math.max(0,e.currentHp-1)===0
      ).map(e=>({type:e.type,number:e.number,variant:e.variant}));

      setEnemies(prev=>prev.map(e=>{
        if(e.type!==item.id||!e.statuses.includes("wound")) return e;
        return {...e,currentHp:Math.max(0,e.currentHp-1)};
      }).filter(e=>e.currentHp>0));

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
    const died=enemies
      .filter(e=>e.statuses.includes("wound")&&Math.max(0,e.currentHp-1)===0)
      .map(e=>({type:e.type,number:e.number,variant:e.variant}));

    setEnemies(prev=>prev.map(e=>{
      if(!e.statuses.includes("wound")) return e;
      return {...e,currentHp:Math.max(0,e.currentHp-1)};
    }).filter(e=>e.currentHp>0));

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
    setEnemies(prev=>prev.map(e=>({...e,shield:0})));
    // Agregar al initOrder cualquier tipo que fue saltado esta ronda (invocaciones)
    setInitOrder(prev=>{
      const existingIds=prev.map(x=>x.id);
      const toAdd=skipThisRound.filter(t=>!existingIds.includes(t)).map(t=>({kind:"monster",id:t}));
      return toAdd.length>0?[...prev,...toAdd]:prev;
    });
    resetInitiative();
  };
  const applyTrap=(id)=>setEnemies(prev=>prev.map(e=>e.id!==id?e:{...e,currentHp:Math.max(0,e.currentHp-1)}).filter(e=>e.currentHp>0));
  const startEditNum=(id,cur)=>{setEditingNum(id);setNumDraft(cur);};
  const commitNum=(id)=>{const v=numDraft.trim();if(v) updateEnemy(id,{number:v});setEditingNum(null);};
  const hpPct=(e)=>(e.currentHp/e.maxHp)*100;
  const hpColor=(p)=>p>60?"#22A355":p>30?"#D4900A":"#CC2222";

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

  // Agrupar cards
  const groupMap={};
  enemies.forEach(e=>{
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

  // ── MODAL picker de escenario (enemigos del escenario + botón "todos") ───────

  // Normalizar texto ignorando tildes para búsquedas
  const norm=(s)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

  const ScenarioPickerModal = () => {
    const [q, setQ] = React.useState("");
    const rows = q.trim()
      ? allTypes.filter(t=>norm(t).includes(norm(q)))
      : availableTypes;
    return(
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={()=>setPickerOpen(false)}>
        <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={()=>setPickerOpen(false)}>
          <View style={[ss.modalBox,{maxHeight:height*0.75}]} onStartShouldSetResponder={()=>true}>
            <View style={ss.modalHeader}>
              <Text style={ss.modalTitle}>
                {scenarioNum ? `Escenario ${scenarioNum} — enemigos` : "Seleccionar Monstruo"}
              </Text>
              <TouchableOpacity onPress={()=>setPickerOpen(false)} style={{padding:6}}>
                <Text style={{fontSize:18,color:MUTED}}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Buscador */}
            <View style={pk.searchWrap}>
              <Text style={pk.searchIcon}>🔍</Text>
              <TextInput
                style={pk.searchInput}
                placeholder="Buscar enemigo..."
                placeholderTextColor={MUTED}
                value={q}
                onChangeText={setQ}
                autoCorrect={false}
              />
              {q.length>0&&(
                <TouchableOpacity onPress={()=>setQ("")} style={{padding:4}}>
                  <Text style={{fontSize:14,color:MUTED}}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {rows.map(t=>{
                const d=ENEMY_TYPES[t];
                const selected=t===selectedType;
                const inScenario=availableTypes.includes(t);
                return(
                  <TouchableOpacity key={t} style={[ss.modalRow,selected&&ss.modalRowOn]}
                    onPress={()=>{setSelectedType(t);setVariant("normal");setPickerOpen(false);}}>
                    <View style={[ss.modalImgWrap,{borderColor:selected?d.color||ACCENT:BORDER}]}>
                      {MONSTER_IMAGES[t]
                        ?<Image source={MONSTER_IMAGES[t]} style={ss.modalImg}/>
                        :<Text style={{fontSize:16}}>{d.icon||"👹"}</Text>}
                    </View>
                    <Text style={[ss.modalRowTxt,selected&&{color:ACCENT,fontWeight:"bold"}]}>{t}</Text>
                    {q.trim()&&!inScenario&&scenarioNum&&(
                      <View style={pk.outScBadge}><Text style={pk.outScTxt}>fuera</Text></View>
                    )}
                    {selected&&<Text style={{color:ACCENT,fontSize:16,marginLeft:"auto"}}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              {/* Separador + botón otros — solo si no hay búsqueda activa */}
              {scenarioNum&&!q.trim()&&(
                <>
                  <View style={pk.separator}>
                    <View style={pk.sepLine}/>
                    <Text style={pk.sepTxt}>otros enemigos</Text>
                    <View style={pk.sepLine}/>
                  </View>
                  <TouchableOpacity style={pk.allBtn}
                    onPress={()=>{setPickerOpen(false);setTimeout(()=>setAllPickerOpen(true),250);}}>
                    <Text style={pk.allBtnTxt}>🔍 Seleccionar otro enemigo</Text>
                  </TouchableOpacity>
                </>
              )}
              {rows.length===0&&(
                <View style={{padding:24,alignItems:"center"}}>
                  <Text style={{color:MUTED,fontSize:13}}>Sin resultados para "{q}"</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── MODAL picker completo (todos los enemigos) ────────────────────────────
  const AllMonstersModal = () => {
    const [q, setQ] = React.useState("");
    const rows = q.trim()
      ? allTypes.filter(t=>norm(t).includes(norm(q)))
      : allTypes;
    return(
      <Modal visible={allPickerOpen} transparent animationType="fade" onRequestClose={()=>setAllPickerOpen(false)}>
        <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={()=>setAllPickerOpen(false)}>
          <View style={[ss.modalBox,{maxHeight:height*0.75}]} onStartShouldSetResponder={()=>true}>
            <View style={ss.modalHeader}>
              <Text style={ss.modalTitle}>Todos los enemigos</Text>
              <TouchableOpacity onPress={()=>setAllPickerOpen(false)} style={{padding:6}}>
                <Text style={{fontSize:18,color:MUTED}}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Buscador */}
            <View style={pk.searchWrap}>
              <Text style={pk.searchIcon}>🔍</Text>
              <TextInput
                style={pk.searchInput}
                placeholder="Buscar enemigo..."
                placeholderTextColor={MUTED}
                value={q}
                onChangeText={setQ}
                autoCorrect={false}
              />
              {q.length>0&&(
                <TouchableOpacity onPress={()=>setQ("")} style={{padding:4}}>
                  <Text style={{fontSize:14,color:MUTED}}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {rows.map(t=>{
                const d=ENEMY_TYPES[t];
                const selected=t===selectedType;
                const inScenario=scenarioMonsters.includes(t);
                return(
                  <TouchableOpacity key={t} style={[ss.modalRow,selected&&ss.modalRowOn]}
                    onPress={()=>{setSelectedType(t);setVariant("normal");setAllPickerOpen(false);}}>
                    <View style={[ss.modalImgWrap,{borderColor:selected?d.color||ACCENT:BORDER}]}>
                      {MONSTER_IMAGES[t]
                        ?<Image source={MONSTER_IMAGES[t]} style={ss.modalImg}/>
                        :<Text style={{fontSize:16}}>{d.icon||"👹"}</Text>}
                    </View>
                    <Text style={[ss.modalRowTxt,selected&&{color:ACCENT,fontWeight:"bold"}]}>{t}</Text>
                    {inScenario&&<View style={pk.inScBadge}><Text style={pk.inScTxt}>✓ escenario</Text></View>}
                    {selected&&<Text style={{color:ACCENT,fontSize:16,marginLeft:4}}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              {rows.length===0&&(
                <View style={{padding:24,alignItems:"center"}}>
                  <Text style={{color:MUTED,fontSize:13}}>Sin resultados para "{q}"</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ── HEADER landscape ────────────────────────────────────────────────────────
  const HeaderLandscape = () => (
    <View style={[ss.headerLand,{paddingLeft:insets.left+8,paddingRight:insets.right+8}]}>
      <TouchableOpacity onPress={onBack} style={ss.backBtnHdr}>
        <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
      </TouchableOpacity>
      <Text style={ss.hIconSm}>⚔️</Text>
      <Text style={ss.hTitleSm} numberOfLines={1}>
        {scenarioData?`#${scenarioData.num} — ${scenarioData.name}`:"Partida libre"}
      </Text>
      <TouchableOpacity onPress={saveManually}
        style={{marginRight:6,paddingHorizontal:8,paddingVertical:4,borderRadius:8,
          backgroundColor:saveConfirm?"#22A355":"transparent",
          flexDirection:"row",alignItems:"center",gap:4}}>
        <Text style={{fontSize:16}}>{saveConfirm?"✓":"💾"}</Text>
        {saveConfirm&&<Text style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Guardado</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={ss.lvlBadge} onPress={()=>setLevelModal(true)}>
        <Text style={ss.lvlBadgeLbl}>NIV</Text>
        <Text style={ss.lvlBadgeNum}>{scenarioLvl}</Text>
      </TouchableOpacity>
    </View>
  );

  // ── HEADER portrait ─────────────────────────────────────────────────────────
  const HeaderPortrait = () => (
    <View style={ss.header}>
      <TouchableOpacity onPress={onBack} style={ss.backBtnHdr}>
        <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
      </TouchableOpacity>
      <Text style={[ss.hTitle,{flex:1,marginHorizontal:4}]} numberOfLines={1}>
        {scenarioData?`#${scenarioData.num} — ${scenarioData.name}`:"⚔️ Partida libre"}
      </Text>
      {/* Indicador online */}
      {online&&(
        <View style={{flexDirection:"row",alignItems:"center",gap:3,marginRight:4}}>
          <View style={{width:7,height:7,borderRadius:4,backgroundColor:"#22A355"}}/>
          <Text style={{color:"#88C898",fontSize:11,fontWeight:"bold"}}>{jugadores}</Text>
        </View>
      )}
      {/* Share / compartir */}
      <TouchableOpacity onPress={compartirSala}
        style={{paddingHorizontal:8,paddingVertical:6,justifyContent:"center",alignItems:"center"}}>
        <Ionicons name={online?"people":"share-social-outline"} size={22} color="#F5DEB3"/>
      </TouchableOpacity>
      {/* Guardar */}
      <TouchableOpacity onPress={saveManually}
        style={{marginRight:4,paddingHorizontal:8,paddingVertical:4,borderRadius:8,
          backgroundColor:saveConfirm?"#22A355":"transparent",
          flexDirection:"row",alignItems:"center",gap:4}}>
        <Text style={{fontSize:16}}>{saveConfirm?"✓":"💾"}</Text>
        {saveConfirm&&<Text style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Guardado</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={ss.lvlBadge} onPress={()=>setLevelModal(true)}>
        <Text style={ss.lvlBadgeLbl}>NIV</Text>
        <Text style={ss.lvlBadgeNum}>{scenarioLvl}</Text>
      </TouchableOpacity>
    </View>
  );

  // ── BARRA AGREGAR landscape ─────────────────────────────────────────────────
  const AddBarLandscape = () => (
    <View style={[ss.addBarLand,{paddingLeft:insets.left+8,paddingRight:insets.right+8}]}>
      <TouchableOpacity style={[ss.selectorBtn,{flex:1,marginRight:6}]} onPress={()=>setPickerOpen(true)}>
        <View style={ss.selectorImgWrap}>
          {MONSTER_IMAGES[selectedType]
            ?<Image source={MONSTER_IMAGES[selectedType]} style={ss.selectorImg}/>
            :<Text style={{fontSize:14}}>{ENEMY_TYPES[selectedType]?.icon||"👹"}</Text>}
        </View>
        <Text style={ss.selectorTxt} numberOfLines={1}>{selectedType}</Text>
        <Text style={ss.selectorArrow}>▾</Text>
      </TouchableOpacity>
      <View style={{width:100,flexDirection:"row",gap:4,alignSelf:"stretch",marginLeft:6}}>
        {selIsBoss
          ? <TouchableOpacity onPress={addEnemy} style={[ss.quickAddBoss,{flex:1,marginLeft:0}]}>
              <Text style={[ss.quickAddTxt,{color:"#fff"}]}>+</Text>
            </TouchableOpacity>
          : <>
              <TouchableOpacity
                onPress={()=>addEnemyVariant("normal")}
                style={[ss.quickAddBtn,{flex:1,marginLeft:0,backgroundColor:"#FFFFFF",borderColor:ACCENT,borderWidth:1.5}]}>
                <Text style={[ss.quickAddTxt,{color:ACCENT}]}>+</Text>
              </TouchableOpacity>
              {selHasElite
                ? <TouchableOpacity
                    onPress={()=>addEnemyVariant("elite")}
                    style={[ss.quickAddBtn,{flex:1,backgroundColor:"#FFE650",borderColor:"#C9920A",borderWidth:1.5}]}>
                    <Text style={[ss.quickAddTxt,{color:"#8B6914"}]}>+</Text>
                  </TouchableOpacity>
                : <View style={{flex:1}}/>
              }
            </>
        }
      </View>
    </View>
  );

  // ── BARRA AGREGAR portrait ──────────────────────────────────────────────────
  const AddBarPortrait = () => (
    <View style={ss.addBar}>
      <View style={ss.addRow}>
        {/* Picker de monstruo */}
        <TouchableOpacity style={[ss.selectorBtn,{flex:1,marginRight:6}]} onPress={()=>setPickerOpen(true)}>
          <View style={ss.selectorImgWrap}>
            {MONSTER_IMAGES[selectedType]
              ?<Image source={MONSTER_IMAGES[selectedType]} style={ss.selectorImg}/>
              :<Text style={{fontSize:14}}>{ENEMY_TYPES[selectedType]?.icon||"👹"}</Text>}
          </View>
          <Text style={ss.selectorTxt} numberOfLines={1}>{selectedType}</Text>
          <Text style={ss.selectorArrow}>▾</Text>
        </TouchableOpacity>
        {/* Bloque de botones ancho fijo — siempre 100px */}
        <View style={{width:100,flexDirection:"row",gap:4,alignSelf:"stretch"}}>
          {selIsBoss
            ? <TouchableOpacity onPress={addEnemy} style={[ss.quickAddBoss,{flex:1,marginLeft:0}]}>
                <Text style={[ss.quickAddTxt,{color:"#fff"}]}>+</Text>
              </TouchableOpacity>
            : <>
                <TouchableOpacity
                  onPress={()=>addEnemyVariant("normal")}
                  style={[ss.quickAddBtn,{flex:1,marginLeft:0,backgroundColor:"#FFFFFF",borderColor:ACCENT,borderWidth:1.5}]}>
                  <Text style={[ss.quickAddTxt,{color:ACCENT}]}>+</Text>
                </TouchableOpacity>
                {selHasElite
                  ? <TouchableOpacity
                      onPress={()=>addEnemyVariant("elite")}
                      style={[ss.quickAddBtn,{flex:1,backgroundColor:"#FFE650",borderColor:"#C9920A",borderWidth:1.5}]}>
                      <Text style={[ss.quickAddTxt,{color:"#8B6914"}]}>+</Text>
                    </TouchableOpacity>
                  : <View style={{flex:1}}/>
                }
              </>
          }
        </View>
      </View>
    </View>
  );

  // ── MODAL NIVEL ──────────────────────────────────────────────────────────
  const LevelModal = () => (
    <Modal visible={levelModal} transparent animationType="fade" onRequestClose={()=>setLevelModal(false)}>
      <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={()=>setLevelModal(false)}>
        <View style={[ss.modalBox,{width:"80%",maxWidth:340}]} onStartShouldSetResponder={()=>true}>
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>Nivel del escenario</Text>
            <TouchableOpacity onPress={()=>setLevelModal(false)} style={{padding:6}}>
              <Text style={{fontSize:18,color:MUTED}}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={ss.lvlGrid}>
            {[0,1,2,3,4,5,6,7].map(n=>(
              <TouchableOpacity key={`lvl${n}`}
                style={[ss.lvlGridBtn, scenarioLvl===n&&ss.lvlGridBtnOn]}
                onPress={()=>{setScenarioLvl(n);setLevelModal(false);}}>
                <Text style={[ss.lvlGridNum, scenarioLvl===n&&ss.lvlGridNumOn]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={ss.lvlHint}>El nivel determina vida y escudo de los enemigos y sus capacidades.</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return(
    <View style={[ss.root,{paddingTop:isLandscape?0:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <LevelModal/>
      <ScenarioPickerModal/>
      <AllMonstersModal/>

      {/* Popup muertes por herida */}
      {noStockAlert&&(
        <View style={ss.overlay}>
          <View style={[ss.popup,{alignItems:"center"}]}>
            <Text style={{fontSize:32,marginBottom:8}}>🚫</Text>
            <Text style={[ss.popupTitle,{textAlign:"center"}]}>Sin fichas disponibles</Text>
            <Text style={[ss.popupSub,{textAlign:"center",marginBottom:16}]}>
              No quedan fichas de este enemigo en el stock.
            </Text>
            <TouchableOpacity style={ss.popupBtn} onPress={()=>setNoStockAlert(false)}>
              <Text style={ss.popupBtnTxt}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {woundDeaths.length>0&&(
        <View style={ss.overlay}>
          <View style={[ss.popup,isLandscape&&{width:"60%",padding:16}]}>
            <Text style={[ss.popupTitle,{textAlign:"center",width:"100%"}]}>💀 Muertos por Herida</Text>
            <Text style={[ss.popupSub,{textAlign:"center",width:"100%",marginBottom:8}]}>Al final de la ronda:</Text>
            <ScrollView style={{maxHeight:isLandscape?height*0.4:300}} showsVerticalScrollIndicator={false}>
              {woundDeaths.map((d,i)=>{
                const vs=VS[d.variant]||VS.normal;
                return(
                <View key={`wd${i}`} style={ss.popupRow}>
                  <View style={[ss.popupImgWrap,{borderColor:vs.border}]}>
                    {MONSTER_IMAGES[d.type]
                      ?<Image source={MONSTER_IMAGES[d.type]} style={ss.popupImg}/>
                      :<Text style={{fontSize:18}}>{ENEMY_TYPES[d.type]?.icon||"👹"}</Text>}
                  </View>
                  <View style={{flex:1}}>
                    <Text style={ss.popupName} numberOfLines={1}>{d.type}</Text>
                    <View style={{flexDirection:"row",alignItems:"center",marginTop:2,gap:4}}>
                      <View style={[ss.popupVariantTag,{backgroundColor:vs.bBg,borderColor:vs.border}]}>
                        <Text style={[ss.popupVariantTxt,{color:vs.tc}]}>{vs.label}</Text>
                      </View>
                      <View style={ss.popupNumBadge}>
                        <Text style={ss.popupNum}>#{d.number}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[ss.popupBtn,{alignSelf:"center",marginTop:8}]} onPress={()=>setWoundDeaths([])}>
              <Text style={ss.popupBtnTxt}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Modal compartir sala ── */}
      <Modal visible={shareVisible} transparent animationType="fade">
        <TouchableOpacity style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",
          justifyContent:"center",alignItems:"center"}}
          activeOpacity={1} onPress={()=>setShareVisible(false)}>
          <View style={{backgroundColor:CARD_BG,borderRadius:20,width:"88%",maxWidth:360,
            borderWidth:1.5,borderColor:BORDER,overflow:"hidden",
            shadowColor:"#000",shadowOffset:{width:0,height:8},shadowRadius:20,
            shadowOpacity:0.4,elevation:16}}
            onStartShouldSetResponder={()=>true}>
            <View style={{backgroundColor:DARK_BG,paddingHorizontal:20,paddingVertical:14}}>
              <Text style={{color:"#F5DEB3",fontWeight:"bold",fontSize:16}}>
                {online?"Sala activa":"Compartir partida"}
              </Text>
              <Text style={{color:"#A0845C",fontSize:12,marginTop:2}}>
                {online?"Tu partida está en línea":"Compartí el código con tus compañeros"}
              </Text>
            </View>
            <View style={{padding:24,alignItems:"center"}}>
              <Text style={{fontSize:56,fontWeight:"bold",letterSpacing:14,color:TEXT,marginBottom:6}}>
                {sharingCode||salaId||"----"}
              </Text>
              <Text style={{fontSize:12,color:MUTED,marginBottom:20}}>Código de sala</Text>
              {online&&(
                <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:20}}>
                  <View style={{width:8,height:8,borderRadius:4,backgroundColor:"#22A355"}}/>
                  <Text style={{color:"#22A355",fontSize:13,fontWeight:"bold"}}>
                    {jugadores} jugador{jugadores!==1?"es":""} conectado{jugadores!==1?"s":""}
                  </Text>
                </View>
              )}
              <TouchableOpacity onPress={()=>handleShareCode(sharingCode||salaId)}
                style={{flexDirection:"row",alignItems:"center",gap:8,
                  backgroundColor:ACCENT,borderRadius:12,paddingHorizontal:24,paddingVertical:12,
                  width:"100%",justifyContent:"center"}}>
                <Ionicons name="share-social-outline" size={20} color="#FFF8E8"/>
                <Text style={{color:"#FFF8E8",fontWeight:"bold",fontSize:15}}>
                  Compartir código
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {isLandscape ? <HeaderLandscape/> : <HeaderPortrait/>}
      {isLandscape ? <AddBarLandscape/> : <AddBarPortrait/>}


      {/* ══ SECCIÓN INICIATIVA ══════════════════════════════════════════════ */}
      <InitiativeBar
        initOrder={initOrder}
        setInitOrder={setInitOrder}
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
                {group.cards.map(enemy=>{
                  const pct=hpPct(enemy),tc=ENEMY_TYPES[enemy.type]?.color||ACCENT;
                  const icon=ENEMY_TYPES[enemy.type]?.icon||"👹";
                  const pending=pendingDmg[enemy.id]||0;
                  const totalShield=(enemy.baseShield||0)+enemy.shield;
                  const effShield=Math.max(0,totalShield-enemy.pierce);
                  const poiBonus=enemy.statuses.includes("poison")?1:0;
                  const prevDmg=pending>0?Math.max(0,pending-effShield)+poiBonus:null;
                  const fullyBlocked=pending>0&&prevDmg===0;
                  const vs=VS[enemy.variant]||VS.normal;

                  const baseShield=enemy.baseShield||0;

                  // ── Stats y skills del nivel actual ──────────────────────────────────
                  const sk = MONSTER_SKILLS[enemy.type]?.[Math.min(scenarioLvl,7)];
                  const isE = enemy.variant==="elite";
                  const isB = enemy.variant==="boss";

                  // Resolver atk con lógica especial (p, i, #+X)
                  const resolveBossAtk = (rawAtk) => {
                    if(rawAtk===null||rawAtk===undefined) return null;
                    if(typeof rawAtk==="number") return String(rawAtk);
                    const s = String(rawAtk);
                    if(s==="i"){
                      // Merciless Overseer: contar Exploradores Infestores en tablero
                      const count = enemies.filter(e=>e.type==="Explorador Infestor").length;
                      return String(count);
                    }
                    if(s==="p") return String(players);
                    const mPlus = s.match(/^(\d+)\+p$/i);
                    if(mPlus) return String(parseInt(mPlus[1])+players);
                    // "#+X" → mostrar tal cual
                    return s;
                  };

                  const mv  = isB ? sk?.boss?.move  : (isE ? sk?.elite?.move  : sk?.normal?.move);
                  const atkRaw = isB ? sk?.boss?.atk : (isE ? sk?.elite?.atk  : sk?.normal?.atk);
                  const atk = isB ? resolveBossAtk(atkRaw) : (atkRaw!=null ? String(atkRaw) : null);
                  const rng  = isB ? sk?.boss?.range : (isE ? sk?.elite?.range : sk?.normal?.range);
                  const ret  = isB ? null : (isE ? sk?.elite?.retaliate : sk?.normal?.retaliate);
                  const retRng = isB ? null : (isE ? sk?.elite?.retRange : sk?.normal?.retRange);
                  const tgt  = isB ? null : (isE ? sk?.elite?.target  : sk?.normal?.target);
                  const flying = sk?.flying==="x";

                  // Inmunidades del jefe (statuses con "x")
                  const bossImmune = isB && sk?.statuses
                    ? Object.entries(sk.statuses).filter(([,v])=>v==="x").map(([k])=>k)
                    : [];

                  // Skills activos (n/e/b) para no-jefes
                  const activeStatuses = !isB && sk?.statuses
                    ? Object.entries(sk.statuses).filter(([k,v])=>{
                        if(!v||v==="x") return false;
                        if(v==="b") return true;
                        if(v==="n"&&!isE) return true;
                        if(v==="e"&&isE) return true;
                        return false;
                      })
                    : [];

                  // "Otras skills" texto
                  const otrasText = isE ? sk?.otrasE : sk?.otrasN;

                  return(
                    <View key={enemy.id} style={[ss.card,{
                      borderColor:enemy.summoned===true?"#C0821A":vs.border,
                      borderWidth:enemy.summoned===true?3:2,
                      width:cardWidth
                    }]}>
                      {enemy.summoned===true&&(
                        <View style={{backgroundColor:"#C0821A",paddingHorizontal:8,paddingVertical:2,alignItems:"center"}}>
                          <Text style={{color:"#fff",fontSize:9,fontWeight:"bold",letterSpacing:1}}>
                            Invocado — no actúa esta ronda
                          </Text>
                        </View>
                      )}
                      {/* ── HEADER: avatar + stats + skills + inmunidades + id/close ── */}
                      <View style={[ss.cardHead,{backgroundColor:vs.hBg()}]}>
                        {/* Avatar — borde naranja + tag INV si fue invocado en ronda anterior */}
                        <View style={{alignItems:"center"}}>
                          <View style={[ss.iconCircle,{
                            borderColor:enemy.summoned==="done"?"#C0821A":vs.bBorder(),
                            borderWidth:enemy.summoned==="done"?3:2,
                          }]}>
                            {MONSTER_IMAGES[enemy.type]
                              ?<Image source={MONSTER_IMAGES[enemy.type]} style={ss.monsterImg}/>
                              :<Text style={{fontSize:18}}>{icon}</Text>}
                            {enemy.summoned==="done"&&(
                              <View style={{position:"absolute",bottom:0,left:0,right:0,
                                alignItems:"center",backgroundColor:"rgba(192,130,26,0.88)",
                                paddingVertical:1}}>
                                <Text style={{color:"#fff",fontSize:7,fontWeight:"bold",letterSpacing:0.5}}>INV</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Columna stats: move / atk / range — #2: mostrar move aunque sea 0 */}
                        {(sk&&(mv!=null||atk!=null||rng!=null))&&(
                          <View style={ss.cardStatCol}>
                            {mv!=null&&(
                              <View style={ss.cardStatRow}>
                                <Image source={MOVE_IMG} style={ss.cardStatImg}/>
                                <Text style={ss.cardStatVal}>{mv===0?"-":mv}</Text>
                              </View>
                            )}
                            {atk!=null&&(
                              <View style={ss.cardStatRow}>
                                <Image source={ATK_IMG} style={ss.cardStatImg}/>
                                <Text style={ss.cardStatVal}>{atk}</Text>
                              </View>
                            )}
                            {rng!=null&&(
                              <View style={ss.cardStatRow}>
                                <Image source={RANGE_IMG} style={ss.cardStatImg}/>
                                <Text style={ss.cardStatVal}>{rng===0?"-":rng}</Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Columna skills: flying primero, luego estados, target, retaliate, otras */}
                        {(activeStatuses.length>0||tgt!=null||ret!=null||flying||otrasText)&&(
                          <View style={ss.cardSkillCol}>
                            {flying&&<Image source={FLYING_IMG} style={ss.cardSkillImg}/>}
                            {activeStatuses.map(([sid])=>(
                              <Image key={sid} source={SKILL_STATUS_IMGS[sid]} style={ss.cardSkillImg}/>
                            ))}
                            {tgt!=null&&(
                              <View style={ss.cardStatRow}>
                                <Image source={TARGET_IMG} style={ss.cardSkillImg}/>
                                <Text style={ss.cardStatVal}>{tgt}</Text>
                              </View>
                            )}
                            {ret!=null&&(
                              <View style={ss.cardStatRow}>
                                <Image source={RETALIATE_IMG} style={ss.cardSkillImg}/>
                                <Text style={ss.cardStatVal}>{ret}</Text>
                                {retRng!=null&&<Image source={RANGE_IMG} style={{width:9,height:9,marginLeft:1}}/>}
                                {retRng!=null&&<Text style={{fontSize:9,fontWeight:"bold",color:MUTED}}>{retRng}</Text>}
                              </View>
                            )}
                            {otrasText==="Ventaja"&&(
                              <Text style={{fontSize:8,fontWeight:"bold",color:"#1A6B2A",lineHeight:10}}>Ventaja</Text>
                            )}
                            {otrasText==="Aplica desventaja"&&(
                              <View style={ss.cardStatRow}>
                                <Text style={{fontSize:8,fontWeight:"bold",color:MUTED,lineHeight:10}}>Aplica </Text>
                                <Image source={MUDDLE_IMG} style={{width:12,height:12}}/>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Inmunidades del jefe en el header */}
                        {isB&&bossImmune.length>0&&(
                          <View style={ss.cardImmuneCol}>
                            {bossImmune.map(sid=>(
                              <View key={sid} style={ss.cardImmuneItem}>
                                {SKILL_STATUS_IMGS[sid]
                                  ?<Image source={SKILL_STATUS_IMGS[sid]} style={ss.cardImmuneImg}/>
                                  :<Text style={{fontSize:10}}>{sid}</Text>}
                                <View style={ss.cardImmuneCross}>
                                  <Text style={ss.cardImmuneCrossTxt}>✕</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* flex:1 para empujar id y close a la derecha */}
                        <View style={{flex:1}}/>

                        {/* Token número (solo no-jefes, excepto Guardaespaldas Inox) + botón eliminar */}
                        {(!isB||enemy.type==="Guardaespaldas Inox")&&(
                          editingNum===enemy.id
                            ?<TextInput autoFocus value={numDraft} onChangeText={setNumDraft}
                                onBlur={()=>commitNum(enemy.id)} onSubmitEditing={()=>commitNum(enemy.id)}
                                keyboardType="number-pad"
                                style={[ss.tokenRect,{borderColor:vs.bBorder(),backgroundColor:vs.bBg}]}/>
                            :<TouchableOpacity onPress={()=>startEditNum(enemy.id,enemy.number)}
                                style={[ss.tokenRect,{borderColor:vs.bBorder(),backgroundColor:vs.bBg}]}>
                                <Text style={[ss.tokenTxt,{color:vs.tc}]}>{enemy.number}</Text>
                              </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={()=>removeEnemy(enemy.id)} style={{padding:6}}>
                          <Text style={{fontSize:16,color:"#BBA888"}}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* ── VIDA + pills de escudo ── */}
                      <View style={ss.hpSec}>
                        <View style={ss.hpRow}>
                          <Text style={ss.hpLbl}>Vida</Text>
                          {/* Pills en contenedor flex:1 con fila siempre estable */}
                          <View style={ss.hpPills}>
                            <View style={[ss.pillBase,{opacity:baseShield>0?1:0}]}>
                              <Image source={SHIELD_IMG} style={{width:12,height:12,marginRight:3}}/>
                              <Text style={ss.pillBaseTxt}>{baseShield||0}</Text>
                            </View>
                            <View style={[ss.pillTemp,{borderColor:vs.bBorder(tc)+"88",opacity:enemy.shield>0?1:0}]}>
                              <Image source={SHIELD_IMG} style={{width:12,height:12,marginRight:2}}/>
                              <Text style={[ss.pillTempTxt,{color:vs.tc}]}>+{enemy.shield||0}</Text>
                            </View>
                          </View>
                          <Text style={[ss.hpVal,{color:hpColor(pct)}]}>
                            {enemy.currentHp}<Text style={ss.hpMax}>/{enemy.maxHp}</Text>
                          </Text>
                        </View>
                        <View style={ss.hpBarOut}>
                          <View style={[ss.hpBarIn,{width:`${pct}%`,backgroundColor:hpColor(pct)}]}/>
                        </View>
                      </View>

                      {/* ── DAÑO DEL ATAQUE ── */}
                      <View style={ss.dmgSec}>
                        <Text style={ss.dmgLbl}>Daño del ataque</Text>
                        <View style={[ss.dmgRow,{justifyContent:"center"}]}>
                          <TouchableOpacity style={ss.dmgBtnSm} onPress={()=>setPendingDmg(prev=>({...prev,[enemy.id]:0}))}>
                            <Ionicons name="refresh" size={16} color={MUTED}/>
                          </TouchableOpacity>
                          <TouchableOpacity style={ss.dmgBtnSm} onPress={()=>adjustPending(enemy.id,-1)}>
                            <Text style={ss.btnSmTxt}>−</Text>
                          </TouchableOpacity>
                          <View style={[ss.dmgBox,fullyBlocked?ss.dmgBoxBlocked:pending>0?ss.dmgBoxOn:ss.dmgBoxOff]}>
                            <Text style={[ss.dmgVal,fullyBlocked?ss.dmgValBlocked:pending>0?ss.dmgValOn:ss.dmgValOff]}>{pending}</Text>
                            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",minHeight:14}}>
                              {fullyBlocked
                                ?<View style={{flexDirection:"row",alignItems:"center",gap:2}}><Image source={SHIELD_IMG} style={{width:11,height:11}}/></View>
                                :prevDmg!==null
                                  ?<>
                                    <Text style={[ss.dmgInfo,{color:"#CC2222"}]}>{`−${prevDmg} HP`}</Text>
                                    {poiBonus>0&&<Image source={POISON_IMG} style={{width:12,height:12,marginLeft:2}}/>}
                                  </>
                                  :<Text style={[ss.dmgInfo,{color:"transparent"}]}> </Text>
                              }
                            </View>
                          </View>
                          <TouchableOpacity style={ss.dmgBtnSm} onPress={()=>adjustPending(enemy.id,1)}>
                            <Text style={ss.btnSmTxt}>+1</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={ss.dmgBtnSm} onPress={()=>adjustPending(enemy.id,5)}>
                            <Text style={ss.btnSmTxt}>+5</Text>
                          </TouchableOpacity>
                        </View>
                        {/* Trampa · Cura · Ataque — misma fila, mismo tamaño */}
                        <View style={ss.healTrapRow}>
                          {/* Trampa */}
                          <TouchableOpacity style={ss.actionBtnSm} onPress={()=>applyTrap(enemy.id)}>
                            <Text style={ss.actionBtnTxt}>🪤</Text>
                            <Text style={ss.actionBtnSub}>−1</Text>
                          </TouchableOpacity>
                          {/* Cura */}
                          <TouchableOpacity style={[ss.actionBtn,{backgroundColor:"#22A355",flex:2}]} onPress={()=>applyHeal(enemy.id)}>
                            {!(enemy.statuses.includes("wound")||enemy.statuses.includes("poison"))&&(
                              <View style={{flexDirection:"row",alignItems:"center",gap:0}}>
                                <Text style={ss.actionBtnTxt}>+1</Text>
                                <Image source={HEAL_IMG} style={ss.actionBtnImg}/>
                              </View>
                            )}
                            {enemy.statuses.includes("poison")&&!enemy.statuses.includes("wound")&&(
                              <>
                                <View style={{flexDirection:"row",alignItems:"center",gap:0}}>
                                  <Text style={ss.actionBtnTxt}>+1</Text>
                                  <Image source={HEAL_IMG} style={ss.actionBtnImg}/>
                                </View>
                                <Text style={ss.actionBtnTxt}>−</Text>
                                <Image source={POISON_IMG} style={ss.actionBtnImg}/>
                              </>
                            )}
                            {enemy.statuses.includes("wound")&&!enemy.statuses.includes("poison")&&(
                              <>
                                <Text style={ss.actionBtnTxt}>−</Text>
                                <Image source={WOUND_IMG} style={ss.actionBtnImg}/>
                              </>
                            )}
                            {enemy.statuses.includes("wound")&&enemy.statuses.includes("poison")&&(
                              <View style={{flexDirection:"row",alignItems:"center",gap:2}}>
                                <Text style={ss.actionBtnTxt}>−</Text>
                                <Image source={POISON_IMG} style={ss.actionBtnImg}/>
                                <Image source={WOUND_IMG} style={ss.actionBtnImg}/>
                              </View>
                            )}
                          </TouchableOpacity>
                          {/* Ataque */}
                          <TouchableOpacity disabled={pending===0} onPress={()=>commitDamage(enemy.id)}
                            style={[ss.actionBtn,{backgroundColor:pending>0?"#CC2222":"#993333",flex:2}]}>
                            <Image source={ATK_WHITE_IMG} style={[ss.actionBtnImg,{width:22,height:22},pending===0&&{opacity:0.5}]}/>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* ── ESCUDO TEMPORAL + PERFORACIÓN en una sola fila 2 col ── */}
                      <View style={ss.statDualRow}>
                        <View style={ss.statCol}>
                          <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:4}}>
                            <Image source={SHIELD_IMG} style={{width:14,height:14}}/>
                            <Text style={ss.statColLbl}>Escudo</Text>
                          </View>
                          <View style={ss.statColCtrl}>
                            <TouchableOpacity style={ss.btnSm} onPress={()=>updateEnemy(enemy.id,{shield:Math.max(0,enemy.shield-1)})}>
                              <Text style={ss.btnSmTxt}>−</Text>
                            </TouchableOpacity>
                            <Text style={ss.statVal}>{enemy.shield}</Text>
                            <TouchableOpacity style={ss.btnSm} onPress={()=>updateEnemy(enemy.id,{shield:enemy.shield+1})}>
                              <Text style={ss.btnSmTxt}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={ss.statDivider}/>
                        <View style={ss.statCol}>
                          <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:4}}>
                            <Image source={PIERCE_IMG} style={{width:14,height:14}}/>
                            <Text style={ss.statColLbl}>Perforación</Text>
                          </View>
                          <View style={ss.statColCtrl}>
                            <TouchableOpacity style={ss.btnSm} onPress={()=>updateEnemy(enemy.id,{pierce:Math.max(0,enemy.pierce-1)})}>
                              <Text style={ss.btnSmTxt}>−</Text>
                            </TouchableOpacity>
                            <Text style={ss.statVal}>{enemy.pierce}</Text>
                            <TouchableOpacity style={ss.btnSm} onPress={()=>updateEnemy(enemy.id,{pierce:enemy.pierce+1})}>
                              <Text style={ss.btnSmTxt}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      <View style={{paddingHorizontal:8,paddingVertical:3,backgroundColor:"#F0F4FA",minHeight:20,justifyContent:"center"}}>
                        <Text style={{fontSize:10,color:"#3070C8"}}>
                          {`Escudo efectivo: ${effShield}`}
                        </Text>
                      </View>

                      {/* ── ESTADOS ── */}
                      <View style={ss.stSec}>
                        <Text style={ss.stLbl}>Estados</Text>
                        {[STATUS_ROW1,STATUS_ROW2].map((row,ri)=>(
                          <View key={`sr${ri}`} style={[ss.stRow,ri===0&&{marginBottom:3}]}>
                            {row.map(st=>{
                              const active=enemy.statuses.includes(st.id);
                              const immune=bossImmune.includes(st.id);
                              return(
                                <TouchableOpacity key={st.id}
                                  onPress={()=>{ if(!immune) toggleStatus(enemy.id,st.id); }}
                                  style={[
                                    ss.stBtn,
                                    active&&{backgroundColor:st.color+"22",borderColor:st.color,opacity:1},
                                    immune&&ss.stBtnImmune,
                                  ]}>
                                  {st.img
                                    ? <Image source={st.img} style={[ss.stImg,immune&&{opacity:0.25}]}/>
                                    : <Text style={{fontSize:16,opacity:immune?0.25:1}}>{st.icon}</Text>}
                                  {immune&&(
                                    <View style={ss.immuneBadge}>
                                      <Text style={ss.immuneTxt}>✕</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        ))}
                        <Text style={{marginTop:4,fontSize:10,color:"#7B5A2A",minHeight:14}}>
                          {enemy.statuses.map(sid=>STATUS_EFFECTS.find(x=>x.id===sid)?.label).filter(Boolean).join(" · ")}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {!isLandscape&&(
        <View style={[ss.footer,{paddingBottom:insets.bottom+6}]}>
          <Text style={ss.footerTxt}>Herida: −1 HP al inicio del turno · Veneno: +1 al daño del ataque</Text>
        </View>
      )}
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
  return(
    <>
      <HomeScreen
        onFreePlay={()=>openClassModal(null)}
        onSelectScenario={()=>navigate("scenarioSelect")}
        onCampaignConfig={()=>navigate("campaignConfig")}
        onSavedGames={()=>navigate("savedGames")}
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
// ESTILOS — HOME
// ═══════════════════════════════════════════════════════════════════════════════
const hs = StyleSheet.create({
  root:         { flex:1, backgroundColor:DARK_BG, alignItems:"center", justifyContent:"center" },
  titleBlock:   { alignItems:"center", marginBottom:32 },
  titleIcon:    { fontSize:48, marginBottom:10 },
  title:        { fontSize:26, fontWeight:"bold", color:"#F5DEB3", letterSpacing:3 },
  sub:          { fontSize:11, color:"#A0845C", letterSpacing:2, marginTop:4 },
  btnWrap:      { width:"100%", gap:8 },
  btnFree:      { backgroundColor:ACCENT, borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                  flexDirection:"row", alignItems:"center",
                  shadowColor:"#000", shadowOffset:{width:0,height:3}, shadowRadius:6, shadowOpacity:0.3, elevation:5 },
  btnScenario:  { backgroundColor:"#F5EFE4", borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                  flexDirection:"row", alignItems:"center", borderWidth:2, borderColor:BORDER,
                  shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowRadius:4, shadowOpacity:0.2, elevation:3 },
  btnIcon:      { fontSize:26, marginRight:14 },
  btnTextBlock: { flex:1 },
  btnTitle:     { fontSize:17, fontWeight:"bold", color:"#FFF8E8" },
  btnDesc:      { fontSize:12, color:"#D4B89A", marginTop:1 },
  btnTitleDark: { fontSize:17, fontWeight:"bold", color:TEXT },
  btnDescDark:  { fontSize:12, color:MUTED, marginTop:1 },
  btnArrow:     { fontSize:22, color:"#FFF8E8", marginLeft:8 },
  btnArrowDark: { fontSize:22, color:MUTED, marginLeft:8 },
  configSection:   { gap:0 },
  freeSection:     { marginTop:6, gap:8 },
  configHeaderRow: { flexDirection:"row", alignItems:"center", marginBottom:6 },
  configLine:      { flex:1, height:1, backgroundColor:"#6B4A28" },
  configLbl:       { fontSize:10, color:"#A0845C", fontWeight:"bold", letterSpacing:1.5, marginHorizontal:10 },
  btnFreeAlt:      { backgroundColor:"#F5EFE4", borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                     flexDirection:"row", alignItems:"center", borderWidth:1.5, borderColor:BORDER,
                     shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowRadius:3, shadowOpacity:0.12, elevation:2 },
  btnTitleMuted:   { fontSize:17, fontWeight:"bold", color:MUTED },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — SCENARIO SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════
const scn = StyleSheet.create({
  root:         { flex:1, backgroundColor:BG },
  header:       { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center",
                  paddingHorizontal:4, paddingVertical:8 },
  backBtn:      { paddingHorizontal:16, paddingVertical:12, justifyContent:"center", alignItems:"center" },
  backTxt:      { color:"#F5DEB3", fontSize:20, fontWeight:"bold", lineHeight:20, includeFontPadding:false },
  headerTitle:  { fontSize:16, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0 },
  inputSection: { backgroundColor:"#EDE4D0", paddingHorizontal:16, paddingVertical:14,
                  borderBottomWidth:1, borderBottomColor:BORDER },
  inputLabel:   { fontSize:12, color:MUTED, marginBottom:8, fontWeight:"bold", letterSpacing:0.5 },
  inputRow:     { flexDirection:"row", alignItems:"center", gap:10 },
  input:        { flex:1, borderWidth:2, borderColor:BORDER, borderRadius:10, paddingHorizontal:14,
                  paddingVertical:10, fontSize:22, fontWeight:"bold", color:TEXT, backgroundColor:CARD_BG,
                  textAlign:"center" },
  inputErr:     { borderColor:"#CC2222" },
  confirmBtn:   { backgroundColor:ACCENT, borderRadius:10, paddingHorizontal:20, paddingVertical:11 },
  confirmTxt:   { color:"#FFF8E8", fontWeight:"bold", fontSize:16 },
  errTxt:       { color:"#CC2222", fontSize:11, marginTop:6 },
  dividerRow:   { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:10,
                  backgroundColor:BG },
  dividerLine:  { flex:1, height:1, backgroundColor:BORDER },
  dividerTxt:   { fontSize:11, color:MUTED, marginHorizontal:10 },
  row:          { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:14,
                  backgroundColor:CARD_BG },
  rowNum:       { width:48, height:48, borderRadius:10, backgroundColor:"#EDE4D0",
                  borderWidth:1, borderColor:BORDER, justifyContent:"center", alignItems:"center",
                  marginRight:14 },
  rowNumTxt:    { fontSize:16, fontWeight:"bold", color:ACCENT },
  rowInfo:      { flex:1 },
  rowName:      { fontSize:17, fontWeight:"bold", color:TEXT },
  rowArrow:     { fontSize:20, color:MUTED, marginLeft:8 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — PICKER ESPECIAL
// ═══════════════════════════════════════════════════════════════════════════════
const pk = StyleSheet.create({
  separator:    { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:8,
                  backgroundColor:"#F5EFE4" },
  sepLine:      { flex:1, height:1, backgroundColor:BORDER },
  sepTxt:       { fontSize:11, color:MUTED, marginHorizontal:10 },
  allBtn:       { paddingHorizontal:14, paddingVertical:12, backgroundColor:"#EDE4D0",
                  borderBottomWidth:1, borderBottomColor:BORDER },
  allBtnTxt:    { fontSize:14, color:ACCENT, fontWeight:"bold", textAlign:"center" },
  inScBadge:    { backgroundColor:"#E8F8EE", borderRadius:4, paddingHorizontal:6, paddingVertical:2,
                  borderWidth:1, borderColor:"#22A355"+"44", marginLeft:6 },
  inScTxt:      { fontSize:10, color:"#22A355", fontWeight:"bold" },
  outScBadge:   { backgroundColor:"#F5EEE8", borderRadius:4, paddingHorizontal:6, paddingVertical:2, borderWidth:1, borderColor:"#B8860B44", marginLeft:"auto" },
  outScTxt:     { fontSize:10, color:"#8B6914", fontWeight:"bold" },
  searchWrap:   { flexDirection:"row", alignItems:"center", marginHorizontal:12, marginTop:10, marginBottom:8, borderWidth:1, borderColor:BORDER, borderRadius:8, backgroundColor:BG, paddingHorizontal:8, paddingVertical:4 },
  searchIcon:   { fontSize:14, marginRight:6 },
  searchInput:  { flex:1, fontSize:14, color:TEXT, paddingVertical:4 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — TRACKER (sin cambios respecto al original)
// ═══════════════════════════════════════════════════════════════════════════════
const ss = StyleSheet.create({
  root:           { flex:1, backgroundColor:DARK_BG },
  header:         { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center", paddingHorizontal:4, paddingVertical:8 },
  headerRow1:     { flexDirection:"row", alignItems:"center", flex:1 },
  hIcon:          { fontSize:20, marginRight:6 },
  hTitle:         { fontSize:15, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0 },
  hSub:           { fontSize:8, color:"#A0845C", letterSpacing:1 },
  initSec:        { backgroundColor:CARD_BG, borderBottomWidth:1, borderBottomColor:BORDER, paddingTop:8, paddingBottom:10 },
  initLbl:        { fontSize:9, color:MUTED, letterSpacing:1.5, fontWeight:"bold", textAlign:"center", marginBottom:6 },
  initRow:        { paddingHorizontal:12, gap:8, alignItems:"center" },
  initAvatar:     { alignItems:"center", width:52 },
  initImgWrap:    { width:44, height:44, borderRadius:22, overflow:"hidden", borderWidth:2,
                    borderColor:BORDER, backgroundColor:"#F0E6D0", justifyContent:"center", alignItems:"center" },
  initImgClass:   { borderColor:ACCENT },
  initImg:        { width:36, height:36 },
  initImgFull:    { width:44, height:44 },
  initAvatarLbl:  { fontSize:9, color:MUTED, marginTop:3, textAlign:"center", maxWidth:52 },
  initFloat:      { position:"absolute", zIndex:999 },
  initNumBadge:   { position:"absolute", top:0, left:0, right:0, bottom:0,
                    backgroundColor:"rgba(0,0,0,0.45)", borderRadius:22,
                    alignItems:"center", justifyContent:"center", elevation:4 },
  initNumTxt:     { color:"#fff", fontSize:20, fontWeight:"bold", lineHeight:24, textShadowColor:"#000",
                    textShadowOffset:{width:0,height:1}, textShadowRadius:3 },
  initNextBtn:    { width:48, height:60, backgroundColor:DARK_BG, borderLeftWidth:1, borderLeftColor:BORDER,
                    justifyContent:"center", alignItems:"center", flexShrink:0 },
  initFinBtn:     { backgroundColor:"#8B0000" },
  initInicioBtn:  { backgroundColor:"#3A5A2A" },
  initNextTxt:    { color:"#F5DEB3", fontSize:26, fontWeight:"bold", lineHeight:30 },
  initFinTxt:     { fontSize:13, fontWeight:"bold", letterSpacing:0.5 },
  initInicioTxt:  { fontSize:12, fontWeight:"bold", letterSpacing:0.5 },
  roundBtnRow:    { flexDirection:"row", gap:6 },
  endRoundBtn:    { flex:1, backgroundColor:"#5A2D0A", borderWidth:1, borderColor:"#A0845C", borderRadius:6, paddingVertical:9, alignItems:"center" },
  startRoundBtn:  { backgroundColor:"#2A4A1A" },
  endRoundBtnRight:{ },
  endRoundTxt:    { color:"#F5DEB3", fontSize:13, fontWeight:"bold", letterSpacing:1 },
  headerLand:     { backgroundColor:DARK_BG, flexDirection:"row", alignItems:"center", paddingHorizontal:4, paddingVertical:8, gap:6 },
  hIconSm:        { fontSize:16 },
  hTitleSm:       { fontSize:14, fontWeight:"bold", color:"#F5DEB3", letterSpacing:0, marginRight:4, flex:1 },
  endRoundBtnSm:  { backgroundColor:"#5A2D0A", borderWidth:1, borderColor:"#A0845C", borderRadius:6, paddingVertical:5, paddingHorizontal:10 },
  endRoundTxtSm:  { color:"#F5DEB3", fontSize:11, fontWeight:"bold" },
  levelRow:       { flexDirection:"row", alignItems:"center" },
  levelLbl:       { fontSize:10, color:"#A0845C", marginRight:3 },
  levelBtn:       { width:22, height:22, borderRadius:4, borderWidth:1, borderColor:"#5C3A1E", justifyContent:"center", alignItems:"center", marginLeft:2 },
  levelBtnOn:     { backgroundColor:ACCENT, borderColor:"#F5DEB3" },
  levelBtnTxt:    { fontSize:11, color:"#A0845C", fontWeight:"bold" },
  levelBtnTxtOn:  { color:"#F5DEB3" },
  addBar:         { backgroundColor:"#EDE4D0", borderBottomWidth:1, borderBottomColor:BORDER, paddingHorizontal:12, paddingVertical:8 },
  selectorBtn:    { flexDirection:"row", alignItems:"center", borderWidth:1, borderColor:BORDER, borderRadius:8, backgroundColor:CARD_BG, paddingHorizontal:10, paddingVertical:6 },
  selectorImgWrap:{ width:32, height:32, borderRadius:16, overflow:"hidden", borderWidth:1.5, borderColor:BORDER, marginRight:8, justifyContent:"center", alignItems:"center", backgroundColor:"#F0E6D0" },
  selectorImg:    { width:32, height:32, borderRadius:16 },
  selectorTxt:    { flex:1, fontSize:14, fontWeight:"bold", color:TEXT },
  selectorArrow:  { fontSize:16, color:MUTED, marginLeft:6 },
  addRow:         { flexDirection:"row", alignItems:"center", flexWrap:"wrap", gap:6 },
  variantBtn:     { width:50, paddingVertical:17, borderRadius:6, borderWidth:1.5, alignItems:"center" },
  variantBtnSm:   { paddingHorizontal:7, paddingVertical:5 },
  modalOverlay:   { flex:1, backgroundColor:"rgba(0,0,0,0.55)", justifyContent:"center", alignItems:"center" },
  modalBox:       { backgroundColor:CARD_BG, borderRadius:14, width:"88%", overflow:"hidden", borderWidth:2, borderColor:BORDER },
  modalHeader:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:BORDER, backgroundColor:"#EDE4D0" },
  modalTitle:     { fontSize:15, fontWeight:"bold", color:TEXT },
  modalRow:       { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:8, borderBottomWidth:1, borderBottomColor:"#EDE4D0" },
  modalRowOn:     { backgroundColor:"#FFF8E8" },
  modalImgWrap:   { width:36, height:36, borderRadius:18, overflow:"hidden", borderWidth:1.5, marginRight:12, justifyContent:"center", alignItems:"center", backgroundColor:"#F0E6D0" },
  modalImg:       { width:36, height:36, borderRadius:18 },
  modalRowTxt:    { fontSize:14, color:TEXT, flex:1 },
  addBarLand:     { backgroundColor:"#EDE4D0", borderBottomWidth:1, borderBottomColor:BORDER, paddingHorizontal:12, paddingVertical:6, flexDirection:"row", alignItems:"center" },
  addRowLand:     { flexDirection:"row", alignItems:"center", flexWrap:"wrap", gap:5 },
  playersBlock:   { flexDirection:"column", paddingRight:6, marginRight:2 },
  playersDivider: { height:1, backgroundColor:BORDER, marginVertical:3 },
  playersLbl:     { fontSize:9, color:MUTED, fontWeight:"bold", letterSpacing:0.5 },
  playersRow:     { flexDirection:"row", gap:3, alignItems:"center" },
  playersBtn:     { paddingHorizontal:9, paddingVertical:6, borderRadius:6, borderWidth:1, borderColor:BORDER },
  playersBtnOn:   { borderColor:"#8B0000", backgroundColor:"#FFE0E022" },
  playersTxt:     { fontSize:13, color:MUTED, fontWeight:"bold" },
  playersTxtOn:   { color:"#8B0000" },
  prevHpTxt:      { fontSize:17, color:MUTED },
  addBtn:         { backgroundColor:ACCENT, paddingHorizontal:25, paddingVertical:13, borderRadius:6, marginLeft:"auto" },
  quickAddBtn:    { borderRadius:6, width:48, marginLeft:4, justifyContent:"center", alignItems:"center", alignSelf:"stretch" },
  quickAddBoss:   { borderRadius:6, width:100, marginLeft:4, justifyContent:"center", alignItems:"center", alignSelf:"stretch", backgroundColor:"#8B0000", borderColor:"#6B0000", borderWidth:1.5 },
  quickAddTxt:    { fontSize:22, fontWeight:"bold" },
  addBtnTxt:      { color:"#FFF8E8", fontSize:20, fontWeight:"bold" },
  scroll:         { flex:1, backgroundColor:BG },
  scrollInner:    { padding:12 },
  empty:          { alignItems:"center", paddingVertical:50 },
  group:          { marginBottom:20 },
  carousel:       { paddingBottom:8, paddingRight:4 },
  groupHeader:    { flexDirection:"row", alignItems:"center", marginBottom:8 },
  groupTitle:     { fontSize:15, fontWeight:"bold", color:TEXT, marginRight:6 },
  groupBadge:     { borderWidth:1, borderRadius:4, paddingHorizontal:6, paddingVertical:2, marginRight:4 },
  groupLine:      { flex:1, height:1, backgroundColor:BORDER, marginLeft:4 },
  card:           { backgroundColor:CARD_BG, borderWidth:2, borderRadius:10, overflow:"hidden", marginRight:12, elevation:3, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowRadius:4, shadowOpacity:0.15 },
  // ── Card header ──
  cardHead:       { paddingHorizontal:8, paddingVertical:6, borderBottomWidth:1, borderBottomColor:BORDER, flexDirection:"row", alignItems:"center", gap:0 },
  cardStatCol:    { flexDirection:"column", justifyContent:"center", alignItems:"flex-start", marginLeft:8, gap:3 },
  cardStatRow:    { flexDirection:"row", alignItems:"center", gap:3 },
  cardStatImg:    { width:16, height:16 },
  cardStatEmoji:  { fontSize:14, lineHeight:16 },
  cardStatVal:    { fontSize:12, fontWeight:"bold", color:TEXT, lineHeight:14 },
  cardSkillCol:   { flexDirection:"column", justifyContent:"center", alignItems:"flex-start", marginLeft:8, gap:3 },
  cardSkillImg:   { width:16, height:16 },
  cardImmuneCol:  { flexDirection:"row", flexWrap:"wrap", alignItems:"center", marginLeft:4, gap:2, maxWidth:44 },
  cardImmuneItem: { position:"relative", width:20, height:20 },
  cardImmuneImg:  { width:20, height:20, opacity:0.4 },
  cardImmuneCross:{ position:"absolute", top:-3, right:-3, width:11, height:11, borderRadius:6,
                    backgroundColor:"#CC2222", alignItems:"center", justifyContent:"center" },
  cardImmuneCrossTxt:{ fontSize:7, color:"#fff", fontWeight:"bold", lineHeight:9 },
  iconCircle:     { width:44, height:44, borderRadius:22, borderWidth:2, justifyContent:"center", alignItems:"center", flexShrink:0, overflow:"hidden" },
  monsterImg:     { width:44, height:44, borderRadius:22 },
  cardTitle:      { fontSize:13, fontWeight:"bold", flexWrap:"wrap" },
  // Token rectangular
  tokenRect:      { width:36, height:36, borderRadius:8, borderWidth:2, justifyContent:"center", alignItems:"center", marginLeft:4, flexShrink:0 },
  tokenTxt:       { fontWeight:"bold", fontSize:15 },
  // ── HP ──
  hpSec:          { paddingHorizontal:8, paddingTop:7, paddingBottom:5 },
  hpRow:          { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:4, gap:6 },
  hpLbl:          { fontSize:10, color:MUTED, letterSpacing:1, fontWeight:"bold" },
  hpPills:        { flexDirection:"row", gap:4 },
  hpVal:          { fontSize:20, fontWeight:"bold" },
  hpMax:          { fontSize:11, color:"#C4B090", fontWeight:"normal" },
  hpBarOut:       { height:7, borderRadius:4, overflow:"hidden", backgroundColor:"#EDE4D0", borderWidth:1, borderColor:BORDER },
  hpBarIn:        { height:"100%", borderRadius:4 },
  // Escudo pills
  pillBase:       { flexDirection:"row", alignItems:"center", backgroundColor:"#DCE9F5", borderRadius:11, paddingHorizontal:7, paddingVertical:3, borderWidth:1, borderColor:"#A8C0D8" },
  pillBaseTxt:    { fontSize:12, fontWeight:"bold", color:"#1F618D" },
  pillTemp:       { flexDirection:"row", alignItems:"center", backgroundColor:"#FFF8D6", borderRadius:10, paddingHorizontal:7, paddingVertical:2, borderWidth:1 },
  pillTempTxt:    { fontSize:10, fontWeight:"bold" },
  // ── Daño ──
  dmgSec:         { paddingHorizontal:6, paddingVertical:7, borderTopWidth:1, borderTopColor:BORDER, backgroundColor:"#FBF7EE" },
  dmgLbl:         { fontSize:10, color:MUTED, letterSpacing:1, fontWeight:"bold", marginBottom:5 },
  dmgRow:         { flexDirection:"row", alignItems:"center", marginBottom:6, gap:3 },
  dmgBtnSm:       { width:30, height:30, borderRadius:5, backgroundColor:"#EDE4D0", borderWidth:1, borderColor:BORDER, justifyContent:"center", alignItems:"center" },
  dmgBtnLg:       { width:38, height:38, borderRadius:6, backgroundColor:"#EDE4D0", borderWidth:1, borderColor:BORDER, justifyContent:"center", alignItems:"center" },
  dmgBtnLgTxt:    { fontSize:15, fontWeight:"bold", color:TEXT },
  dmgBtnTxt:      { fontSize:13, fontWeight:"bold", color:TEXT },
  dmgBox:         { width:52, height:52, borderRadius:6, paddingVertical:4, alignItems:"center", justifyContent:"center", borderWidth:1 },
  dmgBoxOn:       { backgroundColor:"#FFF3CC", borderColor:"#D4A800" },
  dmgBoxOff:      { backgroundColor:"#F0EBE0", borderColor:BORDER },
  dmgBoxBlocked:  { backgroundColor:"#E8F0FF", borderColor:"#3070C8" },
  dmgVal:         { fontSize:16, fontWeight:"bold" },
  dmgValOn:       { color:"#7A5C00" },
  dmgValOff:      { color:"#C4B090" },
  dmgValBlocked:  { color:"#3070C8" },
  dmgInfo:        { fontSize:10, marginTop:1, textAlign:"center" },
  applyBtn:       { paddingHorizontal:4, height:32, borderRadius:6, justifyContent:"center", alignItems:"center", backgroundColor:"#CC2222", marginRight:2 },
  applyBtnOff:    { backgroundColor:"#993333" },
  applyTxt:       { color:"#fff", fontWeight:"bold", fontSize:12 },
  // Curar + Trampa en fila
  healTrapRow:    { flexDirection:"row", gap:5 },
  healBtn:        { flex:1, borderRadius:6, backgroundColor:"#22A355", justifyContent:"center", alignItems:"center", height:36, elevation:2, minWidth:0 },
  healTxt:        { color:"#fff", fontWeight:"bold", fontSize:12, textAlign:"center" },
  healStatusImg:  { width:16, height:16 },
  trapBtn:        { width:56, borderRadius:6, backgroundColor:"#7A5C00", justifyContent:"center", alignItems:"center", height:36, elevation:1 },
  trapTxt:        { color:"#FFF8E8", fontWeight:"bold", fontSize:11 },
  actionBtn:      { flex:1, borderRadius:6, backgroundColor:"#7A5C00", justifyContent:"center", alignItems:"center", height:40, elevation:2, flexDirection:"row", gap:2 },
  actionBtnSm:    { width:46, borderRadius:6, backgroundColor:"#7A5C00", justifyContent:"center", alignItems:"center", height:40, elevation:1, flexDirection:"row", gap:2 },
  actionBtnTxt:   { color:"#fff", fontWeight:"bold", fontSize:13 },
  actionBtnSub:   { color:"#FFF8E8", fontWeight:"bold", fontSize:13 },
  actionBtnImg:   { width:16, height:16 },
  // ── Escudo + Perforación fila dual ──
  statDualRow:    { flexDirection:"row", backgroundColor:"#F8F3E8", borderTopWidth:1, borderTopColor:BORDER, justifyContent:"flex-start" },
  statCol:        { paddingHorizontal:6, paddingVertical:6 },
  statColLbl:     { fontSize:11, color:MUTED, fontWeight:"bold", marginBottom:4, textAlign:"center" },
  statColCtrl:    { flexDirection:"row", alignItems:"center", gap:4 },
  statDivider:    { width:1, backgroundColor:BORDER, marginVertical:6 },
  statVal:        { minWidth:18, textAlign:"center", fontWeight:"bold", fontSize:17, color:TEXT },
  btnSm:          { width:30, height:30, borderRadius:5, borderWidth:1, borderColor:BORDER, backgroundColor:"#EDE4D0", justifyContent:"center", alignItems:"center" },
  btnSmTxt:       { fontSize:17, fontWeight:"bold", color:TEXT },
  stSec:          { paddingHorizontal:8, paddingTop:7, paddingBottom:10, borderTopWidth:1, borderTopColor:BORDER },
  stLbl:          { fontSize:10, color:MUTED, letterSpacing:1, fontWeight:"bold", marginBottom:5, textAlign:"center" },
  stRow:          { flexDirection:"row", flexWrap:"wrap", justifyContent:"center" },
  stBtn:          { backgroundColor:"#F0EBE0", borderWidth:1, borderColor:BORDER, borderRadius:6, paddingHorizontal:5, paddingVertical:4, marginRight:3, marginBottom:3, opacity:0.45 },
  stBtnImmune:    { opacity:1, backgroundColor:"#F0E8E8", borderColor:"#CC4444", position:"relative" },
  immuneBadge:    { position:"absolute", top:-4, right:-4, width:13, height:13, borderRadius:7,
                    backgroundColor:"#CC2222", alignItems:"center", justifyContent:"center" },
  immuneTxt:      { fontSize:7, color:"#fff", fontWeight:"bold", lineHeight:9 },
  stImg:          { width:24, height:24 },
  footer:         { backgroundColor:BG, borderTopWidth:1, borderTopColor:BORDER, padding:8, alignItems:"center" },
  footerTxt:      { fontSize:10, color:"#C4B090", textAlign:"center" },
  overlay:        { position:"absolute", top:0, left:0, right:0, bottom:0, backgroundColor:"rgba(0,0,0,0.55)", justifyContent:"center", alignItems:"center", zIndex:999 },
  popup:          { backgroundColor:CARD_BG, borderRadius:14, padding:22, width:"80%", borderWidth:2, borderColor:"#8B0000", shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowRadius:12, shadowOpacity:0.4, elevation:10 },
  popupTitle:     { fontSize:18, fontWeight:"bold", color:"#8B0000", marginBottom:4 },
  popupSub:       { fontSize:12, color:MUTED, marginBottom:12 },
  popupRow:       { flexDirection:"row", alignItems:"center", marginBottom:8, width:"100%" },
  popupIcon:      { fontSize:20, marginRight:8 },
  popupImgWrap:   { width:36, height:36, borderRadius:18, overflow:"hidden", borderWidth:1.5, marginRight:10, justifyContent:"center", alignItems:"center", backgroundColor:"#F0E6D0" },
  popupImg:       { width:36, height:36, borderRadius:18 },
  popupVariantTag:{ borderRadius:4, paddingHorizontal:6, paddingVertical:2, borderWidth:1, marginRight:6 },
  popupVariantTxt:{ fontSize:10, fontWeight:"bold" },
  popupName:      { fontSize:13, fontWeight:"bold", color:TEXT, flex:1, marginRight:6 },
  popupNumBadge:  { backgroundColor:"#FFE0E0", borderRadius:6, paddingHorizontal:8, paddingVertical:2, borderWidth:1, borderColor:"#8B0000" },
  popupNum:       { fontSize:13, fontWeight:"bold", color:"#8B0000" },
  popupBtn:       { marginTop:14, backgroundColor:"#8B0000", borderRadius:8, paddingHorizontal:28, paddingVertical:10 },
  popupBtnTxt:    { color:"#fff", fontWeight:"bold", fontSize:14 },
  // Back button header
  backBtnHdr:     { paddingHorizontal:16, paddingVertical:12, justifyContent:"center", alignItems:"center" },
  backIconHdr:    { color:"#F5DEB3", fontSize:20, fontWeight:"bold", lineHeight:20, includeFontPadding:false },
  // Nivel badge
  lvlBadge:       { flexDirection:"row", alignItems:"center", backgroundColor:"#5A2D0A", borderRadius:8,
                    paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:"#A0845C", gap:4 },
  lvlBadgeLbl:    { fontSize:10, color:"#A0845C", fontWeight:"bold", letterSpacing:1 },
  lvlBadgeNum:    { fontSize:18, color:"#F5DEB3", fontWeight:"bold", lineHeight:22 },
  // Modal nivel
  lvlGrid:        { flexDirection:"row", flexWrap:"wrap", padding:16, gap:10, justifyContent:"center" },
  lvlGridBtn:     { width:64, height:64, borderRadius:12, borderWidth:2, borderColor:BORDER,
                    backgroundColor:"#EDE4D0", justifyContent:"center", alignItems:"center" },
  lvlGridBtnOn:   { backgroundColor:ACCENT, borderColor:"#F5DEB3" },
  lvlGridNum:     { fontSize:24, fontWeight:"bold", color:MUTED },
  lvlGridNumOn:   { color:"#FFF8E8" },
  lvlHint:        { fontSize:11, color:MUTED, textAlign:"center", paddingHorizontal:16, paddingBottom:16 },
});