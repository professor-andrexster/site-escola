-- Adiciona colunas de turma-alvo e lobby na tabela quizzes
alter table public.quizzes
  add column if not exists turma_alvo text not null default 'Todos',
  add column if not exists lobby_aberto boolean not null default false;
