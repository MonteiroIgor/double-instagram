// Gera saida/galeria.html: prévia de todos os posts com data, legenda e status, para revisar antes de publicar.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { legendaCompleta, SERVICOS } from "./templates.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cal = JSON.parse(readFileSync(join(ROOT, "conteudo/calendario.json"), "utf8"));
const logPath = join(ROOT, "saida/publicados.json");
const publicados = new Set((existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : []).map((l) => l.id));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const dia = (d) => new Date(d + "T12:00:00-03:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

const cards = cal.posts.map((p) => {
  const nome = `${p.data}_${String(p.id).padStart(2, "0")}-${p.servico}`;
  const midia = p.tipo === "reel" ? `<video src="video/${p.video}" controls muted playsinline preload="metadata"></video>` : `<img src="png/${nome}.png" loading="lazy" alt="">`;
  return `<article>${midia}
  <div class="meta"><b>#${p.id} · ${dia(p.data)} · 12h</b><span>${esc((SERVICOS[p.servico] || SERVICOS.double).tag)}</span>${publicados.has(p.id) ? '<em>publicado</em>' : ""}</div>
  <details><summary>Legenda</summary><pre>${esc(legendaCompleta(p))}</pre></details></article>`;
}).join("\n");

writeFileSync(join(ROOT, "saida/galeria.html"), `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Calendário Double</title>
<style>
body{margin:0;background:#F4F8FC;font:15px/1.5 Inter,system-ui,sans-serif;color:#1E3A5F}
h1{font-size:22px;margin:28px 24px 4px}p.s{margin:0 24px 20px;color:#6B7A8C}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;padding:0 24px 40px}
article{background:#fff;border:1px solid #D3E6F5;border-radius:14px;overflow:hidden}
img,video{width:100%;display:block;aspect-ratio:4/5;object-fit:cover;background:#000}
.meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 14px 4px}
.meta span{font-size:12px;color:#2F8FC9;background:#EAF4FB;border-radius:99px;padding:2px 10px}
.meta em{font-size:12px;font-style:normal;color:#1f7a55;background:#eef7f2;border-radius:99px;padding:2px 10px}
details{padding:4px 14px 14px}summary{cursor:pointer;color:#6B7A8C}
pre{white-space:pre-wrap;font:13px/1.5 Inter,system-ui,sans-serif;color:#3E4C5E}
</style></head><body><h1>Calendário de posts · ${esc(cal.perfil)}</h1>
<p class="s">${cal.posts.length} posts no feed (terça e quinta, 12h) · stories todo dia às 12h</p><div class="grid">${cards}</div></body></html>`);
console.log("✓ saida/galeria.html");
