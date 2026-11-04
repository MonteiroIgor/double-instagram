// Gera as artes (PNG + JPG) e as legendas a partir de conteudo/calendario.json.
// Uso: node scripts/render.mjs            -> todos os posts
//      node scripts/render.mjs 3 7        -> só os posts com id 3 e 7
// Requer Google Chrome instalado (usa o modo headless para "fotografar" o HTML).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderPost, legendaCompleta } from "./templates.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "saida");
const CHROME =
  process.env.CHROME_BIN ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
if (!CHROME) throw new Error("Chrome não encontrado. Defina CHROME_BIN.");

const cal = JSON.parse(readFileSync(join(ROOT, "conteudo/calendario.json"), "utf8"));
const filtro = process.argv.slice(2).map(Number);
const posts = filtro.length ? cal.posts.filter((p) => filtro.includes(p.id)) : cal.posts;

for (const d of ["html", "png", "jpg", "legendas"]) mkdirSync(join(OUT, d), { recursive: true });
const logo = pathToFileURL(join(ROOT, "assets/logo.png")).href;

for (const p of posts) {
  const nome = `${p.data}_${String(p.id).padStart(2, "0")}-${p.servico}`;
  const htmlPath = join(OUT, "html", `${nome}.html`);
  const pngPath = join(OUT, "png", `${nome}.png`);
  const jpgPath = join(OUT, "jpg", `${nome}.jpg`);
  writeFileSync(htmlPath, renderPost(p, logo));
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,1350", "--virtual-time-budget=6000", `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "ignore" });
  // O Instagram só aceita JPEG na API de publicação.
  if (process.platform === "darwin") {
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "92", pngPath, "--out", jpgPath], { stdio: "ignore" });
  } else {
    execFileSync("convert", [pngPath, "-quality", "92", jpgPath], { stdio: "ignore" });
  }
  writeFileSync(join(OUT, "legendas", `${nome}.txt`), legendaCompleta(p));
  console.log(`✓ ${nome}`);
}
