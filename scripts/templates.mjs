// Templates visuais dos posts da Double (1080x1350, formato retrato 4:5 do Instagram).
// Paleta clara: fundo branco / azul-gelo, azul-marinho da marca só em texto e detalhes.

export const SERVICOS = {
  marca: { tag: "Marca digital", hashtags: ["#sitesprofissionais", "#linknabio", "#presencadigital", "#webdesign", "#marketingdigital"] },
  ia: { tag: "IA & automação", hashtags: ["#inteligenciaartificial", "#chatbot", "#automacao", "#IA", "#produtividade"] },
  software: { tag: "Software sob medida", hashtags: ["#softwaresobmedida", "#desenvolvimentodesoftware", "#sistemas", "#gestaoempresarial"] },
  saas: { tag: "SaaS", hashtags: ["#saas", "#produtodigital", "#startup", "#receitarecorrente"] },
  qualidade: { tag: "Qualidade de software", hashtags: ["#qualidadedesoftware", "#QA", "#testesautomatizados", "#devops"] },
  consultoria: { tag: "Consultoria de TI", hashtags: ["#consultoriadeti", "#gestaodeti", "#inovacao", "#empreendedorismo"] },
  double: { tag: "Double", hashtags: ["#softwarehouse", "#inovacao", "#empreendedorismo"] },
};
export const HASHTAGS_BASE = ["#DoubleSoftware", "#tecnologia", "#transformacaodigital"];

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// *palavra* vira destaque em azul claro da marca
const rich = (s = "") => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, "<br>");

const CSS = `
:root{
  --navy:#1E3A5F; --navy-2:#2B4A72; --sky:#2F8FC9; --sky-soft:#9FD0F0;
  --ice:#EEF6FC; --ice-2:#E1EFFA; --line:#D3E6F5; --text:#3E4C5E; --muted:#6B7A8C; --white:#FFFFFF;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Inter',system-ui,sans-serif;color:var(--text);-webkit-font-smoothing:antialiased}
.post{position:relative;width:1080px;height:1350px;padding:84px 88px 76px;display:flex;flex-direction:column;overflow:hidden}
.post.branco{background:var(--white)}
.post.gelo{background:linear-gradient(165deg,#F7FBFE 0%,var(--ice) 55%,var(--ice-2) 100%)}
.deco{position:absolute;pointer-events:none}
.deco.a{right:-250px;top:-230px;width:600px;opacity:.75}
.deco.b{left:-330px;bottom:-360px;width:620px;opacity:.6}
.dots{position:absolute;right:88px;bottom:190px;width:150px;height:110px;
  background-image:radial-gradient(var(--sky-soft) 2.2px,transparent 2.6px);background-size:22px 22px;opacity:.55}
header{position:relative;display:flex;align-items:center;justify-content:space-between}
header img{height:104px;margin:-14px 0 -14px -6px;mix-blend-mode:multiply}
.tag{font:600 22px/1 'Inter';letter-spacing:.14em;text-transform:uppercase;color:var(--sky);
  background:rgba(47,143,201,.10);border:1.5px solid rgba(47,143,201,.25);padding:14px 22px;border-radius:100px}
main{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center}
h1{font-family:'Sora',sans-serif;font-weight:700;color:var(--navy);letter-spacing:-.025em;line-height:1.06}
h1 em,.big em,.quote em{font-style:normal;color:var(--sky);
  background:linear-gradient(transparent 68%,rgba(159,208,240,.45) 68%,rgba(159,208,240,.45) 92%,transparent 92%)}
.sub{font-size:36px;line-height:1.45;color:var(--text);margin-top:40px;max-width:860px}
.kicker{font:600 24px/1 'Inter';letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:30px;display:flex;align-items:center;gap:16px}
.kicker:before{content:"";width:48px;height:3px;background:var(--sky);border-radius:3px}
footer{position:relative;display:flex;align-items:center;justify-content:space-between;
  padding-top:30px;border-top:2px solid var(--line);font:600 25px/1 'Inter';color:var(--navy)}
footer .cta{display:flex;align-items:center;gap:12px;color:var(--white);background:var(--navy);padding:16px 26px;border-radius:100px;font-size:23px}
footer .cta svg{width:22px;height:22px}

/* hook */
.hook h1{font-size:86px}
/* lista */
.lista h1{font-size:68px;margin-bottom:46px}
.items{display:flex;flex-direction:column;gap:20px}
.item{display:flex;gap:28px;align-items:flex-start;background:var(--white);border:2px solid var(--line);border-radius:28px;padding:28px 32px;box-shadow:0 10px 30px -18px rgba(30,58,95,.25)}
.post.branco .item{background:#FAFCFE}
.num{flex:none;width:62px;height:62px;border-radius:18px;background:var(--ice-2);color:var(--sky);
  font:700 30px/62px 'Sora';text-align:center}
.item b{display:block;font:600 33px/1.2 'Sora';color:var(--navy);letter-spacing:-.01em}
.item span{display:block;font-size:26px;line-height:1.4;color:var(--muted);margin-top:8px}
/* numero */
.numero main{align-items:flex-start}
.big{font:800 300px/0.9 'Sora';letter-spacing:-.05em;color:var(--sky);margin-bottom:26px;
  background:linear-gradient(180deg,#5FB0E0 0%,var(--sky) 60%,#2577AB 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.numero h1{font-size:64px;max-width:880px}
/* comparativo */
.comparativo h1{font-size:70px;margin-bottom:48px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.col{border-radius:30px;padding:36px 32px}
.col.antes{background:#F3F5F8;border:2px dashed #CBD3DD}
.col.depois{background:var(--white);border:2.5px solid var(--sky);box-shadow:0 22px 40px -24px rgba(47,143,201,.45)}
.col h3{font:700 27px/1 'Sora';text-transform:uppercase;letter-spacing:.08em;margin-bottom:28px}
.col.antes h3{color:#8592A3}.col.depois h3{color:var(--sky)}
.col li{list-style:none;display:flex;gap:16px;font-size:28px;line-height:1.35;margin-bottom:24px;color:var(--text)}
.col.antes li{color:#6E7C8E}
.col li i{flex:none;width:36px;height:36px;border-radius:50%;font:700 20px/36px 'Inter';text-align:center;font-style:normal;margin-top:1px}
.col.antes li i{background:#E1E6EC;color:#8592A3}
.col.depois li i{background:var(--sky);color:#fff}
/* dica */
.quote-mark{font:800 220px/0.7 'Sora';color:var(--sky-soft);height:120px}
.quote{font:600 66px/1.22 'Sora';color:var(--navy);letter-spacing:-.02em}
.assin{margin-top:46px;display:flex;align-items:center;gap:18px;font:600 26px/1 'Inter';color:var(--muted)}
.assin b{width:14px;height:14px;background:var(--sky);transform:rotate(45deg);border-radius:3px}
/* cta */
.cta-post main{align-items:center;text-align:center}
.cta-post .logo-big{width:520px;mix-blend-mode:multiply;margin-bottom:56px}
.cta-post h1{font-size:76px}
.cta-post .sub{margin:34px auto 0}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-top:50px;max-width:900px}
.chip{font:600 24px/1 'Inter';color:var(--navy);background:var(--white);border:2px solid var(--line);padding:16px 24px;border-radius:100px}
`;

// Hexágono "pointy-top" inspirado no símbolo da logo (meia face marinho, meia face azul).
const hex = (cls, stroke1, stroke2) => `
<svg class="deco ${cls}" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 12 L186 62 L186 168 L100 218" fill="none" stroke="${stroke2}" stroke-width="14" stroke-linejoin="round"/>
  <path d="M100 218 L14 168 L14 62 L100 12" fill="none" stroke="${stroke1}" stroke-width="14" stroke-linejoin="round"/>
  <path d="M100 58 L146 84 L146 146 L100 172 L54 146 L54 84 Z" fill="none" stroke="${stroke1}" stroke-width="6" stroke-linejoin="round" opacity=".7"/>
</svg>`;

const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function corpo(p) {
  switch (p.modelo) {
    case "hook":
      return `${p.kicker ? `<div class="kicker">${esc(p.kicker)}</div>` : ""}
        <h1>${rich(p.titulo)}</h1>${p.subtitulo ? `<p class="sub">${rich(p.subtitulo)}</p>` : ""}`;
    case "lista":
      return `<h1>${rich(p.titulo)}</h1><div class="items">${p.itens
        .map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div><b>${esc(it.t)}</b>${it.d ? `<span>${esc(it.d)}</span>` : ""}</div></div>`)
        .join("")}</div>`;
    case "numero":
      return `<div class="big">${esc(p.numero)}</div><h1>${rich(p.titulo)}</h1>${p.subtitulo ? `<p class="sub">${rich(p.subtitulo)}</p>` : ""}`;
    case "comparativo":
      return `<h1>${rich(p.titulo)}</h1><div class="cols">
        <div class="col antes"><h3>${esc(p.antes.titulo)}</h3><ul>${p.antes.itens.map((t) => `<li><i>✕</i>${esc(t)}</li>`).join("")}</ul></div>
        <div class="col depois"><h3>${esc(p.depois.titulo)}</h3><ul>${p.depois.itens.map((t) => `<li><i>✓</i>${esc(t)}</li>`).join("")}</ul></div></div>`;
    case "dica":
      return `<div class="quote-mark">“</div><p class="quote">${rich(p.titulo)}</p>
        <div class="assin"><b></b>${esc(p.assinatura || "Dica Double")}</div>`;
    case "cta":
      return `<img class="logo-big" src="{{LOGO}}" alt="Double"><h1>${rich(p.titulo)}</h1>
        ${p.subtitulo ? `<p class="sub">${rich(p.subtitulo)}</p>` : ""}
        <div class="chips">${(p.chips || []).map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>`;
    default:
      throw new Error(`Modelo desconhecido: ${p.modelo}`);
  }
}

export function renderPost(p, logoSrc) {
  const servico = SERVICOS[p.servico] || SERVICOS.double;
  const fundo = p.fundo || "branco";
  const classe = p.modelo === "cta" ? "cta-post" : p.modelo;
  const header =
    p.modelo === "cta"
      ? `<header><span></span><span class="tag">${esc(servico.tag)}</span></header>`
      : `<header><img src="{{LOGO}}" alt="Double"><span class="tag">${esc(servico.tag)}</span></header>`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="post ${fundo} ${classe}">
  ${hex("a", "#D9EAF7", "#BFDDF2")}${hex("b", "#E3EFF9", "#D3E7F6")}<div class="dots"></div>
  ${header}
  <main>${corpo(p)}</main>
  <footer><span>@ddoublesoftware</span><span class="cta">${esc(p.rodape || "Saiba mais no link da bio")}${arrow}</span></footer>
</div></body></html>`;
  return html.replaceAll("{{LOGO}}", logoSrc);
}

export function legendaCompleta(p) {
  const servico = SERVICOS[p.servico] || SERVICOS.double;
  const tags = [...HASHTAGS_BASE, ...servico.hashtags].join(" ");
  return `${p.legenda.trim()}\n\n${tags}`;
}
