// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — CONFIGURACIÓN DE CAMPAÑA (menú intermedio)
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BG, CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG } from "../data";

export default function CampaignConfigScreen({ onBack, onClassUnlock }){
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return(
    <View style={[styles.root,{paddingTop:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle,{flex:1}]}>Configuración de la campaña</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+24,maxWidth:Math.min(width*0.92,420),alignSelf:"center",width:"100%"}]}
        showsVerticalScrollIndicator={false}>

        <View style={styles.sectionRow}>
          <View style={styles.sectionLine}/>
          <Text style={styles.sectionLbl}>Personajes</Text>
          <View style={styles.sectionLine}/>
        </View>

        <TouchableOpacity style={styles.menuBtn} onPress={onClassUnlock} activeOpacity={0.85}>
          <Text style={styles.menuIcon}>🎭</Text>
          <View style={styles.menuTextBlock}>
            <Text style={styles.menuTitle}>Clases disponibles</Text>
            <Text style={styles.menuDesc}>Desbloquear clases de la campaña</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
