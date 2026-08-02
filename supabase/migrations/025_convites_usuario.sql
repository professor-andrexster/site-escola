-- 025: convite de acesso por email, hoje usado so para bibliotecaria.
-- Quem dispara o convite e sempre gestao (diretora, vice_diretora ou admin).
-- A conta so passa a existir quando o convite e aceito pelo link com token.
-- Rodar manualmente no SQL Editor do Supabase, depois da 024.

CREATE TABLE convites_usuario (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        varchar(120) NOT NULL,
  email       varchar(120) NOT NULL,
  papel       varchar(20) NOT NULL DEFAULT 'bibliotecario' CHECK (papel IN ('bibliotecario')),
  token       varchar(64) UNIQUE NOT NULL,
  criado_por  uuid REFERENCES auth.users(id),
  criado_em   timestamptz NOT NULL DEFAULT now(),
  expira_em   timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  aceito_em   timestamptz,
  usuario_id  uuid REFERENCES auth.users(id),
  revogado_em timestamptz
);

CREATE INDEX convites_usuario_email_idx ON convites_usuario (email);
CREATE INDEX convites_usuario_token_idx ON convites_usuario (token);

ALTER TABLE convites_usuario ENABLE ROW LEVEL SECURITY;

-- So gestao ve e gerencia convites. O aceite do convite (rota publica) usa o
-- service role, entao nao depende de nenhuma politica aqui.
CREATE POLICY "convites_usuario_gestao" ON convites_usuario
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('diretora','vice_diretora','admin') AND p.aprovado = true)
  );

-- O convite de bibliotecaria nao exige CPF no aceite (o CPF continua
-- obrigatorio para quem entra por autocadastro ou cadastro direto da
-- gestao). UNIQUE convive normalmente com varios NULL no Postgres.
ALTER TABLE identidades ALTER COLUMN cpf DROP NOT NULL;
