-- 1. Cursos
CREATE TABLE cursos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        varchar(120) NOT NULL,
  slug          varchar(140) UNIQUE NOT NULL,
  descricao     text,
  capa_url      varchar(300),
  categoria     varchar(60),
  nivel         varchar(30) DEFAULT 'Iniciante',
  autor_nome    varchar(80) DEFAULT 'Professor André Gomes',
  publicado     boolean DEFAULT false,
  ordem         int DEFAULT 0,
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now()
);

-- 2. Aulas (cada uma é uma sequência de slides em imagem)
CREATE TABLE aulas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id              uuid REFERENCES cursos(id) ON DELETE CASCADE,
  titulo                varchar(120) NOT NULL,
  slug                  varchar(140) NOT NULL,
  descricao             text,
  ordem                 int DEFAULT 0,
  slides_urls           text[] DEFAULT '{}',
  duracao_estimada_min  int,
  publicado             boolean DEFAULT false,
  created_at            timestamp DEFAULT now(),
  updated_at            timestamp DEFAULT now(),
  UNIQUE (curso_id, slug)
);

-- 3. Progresso do usuário em cada aula
CREATE TABLE progresso_aulas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  aula_id       uuid REFERENCES aulas(id) ON DELETE CASCADE NOT NULL,
  curso_id      uuid REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  slide_atual   int DEFAULT 0,
  concluida     boolean DEFAULT false,
  concluida_em  timestamp,
  atualizado_em timestamp DEFAULT now(),
  UNIQUE (user_id, aula_id)
);

-- 4. RLS
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cursos_read_publicados" ON cursos
  FOR SELECT USING (publicado = true AND auth.role() = 'authenticated');
CREATE POLICY "cursos_admin_write" ON cursos
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aulas_read_publicadas" ON aulas
  FOR SELECT USING (publicado = true AND auth.role() = 'authenticated');
CREATE POLICY "aulas_admin_write" ON aulas
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE progresso_aulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progresso_own_read" ON progresso_aulas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progresso_own_write" ON progresso_aulas
  FOR ALL USING (auth.uid() = user_id);

-- 5. Bucket público para capas e imagens de slide
INSERT INTO storage.buckets (id, name, public)
VALUES ('cursos-slides', 'cursos-slides', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "cursos_slides_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'cursos-slides');

CREATE POLICY "cursos_slides_admin_write" ON storage.objects
  FOR ALL USING (bucket_id = 'cursos-slides' AND auth.role() = 'authenticated');
