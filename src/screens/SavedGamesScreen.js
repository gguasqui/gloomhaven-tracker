// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — PARTIDAS GUARDADAS
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, Modal,
  StatusBar, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  BG, CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  SAVES_KEY, SCENARIOS, CLASS_IMAGES,
} from "../data";
import { trackerStyles } from "../styles/trackerStyles";

export default function SavedGamesScreen({ onBack, onResume }){
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
                          <View key={i} style={[trackerStyles.initImgWrap,{borderColor:ACCENT,borderWidth:2}]}>
                            {CLASS_IMAGES[cls]
                              ?<Image source={CLASS_IMAGES[cls]} style={trackerStyles.initImg} resizeMode="contain"/>
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
        <TouchableOpacity style={[trackerStyles.modalOverlay,{justifyContent:"center",alignItems:"center"}]}
          activeOpacity={1} onPress={()=>setConfirmDel(false)}>
          <View style={[trackerStyles.modalBox,{width:"80%",maxWidth:320,padding:20}]}
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
