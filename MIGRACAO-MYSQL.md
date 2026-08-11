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
| Sessão, login e senha (Auth) | `lib/auth/sessao.ts` + 3 telas | 4 |
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

### Fase 4 — Autenticação própria
Substituir Supabase Auth: sessão assinada em cookie, hash de senha com bcrypt/argon2, recuperação por token. O `porto-sistema` já faz exatamente isso (`AUTH_SECRET`, `AUTH_SESSION_DAYS`) — o padrão é reaproveitável.
**Detalhe crítico:** as senhas em `auth.users` são hashes bcrypt do Supabase. Se forem exportadas junto, ninguém precisa trocar de senha. Se não, todo mundo troca.

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
