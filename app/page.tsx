import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import HeroBanner from '@/components/HeroBanner'
import NewsGrid from '@/components/NewsGrid'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

const stats = [
  { valor: '1946', label: 'Fundação', desc: 'Décadas de história' },
  { valor: '~340', label: 'Alunos', desc: 'Matriculados em 2025' },
  { valor: '28', label: 'Professores', desc: '100% graduados' },
  { valor: '9h', label: 'Diárias', desc: 'Ensino integral' },
]

const destaques = [
  { href: '/sobre', titulo: 'A Escola', desc: 'Fundada em 1946, 79 anos formando cidadãos protagonistas em Carlos Chagas, MG.', icone: '🏛️' },
  { href: '/emti', titulo: 'Programa EMTI', desc: 'Ensino Médio em Tempo Integral com formação técnica, protagonismo e projeto de vida.', icone: '📖' },
  { href: '/contato', titulo: 'Fale Conosco', desc: 'Entre em contato para matrículas, informações e parceiras com a escola.', icone: '✉️' },
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
          <Image src="/fachada.jpg" alt="E.E. Dr. João Beraldo" fill className="object-cover" priority />
          <div className="absolute inset-0 img-overlay-blue" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-escola-vermelho" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="section-label text-white/70 mb-3">Escola Estadual · Carlos Chagas, MG</p>
            <div className="w-12 h-0.5 bg-escola-vermelho mx-auto mb-5" />
            <h1 className="font-playfair text-white text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-4 text-balance" style={{ fontVariant: 'small-caps' }}>
              Dr. João Beraldo
            </h1>
            <p className="font-serif text-white/80 text-lg md:text-xl max-w-xl leading-relaxed">
              Ensino Médio em Tempo Integral — formando protagonistas desde 1946.
            </p>
            <Link href="/sobre" className="mt-8 inline-flex items-center gap-2 bg-escola-vermelho text-white font-mono text-sm uppercase tracking-widest px-6 py-3 hover:bg-escola-vermelho-escuro transition-colors">
              Conheça a Escola →
            </Link>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-escola-azul text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i as 0|1|2|3|4}>
                <div className="px-6 py-7 text-center">
                  <div className="font-playfair font-black text-3xl md:text-4xl text-white leading-none mb-1">
                    {stat.valor}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho mb-0.5">
                    {stat.label}
                  </div>
                  <div className="font-serif text-xs text-white/50">{stat.desc}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* News grid */}
      <NewsGrid noticias={noticiasRecentes ?? []} />

      {/* Highlights section */}
      <section className="bg-escola-creme-escuro py-14">
        <div className="container mx-auto px-4">
          <AnimateOnScroll>
            <div className="mb-10">
              <div className="border-t-4 border-escola-azul" style={{ boxShadow: '0 2px 0 0 #c0392b' }} />
              <p className="section-label mt-4 mb-1">Conheça a escola</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-black text-escola-azul">
                Saiba Mais
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {destaques.map((item, i) => (
              <AnimateOnScroll key={item.href} delay={(i + 1) as 1|2|3}>
                <Link
                  href={item.href}
                  className="group bg-white border border-escola-cinza-claro p-7 flex flex-col card-lift"
                >
                  <span className="text-4xl mb-4 block">{item.icone}</span>
                  <div className="w-8 h-0.5 bg-escola-vermelho mb-4" />
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

      {/* Quote / CTA */}
      <section className="bg-azul-pattern py-16 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <AnimateOnScroll>
            <div className="w-12 h-0.5 bg-escola-vermelho mx-auto mb-6" />
            <blockquote className="font-playfair italic text-2xl md:text-3xl font-medium leading-relaxed mb-6 text-white/90">
              "A educação é o passaporte para o futuro, pois o amanhã pertence àqueles que se preparam para ele hoje."
            </blockquote>
            <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">
              — Malcolm X
            </p>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 bg-escola-vermelho text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-escola-vermelho-escuro transition-colors"
            >
              Entre em Contato →
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </PageLayout>
  )
}
