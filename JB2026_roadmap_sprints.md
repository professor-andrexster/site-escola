# 🏫 JB2026 — Roadmap Completo de Sprints
## E.E. Dr. João Beraldo | Carlos Chagas-MG | EMTI

> **Regra absoluta:** Nenhum bloco executa código. Cada sprint é um **prompt pronto para o Claude Code**.
> Stack: Next.js App Router + TypeScript + Tailwind CSS + Supabase + Vercel

---

## 🗺️ VISÃO GERAL DOS SPRINTS

| Sprint | Tema | Impacto | Risco de regressão |
|--------|------|---------|-------------------|
| S0 | Base de dados dos alunos (CRUD + Supabase) | Alto | Baixo (novo) |
| S1 | Teste vocacional + perfil de competências | Alto | Baixo (novo) |
| S2 | Portfólio digital por aluno (trilhas: Excel, HW, SW, Design, Código) | Alto | Baixo (novo) |
| S3 | Vitrine pública de projetos (economia circular / divulgação) | Médio | Baixo (novo) |
| S4 | Página de divulgação do curso TI para Carlos Chagas | Médio | Médio (toca `/emti`) |
| S5 | QA Final — mobile + desktop + regressão de tudo | — | — |

---

## ⚙️ SPRINT 0 — Base de Dados dos Alunos (Supabase + CRUD Admin)

> **Objetivo:** Criar a fundação de dados dos alunos. Tudo que vem depois depende disso.

---

### 📋 PROMPT S0-A — Migration Supabase (tabelas + RLS)

**Arquivo(s) alvo:** `supabase/migrations/001_alunos_base.sql` (criar novo)

**Tarefa:**
Criar migration SQL completa no Supabase com as seguintes tabelas e políticas RLS:

```sql
-- 1. Tabela principal de alunos
CREATE TABLE alunos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            varchar(120) NOT NULL,
  matricula       varchar(20) UNIQUE NOT NULL,
  turma           varchar(10) NOT NULL,    -- ex: 1A, 1B, 2A, 2B, 3A
  serie           varchar(20) NOT NULL,    -- 1° ano | 2° ano | 3° ano
  turno           varchar(15) NOT NULL,    -- integral
  data_nascimento date,
  cpf             varchar(14),
  responsavel     varchar(120),
  telefone        varchar(20),
  email           varchar(100),
  foto_url        varchar(300),
  ativo           boolean DEFAULT true,
  criado_em       timestamp DEFAULT now(),
  atualizado_em   timestamp DEFAULT now()
);

-- 2. Tabela de competências mapeadas (trilhas)
CREATE TABLE trilhas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        varchar(60) NOT NULL,  -- Excel | Hardware | Software | Design | Programação
  descricao   text,
  icone       varchar(10),           -- emoji
  cor_tailwind varchar(30)           -- ex: blue-600
);

-- Seeds iniciais das trilhas
INSERT INTO trilhas (nome, descricao, icone, cor_tailwind) VALUES
  ('Excel & Dados',    'Planilhas, análise de dados, automação com fórmulas', '📊', 'green-600'),
  ('Hardware',         'Montagem, manutenção, redes físicas, eletrônica básica', '🖥️', 'orange-600'),
  ('Software',         'Instalação, configuração, suporte técnico, SO', '⚙️', 'gray-600'),
  ('Design Digital',   'Canva, Figma, identidade visual, criação de conteúdo', '🎨', 'pink-600'),
  ('Programação',      'Lógica, HTML/CSS, Python, criação de sistemas', '💻', 'blue-600');

-- 3. RLS
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

-- Apenas admin autenticado pode ler/escrever alunos
CREATE POLICY "admin_full_access" ON alunos
  FOR ALL USING (auth.role() = 'authenticated');

-- Leitura pública apenas do nome e matricula (para quiz, ranking)
CREATE POLICY "public_read_nome" ON alunos
  FOR SELECT USING (true);

ALTER TABLE trilhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trilhas_public_read" ON trilhas FOR SELECT USING (true);
CREATE POLICY "trilhas_admin_write" ON trilhas FOR ALL USING (auth.role() = 'authenticated');
```

**Contexto necessário:** Abrir `src/lib/supabase.ts` para confirmar client já configurado.

**Restrições:**
- Não alterar nenhum arquivo existente — apenas criar a migration
- Usar `gen_random_uuid()` (padrão Supabase)
- RLS obrigatório em todas as tabelas

**Resultado esperado:** Migration aplicável via `supabase db push` sem erros. Tabelas visíveis no dashboard Supabase.

**Teste de regressão:** Rodar `npm run build` após criar apenas os arquivos SQL — nenhum componente existente deve ser afetado.

**Comandos pós-edição:**
```bash
supabase db push
npm run build
```

---

### 📋 PROMPT S0-B — Página Admin: Listagem de Alunos

**Arquivo(s) alvo:** `src/app/admin/alunos/page.tsx` (criar novo)

**Tarefa:**
Criar página de listagem de alunos com:
- Tabela responsiva (cards no mobile, tabela no desktop)
- Filtros: Turma (dropdown), Série (dropdown), Ativo/Inativo (toggle)
- Busca por nome ou matrícula (input com debounce 300ms)
- Botão "Novo Aluno" → link para `/admin/alunos/novo`
- Cada linha/card com link para `/admin/alunos/[id]`
- Loading skeleton enquanto carrega
- Estado vazio quando não há alunos ("Nenhum aluno cadastrado ainda")

**Contexto necessário:** Ler `src/app/admin/page.tsx` para herdar layout/navbar do admin.

**Restrições:**
- Tailwind CSS apenas
- Mobile-first: cards empilhados em mobile, tabela em `md:`
- Usar `@supabase/supabase-js` client-side com `useEffect`
- Paleta: blue-700/blue-800 primário, yellow-400 destaque, gray-900 texto
- Não alterar `/admin/page.tsx`
- Proteger rota: redirecionar para `/admin` se não autenticado (usar `supabase.auth.getSession()`)

**Resultado esperado:**
- Página `/admin/alunos` carrega lista de alunos do Supabase
- Filtros funcionam sem reload
- Responsiva em 375px e 1280px

**Teste de regressão:**
```bash
# Após criar o arquivo, verificar:
npm run build
# Acessar /admin e confirmar que link para /alunos aparece sem erro 404
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

### 📋 PROMPT S0-C — Formulário Novo Aluno

**Arquivo(s) alvo:** `src/app/admin/alunos/novo/page.tsx` (criar novo)

**Tarefa:**
Criar formulário de cadastro de novo aluno com:
- Campos obrigatórios: nome, matrícula, turma (select: 1A/1B/2A/2B/3A/3B), série (select), turno (fixo: integral)
- Campos opcionais: data_nascimento, responsável, telefone, email
- Validação client-side antes de submeter (campos obrigatórios, formato telefone)
- Feedback visual: borda vermelha em campo inválido + mensagem de erro inline
- Submit → INSERT no Supabase → redirect para `/admin/alunos` com toast "Aluno cadastrado com sucesso!"
- Botão "Cancelar" → volta para listagem

**Contexto necessário:** Ler `src/app/admin/alunos/page.tsx` para manter consistência visual.

**Restrições:**
- Sem `react-hook-form` — usar `useState` simples para manter bundle leve
- Sem `<form>` HTML nativo — usar `<div>` com `onClick` no botão
- Tailwind apenas
- Mobile-first
- Tratar erro de matrícula duplicada (mostrar: "Matrícula já cadastrada")

**Resultado esperado:**
- Formulário em `/admin/alunos/novo` funcional
- Dados salvos no Supabase com sucesso
- Redirect automático após cadastro

**Teste de regressão:**
```bash
npm run build
# Testar: preencher form → salvar → conferir no Supabase Dashboard
# Testar: submeter form vazio → ver erros de validação
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

## 🧠 SPRINT 1 — Teste Vocacional + Perfil de Competências

> **Objetivo:** Cada aluno responde um questionário breve e recebe um perfil indicando as trilhas com mais afinidade. Isso alimenta a base de dados para orientação profissional.

---

### 📋 PROMPT S1-A — Migration: tabela de perfis vocacionais

**Arquivo(s) alvo:** `supabase/migrations/002_vocacional.sql` (criar novo)

**Tarefa:**
```sql
-- Respostas do teste vocacional por aluno
CREATE TABLE perfis_vocacionais (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id        uuid REFERENCES alunos(id) ON DELETE CASCADE,
  trilha_id       uuid REFERENCES trilhas(id),
  pontuacao       int NOT NULL DEFAULT 0,  -- 0 a 100
  atualizado_em   timestamp DEFAULT now(),
  UNIQUE(aluno_id, trilha_id)
);

-- Log do teste (quando foi feito)
CREATE TABLE testes_vocacionais (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id    uuid REFERENCES alunos(id) ON DELETE CASCADE,
  respostas   jsonb NOT NULL,   -- array de { pergunta_id, resposta }
  realizado_em timestamp DEFAULT now()
);

ALTER TABLE perfis_vocacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pv_admin_full" ON perfis_vocacionais FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "pv_public_read" ON perfis_vocacionais FOR SELECT USING (true);

ALTER TABLE testes_vocacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tv_admin_full" ON testes_vocacionais FOR ALL USING (auth.role() = 'authenticated');
```

**Restrições:** Migration apenas — sem tocar em arquivos Next.js.

**Comandos:**
```bash
supabase db push && npm run build
```

---

### 📋 PROMPT S1-B — Página do Teste Vocacional (aluno)

**Arquivo(s) alvo:** `src/app/vocacional/page.tsx` (criar novo)

**Tarefa:**
Criar página pública de teste vocacional com:

**Fluxo:**
1. Aluno digita a matrícula → sistema busca o nome no Supabase para confirmar identidade
2. Exibe 15 perguntas de múltipla escolha (5 por grupo de trilhas), uma por vez, com barra de progresso
3. Cada resposta tem peso (1-3 pts) associado a uma ou mais trilhas
4. No final, calcula pontuação por trilha → salva em `perfis_vocacionais`
5. Exibe resultado: cards das 3 trilhas com maior pontuação, com descrição e próximos passos

**Perguntas base (incluir no código como array constante):**
```typescript
const PERGUNTAS = [
  { id: 1, texto: "Você gosta de organizar dados em tabelas e encontrar padrões?", pesos: { "Excel & Dados": 3, "Programação": 1 } },
  { id: 2, texto: "Prefere trabalhar com peças físicas, montar e desmontar equipamentos?", pesos: { "Hardware": 3, "Software": 1 } },
  { id: 3, texto: "Gosta de criar layouts, escolher cores e fazer coisas bonitas visualmente?", pesos: { "Design Digital": 3 } },
  { id: 4, texto: "Fica curioso quando um programa trava — quer entender o porquê?", pesos: { "Software": 3, "Programação": 2 } },
  { id: 5, texto: "Já tentou criar um site, app ou script por conta própria?", pesos: { "Programação": 3 } },
  { id: 6, texto: "Consegue explicar para outras pessoas como usar um computador?", pesos: { "Software": 2, "Hardware": 1 } },
  { id: 7, texto: "Usa planilhas para controlar gastos, notas ou qualquer coisa pessoal?", pesos: { "Excel & Dados": 3 } },
  { id: 8, texto: "Já editou uma foto, vídeo ou fez um cartaz digital?", pesos: { "Design Digital": 3, "Software": 1 } },
  { id: 9, texto: "Se um computador der problema, você tenta resolver antes de pedir ajuda?", pesos: { "Hardware": 2, "Software": 2 } },
  { id: 10, texto: "Tem interesse em entender como a internet funciona por dentro?", pesos: { "Programação": 2, "Hardware": 2, "Software": 1 } },
  { id: 11, texto: "Gosta de seguir instruções passo a passo com precisão?", pesos: { "Excel & Dados": 2, "Software": 2 } },
  { id: 12, texto: "Prefere criar algo do zero a consertar algo existente?", pesos: { "Programação": 2, "Design Digital": 2 } },
  { id: 13, texto: "Trabalha bem com números e lógica matemática?", pesos: { "Programação": 2, "Excel & Dados": 2 } },
  { id: 14, texto: "Você se importa com a aparência e usabilidade dos aplicativos que usa?", pesos: { "Design Digital": 3, "Programação": 1 } },
  { id: 15, texto: "Quer trabalhar consertando computadores de empresas ou pessoas?", pesos: { "Hardware": 3, "Software": 2 } },
]
```

**Design:**
- Fundo `gray-950`, cards `gray-900`, texto branco — visual moderno para engajar alunos
- Barra de progresso no topo (`bg-yellow-400`)
- Botões de resposta: Sim (verde) / Às vezes (amarelo) / Não (vermelho)
- Tela de resultado: ícone + cor da trilha + botão "Ver meu portfólio"

**Contexto necessário:** Ler `src/lib/supabase.ts`

**Restrições:**
- Página pública (sem autenticação obrigatória)
- Mobile-first obrigatório (alunos usam celular)
- Sem bibliotecas externas
- Não alterar nenhuma página existente

**Resultado esperado:**
- Aluno acessa `/vocacional`, faz o teste, vê seu perfil de trilhas
- Resultado salvo no Supabase em `perfis_vocacionais`

**Teste de regressão:**
```bash
npm run build
# Verificar: / /sobre /emti /noticias /contato /admin → nenhuma página quebrada
# Testar /vocacional em 375px (mobile) e 1280px (desktop)
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

## 📁 SPRINT 2 — Portfólio Digital por Aluno

> **Objetivo:** Cada aluno tem uma página pública com seus projetos organizados por trilha. Funciona como CV digital para o mercado de trabalho local.

---

### 📋 PROMPT S2-A — Migration: tabela de projetos

**Arquivo(s) alvo:** `supabase/migrations/003_projetos.sql` (criar novo)

**Tarefa:**
```sql
CREATE TABLE projetos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      uuid REFERENCES alunos(id) ON DELETE CASCADE,
  trilha_id     uuid REFERENCES trilhas(id),
  titulo        varchar(120) NOT NULL,
  descricao     text,
  imagem_url    varchar(300),
  link_externo  varchar(300),   -- GitHub, Canva, Google Sheets público, etc.
  tags          text[],         -- ex: {'python', 'excel', 'canva'}
  destaque      boolean DEFAULT false,
  criado_em     timestamp DEFAULT now(),
  serie_na_epoca varchar(20)    -- em qual série estava quando fez
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projetos_public_read" ON projetos FOR SELECT USING (true);
CREATE POLICY "projetos_admin_write" ON projetos FOR ALL USING (auth.role() = 'authenticated');
```

**Comandos:**
```bash
supabase db push && npm run build
```

---

### 📋 PROMPT S2-B — Portfólio Público do Aluno

**Arquivo(s) alvo:** `src/app/portfolio/[matricula]/page.tsx` (criar novo)

**Tarefa:**
Criar página pública de portfólio do aluno acessível via `escolaestadualdrjoaoberaldo.com/portfolio/123456`:

**Seções da página:**
1. **Header do aluno:** nome, turma/série, foto (ou avatar com inicial), badge das trilhas com maior pontuação
2. **Perfil de Competências:** mini gráfico de barras horizontal mostrando pontuação em cada trilha (sem biblioteca de gráfico — usar `div` com `width` dinâmico em Tailwind)
3. **Projetos por Trilha:** tabs ou filtro por trilha → cards de projetos com: título, descrição, tags, link externo (GitHub/Canva/etc.), data
4. **Footer do portfólio:** "Aluno da E.E. Dr. João Beraldo | Carlos Chagas-MG | EMTI {ano_conclusao}"

**Lógica de dados:**
```typescript
// Buscar por matrícula:
const { data: aluno } = await supabase
  .from('alunos')
  .select('*, perfis_vocacionais(pontuacao, trilhas(nome, icone, cor_tailwind))')
  .eq('matricula', params.matricula)
  .single()

const { data: projetos } = await supabase
  .from('projetos')
  .select('*, trilhas(nome, icone)')
  .eq('aluno_id', aluno.id)
  .order('criado_em', { ascending: false })
```

**Restrições:**
- Página pública — sem autenticação
- SSR com `generateStaticParams` para performance (pre-render das matrículas ativas)
- Mobile-first
- Sem bibliotecas de gráfico — barras em CSS puro
- Paleta neutra para portfólio profissional: branco/cinza com acentos na cor da trilha

**Resultado esperado:**
- Acesso via `/portfolio/[matricula]` mostra portfólio do aluno
- Funciona como link compartilhável (WhatsApp, LinkedIn, currículo)

**Teste de regressão:**
```bash
npm run build
# Verificar que SSG não quebrou outras rotas
# Testar /portfolio/[matricula-inexistente] → mostrar "Aluno não encontrado" (404 gracioso)
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

### 📋 PROMPT S2-C — Admin: Gerenciar Projetos do Aluno

**Arquivo(s) alvo:** `src/app/admin/alunos/[id]/projetos/page.tsx` (criar novo)

**Tarefa:**
Criar página admin para adicionar/editar/remover projetos de um aluno específico:
- Header: nome do aluno + botão "Voltar para perfil"
- Lista de projetos existentes com botões Editar e Excluir
- Botão "+ Adicionar Projeto" → abre modal inline (sem página nova)
- Modal de projeto: título, trilha (select), descrição, link externo, tags (input com chips), marcar como destaque
- Upload de imagem via Supabase Storage (`bucket: projetos`) — opcional
- Salvar → INSERT/UPDATE na tabela `projetos`

**Restrições:**
- Modal com `useState` simples (sem biblioteca de modal)
- Upload de imagem: `supabase.storage.from('projetos').upload()`
- Não alterar `/admin/alunos/[id]/page.tsx` — apenas adicionar link para esta nova página

**Resultado esperado:**
- Professor consegue cadastrar projetos de alunos direto no admin
- Projetos aparecem imediatamente no portfólio público

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

## 🌐 SPRINT 3 — Vitrine Pública de Projetos (Economia Circular)

> **Objetivo:** Página pública no site da escola mostrando os melhores projetos dos alunos. Serve para divulgar o EMTI, atrair empresas locais e mostrar o trabalho para a comunidade de Carlos Chagas.

---

### 📋 PROMPT S3-A — Página /projetos (vitrine pública)

**Arquivo(s) alvo:** `src/app/projetos/page.tsx` (criar novo)

**Tarefa:**
Criar página pública de vitrine dos projetos dos alunos:

**Layout:**
- Hero: título "Projetos dos Alunos JB2026" + subtítulo + contador de projetos publicados
- Filtro por trilha (5 pills: Excel, Hardware, Software, Design, Programação) + "Todos"
- Grid de cards: imagem (ou placeholder colorido por trilha), título, aluno (primeiro nome), série, tags, link "Ver projeto completo"
- Card clicável → abre portfólio do aluno na seção do projeto
- Paginação simples (12 por página)
- Seção "Destaques" no topo: projetos com `destaque = true` em carrossel manual (sem biblioteca)

**Query Supabase:**
```typescript
const { data } = await supabase
  .from('projetos')
  .select(`
    id, titulo, descricao, imagem_url, link_externo, tags, destaque,
    trilhas(nome, icone, cor_tailwind),
    alunos(nome, matricula, serie, turma)
  `)
  .eq('alunos.ativo', true)
  .order('destaque', { ascending: false })
  .order('criado_em', { ascending: false })
  .range(0, 11)
```

**Restrições:**
- Página pública SSR
- Preservar navbar e footer existentes do site
- Mobile-first: 1 coluna no mobile, 2 no tablet, 3 no desktop
- Paleta da escola: blue-700 primário, cores das trilhas para badges
- Adicionar link "Projetos" na navbar principal (verificar onde fica a navbar e adicionar sem quebrar nada)

**Resultado esperado:**
- `/projetos` acessível publicamente
- Filtro por trilha funcional
- Link na navbar principal

**Teste de regressão:**
```bash
npm run build
# Confirmar: / /sobre /emti /noticias /contato /admin → ainda funcionam
# Verificar navbar em todas as páginas (nova opção "Projetos" aparece)
# Testar em 375px: grid vira 1 coluna, filtros viram scroll horizontal
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

## 📣 SPRINT 4 — Divulgação do Curso TI em Carlos Chagas

> **Objetivo:** Transformar a página `/emti` em uma landing page de captação, mostrando o que o aluno aprende, onde pode trabalhar em Carlos Chagas, e como se inscrever. Desengessa o ensino mostrando resultados reais.

---

### 📋 PROMPT S4-A — Refatorar /emti com foco em TI e mercado local

**Arquivo(s) alvo:** `src/app/emti/page.tsx` (EDITAR — verificar antes de alterar)

**Tarefa:**
Expandir a página `/emti` com as seguintes seções novas (sem remover conteúdo existente — apenas acrescentar abaixo do que já existe):

**Seção 1 — "O que você vai aprender" (trilhas)**
Grid de 5 cards (um por trilha) com: ícone, nome, lista de 4 competências, badge "Certificado ao concluir"

**Seção 2 — "Onde você pode trabalhar em Carlos Chagas"**
Cards de áreas de atuação local:
- Clínicas e consultórios (suporte de computador, planilhas)
- Comércio local (nota fiscal eletrônica, sistemas de vendas)
- Prefeitura e órgãos públicos (TI administrativa)
- Escolas (suporte, criação de materiais digitais)
- Freelancer (design, desenvolvimento de sites para negócios locais)
- Empreendedorismo próprio

**Seção 3 — "Projetos reais feitos aqui"**
Preview de 3 projetos em destaque (buscar do Supabase via `destaque=true`) com link para `/projetos`

**Seção 4 — CTA de inscrição**
Bloco amarelo (`bg-yellow-400 text-gray-900`) com texto "Quer fazer parte do EMTI em TI?" + botão que leva para `/contato`

**Restrições:**
- **NÃO remover** nenhum conteúdo existente da página
- Acrescentar novas seções após o conteúdo atual
- Tailwind apenas
- Mobile-first
- Paleta da escola

**Resultado esperado:**
- `/emti` mais completa, com foco em TI, mercado local e captação de alunos

**Teste de regressão:**
```bash
npm run build
# Verificar /emti antes e depois (via git diff)
# Confirmar que nenhuma seção existente desapareceu
# Testar links das novas seções
```

**Comandos pós-edição:**
```bash
npm run build && vercel --prod
```

---

## ✅ SPRINT 5 — QA Final (Regressão + Mobile + Desktop)

> **Objetivo:** Verificação completa de tudo que foi construído. Sem deploy antes de passar por aqui.

---

### 📋 PROMPT S5 — QA Completo

**Arquivo(s) alvo:** Todos os arquivos do projeto (leitura)

**Tarefa:**
Executar checklist de QA completo:

**1. Build check:**
```bash
npm run build
# Deve completar sem erros TypeScript ou warnings críticos
```

**2. Rotas a verificar (nenhuma pode retornar 404 ou 500):**
```
GET /                    → home da escola
GET /sobre               → página sobre
GET /emti                → landing do curso (expandida)
GET /noticias            → portal JBInforma
GET /contato             → formulário de contato
GET /admin               → login admin
GET /admin/alunos        → listagem de alunos (autenticado)
GET /admin/alunos/novo   → formulário de cadastro
GET /vocacional          → teste vocacional
GET /projetos            → vitrine pública
GET /portfolio/[matricula] → portfólio do aluno
```

**3. Testes mobile (375px) — verificar em cada rota:**
- [ ] Nenhum elemento transborda horizontalmente (`overflow-x: hidden` não está escondendo bugs)
- [ ] Botões têm mínimo 44px de altura (touch target)
- [ ] Textos legíveis (mínimo 14px / text-sm)
- [ ] Imagens não distorcem
- [ ] Navbar abre e fecha corretamente no mobile
- [ ] Filtros da vitrine viram scroll horizontal no mobile
- [ ] Formulários usáveis com teclado virtual

**4. Testes desktop (1280px):**
- [ ] Grid de projetos exibe 3 colunas
- [ ] Tabela de alunos visível (não vira cards)
- [ ] Hero section sem espaços excessivos
- [ ] Navbar horizontal sem quebra

**5. Testes funcionais:**
- [ ] Cadastrar aluno → aparece na listagem
- [ ] Matrícula duplicada → exibe erro correto
- [ ] Teste vocacional → resultado salvo no Supabase
- [ ] Portfólio `/portfolio/[matricula]` carrega dados corretos
- [ ] Vitrine `/projetos` filtra por trilha corretamente
- [ ] `/emti` preserva conteúdo original + novas seções aparecem

**6. Testes de segurança:**
- [ ] `/admin/alunos` redireciona para `/admin` se não autenticado
- [ ] Supabase RLS: tentativa de INSERT sem auth retorna erro 403
- [ ] Variáveis de ambiente não expostas no bundle client-side (`SUPABASE_SERVICE_ROLE_KEY` ausente no bundle)

**7. Performance básica:**
- [ ] `npm run build` — verificar tamanho dos bundles (nenhuma rota > 500kb first load)
- [ ] Imagens com `next/image` (lazy loading automático)

**Resultado esperado:**
Relatório de QA preenchido. Todos os itens marcados. Zero regressões nas páginas existentes.

**Comandos finais:**
```bash
npm run build
git add .
git commit -m "feat: S0-S4 base alunos, vocacional, portfólio, vitrine, EMTI expandida"
git push origin main
# Aguardar build no Vercel Dashboard antes de compartilhar com alunos
```

---

## 🔄 CHECKLIST DE DEPLOY (após Sprint 5 aprovado)

```
PRÉ-DEPLOY:
□ npm run build sem erros
□ Variáveis de ambiente no Vercel Dashboard:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
□ Migrations aplicadas: supabase db push
□ RLS policies ativas (verificar no Supabase Dashboard)
□ Bucket "projetos" criado no Supabase Storage (público)

DEPLOY:
□ git push origin main
□ Verificar build no Vercel Dashboard (aguardar verde)
□ Acessar escolaestadualdrjoaoberaldo.com e confirmar

PÓS-DEPLOY:
□ Testar /vocacional no celular de um aluno real
□ Testar /projetos no celular
□ Testar /admin/alunos no desktop do professor
□ Cadastrar 1 aluno de teste e verificar portfólio público
□ Verificar console do browser (zero erros)
```

---

## 📊 RESUMO DO IMPACTO ESPERADO

| Funcionalidade | Benefício direto | Quem usa |
|---------------|-----------------|----------|
| Base de dados alunos | Gestão centralizada, visibilidade da escola | Professor |
| Teste vocacional | Orientação profissional, dados para EMTI | Aluno |
| Portfólio digital | CV digital compartilhável, diferencial no mercado | Aluno |
| Vitrine pública | Divulgação na cidade, orgulho da escola | Comunidade |
| Página EMTI expandida | Captação de novos alunos, visibilidade do curso TI | Futuros alunos |

> **Economia circular:** Alunos aprendem TI → fazem projetos reais → projetos ficam na vitrine → empresas de Carlos Chagas veem o trabalho → contratam ou encomendam serviços → escola tem cases reais para mostrar → atrai mais alunos → ciclo se repete.
