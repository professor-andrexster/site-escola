-- Respostas do teste vocacional por aluno
CREATE TABLE perfis_vocacionais (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id        uuid REFERENCES alunos(id) ON DELETE CASCADE,
  trilha_id       uuid REFERENCES trilhas(id),
  pontuacao       int NOT NULL DEFAULT 0,  -- 0 a 100
  atualizado_em   timestamp DEFAULT now(),
  UNIQUE(aluno_id, trilha_id)
);

-- Log do teste (quando foi feito)
CREATE TABLE testes_vocacionais (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id    uuid REFERENCES alunos(id) ON DELETE CASCADE,
  respostas   jsonb NOT NULL,   -- array de { pergunta_id, resposta }
  realizado_em timestamp DEFAULT now()
);

ALTER TABLE perfis_vocacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pv_admin_full" ON perfis_vocacionais FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "pv_public_read" ON perfis_vocacionais FOR SELECT USING (true);
CREATE POLICY "pv_public_write" ON perfis_vocacionais FOR INSERT WITH CHECK (true);
CREATE POLICY "pv_public_update" ON perfis_vocacionais FOR UPDATE USING (true);

ALTER TABLE testes_vocacionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tv_admin_full" ON testes_vocacionais FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "tv_public_insert" ON testes_vocacionais FOR INSERT WITH CHECK (true);
