import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const noticiasSeed = [
  {
    titulo: 'Feira de Ciências 2024 reúne projetos inovadores dos alunos',
    slug: 'feira-de-ciencias-2024',
    resumo: 'Estudantes apresentaram projetos sobre sustentabilidade, tecnologia e saúde na maior edição da Feira de Ciências da escola.',
    conteudo: '<p>A <strong>Feira de Ciências 2024</strong> foi um sucesso absoluto! Com mais de 50 projetos inscritos, os alunos demonstraram criatividade e conhecimento científico de alto nível.</p><p>Entre os destaques, o projeto de captação de água da chuva para irrigação de jardins escolares chamou a atenção dos juízes pelo impacto ambiental positivo.</p><h2>Premiados</h2><ul><li>1º lugar: Captação de água pluvial — 3º ano B</li><li>2º lugar: Robô reciclado — 2º ano A</li><li>3º lugar: Aplicativo de saúde mental — 1º ano C</li></ul>',
    destaque_home: true,
    publicado: true,
  },
  {
    titulo: 'Alunos do EMTI representam a escola em olimpíada nacional de matemática',
    slug: 'olimpiada-nacional-matematica',
    resumo: 'Três estudantes se classificaram para a fase nacional da OBMEP após se destacarem nas etapas regionais.',
    conteudo: '<p>Com muito estudo e dedicação, três alunos da nossa escola conseguiram a classificação para a fase nacional da <strong>Olimpíada Brasileira de Matemática das Escolas Públicas (OBMEP)</strong>.</p><p>Os classificados são estudantes do 2º e 3º anos e serão orientados por professores durante os próximos meses.</p>',
    destaque_home: false,
    publicado: true,
  },
  {
    titulo: 'Projeto de Vida: alunos apresentam planos para o futuro',
    slug: 'projeto-de-vida-apresentacoes',
    resumo: 'Na semana do Projeto de Vida, estudantes compartilharam seus sonhos e planos com a comunidade escolar.',
    conteudo: '<p>Uma das atividades mais emocionantes do calendário escolar aconteceu nesta semana: a apresentação dos <strong>Projetos de Vida</strong> dos alunos do 3º ano.</p><p>Em apresentações de 5 minutos, cada estudante compartilhou seus objetivos para a vida adulta, os cursos que pretendem fazer e as contribuições que querem dar à sociedade.</p>',
    destaque_home: false,
    publicado: true,
  },
  {
    titulo: 'Eletiva de Programação forma primeiros desenvolvedores da escola',
    slug: 'eletiva-programacao-formatura',
    resumo: 'Turma concluiu o curso de desenvolvimento web e já tem projetos funcionando na internet.',
    conteudo: '<p>A eletiva de <strong>Programação Web</strong> chegou ao fim do semestre com resultados surpreendentes. Os 18 alunos inscritos desenvolveram sites e aplicações que já estão publicados na internet.</p>',
    destaque_home: false,
    publicado: true,
  },
  {
    titulo: 'Semana Cultural celebra diversidade e talentos artísticos',
    slug: 'semana-cultural-2024',
    resumo: 'Durante cinco dias, alunos apresentaram música, teatro, dança e artes visuais para a comunidade escolar.',
    conteudo: '<p>A <strong>Semana Cultural 2024</strong> trouxe uma programação intensa e diversificada, com apresentações de todos os anos e turmas da escola.</p><p>O encerramento contou com um show de talentos com mais de 200 pessoas na plateia.</p>',
    destaque_home: false,
    publicado: false,
  },
]

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  console.log('📰 Inserindo notícias...')
  const { data: noticias, error: noticiasError } = await supabase
    .from('noticias')
    .upsert(noticiasSeed, { onConflict: 'slug' })
    .select()

  if (noticiasError) {
    console.error('❌ Erro ao inserir notícias:', noticiasError.message)
  } else {
    console.log(`✅ ${noticias?.length ?? 0} notícias inseridas/atualizadas`)
  }

  console.log('\n📄 Verificando páginas de conteúdo...')
  const { data: paginas } = await supabase.from('paginas_conteudo').select('pagina')
  console.log(`✅ ${paginas?.length ?? 0} páginas encontradas`)

  console.log('\n⚙️  Verificando configurações...')
  const { data: configs } = await supabase.from('configuracoes_site').select('chave')
  console.log(`✅ ${configs?.length ?? 0} configurações encontradas`)

  console.log('\n✨ Seed concluído com sucesso!')
  console.log('\nAgora você pode:')
  console.log('  → Acessar o site: http://localhost:3000')
  console.log('  → Acessar o admin: http://localhost:3000/admin')
}

seed().catch(console.error)
