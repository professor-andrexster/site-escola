import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Award, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Protagonismo Juvenil — EMTI',
  description: 'Conheça o Protagonismo Juvenil do EMTI da E.E. Dr. João Beraldo: alunos como agentes de transformação da escola e da comunidade.',
}
export const revalidate = 3600

const exemplos = [
  { titulo: 'Clube de Robótica', desc: 'Alunos projetam e constroem robôs para competições regionais e soluções para a escola.' },
  { titulo: 'Jornal Escolar Digital', desc: 'Produção de conteúdo jornalístico sobre a escola, cidade e temas de interesse dos jovens.' },
  { titulo: 'Ação Comunitária', desc: 'Projetos de impacto na comunidade de Carlos Chagas: campanhas, eventos e voluntariado.' },
  { titulo: 'Grêmio Estudantil', desc: 'Participação ativa na gestão da escola por meio do grêmio, representando todos os alunos.' },
]

export default async function ProtagonismoPage() {
  const supabase = await createClient()
  const { data: pagina } = await supabase
    .from('paginas_conteudo').select('*').eq('pagina', 'protagonismo').single()

  return (
    <PageLayout>
      <div className="bg-escola-azul border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border border-escola-vermelho/60 flex items-center justify-center flex-shrink-0 mt-1">
              <Award className="w-5 h-5 text-escola-vermelho" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
                Pilares do EMTI
              </p>
              <h1 className="font-playfair text-white font-black text-3xl md:text-4xl leading-tight mb-3">
                {pagina?.titulo ?? 'Protagonismo Juvenil'}
              </h1>
              <p className="font-serif text-white/65 text-base leading-relaxed max-w-2xl">
                Alunos como agentes ativos de transformação na escola e na comunidade.
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
                <p className="section-label mb-2">O conceito</p>
                <div className="w-10 h-px bg-escola-vermelho mb-5" />
                <div className="font-serif text-escola-preto/85 space-y-4 leading-relaxed text-base">
                  <p>
                    O <strong>Protagonismo Juvenil</strong> é a filosofia central do EMTI: colocar o
                    estudante como sujeito ativo do seu processo educativo e como agente de transformação
                    na sua comunidade.
                  </p>
                  <p>
                    Na prática, os alunos da E.E. Dr. João Beraldo desenvolvem projetos reais — com
                    planejamento, execução e avaliação de resultados. Não é simulação: são ações com
                    impacto mensurável na escola e em Carlos Chagas.
                  </p>
                  <p>
                    O componente trabalha habilidades como liderança, trabalho em equipe,
                    comunicação, resolução de problemas e pensamento crítico — competências
                    essenciais para o mercado de trabalho e para a cidadania.
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            <div className="mt-10">
              <AnimateOnScroll>
                <p className="section-label mb-2">Exemplos de iniciativas</p>
                <div className="w-10 h-px bg-escola-vermelho mb-6" />
              </AnimateOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exemplos.map((e, i) => (
                  <AnimateOnScroll key={e.titulo} delay={(i % 2 + 1) as 1|2}>
                    <div className="bg-white border border-escola-cinza-claro border-t-2 border-t-escola-azul p-5">
                      <h3 className="font-playfair font-bold text-escola-azul text-base mb-2">{e.titulo}</h3>
                      <p className="font-serif text-escola-cinza text-sm leading-relaxed">{e.desc}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
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
                    ['Eletivas', '/emti/eletivas', false],
                    ['Protagonismo Juvenil', '/emti/protagonismo', true],
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
                  Quer saber mais sobre o programa de Protagonismo Juvenil? Fale com a escola.
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
