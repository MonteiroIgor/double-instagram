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
- O GitHub inicia o agendamento às 11:50 e o script aguarda até 12:00. Em dias de fila alta no GitHub pode atrasar alguns minutos.
- Se um dia não tiver post no calendário, nada é publicado.
- Versão da API: padrão `v24.0`; para trocar, crie a variável do repositório `IG_API_VERSION`.
