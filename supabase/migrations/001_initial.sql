-- Extensão para UUID
create extension if not exists "uuid-ossp";

-- Tabela de notícias
create table if not exists public.noticias (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  slug text unique not null,
  resumo text,
  conteudo text,
  imagem_url text,
  destaque_home boolean not null default false,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de conteúdo de páginas
create table if not exists public.paginas_conteudo (
  id uuid primary key default uuid_generate_v4(),
  pagina text not null unique,
  titulo text,
  conteudo text,
  updated_at timestamptz not null default now()
);

-- Tabela de configurações do site
create table if not exists public.configuracoes_site (
  chave text primary key,
  valor text
);

-- Trigger para atualizar updated_at em noticias
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger noticias_updated_at
  before update on public.noticias
  for each row execute function public.set_updated_at();

create trigger paginas_conteudo_updated_at
  before update on public.paginas_conteudo
  for each row execute function public.set_updated_at();

-- Garantir apenas um destaque_home=true por vez
create or replace function public.ensure_single_destaque()
returns trigger as $$
begin
  if new.destaque_home = true then
    update public.noticias
    set destaque_home = false
    where id != new.id and destaque_home = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger noticias_single_destaque
  before insert or update on public.noticias
  for each row execute function public.ensure_single_destaque();

-- RLS (Row Level Security)
alter table public.noticias enable row level security;
alter table public.paginas_conteudo enable row level security;
alter table public.configuracoes_site enable row level security;

-- Políticas para noticias
create policy "Leitura pública de notícias publicadas"
  on public.noticias for select
  using (publicado = true);

create policy "Admins podem ver todas notícias"
  on public.noticias for select
  to authenticated
  using (true);

create policy "Admins podem inserir notícias"
  on public.noticias for insert
  to authenticated
  with check (true);

create policy "Admins podem atualizar notícias"
  on public.noticias for update
  to authenticated
  using (true);

create policy "Admins podem deletar notícias"
  on public.noticias for delete
  to authenticated
  using (true);

-- Políticas para paginas_conteudo
create policy "Leitura pública de páginas"
  on public.paginas_conteudo for select
  using (true);

create policy "Admins podem gerenciar páginas"
  on public.paginas_conteudo for all
  to authenticated
  using (true)
  with check (true);

-- Políticas para configuracoes_site
create policy "Leitura pública de configurações"
  on public.configuracoes_site for select
  using (true);

create policy "Admins podem gerenciar configurações"
  on public.configuracoes_site for all
  to authenticated
  using (true)
  with check (true);

-- Dados iniciais
insert into public.paginas_conteudo (pagina, titulo, conteudo) values
  ('sobre', '79 Anos de Legado Educacional', '<h2>O Pilar da Educação Pública em Carlos Chagas</h2><p>A E.E. Doutor João Beraldo, fundada em 1946 em Carlos Chagas (MG), é um pilar da educação pública estadual, atendendo cerca de 340 alunos com ênfase em inclusão e transformação social.</p><p>Nossos pilares: Ensino Fundamental (anos finais), Ensino Médio de Tempo Integral (EMTI desde 2020) e EJA, guiados pelo PPP 2019/2022 para planejamento democrático e equidade.</p><h2>Linha do Tempo</h2><ul><li><strong>1946</strong> — Fundação como Grupo Escolar Dr. João Beraldo</li><li><strong>1981</strong> — Ensino Fundamental completo (6ª a 8ª séries)</li><li><strong>2009</strong> — Início do Ensino Médio</li><li><strong>2020</strong> — Implantação do EMTI (Ensino Médio em Tempo Integral)</li></ul><h2>Estrutura</h2><p>Prédio modernizado com 25 salas, biblioteca com 2.000 volumes + acervo digital, laboratório de informática com 40 computadores, internet 100 Mbps, quadra FEEMG e acessibilidade completa. Equipe de 28 docentes, 100% graduados.</p>'),
  ('emti', 'Ensino Médio em Tempo Integral', '<h2>O que é o EMTI?</h2><p>O Ensino Médio em Tempo Integral (EMTI) é um modelo educacional que amplia a jornada escolar dos estudantes, oferecendo uma formação mais completa que une o currículo obrigatório a atividades complementares de desenvolvimento humano.</p><p>Na E.E. Dr. João Beraldo, o EMTI foi implantado em 2020 e se tornou referência em Carlos Chagas — MG, com foco em projetos, robótica e qualificação profissional.</p><h2>Diferenciais</h2><ul><li>Jornada ampliada com atividades no contraturno</li><li>Projeto de Vida como disciplina estruturante</li><li>Eletivas para desenvolvimento de habilidades específicas</li><li>Protagonismo Juvenil como eixo formativo</li><li>Laboratório de informática e robótica</li></ul>'),
  ('eletivas', 'Eletivas', '<h2>Disciplinas Eletivas</h2><p>As Eletivas são disciplinas de livre escolha dos estudantes que complementam sua formação com base em seus interesses e projetos de vida. Na E.E. Dr. João Beraldo, as eletivas conectam o currículo à realidade dos alunos e às demandas do século XXI.</p><p>As turmas são formadas por estudantes de diferentes séries que compartilham interesses em comum, promovendo a integração e o protagonismo juvenil.</p>'),
  ('projeto-vida', 'Projeto de Vida', '<h2>Projeto de Vida</h2><p>O Projeto de Vida é uma disciplina estruturante do EMTI que auxilia os estudantes a refletirem sobre seus sonhos, valores e metas, construindo um planejamento consciente para o futuro.</p><p>Na E.E. Dr. João Beraldo, o Projeto de Vida é trabalhado de forma contínua ao longo dos três anos do Ensino Médio, com atividades individuais e em grupo que estimulam o autoconhecimento e a tomada de decisão.</p>'),
  ('protagonismo', 'Protagonismo Juvenil', '<h2>Protagonismo Juvenil</h2><p>O Protagonismo Juvenil é um dos eixos centrais do EMTI. Ele parte do princípio de que os jovens são agentes de transformação — não apenas na escola, mas na família e na comunidade.</p><p>Na E.E. Dr. João Beraldo, os estudantes desenvolvem projetos reais que impactam a escola e a cidade de Carlos Chagas, exercendo liderança, responsabilidade e espírito de coletividade.</p>')
on conflict (pagina) do nothing;

insert into public.configuracoes_site (chave, valor) values
  ('nome_escola', 'E.E. Dr. João Beraldo'),
  ('descricao_escola', 'Escola Estadual Dr. João Beraldo — EMTI — Carlos Chagas, MG'),
  ('logo_url', ''),
  ('cor_primaria', '#1e40af'),
  ('cor_secundaria', '#16a34a'),
  ('telefone', '(33) 99870-1618'),
  ('whatsapp', '5533998701618'),
  ('email', 'escola.146579.secretaria@educacao.mg.gov.br'),
  ('endereco', 'Av. Gabriel Passos, 393 — Centro, Carlos Chagas — MG')
on conflict (chave) do nothing;

-- Tabela de leads (formulário de contato)
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null,
  telefone text,
  mensagem text,
  lido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Leads podem ser inseridos por qualquer pessoa"
  on public.leads for insert
  with check (true);

create policy "Admins podem ver e gerenciar leads"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);
