// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE — SELECTOR DE CLASES (modal)
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, Modal,
  StyleSheet, useWindowDimensions,
} from "react-native";
import {
  CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  CLASS_IMAGES,
} from "../data";
import { useAvailableClasses } from "../contexts/CampaignContext";

export default function ClassSelector({ visible:modalVisible, onBack, onConfirm }){
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
      <View style={styles.overlay}>
        <View style={[styles.box,{maxHeight:height*0.88}]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>¿Quiénes juegan?</Text>
            <TouchableOpacity onPress={onBack} style={{padding:6}}>
              <Text style={{fontSize:18,color:MUTED}}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sub}>Elegí hasta 4 clases · toca para seleccionar</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} style={{flexShrink:1}}>
            {availableClasses.map(cls=>{
              const on = selected.includes(cls);
              return(
                <TouchableOpacity key={cls} style={[styles.card,on&&styles.cardOn]} onPress={()=>toggle(cls)}>
                  <View style={[styles.imgWrap,on&&styles.imgWrapOn]}>
                    <Image source={CLASS_IMAGES[cls]} style={styles.img}/>
                  </View>
                  <Text style={[styles.lbl,on&&styles.lblOn]} numberOfLines={2}>{cls}</Text>
                  {on&&<View style={styles.check}><Text style={{color:"#fff",fontSize:10,fontWeight:"bold"}}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn,selected.length===0&&{opacity:0.4}]}
              onPress={()=>{ if(selected.length>0){ onConfirm(selected); setSelected([]); } }}
              activeOpacity={0.85}>
              <Text style={styles.confirmTxt}>
                {selected.length===0?"Seleccioná al menos una clase":`Jugar con ${selected.length} clase${selected.length>1?"s":""}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
