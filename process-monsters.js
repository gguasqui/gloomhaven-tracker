// Corré este script UNA VEZ desde la raíz del proyecto:
// node process-monsters.js
//
// Requiere jimp: npm install jimp
// Procesa todas las imágenes de assets/monsters/ y guarda las versiones
// circulares recortadas en assets/monsters/processed/

const Jimp  = require("jimp");
const fs    = require("fs");
const path  = require("path");

const IN_DIR  = path.join(__dirname, "assets", "monsters");
const OUT_DIR = path.join(__dirname, "assets", "monsters", "processed");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Tamaño final de cada imagen procesada
const OUTPUT_SIZE = 200;

// Porcentaje del ancho de la imagen que ocupa el arte central
const ART_RATIO = 0.30;

async function processOne(file) {
  const inPath  = path.join(IN_DIR, file);
  const outPath = path.join(OUT_DIR, file);

  if (fs.existsSync(outPath)) {
    console.log(`✓ ya procesada: ${file}`);
    return;
  }

  const img = await Jimp.read(inPath);
  const w   = img.getWidth();
  const h   = img.getHeight();
  const cx  = Math.floor(w / 2);
  const cy  = Math.floor(h / 2);

  // Recortar el cuadrado central con el arte
  const artSize = Math.floor(Math.min(w, h) * ART_RATIO);
  const left    = cx - Math.floor(artSize / 2);
  const top     = cy - Math.floor(artSize / 2);

  const cropped = img.clone().crop(left, top, artSize, artSize);
  cropped.resize(OUTPUT_SIZE, OUTPUT_SIZE, Jimp.RESIZE_LANCZOS);

  // Aplicar máscara circular: poner transparente lo que está fuera del círculo
  const circle = new Jimp(OUTPUT_SIZE, OUTPUT_SIZE, 0x00000000);
  const r      = OUTPUT_SIZE / 2;

  cropped.scan(0, 0, OUTPUT_SIZE, OUTPUT_SIZE, function(x, y, idx) {
    const dx   = x - r;
    const dy   = y - r;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > r) {
      this.bitmap.data[idx + 3] = 0; // transparente fuera del círculo
    }
  });

  // Fondo crema de la app (#F0E6D0) + imagen circular encima
  const bg = new Jimp(OUTPUT_SIZE, OUTPUT_SIZE, 0xF0E6D0FF);
  bg.composite(cropped, 0, 0);
  await bg.writeAsync(outPath);
  console.log(`✓ ${file}`);
}

(async () => {
  const files = fs.readdirSync(IN_DIR)
    .filter(f => f.endsWith(".png") && !fs.statSync(path.join(IN_DIR, f)).isDirectory());

  console.log(`Procesando ${files.length} imágenes...\n`);
  let ok = 0, fail = 0;

  for (const file of files) {
    try {
      await processOne(file);
      ok++;
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nListo: ${ok} procesadas, ${fail} fallidas.`);
})();