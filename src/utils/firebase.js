// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE REST SERVICE
// ═══════════════════════════════════════════════════════════════════════════════
import { createListener } from "../firebase-listen";
import { FB_DB_URL, FB_API_KEY } from "../data";

export const FB = {
  url: (path) => `${FB_DB_URL}/${path}.json?auth=${FB_API_KEY}`,

  async get(path){
    try{
      const r = await fetch(FB.url(path));
      if(!r.ok) return null;
      return await r.json();
    }catch(e){ return null; }
  },

  async set(path, data){
    try{
      await fetch(FB.url(path), {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data),
      });
    }catch(e){}
  },

  async patch(path, data){
    try{
      await fetch(FB.url(path), {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data),
      });
    }catch(e){}
  },

  // Escribe una hoja específica (alias semántico de set para escrituras granulares).
  // Diferencia con set: aquí esperamos un valor primitivo o un sub-objeto pequeño,
  // no el árbol entero. Hook futuro para batching/throttling/métricas.
  async setField(path, value){
    try{
      await fetch(FB.url(path), {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(value),
      });
    }catch(e){}
  },

  async remove(path){
    try{
      await fetch(FB.url(path), { method:"DELETE" });
    }catch(e){}
  },

  // Escuchar cambios en tiempo real — SSE con fallback a polling
  listen: createListener(FB_DB_URL, FB_API_KEY),
};

// Generar código de sala de 4 caracteres
export function genSalaId(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for(let i=0;i<4;i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}
