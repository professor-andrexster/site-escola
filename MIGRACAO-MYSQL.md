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
| Upload de imagem e arquivo (Storage) | 10 componentes | 5 |
| ~~Sessão, login e senha (Auth)~~ | — | ~~4~~ **feito** |
| Quiz ao vivo (Realtime) | `QuizControle`, `QuizRoom` | 6 |

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

### Fase 5 — Arquivos
Baixar os buckets, servir de `/var/www/escola/data/uploads` pelo nginx, reescrever as 20 chamadas de upload.

### Fase 6 — Quiz ao vivo
Substituir o Realtime. No VPS, WebSocket próprio funciona; a alternativa é polling a cada 2s.

### Fase 7 — Virada
1. Congelar escritas (aviso no painel)
2. Exportar Postgres → transformar → importar MySQL
3. Apontar DNS `escolaestadualdrjoaoberaldo.com` para `187.127.18.53`
4. Certbot, nginx, systemd — mesmo padrão dos outros 4 sistemas
5. Smoke test: login, perfil, quiz, biblioteca, certificado, portfólio
6. Supabase e Vercel ficam intocados por 30 dias, como rollback

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
