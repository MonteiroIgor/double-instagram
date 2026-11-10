# Posts e stories · Double (@ddoublesoftware)

Rotina (12h de Brasília):
- **Feed:** terça e quinta (imagem ou Reel), em `conteudo/calendario.json`.
- **Stories:** todo dia, em `conteudo/stories.json` (arte vertical 1080x1920 feita a partir da arte de um post).

```
conteudo/calendario.json   ← textos de todos os posts (edite aqui)
conteudo/stories.json      ← um story por dia (data + post de referência + selo)
scripts/render.mjs         ← gera as artes (PNG + JPG) e legendas
scripts/stories.mjs        ← gera as imagens dos stories (saida/stories)
scripts/galeria.mjs        ← gera saida/galeria.html para revisar tudo
scripts/publicar.mjs       ← publica o feed (se houver) e o story do dia via API oficial
.github/workflows/post-diario.yml ← roda o publicar todo dia às 12h (disparado pelo cron-job.org às 11:57)
.claude/skills/double-instagram/  ← skill do Claude para criar os próximos posts
```

## Uso no dia a dia
- Revisar: abra `saida/galeria.html`.
- Gerar novas artes depois de editar textos: `node scripts/render.mjs` (ou só alguns ids: `node scripts/render.mjs 3 7`) e `node scripts/galeria.mjs`.
- Criar o próximo mês de posts com IA: no Claude Code, dentro desta pasta, peça *"gere os próximos 30 posts da Double"* (usa o skill `double-instagram`).

## Ativar a publicação automática (uma vez só)

### 1. Token do Instagram (usuário do sistema, não expira)
Apps criados a partir de out/2026 usam o "login unificado" da Meta; o caminho mais simples é um **usuário do sistema** no portfólio empresarial.

1. O @ddoublesoftware precisa ser conta **profissional** (Instagram → Configurações → Tipo de conta).
2. Em [business.facebook.com/settings](https://business.facebook.com/settings) (entre com o seu Facebook), crie ou abra o portfólio da Double.
3. **Contas → Contas do Instagram → Adicionar**: conecte o @ddoublesoftware (login do Instagram).
4. **Contas → Apps**: confira se o app criado em developers.facebook.com aparece; se não, adicione pelo ID do app.
5. **Usuários → Usuários do sistema → Adicionar**: nome `double-bot`, função Administrador.
6. Nesse usuário, **Atribuir ativos**: a conta do Instagram (controle total) e o app.
7. **Gerar token**: escolha o app, validade **Nunca**, permissões `instagram_basic`, `instagram_content_publish` e `business_management`. Copie o token.

O ID da conta é descoberto automaticamente pelo script; não precisa cadastrar `IG_USER_ID`.

> Apps antigos com "API com login do Instagram": use o token de lá, cadastre também `IG_USER_ID` e crie a variável do repositório `IG_API_HOST=graph.instagram.com` (esse token vence em 60 dias).

### 2. Repositório no GitHub
O Instagram baixa a imagem por um link público, então o repositório precisa ser **público** (as artes ficam visíveis, o que não é problema: elas vão para o Instagram de qualquer forma). Tokens ficam em *secrets*, nunca no código.

```bash
cd double-instagram
git init && git add . && git commit -m "Calendário de posts Double"
gh repo create double-instagram --public --source . --push
gh secret set IG_ACCESS_TOKEN
```

### 3. Testar
No GitHub: **Actions → Post diário Instagram → Run workflow**, marque *Só simular*. Com o token cadastrado, o log mostra `token OK para @ddoublesoftware` sem publicar nada. Depois disso, o post de cada dia sai sozinho às 12h e fica registrado em `saida/publicados.json`.

Observações
- O GitHub inicia o agendamento às 11:50 e o script aguarda até 12:00. Como o agendador do GitHub às vezes atrasa ou pula execuções, há rodadas de reserva às 12:17, 12:43, 13:23, 14:37 e 17:07: se o post do dia já saiu, elas não fazem nada.
- Se um dia não tiver post no calendário, nada é publicado.
- Versão da API: padrão `v24.0`; para trocar, crie a variável do repositório `IG_API_VERSION`.

## Reels

Coloque o vídeo (MP4 H.264, vertical 1080x1920, até 90 s) em `saida/video/` e adicione ao `calendario.json` um item com
`"tipo": "reel"`, `"video": "<arquivo>.mp4"`, `servico`, `titulo` e `legenda`. O vídeo é enviado ao Instagram pelo jsDelivr
(que serve `video/mp4`), fixado no commit da execução.
