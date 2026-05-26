import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Eletivas — EMTI',
  description: 'Conheça as disciplinas eletivas do EMTI da E.E. Dr. João Beraldo: aprendizado por interesse em tecnologia, artes, esportes e muito mais.',
}
export const revalidate = 3600

const exemplosEletivas = [
  { area: 'Tecnologia', itens: ['Programação em Python', 'Design Gráfico', 'Jogos Digitais', 'Cibersegurança'] },
  { area: 'Comunicação', itens: ['Jornalismo Escolar', 'Podcast & Rádio', 'Fotografia', 'Produção de Vídeo'] },
  { area: 'Negócios', itens: ['Empreendedorismo', 'Finanças Pessoais', 'Marketing Digital', 'Gestão de Projetos'] },
  { area: 'Bem-estar', itens: ['Esportes Coletivos', 'Dança', 'Teatro', 'Meditação e Saúde Mental'] },
]

export default async function EletivasPage() {
  const supabase = await createClient()
  const { data: pagina } = await supabase
    .from('paginas_conteudo').select('*').eq('pagina', 'eletivas').single()

  return (
    <PageLayout>
      <div className="bg-escola-azul border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-escola-vermelho/60 flex items-center justify-center flex-shrink-0 mt-1">
              <BookOpen className="w-5 h-5 text-escola-vermelho" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
                Pilares do EMTI
              </p>
              <h1 className="font-playfair text-white font-black text-3xl md:text-4xl leading-tight mb-3">
                {pagina?.titulo ?? 'Eletivas'}
              </h1>
              <p className="font-serif text-white/65 text-base leading-relaxed max-w-2xl">
                Disciplinas escolhidas pelos próprios alunos de acordo com seus interesses e vocações.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            {pagina?.conteudo ? (
              <AnimateOnScroll>
                <div className="prose-escola" dangerouslySetInnerHTML={{ __html: pagina.conteudo }} />
              </AnimateOnScroll>
            ) : (
              <AnimateOnScroll>
                <p className="section-label mb-2">O que são</p>
                <div className="w-10 h-px bg-escola-vermelho mb-5" />
                <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base">
                  <p>
                    As <strong>Eletivas</strong> são disciplinas optativas do EMTI em que os alunos podem
                    aprofundar conhecimentos em áreas de seu interesse, indo além do currículo obrigatório.
                  </p>
                  <p>
                    A cada semestre, a escola oferta um conjunto de eletivas e os estudantes escolhem
                    quais querem cursar. O processo é democrático: os próprios alunos podem propor
                    temas e até ministrar partes das aulas.
                  </p>
                  <p>
                    Na E.E. Dr. João Beraldo, as eletivas de tecnologia são especialmente valorizadas,
                    com turmas de programação, robótica, games e design digital.
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            <div className="mt-10">
              <AnimateOnScroll>
                <p className="section-label mb-2">Exemplos de eletivas ofertadas</p>
                <div className="w-10 h-px bg-escola-vermelho mb-6" />
              </AnimateOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exemplosEletivas.map((e, i) => (
                  <AnimateOnScroll key={e.area} delay={(i % 2 + 1) as 1|2}>
                    <div className="border border-escola-cinza-claro bg-white p-5">
                      <h3 className="font-mono text-xs uppercase tracking-widest text-escola-azul mb-3 pb-2 border-b border-escola-cinza-claro">
                        {e.area}
                      </h3>
                      <ul className="space-y-1.5">
                        {e.itens.map((item) => (
                          <li key={item} className="font-serif text-escola-cinza text-sm flex items-start gap-2">
                            <span className="text-escola-vermelho flex-shrink-0">—</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
              <p className="font-mono text-[10px] text-escola-cinza/60 mt-4 uppercase tracking-wider">
                * As eletivas variam a cada semestre conforme demanda e disponibilidade de professores.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <AnimateOnScroll delay={1}>
              <div className="bg-escola-creme border border-escola-cinza-claro p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-escola-azul mb-3">
                  Faz parte do EMTI
                </p>
                <ul className="space-y-2">
                  {[
                    ['Projeto de Vida', '/emti/projeto-vida', false],
                    ['Eletivas', '/emti/eletivas', true],
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
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/45 mb-3">Dúvidas?</p>
                <p className="font-serif text-white/70 text-sm leading-relaxed mb-4">
                  Fale com a secretaria para saber quais eletivas estão disponíveis no próximo semestre.
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
