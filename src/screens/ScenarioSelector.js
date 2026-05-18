// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA — SELECTOR DE ESCENARIO
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, TextInput, FlatList,
  StyleSheet, StatusBar, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  BG, CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  SCENARIOS,
} from "../data";

export default function ScenarioSelector({ onBack, onSelect }){
  const insets  = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [inputVal, setInputVal] = useState("");
  const [inputErr, setInputErr] = useState(false);
  const listRef = useRef(null);

  const confirmInput = () => {
    const n = parseInt(inputVal);
    if(isNaN(n)||n<1||n>95){ setInputErr(true); return; }
    setInputErr(false);
    const sc = SCENARIOS.find(s=>s.num===n);
    if(sc) onSelect(sc);
  };

  const handleRowPress = (sc) => {
    onSelect(sc);
  };

  return(
    <View style={[styles.root,{backgroundColor:DARK_BG}]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG}/>
      <View style={{flex:1,backgroundColor:BG,marginTop:insets.top}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F5DEB3"/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle,{flex:1}]}>Seleccionar escenario</Text>
      </View>

      {/* Input numérico */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Número de escenario (1–95)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, inputErr&&styles.inputErr]}
            value={inputVal}
            onChangeText={t=>{setInputVal(t.replace(/[^0-9]/g,""));setInputErr(false);}}
            keyboardType="number-pad"
            placeholder="ej: 42"
            placeholderTextColor="#C4B090"
            maxLength={2}
            returnKeyType="go"
            onSubmitEditing={confirmInput}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmInput} activeOpacity={0.85}>
            <Text style={styles.confirmTxt}>Ir</Text>
          </TouchableOpacity>
        </View>
        {inputErr&&<Text style={styles.errTxt}>Ingresá un número entre 1 y 95</Text>}
      </View>

      {/* Divisor */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine}/>
        <Text style={styles.dividerTxt}>o elegí de la lista</Text>
        <View style={styles.dividerLine}/>
      </View>

      {/* Lista de escenarios */}
      <FlatList
        ref={listRef}
        data={SCENARIOS}
        keyExtractor={item=>String(item.num)}
        contentContainerStyle={{paddingBottom:insets.bottom+16}}
        showsVerticalScrollIndicator={false}
        renderItem={({item})=>(
          <TouchableOpacity style={styles.row} onPress={()=>handleRowPress(item)} activeOpacity={0.75}>
            <View style={styles.rowNum}>
              <Text style={styles.rowNumTxt}>{item.num}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={()=><View style={{height:1,backgroundColor:"#E8DFCE",marginLeft:70}}/>}
      />
      </View>
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
  inputSection: { backgroundColor:"#EDE4D0", paddingHorizontal:16, paddingVertical:14,
                  borderBottomWidth:1, borderBottomColor:BORDER },
  inputLabel:   { fontSize:12, color:MUTED, marginBottom:8, fontWeight:"bold", letterSpacing:0.5 },
  inputRow:     { flexDirection:"row", alignItems:"center", gap:10 },
  input:        { flex:1, borderWidth:2, borderColor:BORDER, borderRadius:10, paddingHorizontal:14,
                  paddingVertical:10, fontSize:22, fontWeight:"bold", color:TEXT, backgroundColor:CARD_BG,
                  textAlign:"center" },
  inputErr:     { borderColor:"#CC2222" },
  confirmBtn:   { backgroundColor:ACCENT, borderRadius:10, paddingHorizontal:20, paddingVertical:11 },
  confirmTxt:   { color:"#FFF8E8", fontWeight:"bold", fontSize:16 },
  errTxt:       { color:"#CC2222", fontSize:11, marginTop:6 },
  dividerRow:   { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:10,
                  backgroundColor:BG },
  dividerLine:  { flex:1, height:1, backgroundColor:BORDER },
  dividerTxt:   { fontSize:11, color:MUTED, marginHorizontal:10 },
  row:          { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:14,
                  backgroundColor:CARD_BG },
  rowNum:       { width:48, height:48, borderRadius:10, backgroundColor:"#EDE4D0",
                  borderWidth:1, borderColor:BORDER, justifyContent:"center", alignItems:"center",
                  marginRight:14 },
  rowNumTxt:    { fontSize:16, fontWeight:"bold", color:ACCENT },
  rowInfo:      { flex:1 },
  rowName:      { fontSize:17, fontWeight:"bold", color:TEXT },
  rowArrow:     { fontSize:20, color:MUTED, marginLeft:8 },
});
