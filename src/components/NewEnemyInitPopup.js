// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE — POPUP DE INICIATIVA (nuevo enemigo se mueve con ← →)
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, Modal,
} from "react-native";
import {
  CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  MONSTER_IMAGES, CLASS_IMAGES,
} from "../data";
import { trackerStyles as ss } from "../styles/trackerStyles";

export default function NewEnemyInitPopup({ newEnemyPopup, popupOrder, setPopupOrder, popupOrderRef,
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
