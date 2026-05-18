// ═══════════════════════════════════════════════════════════════════════════════
// NoStockAlert — alerta cuando no quedan fichas de un tipo de enemigo
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";

export default function NoStockAlert({ visible, onClose }){
  if(!visible) return null;
  return (
    <View style={ss.overlay}>
      <View style={[ss.popup,{alignItems:"center"}]}>
        <Text style={{fontSize:32,marginBottom:8}}>🚫</Text>
        <Text style={[ss.popupTitle,{textAlign:"center"}]}>Sin fichas disponibles</Text>
        <Text style={[ss.popupSub,{textAlign:"center",marginBottom:16}]}>
          No quedan fichas de este enemigo en el stock.
        </Text>
        <TouchableOpacity style={ss.popupBtn} onPress={onClose}>
          <Text style={ss.popupBtnTxt}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
