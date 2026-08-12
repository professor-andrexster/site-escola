# Virada — Vercel/Supabase → VPS/MariaDB

Runbook da fase 7. As fases 2 a 6 estão prontas e verificadas; o que resta aqui
é operação, e cada passo mexe em coisa que os outros quatro sites deste servidor
compartilham. Nada abaixo foi executado.

## Antes de marcar a data

Três coisas precisam de decisão, e nenhuma é técnica:

### 1. As senhas — decidido por omissão se ninguém agir

O papel de leitura (`diagnostico_ro`) **não alcança o schema `auth`**, onde ficam
os hashes bcrypt. Sem eles, `scripts/migrar-dados.mjs` monta a tabela `usuarios`
a partir de `profiles` (id + e-mail) e deixa `encrypted_password` nulo:
**as 37 contas precisam redefinir a senha na primeira entrada.**

Para evitar, exporte `auth.users` pelo painel do Supabase e passe o arquivo:

```bash
CONTAS_JSON=/root/escola-migracao/contas.json node scripts/migrar-dados.mjs
```

O arquivo é uma lista de objetos com `id`, `email`, `encrypted_password` e,
opcionalmente, `email_confirmed_at`, `last_sign_in_at`, `banned_until`,
`created_at`. Os hashes do Supabase são bcrypt e validam direto — foi por isso
que a fase 4 usou bcrypt em vez de argon2.

Se a decisão for "todo mundo troca", ela é gratuita, mas precisa de aviso à
escola antes: 37 pessoas vão encontrar o login recusando na segunda-feira.

### 2. Duas alunas com a mesma matrícula

```
ALU20260010  Daphne Ferraz Pereira   a0f6bf95-6c77-411e-aa9e-8616e24e8d4d
Alu20260010  Anne Pereira da Silva   274867db-064a-4328-ad8c-ddc58a015387
```

Não é problema da migração: é um conflito que já existe hoje e que o Postgres
escondia. A collation daqui (`utf8mb4_unicode_ci`) compara ignorando
maiúsculas, então o índice único só aceita uma das duas.

**Isso já quebra o sistema hoje.** `normalizarMatricula` deixa tudo em
maiúsculas antes de consultar, e a busca é `findFirst` — então
`ALU20260010` sempre encontra a Daphne. A Anne não consegue entrar por
matrícula, nem recuperar senha por CPF, nem completar o autocadastro.

Alguém da secretaria precisa dizer qual matrícula é a correta e corrigir a
outra **no Supabase, antes da virada**. `scripts/migrar-dados.mjs` recusa
rodar enquanto a colisão existir.

### 3. Os arquivos

`scripts/baixar-storage.mjs --so-listar` conta e mede os cinco buckets sem
baixar nada. Rode primeiro: é o número que diz se o disco aguenta. Precisa de
`SUPABASE_SERVICE_ROLE_KEY`, que está no desktop.

## Ensaio já feito

Os 2.065 registros do Supabase já foram copiados para o MariaDB deste servidor
e conferidos linha a linha com `scripts/conferir-migracao.mjs`. Todas as
contagens bateram, exceto `alunos` (32 → 31), pelo motivo do item 2.

Isso significa que o roteiro de dados está testado contra os dados reais. Na
virada ele roda de novo, com o banco zerado e as escritas congeladas, para
pegar o que mudou desde o ensaio.

## Roteiro

### 1. Congelar escritas
Aviso no painel e no site. A partir daqui, o que for gravado no Supabase se
perde.

### 2. Zerar e reimportar

```bash
# apaga o que veio do ensaio
node scripts/limpar-banco.mjs --confirmo

PGURL='postgresql://...' DATABASE_URL='mysql://...' \
  node scripts/migrar-dados.mjs

PGURL='postgresql://...' DATABASE_URL='mysql://...' \
  node scripts/conferir-migracao.mjs
```

O segundo comando tem que sair com todas as contagens batendo. Se não bater,
**pare aqui** — é mais barato voltar antes do DNS.

### 3. Arquivos

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
UPLOAD_ROOT=/var/www/escola/data/uploads \
DATABASE_URL=mysql://... node scripts/baixar-storage.mjs
```

Ao terminar ele imprime o SQL que reescreve as oito colunas de URL. Confira e
rode.

### 4. Serviço

```bash
useradd -r -s /usr/sbin/nologin -d /srv/escola escola
mkdir -p /srv/escola/app /var/www/escola/data/uploads
chown -R escola:escola /srv/escola /var/www/escola/data

# build vem de onde o código está; publique o standalone em /srv/escola/app
cp deploy/escola.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now escola
curl -sS localhost:3003/api/usuarios/perfil   # 401 = de pé
```

O `.env` de `/srv/escola/app` precisa de: `DATABASE_URL`, `UPLOAD_ROOT`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` e, opcional, `AUTH_SESSION_DAYS`.
Nenhuma variável do Supabase — o build passa sem elas, e é assim que se
confirma que a dependência acabou.

### 5. nginx — o passo que afeta os outros sites

```bash
cp deploy/escola.nginx /etc/nginx/sites-available/escola
ln -s /etc/nginx/sites-available/escola /etc/nginx/sites-enabled/
nginx -t                 # se falhar, remova o link e pare
systemctl reload nginx   # reload. nunca restart
```

### 6. DNS

Apontar `escolaestadualdrjoaoberaldo.com` e `www` para `187.127.18.53`.
Baixe o TTL para 300s **um dia antes** — é o que permite desfazer em minutos.

### 7. Certificado

```bash
certbot --nginx -d escolaestadualdrjoaoberaldo.com \
                -d www.escolaestadualdrjoaoberaldo.com
```

### 8. Conferência

Com o DNS propagado, à mão:

- entrar com uma conta de cada papel (direção, professor, aluno);
- "esqueci minha senha": o e-mail chega e o link funciona uma vez só;
- foto de perfil: envia e aparece;
- notícia: cria, publica, aparece na home;
- curso: abre uma aula, o progresso é gravado, o certificado sai;
- quiz ao vivo: abrir sala em uma aba e entrar como aluno em outra —
  iniciar, revelar e próxima têm que refletir na tela do aluno em ~2s;
- biblioteca: empréstimo e devolução;
- um arquivo antigo (`/arquivos/legado/...`) ainda abre.

## Voltar atrás

Até o passo 5, é só não seguir. Depois do DNS, voltar é reapontar o DNS — por
isso o TTL baixo, e por isso **Supabase e Vercel não são desligados no mesmo
dia**. Deixe os dois de pé por 30 dias.

O que for gravado no MariaDB depois da virada não volta para o Supabase. Se a
volta acontecer horas depois, esse período se perde — outro motivo para a
conferência do passo 8 ser feita antes de avisar a escola.

## Sobra conhecida

Quatro scripts em `scripts/` ainda falam com o Supabase direto e param de
funcionar na virada:

| Script | Uso |
|---|---|
| `seed.ts` | povoamento inicial, histórico |
| `import-curso-excel.ts` | rodou uma vez, local |
| `gerar-capas.ts` | **reutilizável** — gera capas dos cursos |
| `insert-curso.ts` | **reutilizável** — insere curso a partir de JSON |

Os dois últimos são os que fazem falta. Portar cada um é trabalho pequeno
(trocam escrita direta por `lib/db/cursos.ts`), mas ficou fora do escopo das
fases 2 a 6 de propósito: nenhum deles é usado pelo site no ar.
