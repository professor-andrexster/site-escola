-- 019: contador de respostas ao vivo no telão do professor.
-- A migration 003 colocou quizzes e quiz_participantes na publicação
-- realtime, mas esqueceu quiz_respostas: sem isso o telão de comando
-- nunca recebe os eventos de resposta dos alunos.
do $$ begin
  alter publication supabase_realtime add table public.quiz_respostas;
exception when duplicate_object then null;
end $$;
