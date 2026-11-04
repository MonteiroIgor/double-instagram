# Posts diários · Double (@ddoublesoftware)

30 posts prontos (05/11 a 04/12/2026), um por dia às **12h de Brasília**, com arte em fundo branco/azul-gelo e legenda.

```
conteudo/calendario.json   ← textos de todos os posts (edite aqui)
scripts/render.mjs         ← gera as artes (PNG + JPG) e legendas
scripts/galeria.mjs        ← gera saida/galeria.html para revisar tudo
scripts/publicar.mjs       ← publica o post do dia via API oficial do Instagram
.github/workflows/post-diario.yml ← roda o publicar todo dia às 12h
.claude/skills/double-instagram/  ← skill do Claude para criar os próximos posts
```

## Uso no dia a dia
- Revisar: abra `saida/galeria.html`.
- Gerar novas artes depois de editar textos: `node scripts/render.mjs` (ou só alguns ids: `node scripts/render.mjs 3 7`) e `node scripts/galeria.mjs`.
- Criar o próximo mês de posts com IA: no Claude Code, dentro desta pasta, peça *"gere os próximos 30 posts da Double"* (usa o skill `double-instagram`).

## Ativar a publicação automática (uma vez só)

### 1. Conta e token do Instagram
1. O @ddoublesoftware precisa ser conta **profissional** (Empresa ou Criador): Instagram → Configurações → Tipo de conta.
2. Em [developers.facebook.com](https://developers.facebook.com/apps) crie um app do tipo **Empresa** e adicione o produto **Instagram** → "API com login do Instagram".
3. Em *Gerar tokens de acesso*, conecte o @ddoublesoftware e conceda `instagram_business_basic` e `instagram_business_content_publish`.
4. Anote o **ID da conta do Instagram** e o **token** (o token gerado ali já é de longa duração, 60 dias).

> Token de 60 dias: renove antes de vencer com
> `curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TOKEN_ATUAL"`
> e atualize o secret. Para não ter vencimento, use o login do Facebook com um *usuário do sistema* do Gerenciador de Negócios e defina a variável `IG_API_HOST=graph.facebook.com`.

### 2. Repositório no GitHub
O Instagram baixa a imagem por um link público, então o repositório precisa ser **público** (as artes ficam visíveis, o que não é problema: elas vão para o Instagram de qualquer forma). Tokens ficam em *secrets*, nunca no código.

```bash
cd double-instagram
git init && git add . && git commit -m "Calendário de posts Double"
gh repo create double-instagram --public --source . --push
gh secret set IG_USER_ID
gh secret set IG_ACCESS_TOKEN
```

### 3. Testar
No GitHub: **Actions → Post diário Instagram → Run workflow**, marque *Só simular*. Se a legenda e o link da imagem aparecerem no log, está pronto. Depois disso, o post de cada dia sai sozinho às 12h e fica registrado em `saida/publicados.json`.

Observações
- O GitHub inicia o agendamento às 11:50 e o script aguarda até 12:00. Em dias de fila alta no GitHub pode atrasar alguns minutos.
- Se um dia não tiver post no calendário, nada é publicado.
- Versão da API: padrão `v24.0`; para trocar, crie a variável do repositório `IG_API_VERSION`.
