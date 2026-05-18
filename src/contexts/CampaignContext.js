// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTO DE CAMPAÑA — clases desbloqueadas, progreso
// ═══════════════════════════════════════════════════════════════════════════════
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY, ALWAYS_UNLOCKED, LOCKABLE_CLASSES } from "../data";

export const CampaignContext = createContext({ unlocked: [], toggleUnlock: ()=>{} });

export function CampaignProvider({ children }){
  const [unlocked, setUnlocked] = useState([]);

  useEffect(()=>{
    AsyncStorage.getItem(STORAGE_KEY).then(val=>{
      if(val) setUnlocked(JSON.parse(val));
    }).catch(()=>{});
  },[]);

  const toggleUnlock = (cls) => {
    setUnlocked(prev=>{
      const next = prev.includes(cls) ? prev.filter(c=>c!==cls) : [...prev,cls];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(()=>{});
      return next;
    });
  };

  return(
    <CampaignContext.Provider value={{unlocked, toggleUnlock}}>
      {children}
    </CampaignContext.Provider>
  );
}

// ── Helper: clases disponibles para selección ─────────────────────────────────
export function useAvailableClasses(){
  const { unlocked } = useContext(CampaignContext);
  return [...ALWAYS_UNLOCKED, ...LOCKABLE_CLASSES.filter(c=>unlocked.includes(c))];
}
