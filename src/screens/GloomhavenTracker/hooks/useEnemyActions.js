// ═══════════════════════════════════════════════════════════════════════════════
// useEnemyActions — handlers de mutación de enemigos
//
// Provee:
//   - CRUD: updateEnemy, removeEnemy, addEnemy, addEnemyVariant
//   - Acciones de combate: commitDamage, applyHeal, applyTrap, toggleStatus
//   - Pending damage: adjustPending
//   - Edición de número: startEditNum, commitNum
//   - Effect que mantiene monsterOrder + initOrder sincronizados con enemies
//
// Dependencias inyectadas:
//   - Estado/setters: enemies, setEnemies, pendingDmg, setPendingDmg,
//     editingNum, setEditingNum, numDraft, setNumDraft, setMonsterOrder,
//     setInitOrder, roundActive, setNoStockAlert
//   - Writers Firebase (vienen de useFirebaseSync): writeEnemyField,
//     writeEnemiesArray, writeInitOrderArray, writeMonsterOrderArray, enemiesRef
//   - Para añadir: selectedType, effVar, scenarioLvl, players, activeTurnId,
//     initOrder, handleNewEnemyDuringRound
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useCallback } from "react";
import { getHp, getDefaultShield, newId } from "../../../utils/enemyHelpers";
import { pickNumber } from "../ENEMY_STOCK";

export default function useEnemyActions({
  // estado/setters de la card
  enemies,            setEnemies,
  pendingDmg,         setPendingDmg,
  editingNum,         setEditingNum,
  numDraft,           setNumDraft,
  setNoStockAlert,
  // estado/setters de iniciativa (para sync de monsterOrder)
  setMonsterOrder, setInitOrder, roundActive,
  // info para crear enemigos
  selectedType, effVar, scenarioLvl, players,
  // callback al insertar mid-round
  handleNewEnemyDuringRound,
  // writers de Firebase y ref auxiliar
  enemiesRef,
  writeEnemyField, writeEnemiesArray,
  writeInitOrderArray, writeMonsterOrderArray,
}){

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const updateEnemy = (id, patch) => {
    setEnemies(prev => prev.map(e => e.id!==id ? e : {...e, ...patch}));
    // Escritura granular por cada campo del patch (shield, pierce, number, etc.)
    Object.entries(patch).forEach(([field,value]) => writeEnemyField(id, field, value));
  };

  const removeEnemy = (id) => {
    const next = enemiesRef.current.filter(e => e.id !== id);
    setEnemies(next);
    writeEnemiesArray(next);
    setPendingDmg(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  // Wrapper para pickNumber: pasa el array de enemies actual
  const pickNumberFor = (type) => pickNumber(type, enemies);

  // ── ADD enemy/variant ───────────────────────────────────────────────────
  const addEnemyVariant = useCallback((v) => {
    const hp         = getHp(selectedType, v, scenarioLvl, players);
    const baseShield = getDefaultShield(selectedType, v, scenarioLvl);
    const num        = pickNumberFor(selectedType);
    if(num === null){ setNoStockAlert(true); return; }
    const eid = newId();
    const newEnemy = {
      id:eid, type:selectedType, variant:v,
      maxHp:hp, currentHp:hp, baseShield, shield:0, pierce:0,
      statuses:[], number:String(num), summoned:false,
    };
    const next = [...enemiesRef.current, newEnemy];
    setEnemies(next);
    writeEnemiesArray(next);
    handleNewEnemyDuringRound(selectedType, eid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, scenarioLvl, players, enemies, writeEnemiesArray, handleNewEnemyDuringRound]);

  const addEnemy = useCallback(() => {
    const v = effVar;
    const hp         = getHp(selectedType, v, scenarioLvl, players);
    const baseShield = getDefaultShield(selectedType, v, scenarioLvl);
    const num        = pickNumberFor(selectedType);
    if(num === null){ setNoStockAlert(true); return; }
    const eid = newId();
    const newEnemy = {
      id:eid, type:selectedType, variant:v,
      maxHp:hp, currentHp:hp, baseShield, shield:0, pierce:0,
      statuses:[], number:String(num), summoned:false,
    };
    const next = [...enemiesRef.current, newEnemy];
    setEnemies(next);
    writeEnemiesArray(next);
    handleNewEnemyDuringRound(selectedType, eid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, effVar, scenarioLvl, players, enemies, writeEnemiesArray, handleNewEnemyDuringRound]);

  // ── SYNC monsterOrder + initOrder cuando cambian los enemies ────────────
  // Política: los muertos se purgan inmediatamente del array `enemies` (no
  // B3). El filtro `currentHp > 0` queda como defensa redundante.
  //
  // - monsterOrder: se sincroniza siempre con los tipos vivos actuales.
  // - initOrder: fuera de ronda activa se sincroniza en ambos sentidos
  //   (agrega tipos nuevos Y remueve los que ya no tienen enemigos vivos —
  //   así desaparece el avatar en la barra cuando muere el último de un tipo).
  //   Durante ronda activa no se toca: representa el orden de la ronda en
  //   curso y sacar tipos en el medio rompe la UX. El popup se encarga
  //   del alta mid-round.
  React.useEffect(() => {
    const alive = enemies.filter(e => e.currentHp > 0);
    const activeTypes = [...new Set(alive.map(e => e.type))];
    setMonsterOrder(prev => {
      const newTypes    = activeTypes.filter(t => !prev.includes(t));
      const stillActive = prev.filter(t => activeTypes.includes(t));
      const updated     = [...stillActive, ...newTypes];
      // Solo escribir a Firebase si realmente cambió (evita escrituras innecesarias y eco-loops)
      const changed = updated.length !== prev.length || updated.some((t,i) => t !== prev[i]);
      if(changed) writeMonsterOrderArray(updated);
      return updated;
    });
    if(!roundActive){
      setInitOrder(order => {
        const activeSet = new Set(activeTypes);
        // Quitar entries de monstruos cuyo tipo ya no tiene vivos
        const filtered = order.filter(x => x.kind !== "monster" || activeSet.has(x.id));
        // Agregar tipos nuevos que aún no estén
        const existingIds = new Set(filtered.filter(x => x.kind === "monster").map(x => x.id));
        const toAdd = activeTypes.filter(t => !existingIds.has(t)).map(t => ({kind:"monster", id:t}));
        const next = [...filtered, ...toAdd];
        const changed =
          next.length !== order.length ||
          next.some((x,i) => x.kind !== order[i]?.kind || x.id !== order[i]?.id);
        if(changed) writeInitOrderArray(next);
        return changed ? next : order;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies]);

  // ── ACCIONES DE COMBATE ─────────────────────────────────────────────────
  const adjustPending = (id, d) =>
    setPendingDmg(prev => ({...prev, [id]: Math.max(0, (prev[id]||0) + d)}));

  // commitDamage: granular mientras el enemigo esté vivo. Si el daño lo mata
  // (currentHp llega a 0), se purga del array inmediatamente con
  // writeEnemiesArray — así desaparece en todos los clientes al instante
  // y no queda residuo en la barra de iniciativa ni en la lista de cards.
  const commitDamage = (id) => {
    const raw = pendingDmg[id] || 0;
    if(!raw) return;
    let newHp = null;
    setEnemies(prev => prev.map(e => {
      if(e.id !== id) return e;
      const totalShield = (e.baseShield||0) + e.shield;
      const eff = Math.max(0, totalShield - e.pierce);
      const dmg = Math.max(0, raw - eff);
      const poi = e.statuses.includes("poison") ? 1 : 0;
      newHp = Math.max(0, e.currentHp - dmg - poi);
      return {...e, currentHp: newHp};
    }));
    if(newHp === 0){
      // Murió: purgar del array (local + Firebase) en una sola escritura.
      const next = enemiesRef.current.filter(e => e.id !== id);
      setEnemies(next);
      writeEnemiesArray(next);
    } else if(newHp !== null){
      writeEnemyField(id, 'currentHp', newHp);
    }
    setPendingDmg(prev => ({...prev, [id]: 0}));
  };

  // applyHeal: B3 — granular. Si está envenenado o herido, solo limpia statuses.
  // Si no, cura 1 HP. Una sola escritura granular según el caso.
  const applyHeal = (id) => {
    let newStatuses = null;
    let newHp = null;
    setEnemies(prev => prev.map(e => {
      if(e.id !== id) return e;
      const hasWound = e.statuses.includes("wound");
      const clean   = e.statuses.filter(x => x !== "poison" && x !== "wound");
      newStatuses = clean;
      if(hasWound){
        newHp = null; // no cambia HP
        return {...e, statuses: clean};
      }
      newHp = Math.min(e.maxHp, e.currentHp + 1);
      return {...e, statuses: clean, currentHp: newHp};
    }));
    if(newStatuses !== null) writeEnemyField(id, 'statuses', newStatuses);
    if(newHp !== null)       writeEnemyField(id, 'currentHp', newHp);
  };

  // toggleStatus: B3 — granular para statuses.
  const toggleStatus = (id, st) => {
    let newStatuses = null;
    setEnemies(prev => prev.map(e => {
      if(e.id !== id) return e;
      const has = e.statuses.includes(st);
      newStatuses = has ? e.statuses.filter(x => x !== st) : [...e.statuses, st];
      return {...e, statuses: newStatuses};
    }));
    if(newStatuses !== null) writeEnemyField(id, 'statuses', newStatuses);
  };

  // applyTrap: granular mientras vivo; si la trampa lo mata, purgar.
  const applyTrap = (id) => {
    let newHp = null;
    setEnemies(prev => prev.map(e => {
      if(e.id !== id) return e;
      newHp = Math.max(0, e.currentHp - 1);
      return {...e, currentHp: newHp};
    }));
    if(newHp === 0){
      const next = enemiesRef.current.filter(e => e.id !== id);
      setEnemies(next);
      writeEnemiesArray(next);
    } else if(newHp !== null){
      writeEnemyField(id, 'currentHp', newHp);
    }
  };

  // ── EDICIÓN DE NÚMERO ───────────────────────────────────────────────────
  const startEditNum = (id, cur) => { setEditingNum(id); setNumDraft(cur); };
  const commitNum    = (id) => {
    const v = numDraft.trim();
    if(v) updateEnemy(id, {number: v});
    setEditingNum(null);
  };

  return {
    updateEnemy, removeEnemy,
    addEnemy, addEnemyVariant,
    pickNumberFor,
    adjustPending, commitDamage, applyHeal, toggleStatus, applyTrap,
    startEditNum, commitNum,
  };
}