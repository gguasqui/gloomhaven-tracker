// Corré este script UNA VEZ desde la raíz del proyecto:
// node download-monsters.js

const https = require("https");
const fs    = require("fs");
const path  = require("path");

const BASE = "https://raw.githubusercontent.com/cmlenius/gloomhaven-card-browser/images/images/monster-stat-cards/gloomhaven/";
const OUT  = path.join(__dirname, "assets", "monsters");

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Mapeo: nombre local → slug de GitHub
const MONSTERS = [
  ["ancient-artillery",   "gh-ancient-artillery-0.png"],
  ["bandit-archer",       "gh-bandit-archer-0.png"],
  ["bandit-commander",    "gh-bandit-commander-0.png"],
  ["bandit-guard",        "gh-bandit-guard-0.png"],
  ["black-imp",           "gh-black-imp-0.png"],
  ["captain-of-guard",    "gh-captain-of-the-guard-0.png"],
  ["cave-bear",           "gh-cave-bear-0.png"],
  ["city-archer",         "gh-city-archer-0.png"],
  ["city-guard",          "gh-city-guard-0.png"],
  ["cultist",             "gh-cultist-0.png"],
  ["dark-rider",          "gh-dark-rider-0.png"],
  ["deep-terror",         "gh-deep-terror-0.png"],
  ["earth-demon",         "gh-earth-demon-0.png"],
  ["elder-drake",         "gh-elder-drake-0.png"],
  ["flame-demon",         "gh-flame-demon-0.png"],
  ["forest-imp",          "gh-forest-imp-0.png"],
  ["frost-demon",         "gh-frost-demon-0.png"],
  ["giant-viper",         "gh-giant-viper-0.png"],
  ["harrower-infester",   "gh-harrower-infester-0.png"],
  ["hound",               "gh-hound-0.png"],
  ["inox-archer",         "gh-inox-archer-0.png"],
  ["inox-bodyguard",      "gh-inox-bodyguard-0.png"],
  ["inox-guard",          "gh-inox-guard-0.png"],
  ["inox-shaman",         "gh-inox-shaman-0.png"],
  ["jekserah",            "gh-jekserah-0.png"],
  ["living-bones",        "gh-living-bones-0.png"],
  ["living-corpse",       "gh-living-corpse-0.png"],
  ["living-spirit",       "gh-living-spirit-0.png"],
  ["lurker",              "gh-lurker-0.png"],
  ["merciless-overseer",  "gh-merciless-overseer-0.png"],
  ["night-demon",         "gh-night-demon-0.png"],
  ["ooze",                "gh-ooze-0.png"],
  ["prime-demon",         "gh-prime-demon-0.png"],
  ["rending-drake",       "gh-rending-drake-0.png"],
  ["savvas-icestorm",     "gh-savvas-icestorm-0.png"],
  ["savvas-lavaflow",     "gh-savvas-lavaflow-0.png"],
  ["spitting-drake",      "gh-spitting-drake-0.png"],
  ["stone-golem",         "gh-stone-golem-0.png"],
  ["sun-demon",           "gh-sun-demon-0.png"],
  ["the-betrayer",        "gh-the-betrayer-0.png"],
  ["the-colorless",       "gh-the-colorless-0.png"],
  ["the-gloom",           "gh-the-gloom-0.png"],
  ["the-sightless-eye",   "gh-the-sightless-eye-0.png"],
  ["vermling-scout",      "gh-vermling-scout-0.png"],
  ["vermling-shaman",     "gh-vermling-shaman-0.png"],
  ["wind-demon",          "gh-wind-demon-0.png"],
  ["winged-horror",       "gh-winged-horror-0.png"],
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode} para ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  let ok = 0, fail = 0;
  for (const [name, file] of MONSTERS) {
    const url  = BASE + file;
    const dest = path.join(OUT, name + ".png");
    if (fs.existsSync(dest)) {
      console.log(`✓ ya existe: ${name}.png`);
      ok++;
      continue;
    }
    try {
      await download(url, dest);
      console.log(`✓ ${name}.png`);
      ok++;
    } catch (e) {
      console.error(`✗ ${name}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nListo: ${ok} descargadas, ${fail} fallidas.`);
  if (fail > 0) console.log("Las fallidas van a usar el emoji como fallback en la app.");
})();