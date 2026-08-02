-- 032: auditoria do modulo de biblioteca. Toda alteracao de leitor,
-- exemplar, emprestimo e configuracao passa por aqui, com valor anterior e
-- valor novo, no mesmo espirito de log_atividades (016). Escrita so pelo
-- service role, dentro das proprias rotas que alteram cada tabela; nao ha
-- policy de insert para authenticated de proposito.
--
-- Escrito para ser seguro de rodar de novo do zero (ver comentario da 027
-- sobre o SQL Editor nao tratar a migration inteira como uma transacao so).
-- Rodar manualmente no SQL Editor do Supabase, depois da 031.

CREATE TABLE IF NOT EXISTS biblioteca_auditoria (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acao              varchar(40) NOT NULL,
  tabela_afetada    varchar(40) NOT NULL,
  registro_afetado  uuid,
  valor_anterior    jsonb,
  valor_novo        jsonb,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS biblioteca_auditoria_tabela_registro_idx ON biblioteca_auditoria (tabela_afetada, registro_afetado);
CREATE INDEX IF NOT EXISTS biblioteca_auditoria_criado_idx ON biblioteca_auditoria (criado_em DESC);

ALTER TABLE biblioteca_auditoria ENABLE ROW LEVEL SECURITY;

-- So gestao ve a auditoria (nem bibliotecario, conforme a secao de papeis do
-- prompt do modulo).
DROP POLICY IF EXISTS "biblioteca_auditoria_gestao_leitura" ON biblioteca_auditoria;
CREATE POLICY "biblioteca_auditoria_gestao_leitura" ON biblioteca_auditoria FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.aprovado = true AND p.role IN ('diretora', 'vice_diretora', 'admin'))
);
