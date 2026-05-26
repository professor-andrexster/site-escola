import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A Escola — E.E. Dr. João Beraldo',
  description: 'Conheça a história da Escola Estadual Dr. João Beraldo, fundada em 1946 em Carlos Chagas, MG. 79 anos formando cidadãos protagonistas.',
}

export const revalidate = 3600

const timeline = [
  { ano: '1946', titulo: 'Fundação', desc: 'Fundada como Grupo Escolar Dr. João Beraldo, a escola nasce para servir a comunidade de Carlos Chagas e região.' },
  { ano: '1981', titulo: 'Expansão', desc: 'Ampliação para o Ensino Fundamental completo, atendendo alunos do 6º ao 9º ano.' },
  { ano: '2009', titulo: 'Ensino Médio', desc: 'Implantação do Ensino Médio, consolidando a escola como referência educacional na cidade.' },
  { ano: '2020', titulo: 'EMTI', desc: 'Pioneira na região, a escola adota o Ensino Médio em Tempo Integral, transformando a formação dos jovens.' },
  { ano: '2025', titulo: 'Hoje', desc: '79 anos de história, ~340 alunos, 28 professores e um projeto educacional de excelência no coração de Minas Gerais.' },
]

const infraestrutura = [
  { icone: '🏫', titulo: '25 Salas de Aula', desc: 'Espaços adequados e climatizados para um aprendizado de qualidade.' },
  { icone: '💻', titulo: 'Laboratório de Informática', desc: '40 computadores com GeoGebra e acesso a internet de 100 Mbps.' },
  { icone: '📚', titulo: 'Biblioteca', desc: 'Acervo com mais de 2.000 volumes físicos e acesso a conteúdos digitais.' },
  { icone: '⚽', titulo: 'Quadra Esportiva', desc: 'Quadra poliesportiva homologada pela FEEMG para competições regionais.' },
  { icone: '♿', titulo: 'Acessibilidade', desc: 'Rampas, banheiros adaptados e sala multifuncional para estudantes PCD.' },
  { icone: '🤖', titulo: 'Laboratório de Robótica', desc: 'Kits Arduino e equipamentos para projetos de inovação e tecnologia.' },
]

const valores = [
  { titulo: 'Missão', texto: 'Oferecer educação pública de qualidade, formando cidadãos críticos, autônomos e protagonistas da própria história, preparados para os desafios do século XXI.' },
  { titulo: 'Visão', texto: 'Ser referência regional em educação integral, reconhecida pela excelência acadêmica, inovação pedagógica e compromisso com a comunidade de Carlos Chagas.' },
  { titulo: 'Valores', texto: 'Protagonismo, respeito à diversidade, ética, responsabilidade social, inovação e compromisso com o desenvolvimento humano pleno.' },
]

export default function SobrePage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative h-[380px] md:h-[480px] overflow-hidden">
        <Image src="/fachada.jpg" alt="Fachada da E.E. Dr. João Beraldo" fill className="object-cover" priority />
        <div className="absolute inset-0 img-overlay-blue" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
          <p className="section-label text-white/70 mb-2">Desde 1946 · Carlos Chagas, MG</p>
          <div className="w-12 h-0.5 bg-escola-vermelho mb-4" />
          <h1 className="font-playfair text-white font-black text-3xl md:text-5xl lg:text-6xl leading-tight mb-3" style={{ fontVariant: 'small-caps' }}>
            Escola Estadual<br />Dr. João Beraldo
          </h1>
          <p className="font-serif text-white/80 text-base md:text-lg max-w-xl leading-relaxed">
            79 anos de história, dedicação e formação de protagonistas no coração de Minas Gerais.
          </p>
        </div>
      </div>

      {/* Quick facts strip */}
      <div className="bg-escola-vermelho text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap divide-x divide-white/20">
            {[
              ['1946', 'Fundação'],
              ['~340', 'Alunos'],
              ['28', 'Professores'],
              ['INEP 31146579', 'Código'],
              ['SRE Teófilo Otoni', 'Regional'],
            ].map(([val, label]) => (
              <div key={label} className="px-5 py-4 text-center flex-1 min-w-[120px]">
                <div className="font-playfair font-black text-xl leading-none">{val}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <AnimateOnScroll>
              <p className="section-label mb-2">Nossa história</p>
              <div className="rule-red w-12 mb-5" />
              <div className="font-playfair italic text-escola-azul text-2xl md:text-3xl leading-relaxed mb-6">
                "Uma instituição que atravessou décadas e segue transformando vidas."
              </div>
              <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base md:text-lg">
                <p>
                  A Escola Estadual Dr. João Beraldo é uma das mais tradicionais instituições de ensino de Carlos Chagas, Minas Gerais.
                  Fundada em <strong>1946</strong>, carrega em sua história quase oito décadas de comprometimento com a educação pública de qualidade.
                </p>
                <p>
                  Situada na <strong>Av. Gabriel Passos, 393, Centro</strong>, a escola atende estudantes da zona urbana e rural,
                  sendo referência não apenas na cidade, mas em toda a regional de Teófilo Otoni.
                </p>
                <p>
                  Em 2020, a escola deu um passo histórico ao implementar o <strong>Ensino Médio em Tempo Integral (EMTI)</strong>,
                  tornando-se pioneira na região e transformando profundamente a experiência educacional dos seus alunos.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <aside className="space-y-5">
            {valores.map((v, i) => (
              <AnimateOnScroll key={v.titulo} delay={(i + 1) as 1|2|3}>
                <div className="bg-escola-creme border border-escola-cinza-claro p-5">
                  <div className="w-6 h-0.5 bg-escola-vermelho mb-3" />
                  <h3 className="font-playfair font-bold text-escola-azul text-lg mb-2">{v.titulo}</h3>
                  <p className="font-serif text-escola-cinza text-sm leading-relaxed">{v.texto}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </aside>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-escola-creme-escuro py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
            <p className="section-label mt-4 mb-1">Linha do tempo</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
              Nossa Trajetória
            </h2>
          </AnimateOnScroll>

          <div className="relative pl-10">
            <div className="timeline-line" />
            {timeline.map((item, i) => (
              <AnimateOnScroll key={item.ano} delay={(i % 3) as 0|1|2}>
                <div className="relative mb-10 last:mb-0">
                  <div className="timeline-dot" style={{ top: '4px' }} />
                  <div className="bg-white border border-escola-cinza-claro p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-playfair font-black text-2xl text-escola-vermelho">{item.ano}</span>
                      <div className="h-0.5 flex-1 bg-escola-cinza-claro" />
                      <span className="font-mono text-xs uppercase tracking-widest text-escola-azul">{item.titulo}</span>
                    </div>
                    <p className="font-serif text-escola-cinza leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <AnimateOnScroll>
          <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
          <p className="section-label mt-4 mb-1">Estrutura física</p>
          <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
            Nossa Infraestrutura
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {infraestrutura.map((item, i) => (
            <AnimateOnScroll key={item.titulo} delay={(i % 3) as 0|1|2}>
              <div className="bg-white border border-escola-cinza-claro p-6 card-lift">
                <span className="text-3xl mb-3 block">{item.icone}</span>
                <div className="w-6 h-0.5 bg-escola-vermelho mb-3" />
                <h3 className="font-playfair font-bold text-escola-azul text-base mb-2">{item.titulo}</h3>
                <p className="font-serif text-escola-cinza text-sm leading-relaxed">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-azul-pattern py-12">
        <div className="container mx-auto px-4 text-center">
          <AnimateOnScroll>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">Venha nos conhecer</p>
            <h2 className="font-playfair text-white font-black text-2xl md:text-3xl mb-6">
              Quer saber mais sobre o EMTI?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/emti" className="bg-escola-vermelho text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-escola-vermelho-escuro transition-colors">
                Ver o Programa →
              </Link>
              <Link href="/contato" className="bg-white/10 border border-white/20 text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/20 transition-colors">
                Entrar em Contato
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
