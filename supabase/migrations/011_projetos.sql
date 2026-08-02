CREATE TABLE projetos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      uuid REFERENCES alunos(id) ON DELETE CASCADE,
  trilha_id     uuid REFERENCES trilhas(id),
  titulo        varchar(120) NOT NULL,
  descricao     text,
  imagem_url    varchar(300),
  link_externo  varchar(300),   -- GitHub, Canva, Google Sheets público, etc.
  tags          text[],         -- ex: {'python', 'excel', 'canva'}
  destaque      boolean DEFAULT false,
  criado_em     timestamp DEFAULT now(),
  serie_na_epoca varchar(20)    -- em qual série estava quando fez
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projetos_public_read" ON projetos FOR SELECT USING (true);
CREATE POLICY "projetos_admin_write" ON projetos FOR ALL USING (auth.role() = 'authenticated');

-- Bucket público para imagens de projetos
INSERT INTO storage.buckets (id, name, public)
VALUES ('projetos', 'projetos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "projetos_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'projetos');

CREATE POLICY "projetos_storage_admin_write" ON storage.objects
  FOR ALL USING (bucket_id = 'projetos' AND auth.role() = 'authenticated');
