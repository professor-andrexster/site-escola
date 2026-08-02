-- Migration: Migrar alunos autenticados (profiles) para tabela alunos

-- 1. Adicionar coluna user_id em alunos (vinculação com auth.users)
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE;
ALTER TABLE alunos ADD CONSTRAINT fk_alunos_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Sincronizar alunos autenticados: copiar profiles com role='aluno' para alunos
INSERT INTO alunos (user_id, nome, email, ativo, criado_em, atualizado_em)
SELECT
  p.id,
  p.nome_completo,
  p.email,
  p.aprovado,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.role = 'aluno'
  AND NOT EXISTS (
    SELECT 1 FROM alunos a WHERE a.user_id = p.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- 3. Atualizar turma em alunos a partir de profiles
UPDATE alunos a
SET turma = p.turma,
    serie = p.turma
FROM profiles p
WHERE a.user_id = p.id
  AND a.turma IS NULL;

-- 4. Copiar CPF e data_nascimento de identidades
UPDATE alunos a
SET cpf = i.cpf,
    data_nascimento = i.data_nascimento
FROM identidades i
WHERE i.user_id = a.user_id
  AND a.cpf IS NULL;

-- 5. Melhorar RLS de alunos:
--    - Direção vê todos
--    - Aluno vê apenas a si mesmo
--    - Leitura pública: apenas ativo para portfólio
DROP POLICY IF EXISTS "admin_crud_alunos" ON alunos;
DROP POLICY IF EXISTS "aluno_self_read_update" ON alunos;
DROP POLICY IF EXISTS "aluno_self_update_limited" ON alunos;

CREATE POLICY "admin_crud_alunos" ON alunos
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor')
  );

CREATE POLICY "aluno_self_read" ON alunos
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor')
  );

CREATE POLICY "aluno_self_update" ON alunos
  FOR UPDATE
  USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor'))
  WITH CHECK (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor'));

CREATE POLICY "public_read_portfolio" ON alunos
  FOR SELECT
  USING (ativo = true);
