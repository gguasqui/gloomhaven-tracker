// ═══════════════════════════════════════════════════════════════════════════════
// ScenarioPickerModal — picker principal del tracker
// Si hay escenario activo: muestra solo sus enemigos + botón "otros enemigos"
// Si es partida libre: muestra todos los enemigos
// Buscador interno por nombre (ignora tildes y mayúsculas)
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Image } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { pk } from "../styles";
import { ENEMY_TYPES, MONSTER_IMAGES, BORDER, MUTED, ACCENT } from "../../../data";

// Normalizar texto ignorando tildes para búsquedas
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

export default function ScenarioPickerModal({
  visible, onClose, scenarioNum,
  selectedType, setSelectedType, setVariant,
  allTypes, availableTypes,
  onOpenAllPicker, height,
}){
  const [q, setQ] = React.useState("");
  const rows = q.trim()
    ? allTypes.filter(t=>norm(t).includes(norm(q)))
    : availableTypes;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[ss.modalBox,{maxHeight:height*0.75}]} onStartShouldSetResponder={()=>true}>
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>
              {scenarioNum ? `Escenario ${scenarioNum} — enemigos` : "Seleccionar Monstruo"}
            </Text>
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
              const inScenario=availableTypes.includes(t);
              return(
                <TouchableOpacity key={t} style={[ss.modalRow,selected&&ss.modalRowOn]}
                  onPress={()=>{setSelectedType(t);setVariant("normal");onClose();}}>
                  <View style={[ss.modalImgWrap,{borderColor:selected?d.color||ACCENT:BORDER}]}>
                    {MONSTER_IMAGES[t]
                      ?<Image source={MONSTER_IMAGES[t]} style={ss.modalImg}/>
                      :<Text style={{fontSize:16}}>{d.icon||"👹"}</Text>}
                  </View>
                  <Text style={[ss.modalRowTxt,selected&&{color:ACCENT,fontWeight:"bold"}]}>{t}</Text>
                  {q.trim()&&!inScenario&&scenarioNum&&(
                    <View style={pk.outScBadge}><Text style={pk.outScTxt}>fuera</Text></View>
                  )}
                  {selected&&<Text style={{color:ACCENT,fontSize:16,marginLeft:"auto"}}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            {/* Separador + botón otros — solo si no hay búsqueda activa */}
            {scenarioNum&&!q.trim()&&(
              <>
                <View style={pk.separator}>
                  <View style={pk.sepLine}/>
                  <Text style={pk.sepTxt}>otros enemigos</Text>
                  <View style={pk.sepLine}/>
                </View>
                <TouchableOpacity style={pk.allBtn} onPress={onOpenAllPicker}>
                  <Text style={pk.allBtnTxt}>🔍 Seleccionar otro enemigo</Text>
                </TouchableOpacity>
              </>
            )}
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
