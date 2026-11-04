---
name: double-instagram
description: Cria e programa posts diários do Instagram da Double (@ddoublesoftware) com arte no padrão da marca (fundo branco/azul-gelo) e legenda chamativa. Use para "gerar próximos posts", "criar post sobre X", "trocar o post de amanhã", "ver calendário" ou "publicar agora".
---

# Posts diários da Double

Projeto: a pasta onde está este skill (`double-instagram/`). Tudo gira em torno de `conteudo/calendario.json`.

## Marca
- Paleta clara: fundo `branco` ou `gelo` (alternar dia a dia). Azul-marinho `#1E3A5F` só em títulos e botões; azul `#2F8FC9` só para destaques (`*palavra*`). Nunca fundo azul forte.
- Tom: direto, próximo, sem jargão; fala com donos de pequenas e médias empresas. Português do Brasil.
- Nunca inventar números, estatísticas, clientes ou depoimentos. Números só se forem verdade óbvia (24/7, 12 meses) ou ilustrativos sem afirmar dado de mercado.
- Serviços (campo `servico`): `marca` (site + página de link na bio), `ia` (chatbots, automações, rotinas, integrações), `software` (sob demanda), `saas`, `qualidade` (QA e testes), `consultoria` (TI), `double` (institucional).

## Formato de cada post
Campos comuns: `id` (sequencial), `data` (AAAA-MM-DD, um por dia), `servico`, `modelo`, `fundo`, `legenda`, opcional `rodape` (texto do botão, ex.: "Salve este post").
- `hook`: `titulo` (até ~60 caracteres, use `\n` para quebrar), `subtitulo`, opcional `kicker`.
- `lista`: `titulo` + `itens` (3 ou 4, cada `{t, d}`; `t` até ~32 caracteres, `d` até ~55).
- `numero`: `numero` (até 4 caracteres), `titulo`, `subtitulo`.
- `comparativo`: `titulo`, `antes {titulo, itens[3-4]}`, `depois {titulo, itens[3-4]}`; itens até ~35 caracteres.
- `dica`: `titulo` (frase de até ~120 caracteres), `assinatura`.
- `cta`: `titulo`, `subtitulo`, `chips` (lista de serviços).
Legenda: gancho na 1ª linha, 3 a 6 parágrafos curtos, emojis com moderação, um CTA no fim (comentar palavra-chave, salvar, direct ou link da bio). Não escrever hashtags: elas são adicionadas automaticamente por serviço.

## Gerar os próximos posts
1. Leia `conteudo/calendario.json`, veja o último `id` e a última `data`.
2. Crie N posts novos (padrão 30) a partir do dia seguinte, girando os 6 serviços e os modelos, sem repetir títulos/ganchos já usados. Use temas da época (datas comemorativas, fim de ano, Black Friday) quando couber.
3. Acrescente ao `posts` (não altere posts já publicados, listados em `saida/publicados.json`).
4. Rode `node scripts/render.mjs <ids novos>` e depois `node scripts/galeria.mjs`.
5. Abra 2 ou 3 PNGs novos para conferir se nenhum texto estourou o espaço; encurte o texto se precisar.
6. Mostre a `saida/galeria.html` ao usuário e só faça commit/push quando ele aprovar (o GitHub Actions publica o que estiver no repositório).

## Outras tarefas
- Trocar o post de um dia: edite o item daquela `data`, renderize só aquele `id`.
- Publicar agora: `node scripts/publicar.mjs --id N` (precisa das variáveis do README) ou rode o workflow manualmente no GitHub com a data.
- Simular: `DRY_RUN=1 node scripts/publicar.mjs --data AAAA-MM-DD`.
