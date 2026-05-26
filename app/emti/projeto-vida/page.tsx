import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Target, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projeto de Vida — EMTI',
  description: 'Conheça o componente Projeto de Vida do EMTI da E.E. Dr. João Beraldo: autoconhecimento, metas e planejamento do futuro.',
}
export const revalidate = 3600

const topicos = [
  { titulo: 'Autoconhecimento', desc: 'Identificação de valores, habilidades, interesses e pontos de melhoria de cada aluno.' },
  { titulo: 'Definição de Metas', desc: 'Estabelecimento de objetivos de curto, médio e longo prazo com base nos sonhos e realidades do estudante.' },
  { titulo: 'Planejamento', desc: 'Construção de um plano concreto com etapas, prazos e recursos necessários para alcançar os objetivos.' },
  { titulo: 'Preparação para o Futuro', desc: 'Orientação vocacional, ENEM, vestibulares, mercado de trabalho e ensino superior ou técnico.' },
]

export default async function ProjetoVidaPage() {
  const supabase = await createClient()
  const { data: pagina } = await supabase
    .from('paginas_conteudo').select('*').eq('pagina', 'projeto-vida').single()

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-escola-azul border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-escola-vermelho/60 flex items-center justify-center flex-shrink-0 mt-1">
              <Target className="w-5 h-5 text-escola-vermelho" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
                Pilares do EMTI
              </p>
              <h1 className="font-playfair text-white font-black text-3xl md:text-4xl leading-tight mb-3">
                {pagina?.titulo ?? 'Projeto de Vida'}
              </h1>
              <p className="font-serif text-white/65 text-base leading-relaxed max-w-2xl">
                Componente que ajuda cada aluno a descobrir quem é, o que quer e como chegar lá.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="md:col-span-2">
            {pagina?.conteudo ? (
              <AnimateOnScroll>
                <div className="prose-escola" dangerouslySetInnerHTML={{ __html: pagina.conteudo }} />
              </AnimateOnScroll>
            ) : (
              <AnimateOnScroll>
                <p className="section-label mb-2">O que é</p>
                <div className="w-10 h-px bg-escola-vermelho mb-5" />
                <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base">
                  <p>
                    O <strong>Projeto de Vida</strong> é um componente curricular central do EMTI.
                    Por meio de encontros semanais com o professor-tutor, cada aluno tem espaço para
                    refletir sobre seus valores, talentos, desafios e sonhos.
                  </p>
                  <p>
                    O objetivo é que o estudante saia do Ensino Médio com clareza sobre quem é e
                    aonde quer chegar — seja no mercado de trabalho, no ensino superior ou em
                    qualquer outro caminho que escolher.
                  </p>
                  <p>
                    Não é aconselhamento escolar tradicional. É uma disciplina estruturada, com
                    metodologia própria, que coloca o aluno como protagonista da sua trajetória.
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topicos.map((t, i) => (
                <AnimateOnScroll key={t.titulo} delay={(i % 2 + 1) as 1|2}>
                  <div className="border-l-4 border-escola-azul bg-escola-creme p-5">
                    <h3 className="font-playfair font-bold text-escola-azul text-base mb-2">{t.titulo}</h3>
                    <p className="font-serif text-escola-cinza text-sm leading-relaxed">{t.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <AnimateOnScroll delay={1}>
              <div className="bg-escola-creme border border-escola-cinza-claro p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-azul mb-3">
                  Faz parte do EMTI
                </p>
                <ul className="space-y-2">
                  {[
                    ['Projeto de Vida', '/emti/projeto-vida', true],
                    ['Eletivas', '/emti/eletivas', false],
                    ['Protagonismo Juvenil', '/emti/protagonismo', false],
                    ['Tutoria', '/emti', false],
                  ].map(([label, href, active]) => (
                    <li key={String(href)}>
                      <Link
                        href={String(href)}
                        className={`font-serif text-sm flex items-center gap-2 py-1.5 border-b border-escola-cinza-claro/50 ${active ? 'text-escola-vermelho font-medium' : 'text-escola-cinza hover:text-escola-azul'} transition-colors`}
                      >
                        {active && <span className="w-1.5 h-1.5 bg-escola-vermelho flex-shrink-0" />}
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-escola-azul text-white p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45 mb-3">
                  Dúvidas?
                </p>
                <p className="font-serif text-white/70 text-sm leading-relaxed mb-4">
                  Entre em contato com a escola para saber mais sobre o programa EMTI.
                </p>
                <Link href="/contato" className="bg-escola-vermelho text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2.5 hover:bg-escola-vermelho-escuro transition-colors inline-flex items-center gap-2">
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
