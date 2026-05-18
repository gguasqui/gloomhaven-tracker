// ═══════════════════════════════════════════════════════════════════════════════
// EnemyCard — card individual de un enemigo
//
// Renderiza dos modos en función del prop viewerMode:
//   - normal: HP + escudo + daño + trampa/cura/ataque + escudo/perforación + estados
//   - viewer (solo lectura): HP grande, escudo+perforación grandes, estados encendidos
//
// Header (avatar + stats + skills + inmunidades + número + cerrar) es común a ambos.
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { VS } from "../../../utils/enemyHelpers";
import {
  ENEMY_TYPES, MONSTER_IMAGES, MONSTER_SKILLS, STATUS_EFFECTS,
  ACCENT, MUTED,
  MOVE_IMG, ATK_IMG, ATK_WHITE_IMG, RANGE_IMG, FLYING_IMG,
  TARGET_IMG, RETALIATE_IMG, MUDDLE_IMG, SHIELD_IMG, PIERCE_IMG,
  POISON_IMG, WOUND_IMG, HEAL_IMG, TRAP_IMG,
  SKILL_STATUS_IMGS,
} from "../../../data";

// STATUS_ROW1/ROW2 derivados de STATUS_EFFECTS (igual que en App.js)
const STATUS_ROW1 = STATUS_EFFECTS.slice(0, 4);
const STATUS_ROW2 = STATUS_EFFECTS.slice(4, 8);

// Helpers visuales propios de la card (antes vivían en App.js)
const hpPct   = (e) => (e.currentHp / e.maxHp) * 100;
const hpColor = (p) => (p > 60 ? "#22A355" : p > 30 ? "#D4900A" : "#CC2222");

export default function EnemyCard({
  enemy, cardWidth, viewerMode,
  scenarioLvl, players, enemies,
  pendingDmg, editingNum, numDraft, setNumDraft, setPendingDmg,
  updateEnemy, removeEnemy, commitDamage, applyHeal, applyTrap,
  toggleStatus, adjustPending, startEditNum, commitNum,
}){
  // ── Cálculos derivados ────────────────────────────────────────────────────
  const pct          = hpPct(enemy);
  const tc           = ENEMY_TYPES[enemy.type]?.color || ACCENT;
  const icon         = ENEMY_TYPES[enemy.type]?.icon  || "👹";
  const pending      = pendingDmg[enemy.id] || 0;
  const baseShield   = enemy.baseShield || 0;
  const totalShield  = baseShield + enemy.shield;
  const effShield    = Math.max(0, totalShield - enemy.pierce);
  const poiBonus     = enemy.statuses.includes("poison") ? 1 : 0;
  const prevDmg      = pending > 0 ? Math.max(0, pending - effShield) + poiBonus : null;
  const fullyBlocked = pending > 0 && prevDmg === 0;
  const vs           = VS[enemy.variant] || VS.normal;

  // ── Stats y skills del nivel actual ───────────────────────────────────────
  const sk  = MONSTER_SKILLS[enemy.type]?.[Math.min(scenarioLvl, 7)];
  const isE = enemy.variant === "elite";
  const isB = enemy.variant === "boss";

  // Resolver atk con lógica especial para jefes (p, i, #+X)
  const resolveBossAtk = (rawAtk) => {
    if(rawAtk===null||rawAtk===undefined) return null;
    if(typeof rawAtk==="number") return String(rawAtk);
    const s = String(rawAtk);
    if(s==="i"){
      // Supervisor Implacable: contar Exploradores Infestores en tablero
      const count = enemies.filter(e=>e.type==="Explorador Infestor").length;
      return String(count);
    }
    if(s==="p") return String(players);
    const mPlus = s.match(/^(\d+)\+p$/i);
    if(mPlus) return String(parseInt(mPlus[1])+players);
    // "#+X" → mostrar tal cual
    return s;
  };

  const mv     = isB ? sk?.boss?.move  : (isE ? sk?.elite?.move  : sk?.normal?.move);
  const atkRaw = isB ? sk?.boss?.atk   : (isE ? sk?.elite?.atk   : sk?.normal?.atk);
  const atk    = isB ? resolveBossAtk(atkRaw) : (atkRaw!=null ? String(atkRaw) : null);
  const rng    = isB ? sk?.boss?.range : (isE ? sk?.elite?.range : sk?.normal?.range);
  const ret    = isB ? null : (isE ? sk?.elite?.retaliate : sk?.normal?.retaliate);
  const retRng = isB ? null : (isE ? sk?.elite?.retRange  : sk?.normal?.retRange);
  const tgt    = isB ? null : (isE ? sk?.elite?.target    : sk?.normal?.target);
  const flying = sk?.flying === "x";

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[ss.card,{
      borderColor: enemy.summoned===true ? "#C0821A" : vs.border,
      borderWidth: enemy.summoned===true ? 3 : 2,
      width: cardWidth,
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
            borderColor: enemy.summoned==="done" ? "#C0821A" : vs.bBorder(),
            borderWidth: enemy.summoned==="done" ? 3 : 2,
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

        {/* Columna stats: move / atk / range — mostrar move aunque sea 0 */}
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
          viewerMode
            ? <View style={[ss.tokenRect,{
                borderColor:vs.bBorder(), backgroundColor:vs.bBg,
                minWidth:40, minHeight:40, borderRadius:8,
                alignItems:"center", justifyContent:"center",
              }]}>
                <Text style={[ss.tokenTxt,{color:vs.tc, fontSize:26, fontWeight:"bold"}]}>{enemy.number}</Text>
              </View>
            : editingNum===enemy.id
              ?<TextInput autoFocus value={numDraft} onChangeText={setNumDraft}
                  onBlur={()=>commitNum(enemy.id)} onSubmitEditing={()=>commitNum(enemy.id)}
                  keyboardType="number-pad"
                  style={[ss.tokenRect,{borderColor:vs.bBorder(),backgroundColor:vs.bBg}]}/>
              :<TouchableOpacity onPress={()=>startEditNum(enemy.id,enemy.number)}
                  style={[ss.tokenRect,{borderColor:vs.bBorder(),backgroundColor:vs.bBg}]}>
                  <Text style={[ss.tokenTxt,{color:vs.tc}]}>{enemy.number}</Text>
                </TouchableOpacity>
        )}
        {!viewerMode && (
          <TouchableOpacity onPress={()=>removeEnemy(enemy.id)} style={{padding:6}}>
            <Text style={{fontSize:16,color:"#BBA888"}}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!viewerMode && (<>
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
            <Image source={TRAP_IMG} style={{width:18,height:18}}/>
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
      </>)}

      {viewerMode && (<>
        {/* ── MODO VIZ: VIDA grande ── */}
        <View style={ss.vzHpSec}>
          <View style={ss.vzHpRow}>
            <Text style={ss.vzHpLbl}>Vida</Text>
            <Text style={[ss.vzHpVal,{color:hpColor(pct)}]}>
              {enemy.currentHp}<Text style={ss.vzHpMax}>/{enemy.maxHp}</Text>
            </Text>
          </View>
          <View style={ss.vzHpBarOut}>
            <View style={[ss.vzHpBarIn,{width:`${pct}%`,backgroundColor:hpColor(pct)}]}/>
          </View>
        </View>

        {/* ── MODO VIZ: ESCUDO + PERFORACIÓN grandes (siempre presentes) ── */}
        <View style={ss.vzDefRow}>
          <View style={[ss.vzDefItem, enemy.shield===0 && baseShield===0 && ss.vzDefItemOff]}>
            <Text style={ss.vzDefLbl}>Escudo</Text>
            <View style={{flexDirection:"row", alignItems:"center", gap:6, marginTop:2}}>
              <Image source={SHIELD_IMG} style={ss.vzDefIcon}/>
              <Text style={ss.vzDefVal}>{baseShield + enemy.shield}</Text>
            </View>
          </View>
          <View style={[ss.vzDefItem, enemy.pierce===0 && ss.vzDefItemOff]}>
            <Text style={ss.vzDefLbl}>Perforación</Text>
            <View style={{flexDirection:"row", alignItems:"center", gap:6, marginTop:2}}>
              <Image source={PIERCE_IMG} style={ss.vzDefIcon}/>
              <Text style={ss.vzDefVal}>{enemy.pierce}</Text>
            </View>
          </View>
        </View>

        {/* ── MODO VIZ: ESTADOS activos (solo encendidos, no tocables) ── */}
        {enemy.statuses.length > 0 && (
          <View style={ss.vzStSec}>
            {[enemy.statuses.slice(0,4), enemy.statuses.slice(4,8)].filter(r=>r.length>0).map((row, ri) => (
              <View key={`vzr${ri}`} style={[ss.vzStRow, ri===0 && enemy.statuses.length>4 && {marginBottom:3}]}>
                {row.map(sid => {
                  const st = STATUS_EFFECTS.find(x => x.id === sid);
                  if(!st) return null;
                  return (
                    <View key={sid} style={[ss.vzStBtn, {backgroundColor: st.color+"22", borderColor: st.color}]}>
                      {st.img
                        ? <Image source={st.img} style={ss.vzStImg}/>
                        : <Text style={{fontSize:16}}>{st.icon}</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </>)}
    </View>
  );
}