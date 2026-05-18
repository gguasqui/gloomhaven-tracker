// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — HOME (menú principal)
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  BG, CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  AUTOSAVE_KEY,
} from "../data";
import { MultiplayerContext } from "../contexts/MultiplayerContext";
import JoinModal from "../components/JoinModal";

export default function HomeScreen({ onFreePlay, onSelectScenario, onCampaignConfig, onSavedGames, onContinue, onJoinGame, onRoadmap }){
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [hasAutosave, setHasAutosave] = React.useState(false);
  const [joinVisible,  setJoinVisible]  = React.useState(false);
  const { unirseASala } = React.useContext(MultiplayerContext);

  React.useEffect(()=>{
    AsyncStorage.getItem(AUTOSAVE_KEY).then(raw=>{ setHasAutosave(!!raw); }).catch(()=>{});
  },[]);

  const handleJoin = async (code) => {
    const result = await unirseASala(code);
    if(!result) return false;
    setJoinVisible(false);
    onJoinGame(result, code);
    return true;
  };

  return(
    <View style={[styles.root,{paddingTop:insets.top+20,paddingBottom:insets.bottom+20}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={styles.titleBlock}>
        <Text style={styles.titleIcon}>⚔️</Text>
        <Text style={styles.title}>Gloomhaven</Text>
        <Text style={styles.sub}>Rastreador de enemigos</Text>
      </View>

      <View style={[styles.btnWrap,{maxWidth:Math.min(width*0.85,360)}]}>
        <TouchableOpacity style={styles.btnFree} onPress={onSelectScenario} activeOpacity={0.85}>
          <Text style={styles.btnIcon}>📖</Text>
          <View style={styles.btnTextBlock}>
            <Text style={styles.btnTitle}>Jugar escenario</Text>
            <Text style={styles.btnDesc}>Enemigos filtrados por escenario</Text>
          </View>
          <Text style={styles.btnArrow}>›</Text>
        </TouchableOpacity>

        {hasAutosave&&(
          <TouchableOpacity
            style={[styles.btnFree,{backgroundColor:"#2A4A2A",borderColor:"#22A355"}]}
            onPress={onContinue} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>▶️</Text>
            <View style={styles.btnTextBlock}>
              <Text style={[styles.btnTitle,{color:"#C8F0D0"}]}>Continuar partida</Text>
              <Text style={[styles.btnDesc,{color:"#88C898"}]}>Recuperá el último autoguardado</Text>
            </View>
            <Text style={[styles.btnArrow,{color:"#88C898"}]}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Configuración de campaña ── */}
        <View style={styles.configSection}>
          <TouchableOpacity style={styles.btnScenario} onPress={onCampaignConfig} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>⚙️</Text>
            <View style={styles.btnTextBlock}>
              <Text style={styles.btnTitleDark}>Configuración de la campaña</Text>
              <Text style={styles.btnDescDark}>Clases, progreso y más</Text>
            </View>
            <Text style={styles.btnArrowDark}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Partida libre (separada) ── */}
        <View style={styles.freeSection}>
          <View style={styles.configHeaderRow}>
            <View style={styles.configLine}/>
            <Text style={styles.configLbl}>Modo libre</Text>
            <View style={styles.configLine}/>
          </View>
          <TouchableOpacity style={styles.btnFreeAlt} onPress={onFreePlay} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>🗺️</Text>
            <View style={styles.btnTextBlock}>
              <Text style={styles.btnTitleDark}>Partida libre</Text>
              <Text style={styles.btnDescDark}>Todos los enemigos disponibles</Text>
            </View>
            <Text style={styles.btnArrowDark}>›</Text>
          </TouchableOpacity>

          {/* ── Partidas guardadas ── */}
          <TouchableOpacity style={[styles.btnFreeAlt,{borderColor:BORDER,borderWidth:1}]}
            onPress={onSavedGames} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>💾</Text>
            <View style={styles.btnTextBlock}>
              <Text style={styles.btnTitleDark}>Partidas guardadas</Text>
              <Text style={styles.btnDescDark}>Retomá o eliminá partidas</Text>
            </View>
            <Text style={styles.btnArrowDark}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mapa de escenarios ── */}
        <TouchableOpacity style={[styles.btnFreeAlt,{borderColor:"#e8b86d",borderWidth:1}]}
          onPress={onRoadmap} activeOpacity={0.85}>
          <Text style={styles.btnIcon}>🗺️</Text>
          <View style={styles.btnTextBlock}>
            <Text style={styles.btnTitleDark}>Mapa de escenarios</Text>
            <Text style={styles.btnDescDark}>Progreso de la campaña</Text>
          </View>
          <Text style={styles.btnArrowDark}>›</Text>
        </TouchableOpacity>

        {/* ── Conectarse a partida ── */}
        <TouchableOpacity onPress={()=>setJoinVisible(true)}
          style={{flexDirection:"row",alignItems:"center",justifyContent:"center",
            paddingVertical:14,gap:6}}>
          <Ionicons name="link-outline" size={16} color={MUTED}/>
          <Text style={{fontSize:13,color:MUTED,fontWeight:"500"}}>Conectarse a partida</Text>
        </TouchableOpacity>
      </View>

      <JoinModal
        visible={joinVisible}
        onClose={()=>setJoinVisible(false)}
        onJoin={handleJoin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex:1, backgroundColor:DARK_BG, alignItems:"center", justifyContent:"center" },
  titleBlock:   { alignItems:"center", marginBottom:32 },
  titleIcon:    { fontSize:48, marginBottom:10 },
  title:        { fontSize:26, fontWeight:"bold", color:"#F5DEB3", letterSpacing:3 },
  sub:          { fontSize:11, color:"#A0845C", letterSpacing:2, marginTop:4 },
  btnWrap:      { width:"100%", gap:8 },
  btnFree:      { backgroundColor:ACCENT, borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                  flexDirection:"row", alignItems:"center",
                  shadowColor:"#000", shadowOffset:{width:0,height:3}, shadowRadius:6, shadowOpacity:0.3, elevation:5 },
  btnScenario:  { backgroundColor:"#F5EFE4", borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                  flexDirection:"row", alignItems:"center", borderWidth:2, borderColor:BORDER,
                  shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowRadius:4, shadowOpacity:0.2, elevation:3 },
  btnIcon:      { fontSize:26, marginRight:14 },
  btnTextBlock: { flex:1 },
  btnTitle:     { fontSize:17, fontWeight:"bold", color:"#FFF8E8" },
  btnDesc:      { fontSize:12, color:"#D4B89A", marginTop:1 },
  btnTitleDark: { fontSize:17, fontWeight:"bold", color:TEXT },
  btnDescDark:  { fontSize:12, color:MUTED, marginTop:1 },
  btnArrow:     { fontSize:22, color:"#FFF8E8", marginLeft:8 },
  btnArrowDark: { fontSize:22, color:MUTED, marginLeft:8 },
  configSection:   { gap:0 },
  freeSection:     { marginTop:6, gap:8 },
  configHeaderRow: { flexDirection:"row", alignItems:"center", marginBottom:6 },
  configLine:      { flex:1, height:1, backgroundColor:"#6B4A28" },
  configLbl:       { fontSize:10, color:"#A0845C", fontWeight:"bold", letterSpacing:1.5, marginHorizontal:10 },
  btnFreeAlt:      { backgroundColor:"#F5EFE4", borderRadius:12, paddingVertical:14, paddingHorizontal:20,
                     flexDirection:"row", alignItems:"center", borderWidth:1.5, borderColor:BORDER,
                     shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowRadius:3, shadowOpacity:0.12, elevation:2 },
  btnTitleMuted:   { fontSize:17, fontWeight:"bold", color:MUTED },
});
