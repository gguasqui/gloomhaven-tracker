// ═══════════════════════════════════════════════════════════════════════════════
// TrackerHeader — header del tracker, soporta landscape y portrait
//
// Landscape: headerLand con padding por insets, ícono ⚔️ separado del título.
// Portrait:  header normal, ícono ⚔️ inline al título.
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trackerStyles as ss } from "../../../styles/trackerStyles";

export default function TrackerHeader({
  isLandscape, insets, scenarioData,
  online, jugadores,
  onBack, onShare, onSave, onOpenLevel,
  saveConfirm, scenarioLvl,
}){
  const titleLand = scenarioData
    ? `#${scenarioData.num} — ${scenarioData.name}`
    : "Partida libre";
  const titlePort = scenarioData
    ? `#${scenarioData.num} — ${scenarioData.name}`
    : "⚔️ Partida libre";

  const containerStyle = isLandscape
    ? [ss.headerLand,{paddingLeft:insets.left+8,paddingRight:insets.right+8}]
    : ss.header;

  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={onBack} style={ss.backBtnHdr}>
        <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
      </TouchableOpacity>

      {isLandscape ? (
        <>
          <Text style={ss.hIconSm}>⚔️</Text>
          <Text style={ss.hTitleSm} numberOfLines={1}>{titleLand}</Text>
        </>
      ) : (
        <Text style={[ss.hTitle,{flex:1,marginHorizontal:4}]} numberOfLines={1}>
          {titlePort}
        </Text>
      )}

      {/* Indicador online (verde + nº jugadores) */}
      {online&&(
        <View style={{flexDirection:"row",alignItems:"center",gap:3,marginRight:4}}>
          <View style={{width:7,height:7,borderRadius:4,backgroundColor:"#22A355"}}/>
          <Text style={{color:"#88C898",fontSize:11,fontWeight:"bold"}}>{jugadores}</Text>
        </View>
      )}

      {/* Compartir */}
      <TouchableOpacity onPress={onShare}
        style={{paddingHorizontal:8,paddingVertical:6,justifyContent:"center",alignItems:"center"}}>
        <Ionicons name={online?"people":"share-social-outline"} size={22} color="#F5DEB3"/>
      </TouchableOpacity>

      {/* Guardar */}
      <TouchableOpacity onPress={onSave}
        style={{marginRight:isLandscape?6:4,paddingHorizontal:8,paddingVertical:4,borderRadius:8,
          backgroundColor:saveConfirm?"#22A355":"transparent",
          flexDirection:"row",alignItems:"center",gap:4}}>
        <Text style={{fontSize:16}}>{saveConfirm?"✓":"💾"}</Text>
        {saveConfirm&&<Text style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Guardado</Text>}
      </TouchableOpacity>

      {/* Badge de nivel */}
      <TouchableOpacity style={ss.lvlBadge} onPress={onOpenLevel}>
        <Text style={ss.lvlBadgeLbl}>NIV</Text>
        <Text style={ss.lvlBadgeNum}>{scenarioLvl}</Text>
      </TouchableOpacity>
    </View>
  );
}
