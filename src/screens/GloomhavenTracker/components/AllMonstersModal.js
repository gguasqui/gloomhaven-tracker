// ═══════════════════════════════════════════════════════════════════════════════
// AllMonstersModal — picker con todos los enemigos del juego
// Se abre desde ScenarioPickerModal cuando el usuario quiere salir del filtro
// del escenario activo. Marca con badge "✓ escenario" los que sí pertenecen.
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { pk } from "../styles";
import { ENEMY_TYPES, MONSTER_IMAGES, BORDER, MUTED, ACCENT } from "../../../data";

// Normalizar texto ignorando tildes para búsquedas
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

export default function AllMonstersModal({
  visible, onClose,
  selectedType, setSelectedType, setVariant,
  allTypes, scenarioMonsters, height,
}){
  const [q, setQ] = React.useState("");
  const rows = q.trim()
    ? allTypes.filter(t=>norm(t).includes(norm(q)))
    : allTypes;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[ss.modalBox,{maxHeight:height*0.75}]} onStartShouldSetResponder={()=>true}>
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>Todos los enemigos</Text>
            <TouchableOpacity onPress={onClose} style={{padding:6}}>
              <Text style={{fontSize:18,color:MUTED}}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Buscador */}
          <View style={pk.searchWrap}>
            <Text style={pk.searchIcon}>🔍</Text>
            <TextInput
              style={pk.searchInput}
              placeholder="Buscar enemigo..."
              placeholderTextColor={MUTED}
              value={q}
              onChangeText={setQ}
              autoCorrect={false}
            />
            {q.length>0&&(
              <TouchableOpacity onPress={()=>setQ("")} style={{padding:4}}>
                <Text style={{fontSize:14,color:MUTED}}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {rows.map(t=>{
              const d=ENEMY_TYPES[t];
              const selected=t===selectedType;
              const inScenario=scenarioMonsters.includes(t);
              return(
                <TouchableOpacity key={t} style={[ss.modalRow,selected&&ss.modalRowOn]}
                  onPress={()=>{setSelectedType(t);setVariant("normal");onClose();}}>
                  <View style={[ss.modalImgWrap,{borderColor:selected?d.color||ACCENT:BORDER}]}>
                    {MONSTER_IMAGES[t]
                      ?<Image source={MONSTER_IMAGES[t]} style={ss.modalImg}/>
                      :<Text style={{fontSize:16}}>{d.icon||"👹"}</Text>}
                  </View>
                  <Text style={[ss.modalRowTxt,selected&&{color:ACCENT,fontWeight:"bold"}]}>{t}</Text>
                  {inScenario&&<View style={pk.inScBadge}><Text style={pk.inScTxt}>✓ escenario</Text></View>}
                  {selected&&<Text style={{color:ACCENT,fontSize:16,marginLeft:4}}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            {rows.length===0&&(
              <View style={{padding:24,alignItems:"center"}}>
                <Text style={{color:MUTED,fontSize:13}}>Sin resultados para "{q}"</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
