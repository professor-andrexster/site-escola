-- Permite que alunos (logados ou não) entrem em salas de quiz pelo código,
-- vejam perguntas, se inscrevam como participantes e registrem respostas.
-- Sem essas políticas, o RLS bloqueia a leitura de "quizzes" e a página
-- /quiz exibe "Quiz não encontrado. Verifique o código." mesmo com o
-- código correto.

alter table public.quizzes enable row level security;
alter table public.quiz_perguntas enable row level security;
alter table public.quiz_participantes enable row level security;
alter table public.quiz_respostas enable row level security;

-- quizzes: leitura pública (necessária para localizar a sala pelo código)
do $$ begin
  create policy "Leitura pública de quizzes"
    on public.quizzes for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null;
end $$;

-- quiz_perguntas: leitura pública (aluno precisa ver as perguntas)
do $$ begin
  create policy "Leitura pública de perguntas"
    on public.quiz_perguntas for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null;
end $$;

-- quiz_participantes: inscrição, leitura (lobby/ranking) e atualização (conclusão)
do $$ begin
  create policy "Inscrição pública em quizzes"
    on public.quiz_participantes for insert
    to anon, authenticated
    with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Leitura pública de participantes"
    on public.quiz_participantes for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Atualização pública de participantes"
    on public.quiz_participantes for update
    to anon, authenticated
    using (true)
    with check (true);
exception when duplicate_object then null;
end $$;

-- quiz_respostas: aluno registra e atualiza suas respostas
do $$ begin
  create policy "Inserção pública de respostas"
    on public.quiz_respostas for insert
    to anon, authenticated
    with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Leitura pública de respostas"
    on public.quiz_respostas for select
    to anon, authenticated
    using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Atualização pública de respostas"
    on public.quiz_respostas for update
    to anon, authenticated
    using (true)
    with check (true);
exception when duplicate_object then null;
end $$;

-- Garante que quizzes e participantes propagam mudanças em tempo real
-- (lobby e estado do quiz na sala de espera)
do $$ begin
  alter publication supabase_realtime add table public.quizzes;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.quiz_participantes;
exception when duplicate_object then null;
end $$;
