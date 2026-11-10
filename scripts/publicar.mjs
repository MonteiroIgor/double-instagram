// Publica no Instagram o conteúdo do dia (horário de Brasília) usando a API oficial da Meta:
//   - feed (imagem ou Reel) quando houver post em conteudo/calendario.json para a data (terça e quinta);
//   - story quando houver story em conteudo/stories.json para a data (todo dia).
//
// Variáveis de ambiente:
//   IG_ACCESS_TOKEN   token com permissão de publicação (obrigatório, nunca commitar)
//   IG_USER_ID        ID da conta do Instagram (opcional: se faltar, é descoberto pelo token)
//   IG_USERNAME       conta a usar na descoberta automática (padrão ddoublesoftware)
//   MEDIA_BASE_URL    URL pública da pasta saida (ex.: https://raw.githubusercontent.com/<usuario>/<repo>/main/saida)
//   IMAGE_BASE_URL    (antigo) URL da pasta saida/jpg; usada se MEDIA_BASE_URL faltar
//   IG_API_HOST       graph.facebook.com (login unificado / usuário do sistema, padrão) ou graph.instagram.com (apps antigos)
//   IG_API_VERSION    padrão v24.0
//   WAIT_UNTIL        "12:00" -> se rodar alguns minutos antes, espera até 12h de Brasília
//   DRY_RUN=1         mostra o que faria, sem publicar
//
// Uso: node scripts/publicar.mjs                     -> feed + story de hoje
//      node scripts/publicar.mjs --data 2026-11-05   -> feed + story dessa data
//      node scripts/publicar.mjs --id 3              -> só o post de feed 3
//      node scripts/publicar.mjs --so feed|story     -> só uma das partes
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
const lerJson = (p, padrao) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : padrao);

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

const hoje = agoraBR();
const alvoId = arg("--id");
const alvoData = arg("--data") || hoje.data;
const so = arg("--so");

// O agendador do GitHub chega a atrasar horas: uma rodada de reserva que caia depois da meia-noite
// não pode publicar o conteúdo do dia seguinte de madrugada.
if (env.GITHUB_EVENT_NAME === "schedule" && hoje.min < 11 * 60 + 30) {
  console.log(`Rodada agendada chegou às ${String(Math.floor(hoje.min / 60)).padStart(2, "0")}h (atrasada). Nada a fazer antes das 11h30.`);
  process.exit(0);
}

const cal = lerJson(join(ROOT, "conteudo/calendario.json"), { posts: [] });
const sts = lerJson(join(ROOT, "conteudo/stories.json"), { stories: [] });
const logPath = join(ROOT, "saida/publicados.json");
const log = lerJson(logPath, []);
const salvarLog = () => writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
const BASE = (env.MEDIA_BASE_URL || (env.IMAGE_BASE_URL || "").replace(/\/jpg\/?$/, "")).replace(/\/$/, "");

// ---------- O que há para publicar ----------
const tarefas = [];

if (so !== "story") {
  const post = alvoId ? cal.posts.find((p) => p.id === Number(alvoId)) : cal.posts.find((p) => p.data === alvoData);
  if (!post) console.log(`Feed: nenhum post programado para ${alvoData}.`);
  else if (log.some((l) => l.id === post.id)) console.log(`Feed: post ${post.id} já publicado.`);
  else {
    const reel = post.tipo === "reel";
    const arquivo = reel ? `video/${post.video}` : `jpg/${post.data}_${String(post.id).padStart(2, "0")}-${post.servico}.jpg`;
    tarefas.push({ tipo: reel ? "reel" : "feed", post, arquivo, caption: legendaCompleta(post), chave: { id: post.id } });
  }
}

if (so !== "feed" && !alvoId) {
  const st = sts.stories.find((s) => s.data === alvoData);
  if (!st) console.log(`Story: nenhum story programado para ${alvoData}.`);
  else if (log.some((l) => l.story === st.data)) console.log(`Story de ${st.data} já publicado.`);
  else tarefas.push({ tipo: "story", story: st, arquivo: `stories/${st.data}_story-${String(st.ref).padStart(2, "0")}.jpg`, chave: { story: st.data } });
}

if (!tarefas.length) { console.log("Nada a publicar."); process.exit(0); }
for (const t of tarefas) {
  if (!existsSync(join(ROOT, "saida", t.arquivo))) throw new Error(`Arquivo não encontrado: saida/${t.arquivo}. Rode scripts/render.mjs / scripts/stories.mjs.`);
  t.url = `${BASE}/${t.arquivo}`;
  console.log(`\n[${t.tipo}] ${t.url}${t.caption ? `\n---\n${t.caption}\n---` : ""}`);
}

if (DRY && !env.IG_ACCESS_TOKEN) { console.log("DRY_RUN=1 sem token: nada foi publicado."); process.exit(0); }
for (const k of ["IG_ACCESS_TOKEN"]) if (!env[k]) throw new Error(`Defina ${k}.`);
if (!BASE) throw new Error("Defina MEDIA_BASE_URL.");

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
  console.log(`DRY_RUN=1: token OK para @${conta.username}.`);
  // Só responde se o token tiver permissão de publicação.
  const { data: [cota] = [] } = await api("GET", `${env.IG_USER_ID}/content_publishing_limit`, { fields: "quota_usage,config" });
  console.log(`Permissão de publicação OK (usados ${cota?.quota_usage ?? 0} de ${cota?.config?.quota_total ?? "?"} posts nas últimas 24h). Nada foi publicado.`);
  process.exit(0);
}

// Se o agendador rodou um pouco antes, espera dar 12h em Brasília (no máximo 30 min).
if (env.WAIT_UNTIL && !alvoId && !arg("--data")) {
  const [h, m] = env.WAIT_UNTIL.split(":").map(Number);
  const falta = h * 60 + m - agoraBR().min;
  if (falta > 0 && falta <= 30) { console.log(`Aguardando ${falta} min até ${env.WAIT_UNTIL}…`); await sleep(falta * 60_000); }
}

// ---------- Publicação ----------
const primeiraLinha = (s = "") => s.split("\n")[0].trim();
let recentes = null;

async function publicar(t) {
  if (t.caption) {
    // Trava contra post duplicado no feed: confere os posts recentes no próprio Instagram.
    recentes ??= (await api("GET", `${env.IG_USER_ID}/media`, { fields: "caption,permalink,timestamp", limit: "10" })).data || [];
    const repetido = recentes.find((m) => primeiraLinha(m.caption) === primeiraLinha(t.caption));
    if (repetido) {
      console.log(`[${t.tipo}] já está no Instagram (${repetido.permalink}).`);
      log.push({ ...t.chave, data: t.post.data, tipo: t.tipo, permalink: repetido.permalink, publicado_em: repetido.timestamp });
      return salvarLog();
    }
  }
  const params =
    t.tipo === "reel" ? { media_type: "REELS", video_url: t.url, caption: t.caption, share_to_feed: "true" }
    : t.tipo === "story" ? { media_type: "STORIES", image_url: t.url }
    : { image_url: t.url, caption: t.caption };
  const { id: containerId } = await api("POST", `${env.IG_USER_ID}/media`, params);
  // Vídeo demora mais para processar: até ~10 min; imagem: até ~1 min.
  const [tentativas, espera] = t.tipo === "reel" ? [120, 5000] : [20, 3000];
  let pronto = false;
  for (let i = 0; i < tentativas; i++) {
    const { status_code, status } = await api("GET", containerId, { fields: "status_code,status" });
    if (status_code === "FINISHED") { pronto = true; break; }
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`[${t.tipo}] falha ao processar a mídia: ${status_code} ${status || ""}`);
    await sleep(espera);
  }
  if (!pronto) throw new Error(`[${t.tipo}] a mídia não terminou de processar a tempo.`);
  const { id: mediaId } = await api("POST", `${env.IG_USER_ID}/media_publish`, { creation_id: containerId });
  let permalink = null;
  try { ({ permalink } = await api("GET", mediaId, { fields: "permalink" })); } catch {}
  log.push({ ...t.chave, data: t.post?.data || t.story.data, tipo: t.tipo, media_id: mediaId, permalink, publicado_em: new Date().toISOString() });
  salvarLog();
  console.log(`✓ [${t.tipo}] publicado: ${permalink || mediaId}`);
}

// Uma falha (ex.: no story) não impede a outra parte; o job termina com erro para aparecer no GitHub.
let falhas = 0;
for (const t of tarefas) {
  try { await publicar(t); } catch (e) { falhas++; console.error(`✗ ${e.message}`); }
}
process.exit(falhas ? 1 : 0);
