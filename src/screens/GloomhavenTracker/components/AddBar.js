// ═══════════════════════════════════════════════════════════════════════════════
// AddBar — barra superior con selector de monstruo y botón(es) +
//
// Landscape: addBarLand con padding por insets, sin wrapper interno.
// Portrait:  addBar + addRow interno, sin padding por insets.
// El bloque de botones (ancho fijo 100px) es idéntico en ambas orientaciones.
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { trackerStyles as ss } from "../../../styles/trackerStyles";
import { ENEMY_TYPES, MONSTER_IMAGES, ACCENT } from "../../../data";

// Render compartido: selector + botones + de la variante
function AddBarInner({
  selectedType, selIsBoss, selHasElite,
  onOpenPicker, onAddBoss, onAddNormal, onAddElite,
  marginLeftBtns,
}){
  return (
    <>
      <TouchableOpacity style={[ss.selectorBtn,{flex:1,marginRight:6}]} onPress={onOpenPicker}>
        <View style={ss.selectorImgWrap}>
          {MONSTER_IMAGES[selectedType]
            ?<Image source={MONSTER_IMAGES[selectedType]} style={ss.selectorImg}/>
            :<Text style={{fontSize:14}}>{ENEMY_TYPES[selectedType]?.icon||"👹"}</Text>}
        </View>
        <Text style={ss.selectorTxt} numberOfLines={1}>{selectedType}</Text>
        <Text style={ss.selectorArrow}>▾</Text>
      </TouchableOpacity>

      <View style={{width:100,flexDirection:"row",gap:4,alignSelf:"stretch",marginLeft:marginLeftBtns}}>
        {selIsBoss
          ? <TouchableOpacity onPress={onAddBoss} style={[ss.quickAddBoss,{flex:1,marginLeft:0}]}>
              <Text style={[ss.quickAddTxt,{color:"#fff"}]}>+</Text>
            </TouchableOpacity>
          : <>
              <TouchableOpacity
                onPress={onAddNormal}
                style={[ss.quickAddBtn,{flex:1,marginLeft:0,backgroundColor:"#FFFFFF",borderColor:ACCENT,borderWidth:1.5}]}>
                <Text style={[ss.quickAddTxt,{color:ACCENT}]}>+</Text>
              </TouchableOpacity>
              {selHasElite
                ? <TouchableOpacity
                    onPress={onAddElite}
                    style={[ss.quickAddBtn,{flex:1,backgroundColor:"#FFE650",borderColor:"#C9920A",borderWidth:1.5}]}>
                    <Text style={[ss.quickAddTxt,{color:"#8B6914"}]}>+</Text>
                  </TouchableOpacity>
                : <View style={{flex:1}}/>
              }
            </>
        }
      </View>
    </>
  );
}

export default function AddBar({
  isLandscape, insets,
  selectedType, selIsBoss, selHasElite,
  onOpenPicker, onAddBoss, onAddNormal, onAddElite,
}){
  if(isLandscape){
    return (
      <View style={[ss.addBarLand,{paddingLeft:insets.left+8,paddingRight:insets.right+8}]}>
        <AddBarInner
          selectedType={selectedType}
          selIsBoss={selIsBoss}
          selHasElite={selHasElite}
          onOpenPicker={onOpenPicker}
          onAddBoss={onAddBoss}
          onAddNormal={onAddNormal}
          onAddElite={onAddElite}
          marginLeftBtns={6}
        />
      </View>
    );
  }
  return (
    <View style={ss.addBar}>
      <View style={ss.addRow}>
        <AddBarInner
          selectedType={selectedType}
          selIsBoss={selIsBoss}
          selHasElite={selHasElite}
          onOpenPicker={onOpenPicker}
          onAddBoss={onAddBoss}
          onAddNormal={onAddNormal}
          onAddElite={onAddElite}
          marginLeftBtns={0}
        />
      </View>
    </View>
  );
}
