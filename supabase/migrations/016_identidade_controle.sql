-- 016: Controle de identidade — CPF, vínculo aluno<->conta, log de atividades
-- e recuperação de senha. Rodar manualmente no SQL Editor do Supabase.

-- 1. Identidade do dono de cada conta (1:1 com auth.users).
--    CPF verificado no cadastro; email_alternativo para recuperação
--    (ex.: email de um responsável).
CREATE TABLE identidades (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf              varchar(14) UNIQUE NOT NULL,
  data_nascimento  date,
  email_alternativo varchar(120),
  criado_via       varchar(20) NOT NULL DEFAULT 'direcao', -- auto_aluno | auto_professor | direcao
  criado_em        timestamptz DEFAULT now()
);

ALTER TABLE identidades ENABLE ROW LEVEL SECURITY;

-- Dono lê a própria linha; toda escrita/leitura administrativa é via service role.
CREATE POLICY "identidades_own_read" ON identidades
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Vínculo do registro acadêmico (alunos) com a conta de login.
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Fecha o furo de escrita em alunos: qualquer autenticado podia INSERT/UPDATE/DELETE.
--    Escrita passa a ser só via service role (rotas /api/alunos, restritas à direção).
DROP POLICY IF EXISTS "admin_full_access" ON alunos;

-- 4. Protege os dados sensíveis dos alunos (CPF, nascimento, contatos):
--    revoga o acesso de tabela e re-concede SÓ as colunas públicas
--    (privilégios de coluna em Postgres são aditivos — revogar coluna
--    não adianta enquanto houver GRANT de tabela inteira).
--    IMPORTANTE: depois disso, select('*') em alunos NÃO funciona mais para
--    anon/authenticated — o código usa listas explícitas ou o service role.
REVOKE ALL ON alunos FROM anon, authenticated;
GRANT SELECT (id, nome, matricula, turma, serie, turno, foto_url, ativo, criado_em, atualizado_em)
  ON alunos TO anon, authenticated;

-- 5. Log de atividades de cadastro/acesso (auditoria da direção).
CREATE TABLE log_atividades (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acao       varchar(40) NOT NULL,
  -- acoes: cadastro_aluno | cadastro_professor | cadastro_recusado |
  --        login_ok | login_falha | senha_redefinida_cpf | senha_redefinida_admin |
  --        recuperacao_recusada | usuario_criado_direcao
  detalhes   jsonb,
  ip         varchar(60),
  criado_em  timestamptz DEFAULT now()
);

CREATE INDEX log_atividades_acao_criado_idx ON log_atividades (acao, criado_em DESC);
CREATE INDEX log_atividades_criado_idx ON log_atividades (criado_em DESC);

ALTER TABLE log_atividades ENABLE ROW LEVEL SECURITY;

-- Só a direção lê o log; escrita só via service role.
CREATE POLICY "log_direcao_read" ON log_atividades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'direcao' AND p.aprovado = true
    )
  );

-- 6. Email denormalizado em profiles (facilita listagem no admin e a resolução
--    de matricula/CPF -> email no login). Mantido pelas rotas server-side.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email varchar(120);
UPDATE profiles SET email = u.email FROM auth.users u WHERE u.id = profiles.id AND profiles.email IS NULL;
