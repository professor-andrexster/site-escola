import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import HeroBanner from '@/components/HeroBanner'
import NewsGrid from '@/components/NewsGrid'
import YoutubeSection from '@/components/YoutubeSection'
import InstagramSection from '@/components/InstagramSection'
import QuizRankingSection from '@/components/QuizRankingSection'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, BookOpen, Mail, Cpu, Users, Award } from 'lucide-react'

export const revalidate = 60

const stats = [
  { valor: '1946', label: 'Fundação', desc: 'Anos de história' },
  { valor: '~340', label: 'Alunos', desc: 'Matriculados em 2025' },
  { valor: '28', label: 'Professores', desc: '100% graduados' },
  { valor: '9h', label: 'Diárias', desc: 'Ensino integral' },
]

const destaques = [
  {
    href: '/sobre',
    titulo: 'A Escola',
    desc: 'Fundada em 1946, 79 anos formando cidadãos protagonistas em Carlos Chagas, MG.',
    Icon: Building2,
  },
  {
    href: '/emti',
    titulo: 'Programa EMTI',
    desc: 'Ensino Médio em Tempo Integral com formação técnica em TI, protagonismo e projeto de vida.',
    Icon: BookOpen,
  },
  {
    href: '/contato',
    titulo: 'Fale Conosco',
    desc: 'Entre em contato para matrículas, informações e parcerias com a escola.',
    Icon: Mail,
  },
]

const tecnologia = [
  { Icon: Cpu, titulo: 'Robótica & Automação', desc: 'Projetos com Arduino, sensores e programação embarcada.' },
  { Icon: BookOpen, titulo: 'Desenvolvimento Web', desc: 'HTML, CSS, JavaScript e criação de sites reais.' },
  { Icon: Users, titulo: 'Redes & Infraestrutura', desc: 'Fundamentos de redes, cabeamento e segurança da informação.' },
  { Icon: Award, titulo: 'Protagonismo Digital', desc: 'Alunos criam soluções para problemas reais da comunidade.' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: noticiasDestaque } = await supabase
    .from('noticias').select('*').eq('publicado', true).eq('destaque_home', true).limit(1).single()

  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 7)

  const { data: noticiasRecentes } = await supabase
    .from('noticias').select('*').eq('publicado', true)
    .gte('created_at', dataLimite.toISOString()).order('created_at', { ascending: false }).limit(6)

  return (
    <PageLayout>
      {/* Hero */}
      {noticiasDestaque ? (
        <HeroBanner noticia={noticiasDestaque} />
      ) : (
        <div className="relative w-full h-[480px] md:h-[580px] overflow-hidden">
          <Image src="/fachada.jpg" alt="E.E. Dr. João Beraldo" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 img-overlay-blue" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 mb-3">
              Escola Estadual · Carlos Chagas, MG
            </p>
            <div className="w-10 h-px bg-escola-vermelho mx-auto mb-5" />
            <h1 className="font-playfair text-white text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4 text-balance">
              Dr. João Beraldo
            </h1>
            <p className="font-serif text-white/75 text-lg md:text-xl max-w-xl leading-relaxed">
              Ensino Médio em Tempo Integral com formação em Tecnologia da Informação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/emti" className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-escola-vermelho-escuro transition-colors">
                Conheça o EMTI
              </Link>
              <Link href="/sobre" className="bg-white/10 border border-white/25 text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-white/20 transition-colors">
                A Escola
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-escola-azul text-white border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i as 0|1|2|3}>
                <div className="px-6 py-6 text-center">
                  <div className="font-playfair font-black text-3xl md:text-4xl text-white leading-none mb-1">
                    {stat.valor}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho mb-0.5">
                    {stat.label}
                  </div>
                  <div className="font-serif text-xs text-white/45">{stat.desc}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* News */}
      <NewsGrid noticias={noticiasRecentes ?? []} />

      {/* YouTube */}
      <YoutubeSection />

      {/* Quiz Ranking */}
      <QuizRankingSection />

      {/* Instagram */}
      <InstagramSection />

      {/* Highlights */}
      <section className="bg-escola-creme-escuro py-14 border-t border-escola-cinza-claro">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="border-t-4 border-escola-azul mb-4" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
            <p className="section-label mt-4 mb-1">Navegue pelo site</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul mb-10">
              Conheça a Escola
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {destaques.map((item, i) => (
              <AnimateOnScroll key={item.href} delay={(i + 1) as 1|2|3}>
                <Link href={item.href} className="group bg-white border border-escola-cinza-claro p-7 flex flex-col card-lift">
                  <div className="w-10 h-10 bg-escola-azul flex items-center justify-center mb-5 group-hover:bg-escola-vermelho transition-colors">
                    <item.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-8 h-px bg-escola-vermelho mb-4" />
                  <h3 className="font-playfair text-escola-azul font-bold text-xl mb-3 group-hover:text-escola-vermelho transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="font-serif text-escola-cinza text-sm leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  <span className="font-mono text-xs text-escola-vermelho font-medium mt-5 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Saiba mais <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* TI Section */}
      <section className="bg-escola-azul py-14">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-2">
                  Curso técnico integrado
                </p>
                <div className="w-10 h-px bg-escola-vermelho mb-4" />
                <h2 className="font-playfair text-white font-black text-3xl md:text-4xl">
                  Tecnologia da Informação
                </h2>
              </div>
              <Link href="/emti" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex-shrink-0 mb-1">
                Ver o programa →
              </Link>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {tecnologia.map((item, i) => (
              <AnimateOnScroll key={item.titulo} delay={(i % 4) as 0|1|2|3}>
                <div className="bg-escola-azul p-7 hover:bg-escola-azul-medio transition-colors group">
                  <div className="w-9 h-9 border border-escola-vermelho flex items-center justify-center mb-5">
                    <item.Icon className="w-4 h-4 text-escola-vermelho" />
                  </div>
                  <h3 className="font-playfair text-white font-bold text-base mb-2 group-hover:text-escola-creme transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="font-serif text-white/55 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-escola-cinza-claro py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <AnimateOnScroll>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-3">
              Matrículas abertas
            </p>
            <div className="w-10 h-px bg-escola-cinza-claro mx-auto mb-5" />
            <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl mb-4">
              Faça parte da E.E. Dr. João Beraldo
            </h2>
            <p className="font-serif text-escola-cinza leading-relaxed mb-8 max-w-xl mx-auto">
              Ensino público de qualidade, formação técnica em TI e jornada integral. Entre em contato e saiba como matricular seu filho.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contato" className="bg-escola-azul text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-escola-azul-medio transition-colors">
                Entrar em Contato
              </Link>
              <a href="https://wa.me/5533998701618" target="_blank" rel="noopener noreferrer"
                className="border border-escola-azul text-escola-azul font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-escola-azul hover:text-white transition-colors">
                WhatsApp
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
