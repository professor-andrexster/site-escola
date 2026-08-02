-- 033: corrige recursao infinita nas politicas de RLS que checam "este
-- usuario e gestao" ou "este usuario e staff da biblioteca".
--
-- O problema: toda policy criada nas migrations 024 a 032 que precisava
-- saber o papel do usuario logado fazia isto dentro da propria policy:
--
--   exists (select 1 from profiles p where p.id = auth.uid() and p.role in (...))
--
-- Quando o Postgres avalia essa policy, ele precisa rodar essa subquery.
-- Como a subquery tambem le a tabela profiles, ele precisa avaliar as
-- policies de profiles de novo para essa leitura, incluindo a MESMA policy
-- recursiva. Isso trava o banco com o erro 42P17, "infinite recursion
-- detected in policy for relation profiles", e derruba a leitura do
-- proprio perfil no login para qualquer pessoa, em qualquer papel.
--
-- A correcao padrao do Postgres para esse problema e mover a checagem para
-- uma funcao security definer: a funcao roda com o dono dela (que nao tem
-- RLS aplicada), entao a consulta interna le profiles direto, sem
-- reavaliar policy nenhuma. Rodar manualmente no SQL Editor do Supabase,
-- depois da 032.

create or replace function public.eh_gestao()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('diretora', 'vice_diretora', 'admin') and aprovado = true
  );
$$;

create or replace function public.eh_biblioteca_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and aprovado = true
      and (role = 'bibliotecario' or role in ('diretora', 'vice_diretora', 'admin'))
  );
$$;

create or replace function public.eh_professor_aprovado()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'professor' and aprovado = true
  );
$$;

revoke all on function public.eh_gestao() from public;
revoke all on function public.eh_biblioteca_staff() from public;
revoke all on function public.eh_professor_aprovado() from public;
grant execute on function public.eh_gestao() to authenticated;
grant execute on function public.eh_biblioteca_staff() to authenticated;
grant execute on function public.eh_professor_aprovado() to authenticated;

-- profiles
drop policy if exists "profiles_leitura_gestao" on profiles;
create policy "profiles_leitura_gestao" on profiles for select using (eh_gestao());

drop policy if exists "profiles_escrita_gestao" on profiles;
create policy "profiles_escrita_gestao" on profiles for update using (eh_gestao());

drop policy if exists "profiles_professor_aprova_aluno" on profiles;
create policy "profiles_professor_aprova_aluno" on profiles
  for update using (role = 'aluno' and id <> auth.uid() and eh_professor_aprovado())
  with check (role = 'aluno');

-- log_atividades
drop policy if exists "log_gestao_read" on log_atividades;
create policy "log_gestao_read" on log_atividades for select using (eh_gestao());

-- convites_usuario
drop policy if exists "convites_usuario_gestao" on convites_usuario;
create policy "convites_usuario_gestao" on convites_usuario for all using (eh_gestao());

-- catalogo da biblioteca
drop policy if exists "biblioteca_categorias_staff" on biblioteca_categorias;
create policy "biblioteca_categorias_staff" on biblioteca_categorias for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_editoras_staff" on biblioteca_editoras;
create policy "biblioteca_editoras_staff" on biblioteca_editoras for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_autores_staff" on biblioteca_autores;
create policy "biblioteca_autores_staff" on biblioteca_autores for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_obras_staff" on biblioteca_obras;
create policy "biblioteca_obras_staff" on biblioteca_obras for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_obras_autores_staff" on biblioteca_obras_autores;
create policy "biblioteca_obras_autores_staff" on biblioteca_obras_autores for all using (eh_biblioteca_staff());

-- leitores
drop policy if exists "biblioteca_leitores_staff" on biblioteca_leitores;
create policy "biblioteca_leitores_staff" on biblioteca_leitores for all using (eh_biblioteca_staff());

-- circulacao
drop policy if exists "biblioteca_emprestimos_staff" on biblioteca_emprestimos;
create policy "biblioteca_emprestimos_staff" on biblioteca_emprestimos for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_renovacoes_staff" on biblioteca_renovacoes;
create policy "biblioteca_renovacoes_staff" on biblioteca_renovacoes for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_reservas_staff" on biblioteca_reservas;
create policy "biblioteca_reservas_staff" on biblioteca_reservas for all using (eh_biblioteca_staff());

drop policy if exists "biblioteca_movimentacoes_staff" on biblioteca_movimentacoes;
create policy "biblioteca_movimentacoes_staff" on biblioteca_movimentacoes for all using (eh_biblioteca_staff());

-- configuracoes e calendario
drop policy if exists "biblioteca_configuracoes_staff_leitura" on biblioteca_configuracoes;
create policy "biblioteca_configuracoes_staff_leitura" on biblioteca_configuracoes for select using (eh_biblioteca_staff());

drop policy if exists "biblioteca_configuracoes_gestao_escrita" on biblioteca_configuracoes;
create policy "biblioteca_configuracoes_gestao_escrita" on biblioteca_configuracoes for update using (eh_gestao());

drop policy if exists "biblioteca_calendario_staff_leitura" on biblioteca_calendario;
create policy "biblioteca_calendario_staff_leitura" on biblioteca_calendario for select using (eh_biblioteca_staff());

drop policy if exists "biblioteca_calendario_gestao_escrita" on biblioteca_calendario;
create policy "biblioteca_calendario_gestao_escrita" on biblioteca_calendario for all using (eh_gestao());

-- auditoria
drop policy if exists "biblioteca_auditoria_gestao_leitura" on biblioteca_auditoria;
create policy "biblioteca_auditoria_gestao_leitura" on biblioteca_auditoria for select using (eh_gestao());
