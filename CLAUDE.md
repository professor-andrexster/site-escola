# CLAUDE.md — Site da Escola EMTI

## Visão Geral do Projeto

Site institucional para escola de **Ensino Médio em Tempo Integral (EMTI)**, com painel administrativo (dashboard) para gestão de conteúdo, deploy no Vercel, e arquitetura moderna baseada em Next.js + Supabase.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Storage de imagens | Supabase Storage |
| Editor de texto | TipTap (rich text) |

---

## Estrutura de Páginas

### Público (Site)

```
/                    → Home — Hero com notícia em destaque + cards das últimas notícias
/sobre               → Sobre a Escola
/emti                → O que é o EMTI
/emti/projeto-vida   → Projeto de Vida
/emti/eletivas       → Eletivas
/emti/protagonismo   → Protagonismo Juvenil
/noticias            → Listagem de todas as notícias
/noticias/[slug]     → Notícia individual
/contato             → Contato
```

### Administrativo (Dashboard)

```
/admin               → Login
/admin/dashboard     → Painel principal
/admin/noticias      → Gerenciar notícias (listar, criar, editar, deletar)
/admin/noticias/nova → Criar nova notícia
/admin/noticias/[id] → Editar notícia
/admin/sobre         → Editar conteúdo da página Sobre
/admin/emti          → Editar conteúdo das páginas EMTI
/admin/configuracoes → Configurações gerais (nome da escola, logo, cores)
```

---

## Agentes de IA (Claude Code Subagentes)

### Agente 1 — `architect-agent`
**Responsabilidade:** Scaffolding inicial do projeto

**Prompt:**
```
Você é um arquiteto de software especializado em Next.js 14 com App Router.
Crie o scaffolding completo do projeto com:
- Estrutura de pastas (app/, components/, lib/, types/)
- Configuração do Tailwind CSS com tema personalizado escolar
- Setup do Supabase client (server e client-side)
- Configuração do shadcn/ui
- Variáveis de ambiente (.env.local.example)
- Schema do banco de dados Supabase (SQL migrations)
Tabelas necessárias: noticias, paginas_conteudo, configuracoes_site
```

### Agente 2 — `schema-agent`
**Responsabilidade:** Banco de dados e tipos

**Prompt:**
```
Crie o schema SQL completo para Supabase com as seguintes tabelas:

noticias:
- id (uuid, primary key)
- titulo (text, not null)
- slug (text, unique, not null)
- resumo (text)
- conteudo (text — HTML do TipTap)
- imagem_url (text)
- destaque_home (boolean, default false)
- publicado (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

paginas_conteudo:
- id (uuid)
- pagina (text — 'sobre', 'emti', 'eletivas', etc.)
- titulo (text)
- conteudo (text)
- updated_at (timestamp)

configuracoes_site:
- chave (text, primary key)
- valor (text)

Inclua RLS policies: leitura pública para conteúdo publicado, escrita apenas para usuários autenticados.
Gere também os tipos TypeScript correspondentes em /types/database.ts
```

### Agente 3 — `ui-agent`
**Responsabilidade:** Componentes visuais do site público

**Prompt:**
```
Crie os componentes React para o site público da escola EMTI em Next.js 14.
Estética: educacional, moderna, acolhedora. Paleta em azul/verde/branco.
Fontes: Fraunces (títulos) + DM Sans (corpo).

Componentes a criar:
1. Header com navegação: Sobre a Escola | EMTI (dropdown) | Notícias | Contato
2. HeroBanner — exibe a notícia marcada como destaque_home=true com imagem full-width
3. NewsCard — card compacto de notícia com imagem, título, resumo e data
4. NewsGrid — grid das notícias da semana atual (últimas 7 dias)
5. Footer institucional
6. PageLayout — wrapper com header/footer

Cada componente deve receber seus dados via props (server components onde possível).
```

### Agente 4 — `pages-agent`
**Responsabilidade:** Páginas e rotas do Next.js

**Prompt:**
```
Crie as páginas Next.js 14 (App Router) para o site da escola EMTI:

1. page.tsx (Home):
   - Busca notícia com destaque_home=true no Supabase (Server Component)
   - Renderiza HeroBanner com ela
   - Busca notícias da semana atual (created_at >= 7 dias atrás, publicado=true)
   - Renderiza NewsGrid com cards

2. /sobre/page.tsx:
   - Busca conteúdo da tabela paginas_conteudo onde pagina='sobre'
   - Renderiza com layout editorial

3. /emti/page.tsx + subpáginas:
   - Seções: O que é o EMTI, Projeto de Vida, Eletivas, Protagonismo Juvenil
   - Conteúdo editável via dashboard

4. /noticias/page.tsx:
   - Listagem paginada de todas as notícias publicadas

5. /noticias/[slug]/page.tsx:
   - Página individual da notícia
   - generateStaticParams para SSG
   - generateMetadata para SEO

Use sempre Server Components com fetch direto ao Supabase.
```

### Agente 5 — `dashboard-agent`
**Responsabilidade:** Painel administrativo completo

**Prompt:**
```
Crie o dashboard administrativo em /admin usando Next.js 14 App Router + shadcn/ui.

Funcionalidades:
1. Login com Supabase Auth (email/senha) em /admin/page.tsx
2. Middleware de proteção: redireciona para /admin se não autenticado
3. Layout do admin com sidebar: Notícias | Conteúdo das Páginas | Configurações

Gerenciador de Notícias (/admin/noticias):
- Tabela com todas as notícias (título, status publicado, destaque_home, data)
- Botões: Nova Notícia, Editar, Deletar, Toggle Publicado, Toggle Destaque
- APENAS UMA notícia pode ter destaque_home=true (ao ativar uma, desativa as outras)

Editor de Notícia (/admin/noticias/nova e /admin/noticias/[id]):
- Campo: Título (input)
- Campo: Slug (auto-gerado do título, editável)
- Campo: Resumo (textarea)
- Campo: Conteúdo (editor TipTap rich text com toolbar)
- Campo: Imagem (upload para Supabase Storage, preview)
- Toggle: Publicado
- Toggle: Destaque na Home
- Botões: Salvar Rascunho | Publicar

Editor de Páginas (/admin/sobre, /admin/emti):
- Editor TipTap para cada seção de conteúdo
- Botão Salvar

Use shadcn/ui components: Table, Button, Dialog, Form, Input, Textarea, Switch, Badge.
```

### Agente 6 — `deploy-agent`
**Responsabilidade:** Configuração de deploy no Vercel

**Prompt:**
```
Configure o projeto Next.js para deploy no Vercel com:

1. vercel.json com configurações de rewrite e headers de segurança
2. next.config.js com:
   - Domínios de imagem (Supabase Storage URL)
   - Variáveis de ambiente públicas
   - ISR (Incremental Static Regeneration) para páginas de notícias (revalidate: 60)

3. Crie um guia DEPLOY.md com passo a passo:
   a. Criar projeto no Supabase (free tier)
   b. Rodar migrations SQL
   c. Criar usuário admin no Supabase Auth
   d. Criar bucket público 'imagens' no Supabase Storage
   e. Conectar repositório GitHub ao Vercel
   f. Configurar variáveis de ambiente no Vercel:
      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY
   g. Deploy automático a cada push na main

4. Script seed.ts para popular banco com dados de exemplo
```

---

## Fluxo de Postagem de Notícia

```
Admin acessa /admin/noticias/nova
        ↓
Preenche título, conteúdo, imagem
        ↓
Marca "Publicado" e opcionalmente "Destaque na Home"
        ↓
Salva → Supabase (publicado=true, destaque_home=true)
        ↓
Vercel ISR revalida a home em até 60 segundos
        ↓
Home exibe novo HeroBanner com a notícia em destaque
        ↓
Notícia aparece nos cards "Últimas da Semana" se < 7 dias
```

---

## Skills Necessárias para Claude Code

```yaml
skills:
  - next-js-app-router        # Server Components, Route Handlers, Middleware
  - supabase-integration       # Auth, Database, Storage, RLS policies
  - tailwind-css               # Estilização responsiva
  - shadcn-ui                  # Componentes admin
  - tiptap-editor              # Editor rich text
  - vercel-deployment          # Deploy, ISR, variáveis de ambiente
  - typescript                 # Tipos, interfaces, generics
  - sql-migrations             # Schema, RLS, functions
  - react-server-components    # Fetch server-side, streaming
  - image-optimization         # next/image com Supabase Storage
```

---

## Prompt Principal para Claude Code

> Cole este prompt no Claude Code para iniciar o projeto do zero:

```
Crie um site completo para uma escola EMTI (Ensino Médio em Tempo Integral) 
usando Next.js 14 (App Router), Tailwind CSS, shadcn/ui e Supabase.

O site deve ter:
- HOME com hero banner dinâmico (notícia em destaque) + grid de notícias da semana
- Páginas: Sobre a Escola, EMTI (com subpáginas), Notícias, Contato
- Dashboard admin em /admin com login, gerenciador de notícias (CRUD completo 
  com editor TipTap + upload de imagens) e editor de conteúdo das páginas
- Deploy configurado para Vercel com ISR
- Schema Supabase com RLS policies
- Estética moderna e educacional: paleta azul/verde, Fraunces + DM Sans

Siga o CLAUDE.md do projeto para estrutura, agentes e detalhes de implementação.
Execute os agentes na ordem: architect → schema → ui → pages → dashboard → deploy
```

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar migrations no Supabase
npx supabase db push

# Seed de dados de exemplo
npx tsx scripts/seed.ts

# Dev local
npm run dev

# Build de produção
npm run build

# Deploy manual no Vercel
vercel --prod
```

---

## Notas de Design

- **Identidade visual:** Usar as cores oficiais da escola se disponíveis, senão azul `#1e40af` + verde `#16a34a`
- **Acessibilidade:** WCAG AA — contraste mínimo 4.5:1, textos alternativos em imagens
- **Mobile-first:** Layout responsivo, menu hambúrguer no mobile
- **SEO:** metadata dinâmica por página, Open Graph para compartilhamento de notícias
- **Performance:** ISR com revalidação de 60s, imagens otimizadas com next/image

---

*Gerado para uso com Claude Code — Anthropic*
