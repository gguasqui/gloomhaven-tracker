// ═══════════════════════════════════════════════════════════════════════════════
// MODAL — CONECTARSE A PARTIDA
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity, TextInput, Modal,
} from "react-native";
import { CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG } from "../data";

export default function JoinModal({ visible, onClose, onJoin }){
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleJoin = async () => {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(clean.length !== 4){ setError("El código debe tener 4 caracteres."); return; }
    setLoading(true);
    setError("");
    const result = await onJoin(clean);
    setLoading(false);
    if(!result) setError("No se encontró la sala. Revisá el código.");
  };

  const handleClose = () => { setCode(""); setError(""); onClose(); };

  return(
    <Modal visible={visible} transparent animationType="fade">
      <View style={{flex:1,backgroundColor:"rgba(0,0,0,0.6)",
        justifyContent:"center",alignItems:"center"}}>
        <TouchableOpacity style={{position:"absolute",top:0,left:0,right:0,bottom:0}}
          activeOpacity={1} onPress={handleClose}/>
        <View style={{backgroundColor:CARD_BG,borderRadius:20,width:"88%",maxWidth:360,
          borderWidth:1.5,borderColor:BORDER,overflow:"hidden",
          shadowColor:"#000",shadowOffset:{width:0,height:8},shadowRadius:20,
          shadowOpacity:0.4,elevation:16}}
          onStartShouldSetResponder={()=>true}>

          {/* Header */}
          <View style={{backgroundColor:DARK_BG,paddingHorizontal:20,paddingVertical:14}}>
            <Text style={{color:"#F5DEB3",fontWeight:"bold",fontSize:16}}>
              Conectarse a partida
            </Text>
            <Text style={{color:"#A0845C",fontSize:12,marginTop:2}}>
              Ingresá el código que compartió el host
            </Text>
          </View>

          <View style={{padding:20}}>
            {/* Campo de código — grande y bold */}
            <TextInput
              value={code}
              onChangeText={t=>{ setCode(t.toUpperCase()); setError(""); }}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="GH42"
              placeholderTextColor="#C4B090"
              style={{
                fontSize:48, fontWeight:"bold", textAlign:"center",
                color:TEXT, letterSpacing:12,
                borderBottomWidth:3, borderBottomColor:code.length===4?ACCENT:BORDER,
                paddingBottom:8, marginBottom:8,
              }}
            />
            {/* Guía de caracteres */}
            <Text style={{textAlign:"center",fontSize:11,color:MUTED,marginBottom:16}}>
              4 caracteres · letras y números
            </Text>

            {error?(
              <Text style={{color:"#CC2222",fontSize:13,textAlign:"center",marginBottom:12}}>
                {error}
              </Text>
            ):null}

            {/* Botones */}
            <View style={{flexDirection:"row",gap:10}}>
              <TouchableOpacity onPress={handleClose}
                style={{flex:1,height:46,borderRadius:10,borderWidth:1.5,
                  borderColor:BORDER,justifyContent:"center",alignItems:"center"}}>
                <Text style={{fontSize:14,color:TEXT,fontWeight:"500"}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleJoin} disabled={loading||code.length!==4}
                style={{flex:1,height:46,borderRadius:10,
                  backgroundColor:code.length===4?ACCENT:"#C4B090",
                  justifyContent:"center",alignItems:"center"}}>
                {loading
                  ?<Text style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>Buscando…</Text>
                  :<Text style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>Unirse</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
