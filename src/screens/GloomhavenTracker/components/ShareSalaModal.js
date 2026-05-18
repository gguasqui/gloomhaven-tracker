// ═══════════════════════════════════════════════════════════════════════════════
// ShareSalaModal — muestra el código de sala y permite compartirlo
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG } from "../../../data";

export default function ShareSalaModal({
  visible, onClose, online, salaId, jugadores, sharingCode, onShareCode,
}){
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",
        justifyContent:"center",alignItems:"center"}}
        activeOpacity={1} onPress={onClose}>
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
            <TouchableOpacity onPress={()=>onShareCode(sharingCode||salaId)}
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
  );
}
