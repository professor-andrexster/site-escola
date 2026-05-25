# Guia de Deploy — Escola EMTI

## Pré-requisitos

- Conta no [Supabase](https://supabase.com) (free tier)
- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub

---

## Passo a Passo

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma nova organização
2. Crie um novo projeto (escolha a região mais próxima do Brasil: **South America (São Paulo)**)
3. Aguarde a provisão do banco de dados (~2 minutos)

### 2. Rodar as migrations SQL

1. No painel Supabase, vá em **SQL Editor**
2. Cole o conteúdo do arquivo `supabase/migrations/001_initial.sql`
3. Clique em **Run**
4. Verifique se as tabelas `noticias`, `paginas_conteudo` e `configuracoes_site` foram criadas em **Table Editor**

### 3. Criar usuário admin

1. No painel Supabase, vá em **Authentication → Users**
2. Clique em **Add user → Create new user**
3. Informe e-mail e senha do administrador
4. O usuário poderá acessar `/admin` com essas credenciais

### 4. Criar bucket de imagens no Storage

1. No painel Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Nome: `imagens`
4. Marque **Public bucket** (para que as URLs de imagem sejam acessíveis publicamente)
5. Clique em **Save**
6. Em **Policies**, adicione política de upload para usuários autenticados:

```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens');

CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens');
```

### 5. Obter as credenciais do Supabase

No painel Supabase, vá em **Settings → API**:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (secret) |

### 6. Configurar ambiente local

```bash
cp .env.local.example .env.local
# Edite .env.local com as credenciais do Supabase
npm install
npm run dev
# Acesse http://localhost:3000
```

### 7. Conectar repositório ao Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
3. Importe o repositório GitHub
4. Na tela de configuração, deixe o framework como **Next.js** (detectado automaticamente)

### 8. Configurar variáveis de ambiente no Vercel

Em **Settings → Environment Variables**, adicione:

| Nome | Valor | Ambientes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (⚠️ secreta) | Production |

### 9. Deploy

1. Clique em **Deploy** no Vercel
2. Aguarde o build (~2 minutos)
3. Acesse a URL gerada (ex: `https://escola-emti.vercel.app`)

### 10. Deploy automático

A partir de agora, todo `git push` na branch `main` disparará um deploy automático no Vercel.

---

## Estrutura de ISR (Incremental Static Regeneration)

| Página | Revalidação |
|---|---|
| Home (`/`) | 60 segundos |
| Notícia individual (`/noticias/[slug]`) | 60 segundos |
| Listagem de notícias (`/noticias`) | 60 segundos |
| Sobre, EMTI e subpáginas | 3600 segundos (1 hora) |

---

## Comandos úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção (teste local)
npm run build && npm start

# Deploy manual no Vercel (requer Vercel CLI)
npx vercel --prod

# Rodar script de seed (dados de exemplo)
npx tsx scripts/seed.ts
```

---

## Solução de problemas

**Erro: `supabaseUrl is required`**
→ Verifique se `.env.local` existe e contém `NEXT_PUBLIC_SUPABASE_URL`

**Erro de RLS (Row Level Security)**
→ Certifique-se de que rodou o SQL completo da migration, incluindo as policies

**Imagens não aparecem**
→ Confirme que o bucket `imagens` é público e que a URL do Supabase está em `next.config.js` na lista `remotePatterns`

**Admin redireciona para login em loop**
→ O middleware em `middleware.ts` protege `/admin/*` — certifique-se de que o usuário foi criado no Supabase Auth
