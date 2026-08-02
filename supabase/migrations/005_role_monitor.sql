-- A role "monitor" foi adicionada ao app (commit 17478e4), mas a tabela
-- profiles ainda tem uma constraint CHECK que só aceita os valores antigos
-- de role (aluno/professor/direcao). Por isso o PATCH para mudar o nível
-- de um usuário para "monitor" retorna 400 (Bad Request) — violação da
-- constraint CHECK.

do $$
declare
  r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('aluno', 'professor', 'monitor', 'direcao'));
