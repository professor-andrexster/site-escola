# Contexto do Projeto — E.E. Dr. João Beraldo

> Leia este arquivo no início de cada sessão para saber exatamente onde parou e o que fazer a seguir.

---

## Sobre o Projeto

Site institucional + painel administrativo da **Escola Estadual Dr. João Beraldo** — Carlos Chagas, MG.
EMTI (Ensino Médio em Tempo Integral). Fundada em 1946.

**Diretório:** `C:\Users\andre\Desktop\escolaJb`
**Site antigo (referência):** `C:\Users\andre\Desktop\joao-beraldo`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deploy | Vercel |
| Storage de imagens | Supabase Storage (bucket `imagens`) |
| Editor de texto | TipTap |

---

## O que foi implementado (completo)

### Site público
- `/` — Home: hero banner com notícia em destaque + grid de notícias da semana
- `/sobre` — Sobre a Escola (conteúdo editável via dashboard)
- `/emti` + subpáginas (projeto-vida, eletivas, protagonismo) — editáveis via dashboard
- `/noticias` — listagem paginada
- `/noticias/[slug]` — notícia individual com ISR (revalidate: 60s)
- `/contato` — formulário real que salva leads no Supabase + informações reais da escola

### Dashboard admin (`/admin`)
- Login com Supabase Auth (email/senha)
- Middleware de proteção de rotas
- **Notícias** — CRUD completo, editor TipTap, upload de imagens, toggle publicado/destaque
- **Leads** — lista de mensagens do formulário de contato, marcar lido, excluir
- **Páginas** — editor de conteúdo das páginas institucionais
- **Configurações** — nome da escola, cores, logo

### Infraestrutura
- Cadeado (ícone Lock) no Header → link para `/admin`
- `vercel.json` configurado
- `next.config.js` com ISR e domínios de imagem
- Migration SQL completa: `supabase/migrations/001_initial.sql`
- Tipos TypeScript: `types/database.ts`

---

## Dados Reais da Escola (já aplicados no código)

| Campo | Valor |
|---|---|
| Nome | E.E. Dr. João Beraldo |
| Endereço | Av. Gabriel Passos, 393 — Centro, Carlos Chagas — MG, CEP 39864-000 |
| Telefone/WhatsApp | (33) 99870-1618 · `wa.me/5533998701618` |
| E-mail | escola.146579.secretaria@educacao.mg.gov.br |
| Instagram | instagram.com/escolajoaoberaldo |
| YouTube | youtube.com/@joaoberaldocarloschagas |
| Facebook | facebook.com/share/1GrYbrPEvJ/ |
| Horário | Segunda a sexta: 7h às 22h |
| INEP | 31146579 · SRE: Teófilo Otoni |

---

## Arquivos de imagem disponíveis (já na pasta `public/`)

- `public/logo.jpg` — logo da escola
- `public/fachada.jpg` — foto da fachada (usar como hero banner quando não há notícia em destaque)

---

## Banco de Dados — Tabelas

### `noticias`
- id, titulo, slug, resumo, conteudo (HTML TipTap), imagem_url
- destaque_home (boolean — apenas 1 por vez, trigger garante)
- publicado (boolean)
- created_at, updated_at

### `paginas_conteudo`
- pagina (chave: 'sobre', 'emti', 'eletivas', 'projeto-vida', 'protagonismo')
- titulo, conteudo (HTML), updated_at

### `configuracoes_site`
- chave / valor
- chaves: nome_escola, descricao_escola, logo_url, cor_primaria, cor_secundaria, telefone, whatsapp, email, endereco

### `leads`
- id, nome, email, telefone, mensagem
- lido (boolean, default false)
- created_at

---

## Status do Deploy

> **NÃO FEITO AINDA** — próximo passo ao retomar.

### Passo 1 — GitHub (terminal do projeto)
```
git init
git add .
git commit -m "projeto inicial escola EMTI"
# Criar repo em github.com, depois:
git remote add origin https://github.com/SEU_USUARIO/escola-emti.git
git branch -M main
git push -u origin main
```

### Passo 2 — Supabase
1. Acesse supabase.com → New project → região **South America (São Paulo)**
2. SQL Editor → cole todo o conteúdo de `supabase/migrations/001_initial.sql` → Run
3. Authentication → Users → Add user → (seu e-mail + senha do admin)
4. Storage → New bucket → nome: `imagens` → marcar como **Public** → Create
5. Settings → API → anotar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Passo 3 — Vercel
1. vercel.com → Add New Project → Import do GitHub
2. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

### Passo 4 — Domínio (Hostinger → Vercel)
1. Vercel → Settings → Domains → adicionar seu domínio
2. Vercel exibe um registro DNS (IP ou CNAME)
3. Hostinger → hPanel → DNS/Nameservers → editar registro A do `@` com o IP do Vercel
4. Aguardar propagação (5–30 min)

---

## Fluxo para publicar uma notícia

```
Acessar /admin → login
→ Notícias → Nova Notícia
→ Preencher título, conteúdo (TipTap), imagem, resumo
→ Marcar "Publicado"
→ Opcionalmente marcar "Destaque na Home" (aparece no hero banner)
→ Salvar
→ Site atualiza em até 60 segundos (ISR)
```

---

## Pendências / melhorias futuras (não urgentes)

- Galeria de fotos (as imagens do site antigo estão em `C:\Users\andre\Desktop\joao-beraldo\images\`)
- Mapa do Google Maps na página de contato
- Integração SUCEM (matrícula online)
- Página de professores
- Página de cursos/formação técnica

---

## Comandos úteis

```bash
# Rodar localmente
npm run dev

# Build de produção (verificar erros)
npm run build

# Criar .env.local com as variáveis do Supabase antes de rodar localmente
# Copiar .env.local.example e preencher com as chaves do Supabase
```

---

*Última atualização: 2026-05-21*
