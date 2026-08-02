-- 1. Tabela principal de alunos
CREATE TABLE alunos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            varchar(120) NOT NULL,
  matricula       varchar(20) UNIQUE NOT NULL,
  turma           varchar(20) NOT NULL,    -- ex: 1° Ano, 2° Ano, 3° Ano
  serie           varchar(20) NOT NULL,    -- 1° Ano | 2° Ano | 3° Ano
  turno           varchar(15) NOT NULL DEFAULT 'Integral',
  data_nascimento date,
  cpf             varchar(14),
  responsavel     varchar(120),
  telefone        varchar(20),
  email           varchar(100),
  foto_url        varchar(300),
  ativo           boolean DEFAULT true,
  criado_em       timestamp DEFAULT now(),
  atualizado_em   timestamp DEFAULT now()
);

-- 2. Tabela de competências mapeadas (trilhas)
CREATE TABLE trilhas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        varchar(60) NOT NULL,  -- Excel | Hardware | Software | Design | Programação
  descricao   text,
  icone       varchar(10),           -- emoji
  cor_tailwind varchar(30)           -- ex: blue-600
);

-- Seeds iniciais das trilhas
INSERT INTO trilhas (nome, descricao, icone, cor_tailwind) VALUES
  ('Excel & Dados',    'Planilhas, análise de dados, automação com fórmulas', '📊', 'green-600'),
  ('Hardware',         'Montagem, manutenção, redes físicas, eletrônica básica', '🖥️', 'orange-600'),
  ('Software',         'Instalação, configuração, suporte técnico, SO', '⚙️', 'gray-600'),
  ('Design Digital',   'Canva, Figma, identidade visual, criação de conteúdo', '🎨', 'pink-600'),
  ('Programação',      'Lógica, HTML/CSS, Python, criação de sistemas', '💻', 'blue-600');

-- 3. RLS
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

-- Apenas admin autenticado pode ler/escrever alunos
CREATE POLICY "admin_full_access" ON alunos
  FOR ALL USING (auth.role() = 'authenticated');

-- Leitura pública (para portfólio, ranking, vocacional)
CREATE POLICY "public_read_alunos" ON alunos
  FOR SELECT USING (true);

ALTER TABLE trilhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trilhas_public_read" ON trilhas FOR SELECT USING (true);
CREATE POLICY "trilhas_admin_write" ON trilhas FOR ALL USING (auth.role() = 'authenticated');
