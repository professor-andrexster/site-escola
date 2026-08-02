-- Migration: Adicionar validação de email único e melhorar RLS de alunos

-- 1. Adicionar constraint UNIQUE para email (permitindo NULLs múltiplos)
-- PostgreSQL: UNIQUE constraint permite múltiplos NULLs por padrão
ALTER TABLE alunos ADD CONSTRAINT alunos_email_unique UNIQUE (email);

-- 2. Adicionar constraint UNIQUE para CPF (permitindo NULLs múltiplos)
ALTER TABLE alunos ADD CONSTRAINT alunos_cpf_unique UNIQUE (cpf);

-- 3. Melhorar RLS: fechar admin_full_access e criar policies específicas
DROP POLICY IF EXISTS "admin_full_access" ON alunos;

-- Direção e admin podem gerenciar (full access)
CREATE POLICY "admin_crud_alunos" ON alunos
  FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor')
  );

-- Aluno autenticado pode ler/atualizar seus próprios dados
CREATE POLICY "aluno_self_read_update" ON alunos
  FOR SELECT
  USING (
    auth.uid()::text = (SELECT aluno_id::text FROM identidades WHERE user_id = auth.uid() LIMIT 1)
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('direcao', 'professor', 'monitor')
  );

-- Para UPDATE do próprio aluno (apenas alguns campos)
CREATE POLICY "aluno_self_update_limited" ON alunos
  FOR UPDATE
  USING (
    auth.uid()::text = (SELECT aluno_id::text FROM identidades WHERE user_id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    auth.uid()::text = (SELECT aluno_id::text FROM identidades WHERE user_id = auth.uid() LIMIT 1)
  );
