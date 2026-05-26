import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  LayoutGrid, Monitor, Library, Activity,
  Heart, Cpu, ChevronRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'A Escola — E.E. Dr. João Beraldo',
  description: 'Conheça a Escola Estadual Dr. João Beraldo, fundada em 1946 em Carlos Chagas, MG. 79 anos formando cidadãos protagonistas.',
}

export const revalidate = 3600

const timeline = [
  { ano: '1946', titulo: 'Fundação', desc: 'Fundada como Grupo Escolar Dr. João Beraldo para atender a comunidade de Carlos Chagas e região.' },
  { ano: '1981', titulo: 'Expansão', desc: 'Ampliação para o Ensino Fundamental completo, atendendo alunos do 6º ao 9º ano.' },
  { ano: '2009', titulo: 'Ensino Médio', desc: 'Implantação do Ensino Médio, consolidando a escola como referência educacional na cidade.' },
  { ano: '2020', titulo: 'EMTI', desc: 'Pioneira na região: adoção do Ensino Médio em Tempo Integral com formação técnica em TI.' },
  { ano: '2025', titulo: 'Presente', desc: '79 anos de história, ~340 alunos, 28 professores e um projeto educacional de excelência.' },
]

const infraestrutura = [
  { Icon: LayoutGrid, titulo: '25 Salas de Aula', desc: 'Espaços adequados para aprendizado de qualidade.' },
  { Icon: Monitor, titulo: 'Laboratório de Informática', desc: '40 computadores com internet 100 Mbps e softwares educacionais.' },
  { Icon: Library, titulo: 'Biblioteca', desc: 'Acervo com mais de 2.000 volumes físicos e conteúdos digitais.' },
  { Icon: Activity, titulo: 'Quadra Esportiva', desc: 'Quadra poliesportiva homologada pela FEEMG para competições regionais.' },
  { Icon: Heart, titulo: 'Acessibilidade', desc: 'Rampas, banheiros adaptados e sala multifuncional para estudantes PCD.' },
  { Icon: Cpu, titulo: 'Laboratório de Robótica', desc: 'Kits Arduino e equipamentos para projetos de inovação e tecnologia.' },
]

const valores = [
  {
    titulo: 'Missão',
    texto: 'Oferecer educação pública de qualidade, formando cidadãos críticos, autônomos e protagonistas, preparados para os desafios do século XXI.',
  },
  {
    titulo: 'Visão',
    texto: 'Ser referência regional em educação integral, reconhecida pela excelência acadêmica, inovação pedagógica e compromisso com a comunidade.',
  },
  {
    titulo: 'Valores',
    texto: 'Protagonismo, ética, responsabilidade social, inovação tecnológica e compromisso com o desenvolvimento humano pleno.',
  },
]

export default function SobrePage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative h-[380px] md:h-[460px] overflow-hidden">
        <Image src="/fachada.jpg" alt="Fachada da E.E. Dr. João Beraldo" fill className="object-cover" priority />
        <div className="absolute inset-0 img-overlay-blue" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55 mb-2">
            Desde 1946 · Carlos Chagas, MG
          </p>
          <div className="w-10 h-px bg-escola-vermelho mb-4" />
          <h1 className="font-playfair text-white font-black text-3xl md:text-5xl lg:text-6xl leading-tight mb-3">
            Escola Estadual<br />Dr. João Beraldo
          </h1>
          <p className="font-serif text-white/75 text-base md:text-lg max-w-xl leading-relaxed">
            79 anos de história e dedicação à educação pública de qualidade.
          </p>
        </div>
      </div>

      {/* Facts strip */}
      <div className="bg-escola-vermelho text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            {[
              ['1946', 'Fundação'],
              ['~340', 'Alunos'],
              ['28', 'Professores'],
              ['INEP 31146579', 'Código'],
              ['SRE Teófilo Otoni', 'Regional'],
            ].map(([val, label], i) => (
              <div key={label} className={`px-5 py-4 text-center flex-1 min-w-[120px] ${i > 0 ? 'border-l border-white/15' : ''}`}>
                <div className="font-playfair font-black text-xl leading-none">{val}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/55 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intro + Missão */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <AnimateOnScroll>
              <p className="section-label mb-2">Nossa história</p>
              <div className="w-10 h-px bg-escola-vermelho mb-5" />
              <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base md:text-lg">
                <p>
                  A Escola Estadual Dr. João Beraldo é uma das mais tradicionais instituições de ensino de
                  Carlos Chagas, Minas Gerais. Fundada em <strong>1946</strong>, carrega quase oito décadas
                  de comprometimento com a educação pública de qualidade.
                </p>
                <p>
                  Situada na Av. Gabriel Passos, 393, Centro, a escola atende estudantes da zona urbana e rural,
                  sendo referência não apenas na cidade, mas em toda a regional de Teófilo Otoni.
                </p>
                <p>
                  Em 2020, deu um passo histórico ao implementar o <strong>Ensino Médio em Tempo Integral (EMTI)</strong>
                  com ênfase em <strong>Tecnologia da Informação</strong>, tornando-se pioneira na região.
                </p>
              </div>
            </AnimateOnScroll>
          </div>

          <aside className="space-y-4">
            {valores.map((v, i) => (
              <AnimateOnScroll key={v.titulo} delay={(i + 1) as 1|2|3}>
                <div className="bg-escola-creme border-l-4 border-escola-azul p-5">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-escola-azul mb-2">{v.titulo}</h3>
                  <p className="font-serif text-escola-cinza text-sm leading-relaxed">{v.texto}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </aside>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-escola-creme-escuro border-t border-b border-escola-cinza-claro py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimateOnScroll>
            <p className="section-label mb-1">Linha do tempo</p>
            <div className="w-10 h-px bg-escola-vermelho mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
              Nossa Trajetória
            </h2>
          </AnimateOnScroll>

          <div className="relative pl-12">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-escola-azul/15" />
            {timeline.map((item, i) => (
              <AnimateOnScroll key={item.ano} delay={(i % 3) as 0|1|2}>
                <div className="relative mb-8 last:mb-0">
                  <div className="absolute -left-8 top-1 w-4 h-4 bg-escola-vermelho border-4 border-escola-creme-escuro" />
                  <div className="bg-white border border-escola-cinza-claro p-5">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-playfair font-black text-2xl text-escola-vermelho">{item.ano}</span>
                      <div className="h-px flex-1 bg-escola-cinza-claro" />
                      <span className="font-mono text-xs uppercase tracking-widest text-escola-azul">{item.titulo}</span>
                    </div>
                    <p className="font-serif text-escola-cinza leading-relaxed text-sm">{item.desc}</p>
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
          <p className="section-label mb-1">Estrutura física</p>
          <div className="w-10 h-px bg-escola-vermelho mb-6" />
          <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
            Infraestrutura
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-escola-cinza-claro border border-escola-cinza-claro">
          {infraestrutura.map((item, i) => (
            <AnimateOnScroll key={item.titulo} delay={(i % 3) as 0|1|2}>
              <div className="bg-white p-6 hover:bg-escola-creme transition-colors group">
                <div className="w-9 h-9 bg-escola-azul flex items-center justify-center mb-4 group-hover:bg-escola-vermelho transition-colors">
                  <item.Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-playfair font-bold text-escola-azul text-base mb-2">{item.titulo}</h3>
                <p className="font-serif text-escola-cinza text-sm leading-relaxed">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-escola-azul py-12 border-t-2 border-escola-vermelho">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <AnimateOnScroll>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">
              Próximo passo
            </p>
            <h2 className="font-playfair text-white font-black text-2xl md:text-3xl mb-6">
              Conheça o Programa EMTI
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/emti" className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center justify-center gap-2">
                Ver o Programa <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/contato" className="border border-white/25 text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-white/10 transition-colors">
                Entrar em Contato
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
