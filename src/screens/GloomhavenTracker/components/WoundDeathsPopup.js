// ═══════════════════════════════════════════════════════════════════════════════
// WoundDeathsPopup — lista enemigos muertos por herida al inicio del turno/ronda
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { ENEMY_TYPES, MONSTER_IMAGES } from "../../../data";
import { VS } from "../../../utils/enemyHelpers";

export default function WoundDeathsPopup({ deaths, onClose, isLandscape, height }){
  if(!deaths || deaths.length===0) return null;
  return (
    <View style={ss.overlay}>
      <View style={[ss.popup,isLandscape&&{width:"60%",padding:16}]}>
        <Text style={[ss.popupTitle,{textAlign:"center",width:"100%"}]}>💀 Muertos por Herida</Text>
        <Text style={[ss.popupSub,{textAlign:"center",width:"100%",marginBottom:8}]}>Al final de la ronda:</Text>
        <ScrollView style={{maxHeight:isLandscape?height*0.4:300}} showsVerticalScrollIndicator={false}>
          {deaths.map((d,i)=>{
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
        <TouchableOpacity style={[ss.popupBtn,{alignSelf:"center",marginTop:8}]} onPress={onClose}>
          <Text style={ss.popupBtnTxt}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
