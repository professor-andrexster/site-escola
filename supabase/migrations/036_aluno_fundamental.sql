-- 036: Papel aluno_fundamental.
-- Aluno do ensino fundamental nao participa da vida do painel do medio
-- (quiz por turma, aprovacao por matricula da secretaria): ele pega livro
-- na biblioteca, cadastrado la pela bibliotecaria como leitor, e acessa os
-- cursos abertos (Word, digitacao) com uma conta criada pela gestao.
-- Nenhum dado precisa migrar; e so a lista de papeis validos que cresce.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('aluno', 'aluno_fundamental', 'professor', 'monitor', 'bibliotecario', 'diretora', 'vice_diretora', 'admin'));
