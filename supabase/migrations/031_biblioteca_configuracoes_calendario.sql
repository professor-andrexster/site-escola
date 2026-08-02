-- 031: parametros de funcionamento da biblioteca e calendario de recesso.
-- Nenhuma regra operacional (prazo, limite, multa) fica fixa no codigo: tudo
-- aqui, editavel em tela por gestao, com o valor inicial sugerido ja
-- inserido. Onde a bibliotecaria ainda nao respondeu, o padrao fica
-- documentado no proprio nome do campo e pode ser ajustado a qualquer hora.
--
-- Escrito para ser seguro de rodar de novo do zero (ver comentario da 027
-- sobre o SQL Editor nao tratar a migration inteira como uma transacao so).
-- Rodar manualmente no SQL Editor do Supabase, depois da 030.

-- Linha unica: id booleano fixo em true garante que so existe uma linha.
CREATE TABLE IF NOT EXISTS biblioteca_configuracoes (
  id                                     boolean PRIMARY KEY DEFAULT true CHECK (id),
  prazo_dias_aluno                       integer NOT NULL DEFAULT 7,
  prazo_dias_professor                   integer NOT NULL DEFAULT 15,
  prazo_dias_funcionario                 integer NOT NULL DEFAULT 15,
  prazo_dias_comunidade                  integer NOT NULL DEFAULT 7,
  limite_exemplares_aluno                integer NOT NULL DEFAULT 2,
  limite_exemplares_professor            integer NOT NULL DEFAULT 5,
  limite_exemplares_funcionario          integer NOT NULL DEFAULT 5,
  limite_exemplares_comunidade           integer NOT NULL DEFAULT 1,
  max_renovacoes                         integer NOT NULL DEFAULT 2,
  dias_suspensao_por_atraso              integer NOT NULL DEFAULT 0,
  multa_habilitada                       boolean NOT NULL DEFAULT false,
  valor_multa_por_dia                    numeric(10, 2) NOT NULL DEFAULT 0,
  gera_tombo_automatico                  boolean NOT NULL DEFAULT true,
  prefixo_tombo                          varchar(10) NOT NULL DEFAULT 'BIB',
  reserva_habilitada                     boolean NOT NULL DEFAULT true,
  prazo_validade_reserva_dias            integer NOT NULL DEFAULT 2,
  consulta_interna_professor_habilitada  boolean NOT NULL DEFAULT false,
  nome_biblioteca                        varchar(150) NOT NULL DEFAULT 'Biblioteca E.E. Dr. João Beraldo',
  texto_comprovante                      text,
  observacoes_implantacao                text,
  atualizado_em                          timestamptz NOT NULL DEFAULT now(),
  atualizado_por                         uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO biblioteca_configuracoes (id, observacoes_implantacao) VALUES (
  true,
  'Valores iniciais sugeridos, pendentes de confirmação com a bibliotecária: prazos, limites, renovações, multa. Acervo atual (planilha, sistema antigo ou papel), etiqueta de tombo já colada, existência de leitor de código de barras e impressora de etiqueta, e se empréstimo acontece só no balcão ou também em sala.'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS biblioteca_calendario (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date NOT NULL UNIQUE,
  motivo      varchar(60) NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now(),
  criado_por  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS biblioteca_calendario_data_idx ON biblioteca_calendario (data);

ALTER TABLE biblioteca_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_calendario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biblioteca_configuracoes_staff_leitura" ON biblioteca_configuracoes;
CREATE POLICY "biblioteca_configuracoes_staff_leitura" ON biblioteca_configuracoes FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
DROP POLICY IF EXISTS "biblioteca_configuracoes_gestao_escrita" ON biblioteca_configuracoes;
CREATE POLICY "biblioteca_configuracoes_gestao_escrita" ON biblioteca_configuracoes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND p.role IN ('diretora', 'vice_diretora', 'admin'))
);

DROP POLICY IF EXISTS "biblioteca_calendario_staff_leitura" ON biblioteca_calendario;
CREATE POLICY "biblioteca_calendario_staff_leitura" ON biblioteca_calendario FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND (p.role = 'bibliotecario' OR p.role IN ('diretora', 'vice_diretora', 'admin')))
);
DROP POLICY IF EXISTS "biblioteca_calendario_gestao_escrita" ON biblioteca_calendario;
CREATE POLICY "biblioteca_calendario_gestao_escrita" ON biblioteca_calendario FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND p.role IN ('diretora', 'vice_diretora', 'admin'))
);
