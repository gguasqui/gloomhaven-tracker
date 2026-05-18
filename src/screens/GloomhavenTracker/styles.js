// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS — PICKER DE MONSTRUOS (usado por ScenarioPickerModal y AllMonstersModal)
// ═══════════════════════════════════════════════════════════════════════════════
import { StyleSheet } from "react-native";
import { BG, BORDER, TEXT, MUTED, ACCENT } from "../../data";

export const pk = StyleSheet.create({
  separator:    { flexDirection:"row", alignItems:"center", paddingHorizontal:14, paddingVertical:8,
                  backgroundColor:"#F5EFE4" },
  sepLine:      { flex:1, height:1, backgroundColor:BORDER },
  sepTxt:       { fontSize:11, color:MUTED, marginHorizontal:10 },
  allBtn:       { paddingHorizontal:14, paddingVertical:12, backgroundColor:"#EDE4D0",
                  borderBottomWidth:1, borderBottomColor:BORDER },
  allBtnTxt:    { fontSize:14, color:ACCENT, fontWeight:"bold", textAlign:"center" },
  inScBadge:    { backgroundColor:"#E8F8EE", borderRadius:4, paddingHorizontal:6, paddingVertical:2,
                  borderWidth:1, borderColor:"#22A355"+"44", marginLeft:6 },
  inScTxt:      { fontSize:10, color:"#22A355", fontWeight:"bold" },
  outScBadge:   { backgroundColor:"#F5EEE8", borderRadius:4, paddingHorizontal:6, paddingVertical:2, borderWidth:1, borderColor:"#B8860B44", marginLeft:"auto" },
  outScTxt:     { fontSize:10, color:"#8B6914", fontWeight:"bold" },
  searchWrap:   { flexDirection:"row", alignItems:"center", marginHorizontal:12, marginTop:10, marginBottom:8, borderWidth:1, borderColor:BORDER, borderRadius:8, backgroundColor:BG, paddingHorizontal:8, paddingVertical:4 },
  searchIcon:   { fontSize:14, marginRight:6 },
  searchInput:  { flex:1, fontSize:14, color:TEXT, paddingVertical:4 },
});
