// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE — BARRA DE INICIATIVA CON DRAG & DROP
// ═══════════════════════════════════════════════════════════════════════════════
import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, Modal,
  PanResponder,
} from "react-native";
import {
  CARD_BG, BORDER, TEXT, MUTED, ACCENT, DARK_BG,
  MONSTER_IMAGES, CLASS_IMAGES,
} from "../data";
import { trackerStyles as ss } from "../styles/trackerStyles";
import NewEnemyInitPopup from "./NewEnemyInitPopup";

export default function InitiativeBar({ initOrder, setInitOrder, enemies, onAvatarTap, activeTurnId, doneTurnIds,
                         onEndRound, roundActive, initNumbers, onSetInitNumber, onStartRound,
                         newEnemyPopup, onConfirmNewEnemy, skipThisRound=[],
                         popupOrder, setPopupOrder, popupOrderRef, viewerMode=false }){
  const AVATAR_W   = 60;
  const FLOAT_SIZE = 52;

  const draggingRef  = React.useRef(null);
  const orderRef     = React.useRef([]);
  const enemiesRef   = React.useRef([]);
  const scrollX      = React.useRef(0);
  const barX         = React.useRef(0);
  const scrollRef    = React.useRef(null);
  const [floatPos,      setFloatPos]     = React.useState({x:0,y:0});
  const [isDragging,    setIsDragging]   = React.useState(false);
  const [showNoOrderAlert, setShowNoOrderAlert] = React.useState(false);

  React.useEffect(()=>{ orderRef.current  = initOrder; }, [initOrder]);
  React.useEffect(()=>{ enemiesRef.current = enemies;  }, [enemies]);



  const skipRef = React.useRef([]);
  React.useEffect(()=>{ skipRef.current = skipThisRound||[]; },[skipThisRound]);

  const getVis = (order) => order.filter(i=>
    i&&i.kind&&(
      i.kind==="class"||
      (enemiesRef.current.some(e=>e.type===i.id) && !skipRef.current.includes(i.id))||
      (newEnemyPopup&&i.id===newEnemyPopup.type)
    )
  );

  const reorder = (moveX) => {
    if(draggingRef.current===null) return;
    const relX   = moveX - barX.current + scrollX.current;
    const vis    = getVis(orderRef.current);
    const toIdx  = Math.max(0, Math.min(vis.length-1, Math.floor(relX/AVATAR_W)));
    const fromIdx = draggingRef.current;
    if(toIdx===fromIdx) return;
    const invis  = orderRef.current.filter(i=>i&&i.kind&&i.kind!=="class"&&!enemiesRef.current.some(e=>e.type===i.id));
    const newVis = [...vis];
    const [moved]= newVis.splice(fromIdx,1);
    newVis.splice(toIdx,0,moved);
    const newOrder = [...newVis,...invis];
    draggingRef.current = toIdx;
    orderRef.current = newOrder;
    setInitOrder(newOrder);
  };

  const pan = React.useRef(PanResponder.create({
    onStartShouldSetPanResponder:        ()=> false,
    onStartShouldSetPanResponderCapture: ()=> false,
    onMoveShouldSetPanResponder:         ()=> false,
    onMoveShouldSetPanResponderCapture:  (_,gs)=> draggingRef.current!==null && Math.abs(gs.dx)>2,
    onPanResponderGrant: (_,gs)=>{ setFloatPos({x:gs.x0-FLOAT_SIZE/2, y:-FLOAT_SIZE-10}); },
    onPanResponderMove:  (_,gs)=>{
      setFloatPos({x:gs.moveX-FLOAT_SIZE/2, y:-FLOAT_SIZE-10});
      reorder(gs.moveX);
    },
    onPanResponderRelease:   ()=>{ draggingRef.current=null; setIsDragging(false); },
    onPanResponderTerminate: ()=>{ draggingRef.current=null; setIsDragging(false); },
  })).current;

  const visible  = getVis(initOrder);
  const dragIdx  = isDragging ? draggingRef.current : null;
  const dragItem = (dragIdx!==null&&visible[dragIdx]) ? visible[dragIdx] : null;
  const dragImg  = dragItem ? (dragItem.kind==="class"?CLASS_IMAGES[dragItem.id]:MONSTER_IMAGES[dragItem.id]) : null;

  // ── Lógica del botón Siguiente / Fin / Inicio ────────────────────────────────
  const activeIdx = activeTurnId
    ? visible.findIndex(i=>i.kind+":"+i.id===activeTurnId)
    : -1;
  const isLast = activeIdx === visible.length - 1;
  const allOrdered = !roundActive && visible.every(i=>initNumbers[i.kind+":"+i.id]!=null);

  // Siguiente pendiente: busca en el orden completo el primer avatar que:
  // 1. No esté en doneTurnIds (no jugó aún esta ronda)
  // 2. No sea el activo actual
  // Esto cubre: enemigos insertados antes del activo durante el turno de un jugador
  // y enemigos de tipo existente que vuelven a habilitarse (quitar de done)
  const getNextPending = () => {
    return visible.find(i=>{
      const tid = i.kind+":"+i.id;
      return tid!==activeTurnId && !doneTurnIds.includes(tid);
    }) || null;
  };

  const nextPending = getNextPending();
  const isFin    = roundActive && activeTurnId !== null && nextPending===null;

  const handleNext = () => {
    if(isDragging) return;
    if(!roundActive){
      if(!allOrdered){ setShowNoOrderAlert(true); return; }
      onStartRound();
      return;
    }
    if(visible.length === 0){ onEndRound(); return; }
    if(activeTurnId === null){
      // Primer avatar del orden que no esté en done
      const first = visible.find(i=>!doneTurnIds.includes(i.kind+":"+i.id));
      if(first){
        onAvatarTap(first);
        const idx = visible.indexOf(first);
        scrollRef.current?.scrollTo({x:Math.max(0,idx*AVATAR_W-AVATAR_W), animated:true});
      }
      return;
    }
    if(isFin){ onEndRound(); return; }
    // Avanzar al siguiente pendiente (puede estar en cualquier posición del orden)
    if(nextPending){
      onAvatarTap(nextPending);
      const nextIdx = visible.indexOf(nextPending);
      scrollRef.current?.scrollTo({x:Math.max(0,nextIdx*AVATAR_W-AVATAR_W), animated:true});
    }
  };
  const isInicio = !roundActive;
  const btnDisabled = isInicio && !allOrdered;
  const btnLabel = !roundActive ? "Inicio" : (isFin ? "Fin" : "›");



  return(
    <View style={[ss.initSec,{overflow:"visible"}]}
      onLayout={e=>{ barX.current=e.nativeEvent.layout.x; }}
      {...pan.panHandlers}>

      {/* Alert: faltan números de iniciativa */}
      <Modal visible={showNoOrderAlert} transparent animationType="fade">
        <TouchableOpacity style={ss.modalOverlay} activeOpacity={1} onPress={()=>setShowNoOrderAlert(false)}>
          <View style={[ss.modalBox,{width:"80%",maxWidth:320,padding:20}]} onStartShouldSetResponder={()=>true}>
            <Text style={{fontSize:16,fontWeight:"bold",color:ACCENT,marginBottom:10,textAlign:"center"}}>
              ⚠️ Orden de iniciativa
            </Text>
            <Text style={{fontSize:13,color:TEXT,textAlign:"center",marginBottom:16}}>
              {Object.keys(initNumbers).length===0
                ? "Tenés que elegir el orden de iniciativa antes de empezar la ronda."
                : "Falta seleccionar algún enemigo o personaje."}
            </Text>
            <TouchableOpacity style={[ss.popupBtn,{alignSelf:"center"}]} onPress={()=>setShowNoOrderAlert(false)}>
              <Text style={[ss.popupBtnTxt,{textAlign:"center"}]}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Popup: nuevo enemigo durante turno de jugador — elegir posición de INI */}
      {!!newEnemyPopup&&(
        <NewEnemyInitPopup
          newEnemyPopup={newEnemyPopup}
          popupOrder={popupOrder}
          setPopupOrder={setPopupOrder}
          popupOrderRef={popupOrderRef}
          doneTurnIds={doneTurnIds}
          activeTurnId={activeTurnId}
          onConfirm={onConfirmNewEnemy}
          AVATAR_W={AVATAR_W}
        />
      )}

      <Text style={ss.initLbl}>Iniciativa</Text>
      <View style={{flexDirection:"row", alignItems:"center"}}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!isDragging}
          onScroll={e=>{ scrollX.current=e.nativeEvent.contentOffset.x; }}
          scrollEventThrottle={16}
          contentContainerStyle={ss.initRow}
          style={{flex:1}}>
          {visible.map((item,idx)=>{
          if(!item||!item.kind||!item.id) return null;   // ← agregar !item.id
            const isClass   = item.kind==="class";
            const img       = isClass ? CLASS_IMAGES[item.id] : MONSTER_IMAGES[item.id];
            const turnId    = item.kind+":"+item.id;
            const isActive  = activeTurnId===turnId;
            const isDone    = doneTurnIds.includes(turnId);
            const beingDrag = isDragging && dragIdx===idx;
            const orderNum  = initNumbers?.[turnId];
            const bColor    = isActive?"#F0A500"
              : !roundActive&&orderNum!=null?"#22A355"
              : isClass?ACCENT:BORDER;
            const bWidth    = isActive||(!roundActive&&orderNum!=null)?3:2;

            return(
              <View
                key={`init-${item.kind}-${item.id}`}
                style={[ss.initAvatar,beingDrag&&{opacity:0},
                  isDone&&roundActive&&{opacity:0.35},
                  !roundActive&&orderNum==null&&{opacity:0.5}]}>
                <TouchableOpacity
                  delayLongPress={roundActive?300:99999}
                  onPress={()=>{
                    if(viewerMode) return;
                    if(!roundActive){
                      // Asignar/quitar número de orden
                      onSetInitNumber(turnId);
                    } else if(!isDragging){
                      onAvatarTap(item);
                    }
                  }}
                  onLongPress={()=>{ if(viewerMode) return; if(roundActive){ draggingRef.current=idx; setIsDragging(true); }}}
                  activeOpacity={viewerMode?1:0.75}>
                  <View style={[ss.initImgWrap,{borderColor:bColor,borderWidth:bWidth},
                    isActive&&{shadowColor:"#F0A500",shadowOpacity:0.7,shadowRadius:6,elevation:6}]}>
                    {img
                      ?<Image source={img} style={isClass?ss.initImg:ss.initImgFull} resizeMode={isClass?"contain":"cover"}/>
                      :<Text style={{fontSize:18}}>👾</Text>}
                    {/* Número de iniciativa superpuesto */}
                    {!roundActive&&orderNum!=null&&(
                      <View style={ss.initNumBadge}>
                        <Text style={ss.initNumTxt}>{orderNum}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[ss.initAvatarLbl,
                  isDone&&roundActive&&{color:"#BBBBBB"},
                  isActive&&{color:ACCENT,fontWeight:"bold"}]} numberOfLines={1}>
                  {item.id.split(" ")[0]}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Botón fijo Inicio / › / Fin — oculto en modo viz */}
        {!viewerMode && (
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[ss.initNextBtn, isFin&&ss.initFinBtn, isInicio&&ss.initInicioBtn,
            (isInicio&&!allOrdered)&&{opacity:0.45}]}>
          <Text style={[ss.initNextTxt, isFin&&ss.initFinTxt, isInicio&&ss.initInicioTxt]}>
            {btnLabel}
          </Text>
        </TouchableOpacity>
        )}
      </View>

      {isDragging&&dragImg&&(
        <View pointerEvents="none" style={[ss.initFloat,{left:floatPos.x,top:floatPos.y}]}>
          <View style={{width:FLOAT_SIZE,height:FLOAT_SIZE,borderRadius:FLOAT_SIZE/2,
            overflow:"hidden",borderWidth:3,borderColor:ACCENT,backgroundColor:"#F0E6D0",
            elevation:16,shadowColor:"#000",shadowOpacity:0.5,shadowRadius:10,shadowOffset:{width:0,height:5}}}>
            <Image source={dragImg} style={{width:FLOAT_SIZE,height:FLOAT_SIZE}}
              resizeMode={dragItem?.kind==="class"?"contain":"cover"}/>
          </View>
        </View>
      )}
    </View>
  );
}
