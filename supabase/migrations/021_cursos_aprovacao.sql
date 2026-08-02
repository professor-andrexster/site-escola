-- Migration: Adicionar fluxo de aprovação de cursos (professor cria, direção aprova)

-- 1. Adicionar coluna de autor (user_id de quem criou)
ALTER TABLE cursos ADD COLUMN criado_por uuid;
ALTER TABLE cursos ADD CONSTRAINT fk_cursos_author FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Adicionar coluna de timestamps se não existir
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS criado_em timestamp DEFAULT now();
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS atualizado_em timestamp DEFAULT now();

-- 3. Melhorar RLS: professor só vê seus cursos, direção vê todos
DROP POLICY IF EXISTS "cursos_leitura_publica" ON cursos;
DROP POLICY IF EXISTS "cursos_escrita_autenticado" ON cursos;

-- Leitura pública: APENAS cursos publicados
CREATE POLICY "cursos_leitura_publica" ON cursos
  FOR SELECT USING (publicado = true);

-- Leitura autenticada: professor vê seus cursos + rascunhos, direção vê todos
CREATE POLICY "cursos_leitura_autenticada" ON cursos
  FOR SELECT USING (
    publicado = true
    OR criado_por = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'direcao'
  );

-- INSERT: professor ou direção podem criar
CREATE POLICY "cursos_insert" ON cursos
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('professor', 'direcao')
  );

-- UPDATE: professor só seus cursos não-publicados, direção tudo
CREATE POLICY "cursos_update" ON cursos
  FOR UPDATE
  USING (
    criado_por = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'direcao'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'direcao'
    OR (criado_por = auth.uid() AND publicado = false)
  );

-- DELETE: apenas direção
CREATE POLICY "cursos_delete" ON cursos
  FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'direcao'
  );
