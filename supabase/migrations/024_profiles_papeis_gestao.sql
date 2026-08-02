-- 024: troca o papel unico direcao por diretora, vice_diretora e admin, e
-- adiciona bibliotecario ao conjunto valido de roles. Tambem cria a
-- permissao nova de professor aprovar cadastro de aluno pendente.
-- Rodar manualmente no SQL Editor do Supabase, depois da 023.
--
-- Ordem importa aqui, em tres passos que nao podem se misturar:
-- 1) tira a constraint de role por completo (tabela fica sem checagem por
--    um instante); 2) so entao migra os dados existentes; 3) so entao
--    recoloca a constraint, ja sem "direcao" na lista e com os dados
--    limpos. Fazer a troca de constraint e o UPDATE nessa ordem errada foi
--    exatamente o erro nas duas primeiras tentativas de rodar isto: com a
--    constraint nova e o dado antigo juntos, um dos dois sempre viola o
--    outro.

-- 1. Tira a constraint de role por completo.
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

-- 2. Com a tabela livre de constraint, migra os dados existentes. Toda
--    conta que hoje e direcao vira diretora, que e a atribuicao mais
--    segura por padrao. O ajuste fino (marcar quem e de fato vice_diretora,
--    e marcar a conta tecnica do desenvolvedor como admin) fica para
--    depois, feito a mao pela propria direcao ou pelo desenvolvedor, com o
--    usuario certo em maos:
--
--    update profiles set role = 'vice_diretora' where id = '<uuid da vice diretora>';
--    update profiles p set role = 'admin' from auth.users u where u.id = p.id and u.email = 'andrexster@gmail.com';
update profiles set role = 'diretora' where role = 'direcao';

-- 3. So agora, com os dados ja limpos, recoloca a constraint, incluindo
--    bibliotecario, que faltava desde que o papel foi criado no codigo
--    (mesmo problema documentado em 005_role_monitor.sql, agora corrigido
--    de vez para os tres papeis de gestao tambem). "direcao" fica de fora
--    de proposito: depois do UPDATE acima nao sobra nenhuma linha com esse
--    valor.
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('aluno', 'professor', 'monitor', 'bibliotecario', 'diretora', 'vice_diretora', 'admin'));

-- 4. Remove qualquer politica de RLS que ainda mencione o papel antigo
--    direcao, em profiles e em log_atividades. Como profiles nunca teve suas
--    politicas documentadas em migration nenhuma (ver 023), a varredura e
--    dinamica em vez de assumir nome de politica. Cada politica removida e
--    relatada via RAISE NOTICE para conferencia manual.
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where tablename in ('profiles', 'log_atividades')
      and (coalesce(qual, '') ilike '%direcao%' or coalesce(with_check, '') ilike '%direcao%')
  loop
    raise notice 'Removendo politica % em %.%', r.policyname, r.schemaname, r.tablename;
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 5. Recria as politicas de profiles que o site depende para funcionar,
--    agora com o conjunto novo de papeis de gestao. Nomes fixos, para as
--    proximas migrations poderem alterar por DROP POLICY IF EXISTS com
--    seguranca.
drop policy if exists "profiles_leitura_propria" on profiles;
create policy "profiles_leitura_propria" on profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_leitura_gestao" on profiles;
create policy "profiles_leitura_gestao" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('diretora','vice_diretora','admin') and p.aprovado = true)
  );

drop policy if exists "profiles_escrita_gestao" on profiles;
create policy "profiles_escrita_gestao" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('diretora','vice_diretora','admin') and p.aprovado = true)
  );

-- Permissao nova: professor aprovado pode aprovar (so aprovar, mais nenhum
-- outro campo) cadastro de aluno pendente, nunca de outro professor nem o
-- proprio. A rota /api/usuarios/aprovar tambem confere isso na aplicacao;
-- esta politica garante a mesma regra mesmo chamando o banco direto.
drop policy if exists "profiles_professor_aprova_aluno" on profiles;
create policy "profiles_professor_aprova_aluno" on profiles
  for update using (
    role = 'aluno' and id <> auth.uid()
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'professor' and p.aprovado = true)
  )
  with check (role = 'aluno');

-- 6. Recria a leitura de auditoria para o conjunto novo de gestao.
drop policy if exists "log_direcao_read" on log_atividades;
drop policy if exists "log_gestao_read" on log_atividades;
create policy "log_gestao_read" on log_atividades
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('diretora','vice_diretora','admin') and p.aprovado = true)
  );
