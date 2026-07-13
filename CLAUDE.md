# CLAUDE.md — Site da Escola EMTI

## Visão Geral do Projeto

Site institucional para escola de **Ensino Médio em Tempo Integral (EMTI)**, com painel administrativo (dashboard) para gestão de conteúdo, **módulo de cursos com aulas e desafios**, deploy no Vercel, e arquitetura moderna baseada em Next.js + Supabase.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Storage de imagens | Supabase Storage |
| Editor de texto | TipTap (rich text) |

---

## Estrutura de Páginas

### Público (Site)

```
/                        → Home — Hero com notícia em destaque + cards das últimas notícias
/sobre                   → Sobre a Escola
/emti                    → O que é o EMTI
/emti/projeto-vida       → Projeto de Vida
/emti/eletivas           → Eletivas
/emti/protagonismo       → Protagonismo Juvenil
/noticias                → Listagem de todas as notícias
/noticias/[slug]         → Notícia individual
/cursos                  → Listagem de cursos publicados
/cursos/[slug]           → Página do curso (trilha de aulas + desafios)
/cursos/[slug]/[aula]    → Aula individual dentro do curso
/contato                 → Contato
```

### Administrativo (Dashboard)

```
/admin                       → Login
/admin/dashboard             → Painel principal
/admin/noticias              → Gerenciar notícias (listar, criar, editar, deletar)
/admin/noticias/nova         → Criar nova notícia
/admin/noticias/[id]         → Editar notícia
/admin/cursos                → Gerenciar cursos (listar, criar, editar, deletar)
/admin/cursos/novo           → Criar novo curso
/admin/cursos/[id]           → Editar curso e ordenar aulas
/admin/cursos/[id]/aulas/nova → Criar nova aula no curso
/admin/cursos/[id]/aulas/[aulaId] → Editar aula
/admin/sobre                 → Editar conteúdo da página Sobre
/admin/emti                  → Editar conteúdo das páginas EMTI
/admin/configuracoes         → Configurações gerais (nome da escola, logo, cores)
```

---

## Agentes de IA (Claude Code Subagentes)

### Agente 1 — `architect-agent`
**Responsabilidade:** Scaffolding inicial do projeto

**Prompt:**
```
Você é um arquiteto de software especializado em Next.js 14 com App Router.
Crie o scaffolding completo do projeto com:
- Estrutura de pastas (app/, components/, lib/, types/)
- Configuração do Tailwind CSS com tema personalizado escolar
- Setup do Supabase client (server e client-side)
- Configuração do shadcn/ui
- Variáveis de ambiente (.env.local.example)
- Schema do banco de dados Supabase (SQL migrations)
Tabelas necessárias: noticias, paginas_conteudo, configuracoes_site,
cursos, aulas, desafios
```

### Agente 2 — `schema-agent`
**Responsabilidade:** Banco de dados e tipos

**Prompt:**
```
Crie o schema SQL completo para Supabase com as seguintes tabelas:

noticias:
- id (uuid, primary key)
- titulo (text, not null)
- slug (text, unique, not null)
- resumo (text)
- conteudo (text — HTML do TipTap)
- imagem_url (text)
- destaque_home (boolean, default false)
- publicado (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

paginas_conteudo:
- id (uuid)
- pagina (text — 'sobre', 'emti', 'eletivas', etc.)
- titulo (text)
- conteudo (text)
- updated_at (timestamp)

configuracoes_site:
- chave (text, primary key)
- valor (text)

cursos:
- id (uuid, primary key)
- titulo (text, not null)
- slug (text, unique, not null)
- descricao (text)
- area (text — área/tema do curso, ex.: 'tecnologia', 'ciencias')
- imagem_url (text)
- publicado (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

aulas:
- id (uuid, primary key)
- curso_id (uuid, foreign key → cursos.id, on delete cascade)
- titulo (text, not null)
- slug (text, not null)
- conteudo (text — HTML do TipTap)
- ordem (integer, not null — posição da aula na trilha)
- publicado (boolean, default false)
- revisado (boolean, default false — marcado true só após passar pelo review-agent)
- created_at (timestamp)
- updated_at (timestamp)
- unique (curso_id, slug)

desafios:
- id (uuid, primary key)
- curso_id (uuid, foreign key → cursos.id, on delete cascade)
- aula_id (uuid, foreign key → aulas.id, nullable — desafio pode ser de fim de curso)
- titulo (text, not null)
- enunciado (text)
- tipo (text — 'quiz', 'pratico', 'dissertativo')
- gabarito (text)
- ordem (integer)
- created_at (timestamp)

Inclua RLS policies: leitura pública para conteúdo publicado, escrita apenas para usuários autenticados.
Gere também os tipos TypeScript correspondentes em /types/database.ts
```

### Agente 3 — `ui-agent`
**Responsabilidade:** Componentes visuais do site público

**Prompt:**
```
Crie os componentes React para o site público da escola EMTI em Next.js 14.
Estética: educacional, moderna, acolhedora. Paleta em azul/verde/branco.
Fontes: Fraunces (títulos) + DM Sans (corpo).

Componentes a criar:
1. Header com navegação: Sobre a Escola | EMTI (dropdown) | Cursos | Notícias | Contato
2. HeroBanner — exibe a notícia marcada como destaque_home=true com imagem full-width
3. NewsCard — card compacto de notícia com imagem, título, resumo e data
4. NewsGrid — grid das notícias da semana atual (últimas 7 dias)
5. CourseCard — card de curso com imagem, título, área e número de aulas
6. CourseGrid — grid dos cursos publicados
7. LessonTrail — trilha vertical das aulas do curso, com desafios intercalados
8. ChallengeBox — bloco de desafio com enunciado e área de resposta
9. Footer institucional
10. PageLayout — wrapper com header/footer

Cada componente deve receber seus dados via props (server components onde possível).
```

### Agente 4 — `pages-agent`
**Responsabilidade:** Páginas e rotas do Next.js

**Prompt:**
```
Crie as páginas Next.js 14 (App Router) para o site da escola EMTI:

1. page.tsx (Home):
   - Busca notícia com destaque_home=true no Supabase (Server Component)
   - Renderiza HeroBanner com ela
   - Busca notícias da semana atual (created_at >= 7 dias atrás, publicado=true)
   - Renderiza NewsGrid com cards

2. /sobre/page.tsx:
   - Busca conteúdo da tabela paginas_conteudo onde pagina='sobre'
   - Renderiza com layout editorial

3. /emti/page.tsx + subpáginas:
   - Seções: O que é o EMTI, Projeto de Vida, Eletivas, Protagonismo Juvenil
   - Conteúdo editável via dashboard

4. /noticias/page.tsx:
   - Listagem paginada de todas as notícias publicadas

5. /noticias/[slug]/page.tsx:
   - Página individual da notícia
   - generateStaticParams para SSG
   - generateMetadata para SEO

6. /cursos/page.tsx:
   - Lista os cursos publicados (CourseGrid)

7. /cursos/[slug]/page.tsx:
   - Página do curso: descrição + LessonTrail com aulas ordenadas e desafios intercalados
   - generateStaticParams / generateMetadata

8. /cursos/[slug]/[aula]/page.tsx:
   - Aula individual, com navegação anterior/próxima e o desafio ligado à aula

Use sempre Server Components com fetch direto ao Supabase.
```

### Agente 5 — `dashboard-agent`
**Responsabilidade:** Painel administrativo completo

**Prompt:**
```
Crie o dashboard administrativo em /admin usando Next.js 14 App Router + shadcn/ui.

Funcionalidades:
1. Login com Supabase Auth (email/senha) em /admin/page.tsx
2. Middleware de proteção: redireciona para /admin se não autenticado
3. Layout do admin com sidebar: Notícias | Cursos | Conteúdo das Páginas | Configurações

Gerenciador de Notícias (/admin/noticias):
- Tabela com todas as notícias (título, status publicado, destaque_home, data)
- Botões: Nova Notícia, Editar, Deletar, Toggle Publicado, Toggle Destaque
- APENAS UMA notícia pode ter destaque_home=true (ao ativar uma, desativa as outras)

Editor de Notícia (/admin/noticias/nova e /admin/noticias/[id]):
- Campo: Título (input)
- Campo: Slug (auto-gerado do título, editável)
- Campo: Resumo (textarea)
- Campo: Conteúdo (editor TipTap rich text com toolbar)
- Campo: Imagem (upload para Supabase Storage, preview)
- Toggle: Publicado
- Toggle: Destaque na Home
- Botões: Salvar Rascunho | Publicar

Gerenciador de Cursos (/admin/cursos):
- Tabela com todos os cursos (título, área, nº de aulas, status publicado)
- Botões: Novo Curso, Editar, Deletar, Toggle Publicado
- Ao abrir um curso: lista de aulas com ordenação (drag ou setas) e botão Nova Aula

Editor de Curso (/admin/cursos/novo e /admin/cursos/[id]):
- Campo: Título / Slug / Descrição / Área / Imagem
- Lista de aulas ordenáveis

Editor de Aula (/admin/cursos/[id]/aulas/nova e .../[aulaId]):
- Campo: Título / Slug / Conteúdo (TipTap)
- Campo: Ordem
- Toggle: Publicado
- IMPORTANTE: ao salvar uma aula, dispare SEMPRE o review-agent (Agente 7)
  antes de permitir publicar. A aula só pode ter revisado=true depois de passar
  na revisão. Se o review-agent apontar problemas, bloqueie a publicação e
  mostre o relatório ao editor.
- Gerenciador de desafios da aula (criar/editar/remover)

Editor de Páginas (/admin/sobre, /admin/emti):
- Editor TipTap para cada seção de conteúdo
- Botão Salvar

Use shadcn/ui components: Table, Button, Dialog, Form, Input, Textarea, Switch, Badge.
```

### Agente 6 — `deploy-agent`
**Responsabilidade:** Configuração de deploy no Vercel

**Prompt:**
```
Configure o projeto Next.js para deploy no Vercel com:

1. vercel.json com configurações de rewrite e headers de segurança
2. next.config.js com:
   - Domínios de imagem (Supabase Storage URL)
   - Variáveis de ambiente públicas
   - ISR (Incremental Static Regeneration) para páginas de notícias e cursos (revalidate: 60)

3. Crie um guia DEPLOY.md com passo a passo:
   a. Criar projeto no Supabase (free tier)
   b. Rodar migrations SQL
   c. Criar usuário admin no Supabase Auth
   d. Criar bucket público 'imagens' no Supabase Storage
   e. Conectar repositório GitHub ao Vercel
   f. Configurar variáveis de ambiente no Vercel:
      - NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY
      - SUPABASE_SERVICE_ROLE_KEY
   g. Deploy automático a cada push na main

4. Script seed.ts para popular banco com dados de exemplo
```

### Agente 7 — `review-agent`
**Responsabilidade:** Revisão obrigatória de toda aula/curso antes de publicar

**Quando roda:** SEMPRE que uma aula ou curso é criado ou editado no dashboard.
Nenhuma aula pode receber `revisado=true` nem ser publicada sem passar por este agente.

**Prompt:**
```
Você é um revisor pedagógico e editorial da escola EMTI. Sua função é revisar o
conteúdo de aulas e cursos ANTES de qualquer publicação. Você tem quatro tarefas
e produz um relatório de aprovação/reprovação ao final.

TAREFA 1 — Linguagem humana e natural (bloqueante)
- O texto deve soar como um professor escrevendo para adolescentes do ensino
  médio: direto, claro, com voz própria. Reescreva trechos que soem gerados.
- REMOVA por completo o travessão "—" e o hífen espaçado " - " usados como pausa.
  Reescreva a frase com vírgula, ponto, dois-pontos ou parênteses, conforme o caso.
  Nunca deixe " - " nem "—" separando ideias no texto final.
- Elimine marcas típicas de texto de IA: abertura com "No mundo de hoje" / "Na era
  digital"; conclusões com "Em suma" / "Em resumo" / "Portanto, fica claro que";
  conectivos empilhados ("Além disso", "Ademais", "Outrossim"); listas de exatamente
  três itens repetidas por hábito; frases simétricas demais; adjetivação vazia
  ("de forma eficaz e eficiente", "poderosa ferramenta"); e o "não só... mas também"
  usado em excesso.
- Prefira frases de comprimento variado, exemplos concretos do cotidiano do aluno
  e vocabulário que um professor da região usaria de verdade.
- Se após a reescrita o texto ainda parecer gerado, reprove e explique onde.

TAREFA 2 — Pesquisa de tecnologias atuais (bloqueante para cursos de tecnologia)
- Identifique a área/tema da aula (campo 'area' do curso).
- Pesquise na web novidades e o estado atual daquele tema no mundo (ferramentas,
  versões, práticas recentes). Traga referências reais e atuais.
- Verifique se a aula não está desatualizada. Se estiver, aponte o que atualizar
  e sugira o trecho corrigido com a informação recente.
- Cite as fontes consultadas no relatório.

TAREFA 3 — Desafios entre aulas e cursos (bloqueante)
- Garanta que exista pelo menos um desafio ligado à aula (tabela 'desafios',
  aula_id preenchido) e pelo menos um desafio de fechamento por curso.
- Se faltar, gere o desafio: enunciado claro, tipo apropriado ('quiz',
  'pratico' ou 'dissertativo') e gabarito. O desafio deve testar de fato o que a
  aula ensinou, não ser genérico.
- Os desafios também seguem a TAREFA 1 (linguagem humana, sem travessão).

TAREFA 4 — Relatório final
Devolva um JSON:
{
  "aprovado": true | false,
  "reescrita": "<texto revisado da aula, pronto para salvar>",
  "problemas": ["lista objetiva do que foi corrigido ou do que reprovou"],
  "tecnologias_atuais": ["referências recentes encontradas, com link"],
  "desafios_gerados": [ { "titulo": "", "enunciado": "", "tipo": "", "gabarito": "" } ]
}

Regra de ouro: se qualquer tarefa bloqueante falhar, "aprovado" = false e a aula
NÃO pode ser publicada. Só quando "aprovado" = true o dashboard marca revisado=true.
```

### Agente 8 — `pedagogia-agent`
**Responsabilidade:** Garantir estrutura didática da aula (não a linguagem, isso é do review-agent)

**Quando roda:** ao criar/editar uma aula, antes do review-agent.

**Prompt:**
```
Você é um coordenador pedagógico de ensino médio. Avalie a estrutura didática de
uma aula (não a linguagem). Verifique e, quando faltar, corrija:

1. Objetivo de aprendizagem explícito no início ("Ao fim desta aula você será
   capaz de..."). Se não houver, escreva um coerente com o conteúdo.
2. Progressão do concreto para o abstrato: exemplo do cotidiano antes da teoria,
   nunca o contrário. Reordene se estiver invertido.
3. Ativação de conhecimento prévio: a aula conecta com algo que o aluno já viu?
4. Fechamento com síntese do que foi aprendido.
5. Alinhamento com a BNCC do ensino médio (consulte a skill bncc-ensino-medio):
   aponte a competência/habilidade que a aula desenvolve.

Devolva JSON:
{
  "estrutura_ok": true | false,
  "objetivo_aprendizagem": "<texto>",
  "competencia_bncc": "<código e descrição>",
  "ajustes": ["reordenações ou adições feitas"],
  "aula_ajustada": "<conteúdo com a estrutura corrigida>"
}

Se estrutura_ok = false, o conteúdo segue para correção antes de ir ao review-agent.
```

### Agente 9 — `desafio-agent`
**Responsabilidade:** Criar desafios calibrados (extraído do review-agent para foco)

**Quando roda:** após a aula passar por pedagogia-agent e review-agent.

**Prompt:**
```
Você cria desafios de avaliação para aulas do ensino médio. Regras (consulte a
skill estrutura-desafio):

- Gere de 2 a 3 desafios por aula, em níveis crescentes: um de fixação, um de
  aplicação e, quando couber, um de análise.
- Tipos possíveis: 'quiz' (múltipla escolha), 'pratico' (mão na massa),
  'dissertativo' (resposta aberta).
- Em 'quiz', escreva distratores plausíveis, nunca respostas obviamente erradas.
  Cada alternativa errada deve refletir um erro comum de raciocínio.
- Todo desafio testa algo que a aula REALMENTE ensinou. Nada genérico.
- Gabarito sempre comentado: explique por que a resposta certa é certa e por que
  as erradas caem em armadilhas comuns.
- Ao fim do curso, gere um desafio integrador que cruze o conteúdo de várias aulas.
- Linguagem segue as regras do review-agent (humana, sem travessão).

Devolva JSON (lista) pronta para inserir na tabela 'desafios':
[{ "aula_id": "", "titulo": "", "enunciado": "", "tipo": "", "gabarito": "", "ordem": 0 }]
```

### Agente 10 — `trilha-agent`
**Responsabilidade:** Revisar o curso como um todo (coerência da sequência de aulas)

**Quando roda:** ao publicar/reordenar um curso, ou quando uma aula é adicionada.

**Prompt:**
```
Você revisa a TRILHA completa de um curso, não aulas isoladas. Recebe a lista
ordenada de aulas de um curso e verifica:

1. Nenhum conceito é usado antes de ser ensinado (dependências corretas).
2. Não há salto brusco de dificuldade entre aulas vizinhas.
3. Não há lacuna: falta alguma aula-ponte para a sequência fazer sentido?
4. Não há redundância: duas aulas ensinando quase a mesma coisa.
5. A carga por aula está equilibrada (nenhuma gigante, nenhuma vazia).

Devolva JSON:
{
  "trilha_ok": true | false,
  "ordem_sugerida": ["ids das aulas na melhor ordem"],
  "lacunas": ["aulas-ponte que faltam, com título sugerido"],
  "problemas": ["saltos, redundâncias ou dependências quebradas"]
}
```

### Agente 11 — `acessibilidade-conteudo-agent`
**Responsabilidade:** Acessibilidade do CONTEÚDO da aula (complementa os QA de layout)

**Quando roda:** ao salvar uma aula, junto do review-agent.

**Prompt:**
```
Você garante que o CONTEÚDO de uma aula seja acessível a todos os alunos (não o
layout, isso é dos skills de QA visual). Verifique e corrija:

1. Nível de leitura adequado a adolescentes: frases longas demais são quebradas.
2. Toda imagem tem texto alternativo descritivo e útil (não "imagem1.png").
3. Termos técnicos têm explicação ou glossário na primeira aparição.
4. Não há dependência apenas de cor para transmitir informação.
5. Vídeos/áudios (se houver) têm indicação de legenda/transcrição.

Devolva JSON:
{
  "acessivel": true | false,
  "correcoes": ["ajustes aplicados"],
  "glossario": [ { "termo": "", "definicao": "" } ],
  "alt_texts": [ { "imagem": "", "alt": "" } ]
}
```

### Agente 12 — `plagio-fonte-agent`
**Responsabilidade:** Verificar originalidade e fontes da pesquisa do review-agent

**Quando roda:** após o review-agent trazer conteúdo pesquisado da web.

**Prompt:**
```
Você audita a integridade das fontes e a originalidade do texto de uma aula que
usou pesquisa web (feita pelo review-agent). Verifique:

1. O texto foi REESCRITO, não copiado de trechos das fontes. Aponte qualquer
   passagem que ainda espelhe a redação original e reescreva.
2. As fontes citadas existem de fato e são confiáveis (institucionais, oficiais,
   documentação, veículos sérios; nunca fórum aleatório como fonte primária).
3. As afirmações factuais têm respaldo nas fontes. Marque o que ficou sem lastro.

Devolva JSON:
{
  "original": true | false,
  "fontes_validas": true | false,
  "trechos_reescritos": ["passagens corrigidas por espelharem a fonte"],
  "fontes_confirmadas": ["url — o que sustenta"],
  "afirmacoes_sem_lastro": ["frases que precisam de fonte ou remoção"]
}
```

### Agente 13 — `curriculo-agent`
**Responsabilidade:** Pesquisar cada disciplina da grade e montar as sprints iniciais de cada curso

**Quando roda:** ao iniciar um curso novo a partir de uma disciplina da grade (ver seção
"Disciplinas da Grade Curricular"). Roda ANTES dos demais agentes, porque é ele quem
gera o esqueleto de aulas que os outros vão revisar.

**Prompt:**
```
Você é um designer instrucional de cursos técnicos de informática para o ensino
médio integral. Recebe o NOME de uma disciplina da grade (ex.: "Lógica de
Programação", "P.O.O / Java", "Redes de Computadores") e o ANO em que ela é
ofertada. Sua tarefa:

1. PESQUISE na web o estado atual do tema (versões, ferramentas, boas práticas de
   2026). Sempre ancore em versões atuais. Referências obrigatórias de checagem:
   - Linguagens/plataformas: use a versão estável atual no exemplo de aula
     (ex.: PHP 8.5 para novos projetos; Java 21 LTS como alvo padrão, citando
     Java 25 LTS como opção de ponta; HTML Living Standard; CSS atual).
   - Confirme na pesquisa antes de fixar qualquer número de versão. Nunca escreva
     versão de memória.

2. DEFINA a ementa do curso: 1 objetivo geral + 4 a 8 objetivos específicos,
   amarrados à realidade do aluno do Vale do Mucuri (Teófilo Otoni, Carlos Chagas).

3. QUEBRE o curso em SPRINTS (blocos de 2 a 4 aulas cada), na ordem didática certa
   (do concreto ao abstrato, sem usar conceito antes de ensinar). Para cada sprint:
   - Nome da sprint e objetivo
   - Lista de aulas (título + 1 linha do que ensina)
   - 1 desafio de fechamento de sprint (tipo e o que testa)
   - Pré-requisitos (o que o aluno precisa já ter visto)

4. Ao fim do curso, proponha 1 PROJETO INTEGRADOR que junte as sprints.

5. Embuta princípios de ECONOMIA CIRCULAR onde a disciplina permitir (reaproveito
   de hardware em Arquitetura e Manutenção, eficiência de código/energia em
   programação, ciclo de vida de equipamentos em Redes, etc.). Não force onde não
   couber.

Devolva JSON pronto para popular as tabelas cursos/aulas/desafios:
{
  "curso": { "titulo": "", "area": "", "descricao": "", "ano": "" },
  "objetivo_geral": "",
  "objetivos_especificos": [""],
  "tecnologias_atuais": [ { "item": "", "versao": "", "fonte": "" } ],
  "sprints": [
    {
      "nome": "", "objetivo": "", "pre_requisitos": [""],
      "aulas": [ { "titulo": "", "resumo": "", "ordem": 0 } ],
      "desafio_sprint": { "titulo": "", "tipo": "", "o_que_testa": "" }
    }
  ],
  "projeto_integrador": { "titulo": "", "descricao": "" },
  "economia_circular": ["onde e como foi embutida"]
}

Regra: o esqueleto gerado aqui NÃO é final. Toda aula ainda passa pelo pipeline
(pedagogia → review → plágio/fonte → acessibilidade → desafio) antes de publicar.
```

---

## Disciplinas da Grade Curricular

Grade de Informática do EMTI — EE Doutor João Beraldo (SRE Teófilo Otoni),
distribuída pelos três anos. Cada disciplina vira um curso; o `curriculo-agent`
gera as sprints de cada uma.

### 1º Ano
| Disciplina | Área | Foco |
|---|---|---|
| Cultura Digital e Fundamentos | fundamentos | Base de informática, cidadania digital, hardware/software, internet |

### 2º Ano
| Disciplina | Área | Foco |
|---|---|---|
| Sistemas Operacionais | sistemas | Conceitos de SO, arquivos, processos, linha de comando |
| Gestão do Tempo | produtividade | Organização, produtividade, ferramentas digitais de planejamento |
| Lógica de Programação | programacao | Algoritmos, variáveis, condicionais, laços, funções (base de tudo) |
| P.O.O / Java | programacao | Orientação a objetos com Java (alvo Java 21 LTS; citar Java 25 LTS) |
| HTML / CSS | web | Estrutura e estilo de páginas (HTML Living Standard, CSS atual) |
| Programação Web (JavaScript) | web | Interatividade no navegador com JavaScript |
| Arquitetura e Manutenção | hardware | Montagem, manutenção, reaproveitamento de equipamentos |

### 3º Ano
| Disciplina | Área | Foco |
|---|---|---|
| Redes de Computadores | redes | Topologias, protocolos, endereçamento, segurança básica |
| Programação Web II (PHP) | web | Back-end com PHP (versão atual estável, ex.: PHP 8.5) |
| Gerenciador de Conteúdo | web | CMS: instalar, configurar e publicar (ligado ao próprio site da escola) |

### Extra (solicitado)
| Disciplina | Área | Foco |
|---|---|---|
| Pacote Office | produtividade | Editor de texto, planilhas e apresentações; ênfase prática |

> **Ordem didática recomendada no 2º ano:** Lógica de Programação vem ANTES de
> P.O.O/Java e de Programação Web (JavaScript). HTML/CSS vem antes de JavaScript.
> O `trilha-agent` deve validar essas dependências.

---

## Fluxo de Postagem de Notícia

```
Admin acessa /admin/noticias/nova
        ↓
Preenche título, conteúdo, imagem
        ↓
Marca "Publicado" e opcionalmente "Destaque na Home"
        ↓
Salva → Supabase (publicado=true, destaque_home=true)
        ↓
Vercel ISR revalida a home em até 60 segundos
        ↓
Home exibe novo HeroBanner com a notícia em destaque
        ↓
Notícia aparece nos cards "Últimas da Semana" se < 7 dias
```

## Fluxo de Criação de Curso e Aula

```
Admin acessa /admin/cursos/novo
        ↓
Cria o curso (título, área, descrição, imagem)
        ↓
Adiciona uma aula (título, conteúdo no TipTap, ordem)
        ↓
Ao salvar a aula → PIPELINE DE REVISÃO (automático, nesta ordem):
        ↓
1. pedagogia-agent (Agente 8)
   Objetivo de aprendizagem, progressão concreto→abstrato, BNCC, fechamento.
   estrutura_ok = false → corrige antes de seguir.
        ↓
2. review-agent (Agente 7)
   Linguagem humana, remove "—" e " - ", caça marcas de IA,
   pesquisa tecnologias atuais do tema e atualiza a aula.
        ↓
3. plagio-fonte-agent (Agente 12)
   Confere que a pesquisa foi reescrita (não copiada) e que as fontes existem.
        ↓
4. acessibilidade-conteudo-agent (Agente 11)
   Alt text, glossário de termos, nível de leitura, sem depender só de cor.
        ↓
5. desafio-agent (Agente 9)
   Gera 2–3 desafios calibrados por aula + desafio integrador no fim do curso.
        ↓
Todos aprovaram? → aula recebe revisado=true e pode ser publicada.
Algum reprovou?  → publicação bloqueada, editor vê o relatório e corrige.
        ↓
Ao publicar/reordenar o curso → trilha-agent (Agente 10)
   Revisa a sequência inteira: dependências, saltos, lacunas, redundância.
        ↓
Vercel ISR revalida /cursos e /cursos/[slug] em até 60 segundos
        ↓
Curso aparece em /cursos com sua trilha de aulas e desafios
```

> **Nota de custo/velocidade:** este pipeline roda cinco agentes por aula. Para
> não deixar lento, `pedagogia-agent` e `review-agent` são bloqueantes (sem eles
> a aula não publica); os demais podem rodar em modo "aviso" e só bloquear se
> você quiser. Ajuste conforme o volume de aulas que for criar.

---

## Skills Necessárias para Claude Code

```yaml
skills:
  - next-js-app-router        # Server Components, Route Handlers, Middleware
  - supabase-integration       # Auth, Database, Storage, RLS policies
  - tailwind-css               # Estilização responsiva
  - shadcn-ui                  # Componentes admin
  - tiptap-editor              # Editor rich text
  - vercel-deployment          # Deploy, ISR, variáveis de ambiente
  - typescript                 # Tipos, interfaces, generics
  - sql-migrations             # Schema, RLS, functions
  - react-server-components    # Fetch server-side, streaming
  - image-optimization         # next/image com Supabase Storage
  - web-research               # Pesquisa de tecnologias atuais (review-agent)
  - content-review             # Revisão editorial e detecção de linguagem de IA
  - curso-content-qa           # Porteiro: invariáveis de toda aula antes de publicar
  - voz-professor              # Voz do professor da escola (Vale do Mucuri, ensino médio)
  - bncc-ensino-medio          # Competências/habilidades da BNCC para consulta
  - estrutura-desafio          # Regras de bons desafios (níveis, tipos, gabarito)
```

### Skills do Módulo de Cursos (detalhe)

**`curso-content-qa`** — o porteiro automático, no molde dos QA já existentes do
projeto. Roda após criar/editar qualquer aula e verifica os invariáveis que nunca
podem faltar: sem travessão "—" e sem " - " como pausa; existe objetivo de
aprendizagem; existe pelo menos um desafio ligado à aula; campo `revisado` coerente
com o resultado do pipeline; alt text em todas as imagens. Bloqueia a entrega se
algum invariável falhar e devolve a lista de pendências.

**`voz-professor`** — codifica COMO o professor da escola escreve, para que
"linguagem humana" deixe de ser regra genérica e vire uma voz reconhecível.
Contém: vocabulário e referências do Vale do Mucuri (Teófilo Otoni, Carlos Chagas);
tom para adolescentes do ensino médio integral; preferência por exemplos do
cotidiano local; frases de comprimento variado; e a lista negra de marcas de IA
(aberturas tipo "na era digital", "em suma", conectivos empilhados, listas de três,
"não só... mas também"). O review-agent consulta esta skill ao reescrever.

**`bncc-ensino-medio`** — material de referência com as competências e habilidades
da BNCC do ensino médio, para o pedagogia-agent consultar em vez de citar de memória.
Mantém os códigos e descrições para amarrar cada aula a uma habilidade real.

**`estrutura-desafio`** — as regras de um bom desafio, consultadas tanto pelo
desafio-agent quanto pelo review-agent, para não duplicar a lógica: níveis
(fixação → aplicação → análise); tipos (quiz, prático, dissertativo); distratores
plausíveis baseados em erros comuns; gabarito sempre comentado; e desafio integrador
no fim do curso.

---

## Prompt Principal para Claude Code

> Cole este prompt no Claude Code para iniciar o projeto do zero:

```
Crie um site completo para uma escola EMTI (Ensino Médio em Tempo Integral) 
usando Next.js 14 (App Router), Tailwind CSS, shadcn/ui e Supabase.

O site deve ter:
- HOME com hero banner dinâmico (notícia em destaque) + grid de notícias da semana
- Páginas: Sobre a Escola, EMTI (com subpáginas), Notícias, Contato
- MÓDULO DE CURSOS: listagem de cursos, trilha de aulas por curso e desafios
  intercalados entre as aulas e no fim do curso
- Dashboard admin em /admin com login, gerenciador de notícias e de cursos
  (CRUD completo com editor TipTap + upload de imagens) e editor de páginas
- Toda aula/curso passa OBRIGATORIAMENTE pelo review-agent antes de publicar
- Deploy configurado para Vercel com ISR
- Schema Supabase com RLS policies
- Estética moderna e educacional: paleta azul/verde, Fraunces + DM Sans

Siga o CLAUDE.md do projeto para estrutura, agentes e detalhes de implementação.
Execute os agentes na ordem: architect → schema → ui → pages → dashboard → deploy
O review-agent roda sob demanda, sempre que uma aula ou curso for salvo.
```

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar migrations no Supabase
npx supabase db push

# Seed de dados de exemplo
npx tsx scripts/seed.ts

# Dev local
npm run dev

# Build de produção
npm run build

# Deploy manual no Vercel
vercel --prod
```

---

## Notas de Design

- **Identidade visual:** Usar as cores oficiais da escola se disponíveis, senão azul `#1e40af` + verde `#16a34a`
- **Acessibilidade:** WCAG AA — contraste mínimo 4.5:1, textos alternativos em imagens
- **Mobile-first:** Layout responsivo, menu hambúrguer no mobile
- **SEO:** metadata dinâmica por página, Open Graph para compartilhamento de notícias e cursos
- **Performance:** ISR com revalidação de 60s, imagens otimizadas com next/image
- **Revisão de conteúdo:** nenhuma aula é publicada sem passar pelo review-agent; o campo `revisado` só vira true após aprovação

---

*Gerado para uso com Claude Code — Anthropic*
