-- 027: catalogo bibliografico. Obra e exemplar sao coisas diferentes: a obra
-- e a informacao bibliografica (titulo, autor, editora, isbn), o exemplar e
-- o objeto fisico na estante, criado na migration seguinte. Autor entra em
-- tabela propria com tabela de ligacao, porque livro com mais de um autor e
-- comum e concatenar tudo num campo de texto trava a busca depois.
--
-- Escrito para ser seguro de rodar de novo do zero (CREATE TABLE/INDEX IF
-- NOT EXISTS, DROP POLICY IF EXISTS antes de recriar), porque o SQL Editor
-- do Supabase aplica cada comando na hora, nao a migration inteira como uma
-- transacao so: se um comando no meio falhar, os anteriores ja ficam
-- gravados, e rodar de novo sem isso ia esbarrar em "ja existe".
-- Rodar manualmente no SQL Editor do Supabase, depois da 026.

CREATE TABLE IF NOT EXISTS biblioteca_categorias (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         varchar(80) NOT NULL UNIQUE,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS biblioteca_editoras (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         varchar(120) NOT NULL,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS biblioteca_autores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         varchar(150) NOT NULL,
  ativo        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS biblioteca_obras (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo                   varchar(300) NOT NULL,
  subtitulo                varchar(300),
  ano_publicacao           integer,
  edicao                   varchar(40),
  isbn                     varchar(20),
  idioma                   varchar(40) NOT NULL DEFAULT 'Portugues',
  numero_paginas           integer,
  sinopse                  text,
  palavras_chave           text[] NOT NULL DEFAULT '{}',
  publico_indicado         varchar(60),
  area_conhecimento        varchar(80),
  classificacao_catalogacao varchar(60),
  situacao                 varchar(15) NOT NULL DEFAULT 'ativa' CHECK (situacao IN ('ativa', 'inativa')),
  capa_url                 text,
  observacoes_internas     text,
  editora_id               uuid REFERENCES biblioteca_editoras(id) ON DELETE SET NULL,
  categoria_id             uuid REFERENCES biblioteca_categorias(id) ON DELETE SET NULL,
  criado_em                timestamptz NOT NULL DEFAULT now(),
  atualizado_em            timestamptz NOT NULL DEFAULT now(),
  atualizado_por           uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS biblioteca_obras_autores (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id   uuid NOT NULL REFERENCES biblioteca_obras(id) ON DELETE CASCADE,
  autor_id  uuid NOT NULL REFERENCES biblioteca_autores(id) ON DELETE RESTRICT,
  UNIQUE (obra_id, autor_id)
);

-- Indices de busca: parcial e sem acento em titulo e em nome de autor,
-- exato (mas indexado) em isbn.
CREATE INDEX IF NOT EXISTS biblioteca_obras_titulo_busca_idx ON biblioteca_obras USING gin (biblioteca_texto_busca(titulo) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS biblioteca_obras_isbn_idx ON biblioteca_obras (isbn);
CREATE INDEX IF NOT EXISTS biblioteca_obras_categoria_idx ON biblioteca_obras (categoria_id);
CREATE INDEX IF NOT EXISTS biblioteca_autores_nome_busca_idx ON biblioteca_autores USING gin (biblioteca_texto_busca(nome) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS biblioteca_obras_autores_obra_idx ON biblioteca_obras_autores (obra_id);
CREATE INDEX IF NOT EXISTS biblioteca_obras_autores_autor_idx ON biblioteca_obras_autores (autor_id);

ALTER TABLE biblioteca_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_editoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_autores ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_obras_autores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biblioteca_categorias_leitura_publica" ON biblioteca_categorias;
CREATE POLICY "biblioteca_categorias_leitura_publica" ON biblioteca_categorias FOR SELECT USING (ativo = true);
DROP POLICY IF EXISTS "biblioteca_categorias_staff" ON biblioteca_categorias;
CREATE POLICY "biblioteca_categorias_staff" ON biblioteca_categorias FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);

DROP POLICY IF EXISTS "biblioteca_editoras_leitura_publica" ON biblioteca_editoras;
CREATE POLICY "biblioteca_editoras_leitura_publica" ON biblioteca_editoras FOR SELECT USING (ativo = true);
DROP POLICY IF EXISTS "biblioteca_editoras_staff" ON biblioteca_editoras;
CREATE POLICY "biblioteca_editoras_staff" ON biblioteca_editoras FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);

DROP POLICY IF EXISTS "biblioteca_autores_leitura_publica" ON biblioteca_autores;
CREATE POLICY "biblioteca_autores_leitura_publica" ON biblioteca_autores FOR SELECT USING (ativo = true);
DROP POLICY IF EXISTS "biblioteca_autores_staff" ON biblioteca_autores;
CREATE POLICY "biblioteca_autores_staff" ON biblioteca_autores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);

DROP POLICY IF EXISTS "biblioteca_obras_leitura_publica" ON biblioteca_obras;
CREATE POLICY "biblioteca_obras_leitura_publica" ON biblioteca_obras FOR SELECT USING (situacao = 'ativa');
DROP POLICY IF EXISTS "biblioteca_obras_staff" ON biblioteca_obras;
CREATE POLICY "biblioteca_obras_staff" ON biblioteca_obras FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);

DROP POLICY IF EXISTS "biblioteca_obras_autores_leitura_publica" ON biblioteca_obras_autores;
CREATE POLICY "biblioteca_obras_autores_leitura_publica" ON biblioteca_obras_autores FOR SELECT USING (true);
DROP POLICY IF EXISTS "biblioteca_obras_autores_staff" ON biblioteca_obras_autores;
CREATE POLICY "biblioteca_obras_autores_staff" ON biblioteca_obras_autores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
