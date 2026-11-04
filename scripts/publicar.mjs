// Publica no Instagram o post do dia (horário de Brasília) usando a API oficial da Meta.
//
// Variáveis de ambiente:
//   IG_ACCESS_TOKEN   token com permissão de publicação (obrigatório, nunca commitar)
//   IG_USER_ID        ID da conta do Instagram (opcional: se faltar, é descoberto pelo token)
//   IG_USERNAME       conta a usar na descoberta automática (padrão ddoublesoftware)
//   IMAGE_BASE_URL    URL pública da pasta saida/jpg (ex.: https://raw.githubusercontent.com/<usuario>/<repo>/main/saida/jpg)
//   IG_API_HOST       graph.facebook.com (login unificado / usuário do sistema, padrão) ou graph.instagram.com (apps antigos)
//   IG_API_VERSION    padrão v24.0
//   WAIT_UNTIL        "12:00" -> se rodar alguns minutos antes, espera até 12h de Brasília
//   DRY_RUN=1         mostra o que faria, sem publicar
//
// Uso: node scripts/publicar.mjs                 -> post com data de hoje
//      node scripts/publicar.mjs --data 2026-11-05
//      node scripts/publicar.mjs --id 3
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { legendaCompleta } from "./templates.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TZ = "America/Sao_Paulo";
const env = process.env;
const DRY = env.DRY_RUN === "1";
const HOST = env.IG_API_HOST || "graph.facebook.com";
const VER = env.IG_API_VERSION || "v24.0";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const agoraBR = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return { data: `${parts.year}-${parts.month}-${parts.day}`, min: Number(parts.hour) * 60 + Number(parts.minute) };
};

const arg = (nome) => { const i = process.argv.indexOf(nome); return i > -1 ? process.argv[i + 1] : undefined; };

async function api(method, path, params) {
  const url = new URL(`https://${HOST}/${VER}/${path}`);
  const body = new URLSearchParams({ ...params, access_token: env.IG_ACCESS_TOKEN });
  const res = method === "GET"
    ? await fetch(`${url}?${body}`)
    : await fetch(url, { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${path}: ${JSON.stringify(json.error || json)}`);
  return json;
}

const cal = JSON.parse(readFileSync(join(ROOT, "conteudo/calendario.json"), "utf8"));
const hoje = agoraBR();
const alvoId = arg("--id");
const alvoData = arg("--data") || hoje.data;
const post = alvoId ? cal.posts.find((p) => p.id === Number(alvoId)) : cal.posts.find((p) => p.data === alvoData);
if (!post) { console.log(`Nenhum post programado para ${alvoData}. Nada a fazer.`); process.exit(0); }

const logPath = join(ROOT, "saida/publicados.json");
const log = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : [];
if (log.some((l) => l.id === post.id)) { console.log(`Post ${post.id} já publicado. Nada a fazer.`); process.exit(0); }

const nome = `${post.data}_${String(post.id).padStart(2, "0")}-${post.servico}.jpg`;
if (!existsSync(join(ROOT, "saida/jpg", nome))) throw new Error(`Arte não encontrada: saida/jpg/${nome}. Rode scripts/render.mjs.`);
const imageUrl = `${(env.IMAGE_BASE_URL || "").replace(/\/$/, "")}/${nome}`;
const caption = legendaCompleta(post);

console.log(`Post ${post.id} (${post.data}) · ${post.servico}\nImagem: ${imageUrl}\n---\n${caption}\n---`);
if (DRY && !env.IG_ACCESS_TOKEN) { console.log("DRY_RUN=1 sem token: nada foi publicado."); process.exit(0); }
for (const k of ["IG_ACCESS_TOKEN", "IMAGE_BASE_URL"]) if (!env[k]) throw new Error(`Defina ${k}.`);

// Sem IG_USER_ID: descobre o ID da conta pelo token (token de usuário do sistema / login unificado).
if (!env.IG_USER_ID) {
  const usuario = (env.IG_USERNAME || "ddoublesoftware").toLowerCase();
  const { data = [] } = await api("GET", "me/assigned_instagram_accounts", { fields: "id,username" });
  const conta = data.find((c) => (c.username || "").toLowerCase() === usuario) || (data.length === 1 ? data[0] : null);
  if (!conta) throw new Error(`Conta @${usuario} não encontrada no token. Contas vistas: ${data.map((c) => "@" + c.username).join(", ") || "nenhuma"}.`);
  env.IG_USER_ID = conta.id;
  console.log(`Conta: @${conta.username} (ID ${conta.id})`);
}
if (DRY) {
  const conta = await api("GET", env.IG_USER_ID, { fields: "username" });
  console.log(`DRY_RUN=1: token OK para @${conta.username}. Nada foi publicado.`);
  process.exit(0);
}

// Se o agendador rodou um pouco antes, espera dar 12h em Brasília (no máximo 30 min).
if (env.WAIT_UNTIL && !alvoId && !arg("--data")) {
  const [h, m] = env.WAIT_UNTIL.split(":").map(Number);
  const falta = h * 60 + m - agoraBR().min;
  if (falta > 0 && falta <= 30) { console.log(`Aguardando ${falta} min até ${env.WAIT_UNTIL}…`); await sleep(falta * 60_000); }
}

const { id: containerId } = await api("POST", `${env.IG_USER_ID}/media`, { image_url: imageUrl, caption });
for (let i = 0; i < 20; i++) {
  const { status_code } = await api("GET", containerId, { fields: "status_code" });
  if (status_code === "FINISHED") break;
  if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Falha ao processar a imagem: ${status_code}`);
  await sleep(3000);
}
const { id: mediaId } = await api("POST", `${env.IG_USER_ID}/media_publish`, { creation_id: containerId });
let permalink = null;
try { ({ permalink } = await api("GET", mediaId, { fields: "permalink" })); } catch {}

log.push({ id: post.id, data: post.data, media_id: mediaId, permalink, publicado_em: new Date().toISOString() });
writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
console.log(`✓ Publicado: ${permalink || mediaId}`);
