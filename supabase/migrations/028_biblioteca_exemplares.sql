-- 028: exemplar fisico. Uma obra pode ter varios exemplares, cada um com
-- tombo proprio e sua propria situacao (disponivel, emprestado, reservado,
-- em reparo, extraviado, baixado). Emprestimo, devolucao, reserva e baixa
-- acontecem sempre aqui, nunca na obra.
--
-- Escrito para ser seguro de rodar de novo do zero (ver comentario da 027
-- sobre o SQL Editor nao tratar a migration inteira como uma transacao so).
-- Rodar manualmente no SQL Editor do Supabase, depois da 027.

CREATE TABLE IF NOT EXISTS biblioteca_exemplares (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id            uuid NOT NULL REFERENCES biblioteca_obras(id) ON DELETE RESTRICT,
  tombo              varchar(30) NOT NULL,
  codigo_barras      varchar(40),
  situacao           varchar(15) NOT NULL DEFAULT 'disponivel' CHECK (situacao IN ('disponivel', 'emprestado', 'reservado', 'em_reparo', 'extraviado', 'baixado')),
  estado_conservacao varchar(15) NOT NULL DEFAULT 'bom' CHECK (estado_conservacao IN ('novo', 'bom', 'regular', 'ruim')),
  estante            varchar(20),
  prateleira         varchar(20),
  data_entrada       date NOT NULL DEFAULT current_date,
  origem_aquisicao   varchar(20) NOT NULL DEFAULT 'compra' CHECK (origem_aquisicao IN ('compra', 'doacao', 'programa_governo', 'transferencia')),
  valor_referencia   numeric(10, 2),
  consulta_local     boolean NOT NULL DEFAULT false,
  observacoes        text,
  criado_em          timestamptz NOT NULL DEFAULT now(),
  atualizado_em      timestamptz NOT NULL DEFAULT now(),
  atualizado_por     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tombo unico na escola, com opcao de digitar manual (etiqueta antiga) ou
-- deixar o sistema gerar (ver biblioteca_configuracoes.gera_tombo_automatico
-- e prefixo_tombo, na migration 031).
CREATE UNIQUE INDEX IF NOT EXISTS biblioteca_exemplares_tombo_idx ON biblioteca_exemplares (tombo);
CREATE UNIQUE INDEX IF NOT EXISTS biblioteca_exemplares_codigo_barras_idx ON biblioteca_exemplares (codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS biblioteca_exemplares_obra_situacao_idx ON biblioteca_exemplares (obra_id, situacao);

ALTER TABLE biblioteca_exemplares ENABLE ROW LEVEL SECURITY;

-- Leitura publica so pelas colunas nao sensiveis (id, obra, situacao,
-- indicador de consulta local), mesma tecnica de coluna restrita usada em
-- 016_identidade_controle.sql para a tabela alunos. Tombo, codigo de barras,
-- localizacao e valor so aparecem para quem le pelo service role (rotas
-- administrativas). Sem policy de escrita para authenticated de proposito:
-- cadastro e baixa de exemplar sao sempre via rota de servidor.
DROP POLICY IF EXISTS "biblioteca_exemplares_leitura_publica" ON biblioteca_exemplares;
CREATE POLICY "biblioteca_exemplares_leitura_publica" ON biblioteca_exemplares FOR SELECT USING (true);

REVOKE ALL ON biblioteca_exemplares FROM anon, authenticated;
GRANT SELECT (id, obra_id, situacao, consulta_local) ON biblioteca_exemplares TO anon, authenticated;
