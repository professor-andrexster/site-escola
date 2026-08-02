-- Função para o ranking geral acumulado (soma de pontos de todos os quizzes
-- concluídos, por aluno logado). Usa SECURITY DEFINER para poder agregar
-- dados de profiles + quiz_participantes sem expor a tabela profiles
-- inteira via RLS para usuários anônimos/autenticados — só retorna nome,
-- turma e pontuação total, mesma informação já exibida publicamente no
-- ranking por quiz.

create or replace function public.ranking_geral_quiz()
returns table (user_id uuid, nome_completo text, turma text, pontuacao_total bigint)
language sql
security definer
set search_path = public
as $$
  select p.id, p.nome_completo, p.turma, coalesce(sum(qp.pontuacao_total), 0) as pontuacao_total
  from public.profiles p
  join public.quiz_participantes qp on qp.user_id = p.id and qp.concluido = true
  group by p.id, p.nome_completo, p.turma
  order by pontuacao_total desc;
$$;

grant execute on function public.ranking_geral_quiz() to anon, authenticated;
