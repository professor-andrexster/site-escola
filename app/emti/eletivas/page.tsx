import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, ChevronRight, Pencil, Target, Brain, Zap, Trophy, AlertTriangle, CheckCircle, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Eletiva de Redação para o ENEM — E.E. Dr. João Beraldo',
  description:
    'Na eletiva de Redação para o ENEM da E.E. Dr. João Beraldo você aprende a dominar as 5 competências, construir a proposta de intervenção e tirar nota 1000 — tudo com a linguagem que o ENEM quer. Vem com a gente!',
  keywords: [
    'eletiva redação ENEM',
    'redação ENEM escola',
    'como tirar 1000 na redação do ENEM',
    'competências redação ENEM',
    'proposta de intervenção ENEM',
    'EMTI Carlos Chagas',
    'E.E. Dr. João Beraldo',
  ],
  openGraph: {
    title: 'Eletiva de Redação ENEM — E.E. Dr. João Beraldo',
    description: 'Aprenda a dominar a redação do ENEM com humor, técnica e muita prática. Aqui o lápis não para.',
  },
}

export const revalidate = 3600

const competencias = [
  {
    numero: 'C1',
    titulo: 'Domínio da Norma Culta',
    icon: BookOpen,
    resumo: 'Escrever certo sem parecer robô',
    descricao:
      'Aqui entra ortografia, concordância, pontuação — tudo aquilo que você ignora no zap mas o ENEM cobra sem dó. A boa notícia: dá pra aprender. A má notícia: "mais" e "mas" ainda confundem geral.',
    cor: 'border-blue-400 bg-blue-50',
    corIcone: 'text-blue-700',
  },
  {
    numero: 'C2',
    titulo: 'Compreender o Tema',
    icon: Target,
    resumo: 'Não fugir do tema (sim, isso acontece)',
    descricao:
      'Todo ano alguém escreve três páginas sobre um assunto completamente diferente do proposto. Seja você não essa pessoa. Aqui a gente treina leitura de proposta, recorte temático e como não sair pela tangente.',
    cor: 'border-red-400 bg-red-50',
    corIcone: 'text-red-700',
  },
  {
    numero: 'C3',
    titulo: 'Seleção de Argumentos',
    icon: Brain,
    resumo: 'Convencer sem inventar',
    descricao:
      '"Segundo especialistas..." — mas quais especialistas? Na eletiva você aprende a usar dados reais, repertório cultural de verdade e a construir argumentos que fazem o corretor pensar "caramba, esse aluno sabe das coisas".',
    cor: 'border-amber-400 bg-amber-50',
    corIcone: 'text-amber-700',
  },
  {
    numero: 'C4',
    titulo: 'Coesão e Coerência',
    icon: Zap,
    resumo: 'O texto que faz sentido do começo ao fim',
    descricao:
      'Conectivos: portanto, entretanto, outrossim, dessarte (sim, essa última existe e impressiona). Aqui você aprende a costurar as ideias sem parecer que escreveu o texto em 4 pedaços separados e colou com fita.',
    cor: 'border-green-400 bg-green-50',
    corIcone: 'text-green-700',
  },
  {
    numero: 'C5',
    titulo: 'Proposta de Intervenção',
    icon: Trophy,
    resumo: 'O parágrafo que salva ou destrói a nota',
    descricao:
      'O famoso PI: Agente + Ação + Modo/Meio + Efeito + Detalhamento. Parece fórmula de química, e na prática é. Aqui a gente monta, desmonta e remonta esse bloco até ele sair na veia — mesmo às 5h da manhã no dia da prova.',
    cor: 'border-purple-400 bg-purple-50',
    corIcone: 'text-purple-700',
  },
]

const oquePratica = [
  { emoji: '✍️', item: 'Uma redação por semana — sim, toda semana' },
  { emoji: '🔍', item: 'Correção coletiva: a gente aprende errando junto' },
  { emoji: '📰', item: 'Leitura de repertório: textos, dados, filmes, músicas' },
  { emoji: '🎯', item: 'Simulados com temas inusitados (já foi saúde dos povos indígenas, violência contra a mulher, falta de saneamento...)' },
  { emoji: '🤝', item: 'Reescrita: porque ninguém acerta de primeira, e tudo bem' },
  { emoji: '💬', item: 'Debates para montar argumentação na cabeça antes de por no papel' },
]

const temas = [
  'O impacto das redes sociais na democracia',
  'Desafios da educação inclusiva no Brasil',
  'A invisibilidade da pessoa idosa na sociedade',
  'Saúde mental e pressão por desempenho',
  'Racismo estrutural e o mercado de trabalho',
  'Crise climática e responsabilidade coletiva',
]

export default function EletivasPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-escola-azul border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4 py-14 max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-escola-vermelho/60 flex items-center justify-center flex-shrink-0 mt-1">
              <Pencil className="w-5 h-5 text-escola-vermelho" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
                Pilares do EMTI · Eletivas
              </p>
              <h1 className="font-playfair text-white font-black text-3xl md:text-5xl leading-tight mb-4">
                Redação para o ENEM
              </h1>
              <p className="font-serif text-white/70 text-base md:text-lg leading-relaxed max-w-2xl">
                A eletiva que todo mundo precisa e metade da galera tem medo de fazer.{' '}
                <span className="text-white/90 font-medium">Spoiler: você vai sair daqui escrevendo diferente.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Conteúdo principal */}
          <div className="md:col-span-2 space-y-14">

            {/* Abertura */}
            <AnimateOnScroll>
              <div className="flex items-start gap-3 p-5 border-l-4 border-escola-vermelho bg-escola-creme-escuro">
                <AlertTriangle className="w-5 h-5 text-escola-vermelho flex-shrink-0 mt-0.5" />
                <p className="font-serif text-escola-preto/85 text-sm leading-relaxed">
                  <strong>Aviso importante:</strong> 50% da nota de Linguagens no ENEM vem da redação.
                  Não é brincadeira. Esse único texto pode abrir ou fechar portas para a faculdade dos seus sonhos.
                  E a gente sabe que você tem sonhos grandes — por isso essa eletiva existe.
                </p>
              </div>

              <div className="mt-8 space-y-5 font-serif text-escola-preto/85 leading-relaxed text-[15px]">
                <p>
                  A <strong>Eletiva de Redação para o ENEM</strong> da E.E. Dr. João Beraldo é o espaço
                  onde você para de ter pavor do papel em branco e começa a encarar o tema da prova
                  com a cabeça erguida — mesmo quando o ENEM vem com aquele tema que parece tirado
                  do nada às 13h30 de um sábado.
                </p>
                <p>
                  Aqui não tem aquela coisa de copiar modelo e decorar frase de filósofo grego que
                  você nunca ouviu falar. O que a gente faz é construir o seu jeito de argumentar,
                  com repertório real, estrutura sólida e uma proposta de intervenção que não seja
                  só "o governo deve criar políticas públicas" — porque todo mundo escreve isso e
                  funciona cada vez menos.
                </p>
                <p>
                  O resultado? Textos que têm cara de quem leu, pensou e tem algo a dizer.
                  Exatamente o que o ENEM quer.
                </p>
              </div>
            </AnimateOnScroll>

            {/* As 5 Competências */}
            <AnimateOnScroll>
              <p className="section-label mb-2">O mapa da mina</p>
              <div className="w-10 h-px bg-escola-vermelho mb-2" />
              <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl mb-2">
                As 5 Competências do ENEM
              </h2>
              <p className="font-serif text-escola-cinza text-sm mb-8 leading-relaxed">
                O ENEM avalia sua redação em 5 eixos — cada um vale até 200 pontos.
                Some tudo: <strong className="text-escola-azul">nota máxima = 1000</strong>.
                Veja o que cada competência pede (e o que a eletiva faz com cada uma):
              </p>

              <div className="space-y-4">
                {competencias.map((c, i) => (
                  <AnimateOnScroll key={c.numero} delay={(Math.min(i, 3)) as 0|1|2|3}>
                    <div className={`border-l-4 ${c.cor} p-5 rounded-r-lg`}>
                      <div className="flex items-start gap-3">
                        <div className={`font-mono text-xs font-bold ${c.corIcone} flex-shrink-0 mt-0.5 bg-white px-2 py-0.5 rounded border border-current`}>
                          {c.numero}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h3 className="font-playfair text-escola-azul font-bold text-lg leading-snug">
                              {c.titulo}
                            </h3>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza bg-white border border-escola-cinza-claro px-2 py-0.5 flex-shrink-0">
                              {c.resumo}
                            </span>
                          </div>
                          <p className="font-serif text-escola-preto/75 text-sm leading-relaxed mt-2">
                            {c.descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </AnimateOnScroll>

            {/* O que pratica */}
            <AnimateOnScroll>
              <p className="section-label mb-2">Na prática</p>
              <div className="w-10 h-px bg-escola-vermelho mb-2" />
              <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl mb-6">
                O que você faz nessa eletiva
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {oquePratica.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-escola-cinza-claro p-4">
                    <span className="text-xl flex-shrink-0">{p.emoji}</span>
                    <p className="font-serif text-escola-preto/80 text-sm leading-relaxed">{p.item}</p>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>

            {/* Temas */}
            <AnimateOnScroll>
              <p className="section-label mb-2">Exemplos de temas trabalhados</p>
              <div className="w-10 h-px bg-escola-vermelho mb-2" />
              <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl mb-3">
                Temas que a gente já encarou
              </h2>
              <p className="font-serif text-escola-cinza text-sm mb-6 leading-relaxed">
                O ENEM adora temas sociais. A gente treina com os que mais aparecem — e os que mais
                pegam todo mundo de surpresa:
              </p>
              <ul className="space-y-2">
                {temas.map((tema, i) => (
                  <li key={i} className="flex items-start gap-3 font-serif text-escola-preto/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-escola-vermelho flex-shrink-0 mt-0.5" />
                    {tema}
                  </li>
                ))}
              </ul>
              <p className="font-mono text-[10px] text-escola-cinza/50 mt-4 uppercase tracking-wider">
                * Inspirados nos últimos anos do ENEM. Os temas variam a cada semestre.
              </p>
            </AnimateOnScroll>

            {/* CTA final */}
            <AnimateOnScroll>
              <div className="bg-escola-azul text-white p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-escola-vermelho" />
                <div className="relative">
                  <Star className="w-6 h-6 text-escola-vermelho mb-4" />
                  <h2 className="font-playfair font-black text-2xl md:text-3xl mb-3">
                    Quem escreve bem, chega mais longe.
                  </h2>
                  <p className="font-serif text-white/70 text-sm leading-relaxed mb-6 max-w-lg">
                    Seja pra entrar na faculdade, passar no SISU, conseguir uma bolsa no ProUni
                    ou só provar que você tem argumento — a redação do ENEM é o seu palco.
                    E a eletiva é o ensaio.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/contato"
                      className="bg-escola-vermelho text-white font-mono text-[10px] uppercase tracking-widest px-5 py-3 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center gap-2"
                    >
                      Quero saber mais <ChevronRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/emti"
                      className="border border-white/30 text-white font-mono text-[10px] uppercase tracking-widest px-5 py-3 hover:bg-white/10 transition-colors"
                    >
                      Ver o EMTI completo
                    </Link>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <AnimateOnScroll delay={1}>
              {/* Navegação EMTI */}
              <div className="bg-escola-creme border border-escola-cinza-claro p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-azul mb-3">
                  Faz parte do EMTI
                </p>
                <ul className="space-y-2">
                  {[
                    ['Projeto de Vida', '/emti/projeto-vida', false],
                    ['Eletivas', '/emti/eletivas', true],
                    ['Protagonismo Juvenil', '/emti/protagonismo', false],
                    ['O Programa EMTI', '/emti', false],
                  ].map(([label, href, active]) => (
                    <li key={String(href)}>
                      <Link
                        href={String(href)}
                        className={`font-serif text-sm flex items-center gap-2 py-1.5 border-b border-escola-cinza-claro/50 transition-colors ${
                          active ? 'text-escola-vermelho font-medium' : 'text-escola-cinza hover:text-escola-azul'
                        }`}
                      >
                        {active && <span className="w-1.5 h-1.5 bg-escola-vermelho flex-shrink-0 rounded-full" />}
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box destaque */}
              <div className="bg-white border-2 border-escola-vermelho p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho mb-2">
                  Sabia que...
                </p>
                <p className="font-playfair text-escola-azul font-bold text-3xl leading-none mb-1">
                  1000
                </p>
                <p className="font-serif text-escola-cinza text-xs leading-relaxed">
                  é a nota máxima da redação do ENEM. Menos de{' '}
                  <strong>0,1% dos candidatos</strong> chegam lá.
                  A eletiva não promete milagre — mas promete que você vai chegar muito mais perto.
                </p>
              </div>

              {/* Box contato */}
              <div className="bg-escola-azul text-white p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45 mb-3">
                  Dúvidas?
                </p>
                <p className="font-serif text-white/70 text-sm leading-relaxed mb-4">
                  Fale com a secretaria para saber quando a eletiva abre vagas no próximo semestre.
                </p>
                <Link
                  href="/contato"
                  className="bg-escola-vermelho text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2.5 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center gap-2"
                >
                  Fale Conosco <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </AnimateOnScroll>
          </aside>
        </div>
      </div>
    </PageLayout>
  )
}
