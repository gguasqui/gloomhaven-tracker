// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — DESBLOQUEAR CLASES
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useContext } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  BG, CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  CLASS_IMAGES, ALWAYS_UNLOCKED, LOCKABLE_CLASSES, CLASS_ALIAS,
} from "../data";
import { CampaignContext } from "../contexts/CampaignContext";

export default function ClassUnlockScreen({ onBack }){
  const insets = useSafeAreaInsets();
  const { unlocked, toggleUnlock } = useContext(CampaignContext);

  return(
    <View style={[styles.root,{paddingTop:insets.top}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle,{flex:1}]}>Clases disponibles</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.grid,{paddingBottom:insets.bottom+24}]}
        showsVerticalScrollIndicator={false}>

        {/* Sección desbloqueadas por defecto */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLine}/>
          <Text style={styles.sectionLbl}>Iniciales</Text>
          <View style={styles.sectionLine}/>
        </View>
        <View style={styles.row}>
          {ALWAYS_UNLOCKED.map(cls=>(
            <View key={cls} style={styles.card}>
              <View style={[styles.imgWrap,styles.imgWrapUnlocked]}>
                <Image source={CLASS_IMAGES[cls]} style={styles.img}/>
              </View>
              <Text style={[styles.lbl,styles.lblUnlocked]}>{cls}</Text>
              <View style={styles.badgeUnlocked}>
                <Text style={styles.badgeTxt}>✓</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sección bloqueables */}
        <View style={[styles.sectionRow,{marginTop:20}]}>
          <View style={styles.sectionLine}/>
          <Text style={styles.sectionLbl}>Desbloqueables</Text>
          <View style={styles.sectionLine}/>
        </View>
        <Text style={styles.hint}>Tocá una clase para desbloquearla o volver a bloquearla</Text>
        <View style={styles.row}>
          {LOCKABLE_CLASSES.map(cls=>{
            const isUnlocked = unlocked.includes(cls);
            return(
              <TouchableOpacity key={cls} style={styles.card} onPress={()=>toggleUnlock(cls)} activeOpacity={0.75}>
                <View style={[styles.imgWrap, isUnlocked?styles.imgWrapUnlocked:styles.imgWrapLocked]}>
                  {isUnlocked
                    ? <Image source={CLASS_IMAGES[cls]} style={styles.img}/>
                    : <View style={styles.lockedImgWrap}>
                        <Image source={CLASS_IMAGES[cls]} style={[styles.img,{opacity:0.25}]}/>
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      </View>
                  }
                </View>
                <Text style={[styles.lbl, isUnlocked?styles.lblUnlocked:styles.lblLocked]} numberOfLines={2}>
                  {isUnlocked ? cls : CLASS_ALIAS[cls]}
                </Text>
                {isUnlocked&&(
                  <View style={styles.badgeUnlocked}>
                    <Text style={styles.badgeTxt}>✓</Text>
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

const styles = StyleSheet.create({
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
