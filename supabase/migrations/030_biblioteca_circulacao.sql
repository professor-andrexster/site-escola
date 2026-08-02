-- 030: emprestimo, renovacao, reserva e movimentacao de exemplar. O coracao
-- do modulo. A situacao "atrasado" nunca e gravada aqui, e sempre calculada
-- comparando data_prevista com a data de hoje na hora de exibir, para o
-- sistema nao depender de rotina agendada externa.
--
-- Escrito para ser seguro de rodar de novo do zero (ver comentario da 027
-- sobre o SQL Editor nao tratar a migration inteira como uma transacao so).
-- Rodar manualmente no SQL Editor do Supabase, depois da 029.

CREATE TABLE IF NOT EXISTS biblioteca_emprestimos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exemplar_id       uuid NOT NULL REFERENCES biblioteca_exemplares(id) ON DELETE RESTRICT,
  leitor_id         uuid NOT NULL REFERENCES biblioteca_leitores(id) ON DELETE RESTRICT,
  data_emprestimo   timestamptz NOT NULL DEFAULT now(),
  data_prevista     date NOT NULL,
  data_devolucao    timestamptz,
  renovacoes_feitas integer NOT NULL DEFAULT 0,
  situacao          varchar(25) NOT NULL DEFAULT 'em_andamento' CHECK (situacao IN ('em_andamento', 'devolvido', 'devolvido_com_atraso', 'renovado', 'perdido')),
  registrado_por    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  devolvido_por     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  observacoes       text,
  criado_em         timestamptz NOT NULL DEFAULT now(),
  atualizado_em     timestamptz NOT NULL DEFAULT now()
);

-- A linha mais importante do modulo inteiro: impede dois emprestimos abertos
-- do mesmo exemplar ao mesmo tempo, mesmo com dois cliques quase juntos no
-- balcao ou chamando o banco direto. Validar isso so na aplicacao nao basta.
CREATE UNIQUE INDEX IF NOT EXISTS biblioteca_emprestimos_exemplar_aberto_idx ON biblioteca_emprestimos (exemplar_id) WHERE situacao IN ('em_andamento', 'renovado');
CREATE INDEX IF NOT EXISTS biblioteca_emprestimos_exemplar_situacao_idx ON biblioteca_emprestimos (exemplar_id, situacao);
CREATE INDEX IF NOT EXISTS biblioteca_emprestimos_leitor_situacao_idx ON biblioteca_emprestimos (leitor_id, situacao);

CREATE TABLE IF NOT EXISTS biblioteca_renovacoes (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emprestimo_id            uuid NOT NULL REFERENCES biblioteca_emprestimos(id) ON DELETE CASCADE,
  autorizado_por           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  data_prevista_anterior   date NOT NULL,
  nova_data_prevista       date NOT NULL,
  criado_em                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS biblioteca_renovacoes_emprestimo_idx ON biblioteca_renovacoes (emprestimo_id);

CREATE TABLE IF NOT EXISTS biblioteca_reservas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id       uuid NOT NULL REFERENCES biblioteca_obras(id) ON DELETE CASCADE,
  leitor_id     uuid NOT NULL REFERENCES biblioteca_leitores(id) ON DELETE CASCADE,
  data_reserva  timestamptz NOT NULL DEFAULT now(),
  posicao_fila  integer NOT NULL,
  validade      date NOT NULL,
  situacao      varchar(15) NOT NULL DEFAULT 'aguardando' CHECK (situacao IN ('aguardando', 'disponivel', 'atendida', 'expirada', 'cancelada')),
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS biblioteca_reservas_obra_situacao_idx ON biblioteca_reservas (obra_id, situacao);
CREATE INDEX IF NOT EXISTS biblioteca_reservas_leitor_idx ON biblioteca_reservas (leitor_id);

CREATE TABLE IF NOT EXISTS biblioteca_movimentacoes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exemplar_id       uuid NOT NULL REFERENCES biblioteca_exemplares(id) ON DELETE CASCADE,
  situacao_anterior varchar(15),
  situacao_nova     varchar(15) NOT NULL,
  motivo            text,
  responsavel_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS biblioteca_movimentacoes_exemplar_idx ON biblioteca_movimentacoes (exemplar_id, criado_em DESC);

ALTER TABLE biblioteca_emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_renovacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biblioteca_emprestimos_staff" ON biblioteca_emprestimos;
CREATE POLICY "biblioteca_emprestimos_staff" ON biblioteca_emprestimos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
DROP POLICY IF EXISTS "biblioteca_renovacoes_staff" ON biblioteca_renovacoes;
CREATE POLICY "biblioteca_renovacoes_staff" ON biblioteca_renovacoes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
DROP POLICY IF EXISTS "biblioteca_reservas_staff" ON biblioteca_reservas;
CREATE POLICY "biblioteca_reservas_staff" ON biblioteca_reservas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
DROP POLICY IF EXISTS "biblioteca_movimentacoes_staff" ON biblioteca_movimentacoes;
CREATE POLICY "biblioteca_movimentacoes_staff" ON biblioteca_movimentacoes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
