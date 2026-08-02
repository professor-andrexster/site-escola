-- A tabela quiz_participantes nunca recebeu a coluna user_id, embora o app
-- (QuizEntrada, meus-quizzes) sempre tenha esperado essa coluna para
-- vincular o participante a um aluno logado. Sem ela, o PostgREST retorna
-- PGRST204 ("Could not find the 'user_id' column") e o aluno não consegue
-- entrar na sala do quiz.

alter table public.quiz_participantes
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists quiz_participantes_user_id_idx
  on public.quiz_participantes (user_id);
