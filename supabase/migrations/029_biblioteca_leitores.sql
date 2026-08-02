-- 029: leitores da biblioteca (quem pode pegar livro emprestado). Tipo
-- aluno, professor, funcionario ou comunidade. Responsavel obrigatorio para
-- aluno menor de idade e validado na aplicacao, nao aqui no banco, seguindo
-- o padrao ja usado no resto do projeto (regra de negocio em TypeScript).
--
-- Escrito para ser seguro de rodar de novo do zero (ver comentario da 027
-- sobre o SQL Editor nao tratar a migration inteira como uma transacao so).
-- Rodar manualmente no SQL Editor do Supabase, depois da 028.

CREATE TABLE IF NOT EXISTS biblioteca_leitores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo        varchar(150) NOT NULL,
  nome_social          varchar(150),
  tipo_leitor          varchar(15) NOT NULL CHECK (tipo_leitor IN ('aluno', 'professor', 'funcionario', 'comunidade')),
  matricula            varchar(30),
  data_nascimento      date,
  turma                varchar(20),
  turno                varchar(15),
  ano_escolar          varchar(20),
  telefone             varchar(20),
  email                varchar(120),
  nome_responsavel     varchar(150),
  telefone_responsavel varchar(20),
  situacao             varchar(15) NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'bloqueado')),
  motivo_bloqueio      text,
  data_cadastro        timestamptz NOT NULL DEFAULT now(),
  observacoes          text,
  criado_em            timestamptz NOT NULL DEFAULT now(),
  atualizado_em        timestamptz NOT NULL DEFAULT now(),
  atualizado_por       uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS biblioteca_leitores_nome_busca_idx ON biblioteca_leitores USING gin (biblioteca_texto_busca(nome_completo) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS biblioteca_leitores_matricula_idx ON biblioteca_leitores (matricula);
CREATE INDEX IF NOT EXISTS biblioteca_leitores_tipo_situacao_idx ON biblioteca_leitores (tipo_leitor, situacao);

ALTER TABLE biblioteca_leitores ENABLE ROW LEVEL SECURITY;

-- Sem leitura publica: dado de leitor (telefone, responsavel, contato) e
-- justamente o que a consulta publica do acervo nunca pode alcançar.
DROP POLICY IF EXISTS "biblioteca_leitores_staff" ON biblioteca_leitores;
CREATE POLICY "biblioteca_leitores_staff" ON biblioteca_leitores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
