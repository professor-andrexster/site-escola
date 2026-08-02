-- 023: baseline da tabela profiles.
-- A tabela profiles nunca foi criada por uma migration versionada, ela existe
-- desde antes deste diretório de migrations existir. Este arquivo documenta o
-- schema real dela de forma idempotente (CREATE TABLE IF NOT EXISTS), sem
-- mexer em nenhum dado e sem recriar politica nenhuma. Serve so para o
-- historico de migrations deixar de ter um buraco na origem de profiles.
-- Rodar manualmente no SQL Editor do Supabase.

CREATE TABLE IF NOT EXISTS profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo  varchar(120) NOT NULL,
  role           varchar(20) NOT NULL DEFAULT 'aluno',
  turma          varchar(20),
  disciplina     varchar(80),
  aprovado       boolean NOT NULL DEFAULT false,
  email          varchar(120),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email varchar(120);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
