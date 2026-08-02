-- 017: Aulas em texto (HTML) e desafios por aula/curso.
-- O módulo de cursos nasceu com aulas em slides (slides_urls); a grade EMTI
-- completa usa aulas escritas. Uma aula tem OU slides OU conteudo.

-- Obs.: a tabela chama-se curso_desafios porque "desafios" já existe
-- (motor de desafios em fases da Fábrica de Ideias, migration 014).

ALTER TABLE aulas ADD COLUMN IF NOT EXISTS conteudo text;
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS revisado boolean DEFAULT false;

CREATE TABLE curso_desafios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    uuid REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  aula_id     uuid REFERENCES aulas(id) ON DELETE CASCADE,  -- null = desafio de sprint/projeto do curso
  titulo      varchar(160) NOT NULL,
  enunciado   text NOT NULL,
  tipo        varchar(20) NOT NULL DEFAULT 'pratico',       -- quiz | pratico | dissertativo
  gabarito    text,                                         -- só professores enxergam
  ordem       int DEFAULT 0,
  created_at  timestamp DEFAULT now()
);

CREATE INDEX curso_desafios_curso_idx ON curso_desafios (curso_id, ordem);
CREATE INDEX curso_desafios_aula_idx ON curso_desafios (aula_id);

ALTER TABLE curso_desafios ENABLE ROW LEVEL SECURITY;

-- Aluno logado lê os desafios (menos o gabarito, coluna revogada abaixo);
-- escrita só authenticated (mesmo padrão de cursos/aulas).
CREATE POLICY "curso_desafios_read" ON curso_desafios
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "curso_desafios_write" ON curso_desafios
  FOR ALL USING (auth.role() = 'authenticated');

-- Gabarito não pode vazar para aluno via REST: revoga a tabela e re-concede
-- as colunas sem o gabarito (professor/direção leem o gabarito via service role).
REVOKE ALL ON curso_desafios FROM anon;
REVOKE SELECT ON curso_desafios FROM authenticated;
GRANT SELECT (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, created_at)
  ON curso_desafios TO authenticated;
GRANT INSERT, UPDATE, DELETE ON curso_desafios TO authenticated;
