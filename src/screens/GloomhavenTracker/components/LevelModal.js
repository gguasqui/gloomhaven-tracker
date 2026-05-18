// ═══════════════════════════════════════════════════════════════════════════════
// LevelModal — grilla 0..7 para elegir nivel del escenario
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { MUTED } from "../../../data";

export default function LevelModal({ visible, onClose, scenarioLvl, setScenarioLvl }){
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[ss.modalBox,{width:"80%",maxWidth:340}]} onStartShouldSetResponder={()=>true}>
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>Nivel del escenario</Text>
            <TouchableOpacity onPress={onClose} style={{padding:6}}>
              <Text style={{fontSize:18,color:MUTED}}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={ss.lvlGrid}>
            {[0,1,2,3,4,5,6,7].map(n=>(
              <TouchableOpacity key={`lvl${n}`}
                style={[ss.lvlGridBtn, scenarioLvl===n&&ss.lvlGridBtnOn]}
                onPress={()=>{setScenarioLvl(n);onClose();}}>
                <Text style={[ss.lvlGridNum, scenarioLvl===n&&ss.lvlGridNumOn]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={ss.lvlHint}>El nivel determina vida y escudo de los enemigos y sus capacidades.</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
