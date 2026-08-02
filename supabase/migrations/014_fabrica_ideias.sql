/* 1. Fabrica de Ideias - mural aberto */
CREATE TABLE ideias (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id      uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo        varchar(140) NOT NULL,
  dor           text,
  lacuna        text,
  inovacao      text,
  trilha_id     uuid REFERENCES trilhas(id),
  status        varchar(20) DEFAULT 'nova', /* nova | em_analise | adotada | arquivada */
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now()
);

CREATE TABLE ideia_votos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ideia_id      uuid REFERENCES ideias(id) ON DELETE CASCADE NOT NULL,
  profile_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at    timestamp DEFAULT now(),
  UNIQUE (ideia_id, profile_id)
);

CREATE TABLE ideia_comentarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ideia_id      uuid REFERENCES ideias(id) ON DELETE CASCADE NOT NULL,
  autor_id      uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  corpo         text NOT NULL,
  created_at    timestamp DEFAULT now()
);

/* 2. Motor de Desafios (generalizado a partir do CTRL+ALT+CHAGAS) */
CREATE TABLE desafios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        varchar(140) NOT NULL,
  subtitulo     varchar(200),
  briefing      text,
  professor_id  uuid REFERENCES profiles(id),
  turma_alvo    varchar(20),
  ano_letivo    varchar(10) DEFAULT '2026',
  pontos_total  int DEFAULT 100,
  publicado     boolean DEFAULT false,
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now()
);

CREATE TABLE desafio_fases (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  desafio_id            uuid REFERENCES desafios(id) ON DELETE CASCADE NOT NULL,
  ordem                 int NOT NULL,
  titulo                varchar(120) NOT NULL,
  descricao             text,
  entregavel_instrucoes text,
  pontos_max            int DEFAULT 0,
  semana_sugerida       int,
  UNIQUE (desafio_id, ordem)
);

CREATE TABLE desafio_papeis (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  desafio_id    uuid REFERENCES desafios(id) ON DELETE CASCADE NOT NULL,
  nome          varchar(80) NOT NULL,
  descricao     text
);

CREATE TABLE equipes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  desafio_id    uuid REFERENCES desafios(id) ON DELETE CASCADE NOT NULL,
  nome_empresa  varchar(120),
  ideia_id      uuid REFERENCES ideias(id),
  turma         varchar(20),
  created_at    timestamp DEFAULT now()
);

CREATE TABLE equipe_membros (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id     uuid REFERENCES equipes(id) ON DELETE CASCADE NOT NULL,
  profile_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  papel_id      uuid REFERENCES desafio_papeis(id),
  UNIQUE (equipe_id, profile_id)
);

CREATE TABLE entregas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id           uuid REFERENCES equipes(id) ON DELETE CASCADE NOT NULL,
  fase_id             uuid REFERENCES desafio_fases(id) ON DELETE CASCADE NOT NULL,
  conteudo            text,
  arquivo_url         varchar(300),
  link_url            varchar(300),
  dados_estruturados  jsonb,
  status              varchar(20) DEFAULT 'pendente', /* pendente | entregue | avaliada */
  nota                numeric(5,2),
  feedback_professor  text,
  enviado_em          timestamp,
  avaliado_em         timestamp,
  UNIQUE (equipe_id, fase_id)
);

/* 3. Promove uma equipe concluida a vitrine publica (reaproveita a tabela projetos) */
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS equipe_id uuid REFERENCES equipes(id);

/* 4. Bucket publico para arquivos de entrega (prints, docx, artes) */
INSERT INTO storage.buckets (id, name, public)
VALUES ('desafios', 'desafios', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "desafios_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'desafios');

CREATE POLICY "desafios_storage_write" ON storage.objects
  FOR ALL USING (bucket_id = 'desafios' AND auth.role() = 'authenticated');

/* 5. RLS - mesmo padrao de cursos/projetos: leitura autenticada, escrita autenticada */
ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ideias_read" ON ideias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ideias_write" ON ideias FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE ideia_votos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ideia_votos_read" ON ideia_votos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ideia_votos_write" ON ideia_votos FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE ideia_comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ideia_comentarios_read" ON ideia_comentarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ideia_comentarios_write" ON ideia_comentarios FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE desafios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desafios_read" ON desafios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "desafios_write" ON desafios FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE desafio_fases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desafio_fases_read" ON desafio_fases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "desafio_fases_write" ON desafio_fases FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE desafio_papeis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desafio_papeis_read" ON desafio_papeis FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "desafio_papeis_write" ON desafio_papeis FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipes_read" ON equipes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "equipes_write" ON equipes FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE equipe_membros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipe_membros_read" ON equipe_membros FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "equipe_membros_write" ON equipe_membros FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entregas_read" ON entregas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "entregas_write" ON entregas FOR ALL USING (auth.role() = 'authenticated');
