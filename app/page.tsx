import PageLayout from '@/components/PageLayout'
import CursosEmtiBanner from '@/components/CursosEmtiBanner'
import ContatoForm from '@/components/ContatoForm'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Cpu, Users, Award, MessageCircle, ChevronRight } from 'lucide-react'

export const revalidate = 60

const stats = [
  { valor: '1946', label: 'Fundação', desc: 'Anos de história' },
  { valor: '~340', label: 'Alunos', desc: 'Matriculados em 2025' },
  { valor: '28', label: 'Professores', desc: '100% graduados' },
  { valor: '9h', label: 'Diárias', desc: 'Ensino integral' },
]

const tecnologia = [
  { Icon: Cpu, titulo: 'Robótica & Automação', desc: 'Projetos com Arduino, sensores e programação embarcada.' },
  { Icon: BookOpen, titulo: 'Desenvolvimento Web', desc: 'HTML, CSS, JavaScript e criação de sites reais.' },
  { Icon: Users, titulo: 'Redes & Infraestrutura', desc: 'Fundamentos de redes, cabeamento e segurança da informação.' },
  { Icon: Award, titulo: 'Protagonismo Digital', desc: 'Alunos criam soluções para problemas reais da comunidade.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: cursosDestaque } = await supabase
    .from('cursos')
    .select('id, titulo, slug, descricao, capa_url, categoria, nivel')
    .eq('publicado', true)
    .order('ordem')
    .limit(3)

  return (
    <PageLayout>
      {/* Hero */}
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
            <Link href="/cursos" className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-escola-vermelho-escuro transition-colors">
              Conhecer os Cursos
            </Link>
            <Link href="/contato" className="bg-white/10 border border-white/25 text-white font-mono text-xs uppercase tracking-widest px-7 py-3.5 hover:bg-white/20 transition-colors">
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>

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

      {/* Cursos & EMTI */}
      <CursosEmtiBanner />

      {/* Vitrine de cursos reais */}
      {(cursosDestaque ?? []).length > 0 && (
        <section className="bg-escola-creme py-14 border-t border-escola-cinza-claro">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <p className="section-label mb-1">Feitos pelos professores da escola</p>
                  <div className="w-10 h-px bg-escola-vermelho mb-4" />
                  <h2 className="font-playfair text-escola-azul font-black text-3xl md:text-4xl">
                    Cursos em destaque
                  </h2>
                </div>
                <Link href="/cursos" className="font-mono text-xs uppercase tracking-widest text-escola-cinza hover:text-escola-azul transition-colors flex-shrink-0 mb-1 inline-flex items-center gap-1">
                  Ver todos os cursos <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(cursosDestaque ?? []).map((curso, i) => (
                <AnimateOnScroll key={curso.id} delay={(i + 1) as 1|2|3}>
                  <Link href="/cursos" className="group bg-white border border-escola-cinza-claro flex flex-col card-lift overflow-hidden h-full">
                    <div className="relative aspect-[16/9] bg-escola-azul overflow-hidden">
                      {curso.capa_url && (
                        <Image
                          src={curso.capa_url}
                          alt={curso.titulo}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {curso.categoria && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho">
                            {curso.categoria}
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase tracking-widest text-escola-cinza/60">
                          · {curso.nivel}
                        </span>
                      </div>
                      <h3 className="font-playfair text-escola-azul font-bold text-lg leading-snug mb-2 group-hover:text-escola-vermelho transition-colors">
                        {curso.titulo}
                      </h3>
                      {curso.descricao && (
                        <p className="font-serif text-escola-cinza text-sm leading-relaxed line-clamp-2 flex-1">
                          {curso.descricao}
                        </p>
                      )}
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Captura de leads: formulario direto na home, sem desvio */}
      <section className="bg-white border-t border-escola-cinza-claro py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            <AnimateOnScroll>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-3">
                Matrículas e informações
              </p>
              <div className="w-10 h-px bg-escola-cinza-claro mb-5" />
              <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl mb-4">
                Fale com a escola
              </h2>
              <p className="font-serif text-escola-cinza leading-relaxed mb-8">
                Quer matricular seu filho, conhecer os cursos ou tirar qualquer dúvida?
                Deixe seu contato que a secretaria retorna, ou chame direto no WhatsApp.
              </p>
              <a
                href="https://wa.me/5533998701618"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-escola-azul text-escola-azul font-mono text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-escola-azul hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chamar no WhatsApp
              </a>
            </AnimateOnScroll>

            <AnimateOnScroll delay={1}>
              <div className="bg-escola-creme border border-escola-cinza-claro p-6 md:p-8">
                <ContatoForm />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
