-- 035: Prova final por curso e certificado de conclusão.
-- Aluno que termina todas as aulas libera a prova final; nota >= 70 emite
-- certificado com código público de validação (/certificado/[codigo]).
-- Idempotente: o SQL Editor do Supabase roda cada comando isolado, então
-- tudo aqui pode ser reexecutado sem quebrar.

-- Carga horária oficial do curso, em horas. Quando vazia, o certificado
-- calcula pela soma de duracao_estimada_min das aulas.
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS carga_horaria int;

-- Perguntas da prova final. Nenhuma política de leitura para o aluno de
-- propósito: RLS ligada sem política nega tudo, e o gabarito só circula
-- pelas rotas de servidor (service role), que entregam as perguntas ao
-- aluno já sem a resposta correta.
CREATE TABLE IF NOT EXISTS curso_prova_perguntas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id         uuid REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  enunciado        text NOT NULL,
  alternativa_a    text NOT NULL,
  alternativa_b    text NOT NULL,
  alternativa_c    text NOT NULL,
  alternativa_d    text NOT NULL,
  resposta_correta varchar(1) NOT NULL CHECK (resposta_correta IN ('a', 'b', 'c', 'd')),
  ordem            int DEFAULT 0,
  created_at       timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS curso_prova_perguntas_curso_idx ON curso_prova_perguntas (curso_id, ordem);

ALTER TABLE curso_prova_perguntas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON curso_prova_perguntas FROM anon;
REVOKE ALL ON curso_prova_perguntas FROM authenticated;

-- Certificado emitido. Os dados são um retrato do momento da emissão
-- (nome, título do curso, carga horária): renomear o curso depois não
-- reescreve certificados já entregues.
CREATE TABLE IF NOT EXISTS certificados (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo         varchar(16) UNIQUE NOT NULL,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id       uuid REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  aluno_nome     varchar(120) NOT NULL,
  curso_titulo   varchar(120) NOT NULL,
  autor_nome     varchar(80),
  carga_horaria  int NOT NULL,
  nota           int NOT NULL,
  emitido_em     timestamp DEFAULT now(),
  UNIQUE (user_id, curso_id)
);

CREATE INDEX IF NOT EXISTS certificados_user_idx ON certificados (user_id);

ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Dono lê o próprio certificado; gestão lê todos. Emissão só pela rota de
-- servidor (service role), nunca direto do client: sem política de INSERT.
DROP POLICY IF EXISTS "certificados_select" ON certificados;
CREATE POLICY "certificados_select" ON certificados
  FOR SELECT USING (user_id = auth.uid() OR eh_gestao());
