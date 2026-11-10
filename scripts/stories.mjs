// Gera as imagens dos stories (1080x1920) a partir de conteudo/stories.json.
// Cada story usa a arte de feed do post "ref" (saida/jpg) sobre o fundo da marca, com um selo no topo.
// Uso: node scripts/stories.mjs                 -> todos
//      node scripts/stories.mjs 2026-11-10      -> só essas datas
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "saida");
const CHROME =
  process.env.CHROME_BIN ||
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
if (!CHROME) throw new Error("Chrome não encontrado. Defina CHROME_BIN.");

const { stories } = JSON.parse(readFileSync(join(ROOT, "conteudo/stories.json"), "utf8"));
const filtro = process.argv.slice(2);
const lista = filtro.length ? stories.filter((s) => filtro.includes(s.data)) : stories;
for (const d of ["html", "stories"]) mkdirSync(join(OUT, d), { recursive: true });
const jpgs = readdirSync(join(OUT, "jpg"));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = (arte, selo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Sora:wght@700&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{background:linear-gradient(180deg,#EEF6FC 0%,#E1EFFA 100%);font-family:'Inter',sans-serif;color:#1E3A5F;position:relative}
.topo{position:absolute;top:290px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:22px}
.selo{font:700 34px/1 'Sora';color:#fff;background:#2F8FC9;padding:18px 34px;border-radius:999px;letter-spacing:-.01em}
.arte{position:absolute;top:470px;left:60px;width:960px;height:1200px;border-radius:36px;overflow:hidden;
  box-shadow:0 30px 70px rgba(30,58,95,.18);border:2px solid #D3E6F5}
.arte img{width:100%;height:100%;display:block}
.rodape{position:absolute;bottom:120px;left:0;right:0;text-align:center;font:600 34px/1.3 'Inter';color:#1E3A5F}
.rodape b{color:#2F8FC9}
</style></head><body>
<div class="topo"><span class="selo">${esc(selo)}</span></div>
<div class="arte"><img src="${arte}" alt=""></div>
<div class="rodape">Mais no perfil <b>@ddoublesoftware</b></div>
</body></html>`;

for (const s of lista) {
  const id2 = String(s.ref).padStart(2, "0");
  const arte = jpgs.find((f) => f.includes(`_${id2}-`));
  if (!arte) throw new Error(`Arte do post ${s.ref} não encontrada em saida/jpg.`);
  const nome = `${s.data}_story-${id2}`;
  const htmlPath = join(OUT, "html", `${nome}.html`), pngPath = join(OUT, "html", `${nome}.png`), jpgPath = join(OUT, "stories", `${nome}.jpg`);
  writeFileSync(htmlPath, html(pathToFileURL(join(OUT, "jpg", arte)).href, s.selo || "Dica Double"));
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,1920", "--virtual-time-budget=6000", `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href,
  ], { stdio: "ignore" });
  if (process.platform === "darwin") execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", pngPath, "--out", jpgPath], { stdio: "ignore" });
  else execFileSync("convert", [pngPath, "-quality", "90", jpgPath], { stdio: "ignore" });
  console.log(`✓ ${nome}`);
}
