-- Libera leitura pública (sem login) dos cursos e aulas publicados,
-- para a vitrine pública em /cursos. O conteúdo em si (slides) já é
-- servido por um bucket público, então isso só formaliza o acesso
-- de leitura aos metadados no banco.

DROP POLICY IF EXISTS "cursos_read_publicados" ON cursos;
CREATE POLICY "cursos_read_publicados" ON cursos
  FOR SELECT USING (publicado = true);

DROP POLICY IF EXISTS "aulas_read_publicadas" ON aulas;
CREATE POLICY "aulas_read_publicadas" ON aulas
  FOR SELECT USING (publicado = true);
