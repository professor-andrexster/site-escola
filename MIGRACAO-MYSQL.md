# Migração: Supabase/Vercel → MySQL/VPS

Documento de planejamento. **Nada aqui foi executado.**

## Alvo

| | Hoje | Depois |
|---|---|---|
| Aplicação | Vercel | VPS `187.127.18.53`, systemd + nginx |
| Banco | Supabase (PostgreSQL) | MySQL/MariaDB |
| Autenticação | Supabase Auth | própria, sessão em cookie |
| Arquivos | Supabase Storage | disco do VPS, servido pelo nginx |
| Quiz ao vivo | Supabase Realtime | WebSocket próprio |

## O que precisa ser movido

Levantado no commit `dbde5df`:

- **43 tabelas** e 36 migrations
- **83 policies de RLS** — `alunos` (9), `cursos` (8), `profiles` (7), `storage.objects` (6)
- **6 funções** e **3 triggers** no banco
- **371 chamadas** `.from(...)` em **132 arquivos**
- **36 chamadas** de autenticação, **20** de Storage, **8** de Realtime

## O risco que domina tudo

**MySQL não tem row level security.** Hoje "aluno só vê a própria linha" é garantido pelo banco: mesmo que uma rota esqueça um filtro, o Postgres recusa. No MySQL essa rede some — cada uma das 83 regras vira `where` na aplicação, e a que passar despercebida vira aluno lendo dado de outro aluno, sem erro nenhum na tela.

Por isso a fase 3 (camada de autorização) vem **antes** da troca do banco, e não depois: o código passa a impor as regras enquanto o Postgres ainda está lá para pegar o que escapar.

## Fases

Cada fase é reversível e termina com o sistema no ar. A produção só muda na fase 7.

### Fase 0 — Inventário do dado real
Contagem de linhas por tabela, tamanho dos buckets de Storage, quantas contas existem em `auth.users`. Define o tempo de janela da virada.
**Precisa:** connection string do `diagnostico_ro`.

### Fase 1 — Schema em MySQL
Portar as 36 migrations para DDL de MySQL: `uuid` → `char(36)` ou `binary(16)`, `timestamptz` → `datetime(3)` em UTC, `jsonb` → `json`, `gen_random_uuid()` → gerado na aplicação. As 6 funções e 3 triggers viram código.
**Entrega:** um `schema.sql` que cria o banco vazio e roda limpo.

### Fase 2 — Camada de acesso a dados
Trocar as chamadas `.from(...)` por um repositório em `lib/db/`. Feito por
módulo, com o Supabase ainda ativo — nada quebra enquanto não terminar.

**Números corrigidos durante a execução.** As 371 iniciais incluíam 10 chamadas
de Storage (fase 5). O total real de banco é **358**, distribuído assim:

| Onde | Arquivos | Chamadas | Situação |
|---|---|---|---|
| Server-side (rotas, páginas) | 87 | 265 | **concluído** |
| Componentes de cliente | 33 | 93 | **concluído** |

**A fase 2 está fechada.** Não existe mais um `.from()` de tabela em página,
componente ou rota deste repositório: tudo passa por `lib/db/` (11 módulos) e,
do lado do navegador, por rotas de API com autorização explícita.
`npx tsc --noEmit` limpo, `npx next build` gera as 109 páginas, e as 5 suítes
de `tests/` passam contra o MariaDB local.

O que ainda usa o Supabase, e em qual fase cai:

| O quê | Arquivos | Fase |
|---|---|---|
| ~~Upload de imagem e arquivo (Storage)~~ | — | ~~5~~ **feito** |
| ~~Sessão, login e senha (Auth)~~ | — | ~~4~~ **feito** |
| ~~Quiz ao vivo (Realtime)~~ | — | ~~6~~ **feito** |

### O que a fase 2 corrigiu de autorização

Migrar as 93 chamadas do navegador não foi conversão mecânica: cada uma
precisou de uma regra que antes ou era só aparência da tela, ou não existia.
As que mudam comportamento:

| Onde | O que dava para fazer |
|---|---|
| `QuizPlayer` | o aluno mandava `correta` e `pontos_obtidos` prontos, e a própria `pontuacao_total` no fim — nota livre |
| `DesafioWorkspace` | entregar e dar nota eram o mesmo upsert: bastava juntar `nota` ao envio para se autoavaliar |
| `SlideViewer` / `ConteudoViewer` | `user_id` no corpo: dava para concluir aula no progresso de outro aluno (é o que libera o certificado) |
| `QuizControle` | mandava o objeto de colunas de `quizzes` — escrita livre em qualquer coluna, de qualquer quiz |
| `QuizEntrada` | `user_id` no corpo: participação e pontuação lançadas no nome de outra pessoa |
| `NoticiasTable` | o log de auditoria era escrito pelo cliente, com ação e autor à escolha de quem estava sendo auditado |
| `CursoForm` | `publicado: true` num POST direto, sem passar pela aprovação da direção |
| `IdeiasBoard` / `IdeiaDetail` | `autor_id` e `profile_id` no corpo: publicar, votar e comentar como outra pessoa |
| `DesafioWorkspace` | inscrever qualquer aluno em qualquer equipe |
| `VocacionalTest` | a pontuação por trilha ia pronta do navegador para o perfil vocacional |

Nenhuma dessas dependia de RLS para ser barrada — as policies cobriam leitura,
não a coerência do que era gravado.

**Os 93 do cliente são o custo escondido da migração.** Hoje o navegador fala
direto com o Postgres via PostgREST, e quem impede um aluno de ler dado alheio
é o RLS. Sem Supabase esse caminho deixa de existir: o navegador não alcança o
MariaDB.

Cada uma dessas chamadas precisa virar endpoint no servidor, e cada endpoint
precisa da checagem de permissão que o RLS fazia. Isso não é conversão
mecânica — é desenho de API, e é onde a fase 2 encosta na fase 3.

### Fase 3 — Autorização em código
As 83 policies viram checagem explícita, com teste por regra. **Fase mais longa e mais perigosa.** Enquanto o Postgres estiver ativo, qualquer regra esquecida ainda é barrada pelo banco — é a única janela em que o erro é visível antes de virar vazamento.

### Fase 4 — Autenticação própria — **concluída**

O Supabase Auth saiu. No lugar: token opaco de 32 bytes no cookie `jb_sessao`,
sessão na tabela `sessoes`, senha em bcrypt em `usuarios.encrypted_password`.

Nenhuma rota mudou: `lib/auth/sessao.ts` manteve as mesmas assinaturas, que era
exatamente o motivo de a costura existir desde a fase 2.

**Duas tabelas novas** (já criadas no MariaDB e no `schema.prisma`):

| Tabela | Para quê |
|---|---|
| `sessoes` | uma linha por dispositivo logado; guarda o **SHA-256** do token, nunca o token |
| `tokens_senha` | link de redefinição: vale 2h, serve uma vez, e pedir outro invalida o anterior |

**bcrypt, e não argon2**, de propósito: o Supabase guardava bcrypt. Os hashes
exportados de `auth.users` entram direto na coluna e continuam validando — é o
que permite ninguém trocar de senha na virada. Custo 10, o mesmo de lá.

**Se os hashes não vierem**, o sistema não quebra: `encrypted_password` fica
nulo, o login recusa com o motivo `conta sem senha definida` no log, e a pessoa
entra pelo fluxo de "esqueci minha senha". A decisão continua sendo do André —
depende da query em `auth.users`, que ainda não foi rodada.

**O que a fase 4 apertou em relação ao Supabase:**

- trocar a senha derruba as sessões abertas daquela conta. Lá, a sessão do
  invasor continuava valendo depois de a vítima trocar a senha;
- `banned_until` derruba a sessão em curso, não só o próximo login;
- login em conta inexistente gasta o tempo de um bcrypt — sem isso dá para
  descobrir quais e-mails existem só cronometrando a resposta;
- o motivo da recusa virou preciso no log (conta inexistente / senha errada /
  conta sem senha / conta bloqueada). O Supabase devolvia
  `Invalid login credentials` para os quatro, e foi isso que deixou dois alunos
  travados em agosto sem ninguém conseguir dizer por quê. Para quem está na
  tela, a mensagem continua sendo a mesma frase genérica.

**O middleware** agora só verifica se o cookie existe: ele roda no runtime Edge,
onde o Prisma não alcança o banco. Isso não afrouxa nada — ele nunca foi a
autorização de coisa alguma. Toda página passa por `getProfileOrRedirect` e toda
rota por `lib/apiGestao`, que leem a sessão de verdade; um cookie inventado
passa pelo middleware e é recusado uma camada abaixo (verificado no smoke test).

**E-mail de redefinição** sai pelo Resend, que já mandava o convite de
bibliotecária. Exige `RESEND_API_KEY` no `.env` de produção.

**Variáveis novas:** `AUTH_SESSION_DAYS` (opcional, padrão 7).
Não há `AUTH_SECRET`: o token é sorteado, não assinado — não há o que assinar.

**A regra de senha** estava repetida em seis rotas, todas com "mínimo 6".
Agora está só em `lib/auth/senha.ts` (`MINIMO_DE_SENHA`). Continua 6:
endurecer é decisão da direção, não efeito colateral de trocar de provedor —
mas agora é uma linha.

### Fase 5 — Arquivos — **concluída (falta mover os arquivos)**

As doze chamadas de upload viraram uma rota (`POST /api/arquivos`) e uma função
no cliente (`lib/enviarArquivo.ts`). O cliente manda a **finalidade** — uma de
seis, fechada — e o servidor decide pasta, nome e extensão.

| Finalidade | Pasta | Quem pode | Limite |
|---|---|---|---|
| `avatar` | `avatares/` | qualquer conta aprovada | 5 MB |
| `noticia` | `noticias/` | monitor ou gestão | 8 MB |
| `curso` | `cursos/` | professor, monitor ou gestão | 8 MB |
| `projeto` | `projetos/` | gestão | 8 MB |
| `obra` | `biblioteca/` | bibliotecário ou gestão | 5 MB |
| `desafio` | `desafios/` | integrante da equipe, ou quem avalia | 25 MB |

**O que a fase 5 fechou** (nada disso existia no Storage):

- **upload não tinha autorização nenhuma.** Qualquer sessão escrevia em
  qualquer bucket;
- **o caminho vinha do cliente**, com o id da pessoa no nome — dava para gravar
  em `avatars/<id de qualquer um>`;
- **o tipo era o que a extensão dissesse.** Agora sai dos bytes iniciais: um
  `.html` renomeado para `.png` é recusado;
- **não havia limite de tamanho.**

**Entrega de desafio** continua aceitando qualquer tipo — é planilha,
apresentação, protótipo zipado — mas é servida com `Content-Disposition:
attachment`. Sem isso, um HTML enviado como entrega rodaria no domínio da
escola, com acesso aos cookies de quem abrisse. O mesmo vale para tudo que vier
dos buckets antigos, que nunca validaram tipo nenhum.

**Serviço dos arquivos:** rota Next em `/arquivos/[...caminho]`, para o sistema
não depender do nginx. Na virada o nginx assume esse prefixo — que por isso já é
o definitivo, e nenhuma URL gravada no banco vai precisar mudar de novo.

**Variável nova:** `UPLOAD_ROOT` (produção: `/var/www/escola/data/uploads`).

#### O que falta: mover os arquivos

`scripts/baixar-storage.mjs` baixa os cinco buckets e imprime o SQL que reescreve
as oito colunas de URL (`profiles.avatar_url`, `alunos.foto_url`,
`noticias.imagem_url`, `cursos.capa_url`, `aulas.slides_urls`,
`projetos.imagem_url`, `entregas.arquivo_url`, `biblioteca_obras.capa_url`).

Ele preserva a estrutura original em `legado/<bucket>/<caminho>` — assim a
reescrita é troca de prefixo, não casamento arquivo a arquivo, e não colide com
os nomes novos.

**Não foi rodado:** depende de `SUPABASE_SERVICE_ROLE_KEY`, que está no desktop.
Rode primeiro com `--so-listar`, que conta e mede tudo sem baixar nada:

```bash
SUPABASE_URL=https://yxtjkorchxcjkfnbekrs.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/baixar-storage.mjs --so-listar
```

### Fase 6 — Quiz ao vivo — **concluída**

`QuizRoom` e `QuizControle` trocam a subscrição Realtime por consulta a cada
dois segundos em `GET /api/quiz/[id]/estado`.

**Polling e não WebSocket/SSE por causa do modo de falhar.** Os dois dependem de
configuração no nginx (upgrade de conexão, `proxy_buffering off`) que, se faltar
na virada, quebra em silêncio — e essa quebra acontece com a turma inteira
olhando o telão. Requisição HTTP comum não tem esse modo de falha. São ~40
alunos por sala, uma consulta leve cada.

O hook (`lib/quiz/usarEstadoDaSala.ts`) evita dois erros da versão ingênua: a
consulta seguinte só parte quando a anterior volta (senão resposta lenta empilha
requisição), e aba em segundo plano não consulta — mas ao voltar busca na hora.

A tela do aluno faz **uma** requisição por rodada: estado da sala e lista de
espera vêm juntos. Antes eram duas subscrições.

**`lib/supabase/` foi apagado.** Não há mais uma linha de Supabase em `app/`,
`components/`, `lib/` ou no middleware, e o `next build` passa sem nenhuma
variável `NEXT_PUBLIC_SUPABASE_*` — é assim que se confirma que a dependência
acabou.


### Fase 7 — Virada — **ensaiada, não executada**

O runbook completo está em **`deploy/VIRADA.md`**. Resumo do que já foi feito e
do que falta.

#### Já feito: o ensaio

Os **2.065 registros** do Supabase foram copiados para o MariaDB deste servidor
e conferidos linha a linha. O site sobe contra eles e serve conteúdo real —
notícias, cursos, quizzes, ranking, sitemap, página de curso.

Isso significa que o roteiro de dados está testado contra os dados de verdade,
não contra um banco de exemplo.

| Script | O que faz |
|---|---|
| `scripts/migrar-dados.mjs` | lê pelo `psql`, grava pelo Prisma; `--ensaio` não escreve |
| `scripts/conferir-migracao.mjs` | compara a contagem das duas pontas |
| `scripts/limpar-banco.mjs` | zera antes da importação definitiva (exige `--confirmo`) |
| `scripts/baixar-storage.mjs` | baixa os buckets e imprime o SQL das URLs |
| `deploy/escola.service` | unit do systemd (porta 3003) |
| `deploy/escola.nginx` | vhost — **não instalado** |

**Os dados reais estão no MariaDB deste servidor agora.** É o destino da
migração e o banco só aceita conexão local, mas se a migração for abandonada,
apague com `node scripts/limpar-banco.mjs --confirmo`.

#### Três decisões pendentes, nenhuma técnica

**1. As senhas.** O papel `diagnostico_ro` não alcança o schema `auth`, onde
ficam os hashes. Sem eles, `usuarios` é montada a partir de `profiles` e as
**37 contas precisam redefinir a senha**. Para evitar, exporte `auth.users` pelo
painel e passe em `CONTAS_JSON` — os hashes do Supabase são bcrypt e validam
direto, que é o motivo de a fase 4 ter usado bcrypt.

**2. Duas alunas com a mesma matrícula.**

```
ALU20260010  Daphne Ferraz Pereira
Alu20260010  Anne Pereira da Silva
```

Não é problema da migração: a collation do Postgres escondia. E **já quebra
hoje** — `normalizarMatricula` põe tudo em maiúscula antes de consultar, então
`ALU20260010` sempre acha a Daphne. A Anne não entra por matrícula, não recupera
senha por CPF e não conclui o autocadastro. A secretaria decide qual é a
correta; o script recusa rodar enquanto a colisão existir.

**3. O tamanho dos arquivos.** `scripts/baixar-storage.mjs --so-listar` conta e
mede os cinco buckets sem baixar nada. Precisa da chave de serviço, que está no
desktop.

#### O que não foi executado, e por quê

Instalar o vhost, criar o serviço, apontar o DNS e emitir o certificado mexem em
recurso compartilhado com os outros quatro sites deste servidor, ou dependem de
decisão do André. Estão escritos e comentados, prontos para rodar.

## Rollback

Até a fase 7, reverter é `git revert`. Depois da virada, é reapontar o DNS — por isso Supabase e Vercel não são desligados no mesmo dia.

## O que fica pior

Honestidade sobre o custo, para não haver surpresa:

- **Sem RLS**, a segurança passa a depender inteiramente do código
- **Sem preview por PR** — a Vercel dava um ambiente por branch de graça
- **Backup vira sua responsabilidade** (o Supabase fazia PITR sozinho)
- **Escala** — o VPS já roda 4 sistemas; a escola é a quinta carga

## O que fica melhor

- Um lugar só, controle total, sem depender de plataforma
- Banco local, sem latência de rede por consulta
- Deploy pelo mesmo caminho dos outros sistemas

## Ordem de execução

Fases 0 e 1 podem começar já. A 2 e a 3 são o volume do trabalho. A 7 exige janela combinada, de preferência fora do horário escolar.
