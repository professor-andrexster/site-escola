import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import PortfolioProjetos from '@/components/portfolio/PortfolioProjetos'
import Image from 'next/image'
import { GraduationCap } from 'lucide-react'
import type { Metadata } from 'next'
import { trilhaBg } from '@/lib/trilhaColors'

export const revalidate = 60

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: alunos } = await supabase
    .from('alunos')
    .select('matricula')
    .eq('ativo', true)

  return (alunos ?? []).map(a => ({ matricula: a.matricula }))
}

export async function generateMetadata({ params }: { params: Promise<{ matricula: string }> }): Promise<Metadata> {
  const { matricula } = await params
  const supabase = await createClient()
  const { data: aluno } = await supabase.from('alunos').select('nome, turma').eq('matricula', matricula).maybeSingle()

  if (!aluno) return { title: 'Portfólio não encontrado' }

  return {
    title: `${aluno.nome} — Portfólio EMTI`,
    description: `Portfólio digital de ${aluno.nome}, aluno(a) do ${aluno.turma} do EMTI da E.E. Dr. João Beraldo.`,
  }
}

export default async function PortfolioPage({ params }: { params: Promise<{ matricula: string }> }) {
  const { matricula } = await params
  const supabase = await createClient()

  const { data: aluno } = await supabase
    .from('alunos')
    .select('*, perfis_vocacionais(pontuacao, trilhas(nome, icone, cor_tailwind))')
    .eq('matricula', matricula)
    .eq('ativo', true)
    .maybeSingle()

  if (!aluno) notFound()

  const { data: projetos } = await supabase
    .from('projetos')
    .select('*, trilhas(nome, icone, cor_tailwind)')
    .eq('aluno_id', aluno.id)
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  type PerfilJoin = { pontuacao: number; trilhas: { nome: string; icone: string | null; cor_tailwind: string | null } | { nome: string; icone: string | null; cor_tailwind: string | null }[] | null }

  const perfis = ((aluno.perfis_vocacionais ?? []) as PerfilJoin[])
    .map((p) => {
      const trilha = Array.isArray(p.trilhas) ? p.trilhas[0] : p.trilhas
      return { ...p, trilha }
    })
    .filter(p => p.trilha)
    .sort((a, b) => b.pontuacao - a.pontuacao)

  const iniciais = aluno.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <PageLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header do aluno */}
        <div className="bg-escola-azul text-white">
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            <div className="flex items-center gap-5">
              {aluno.foto_url ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/10 flex-shrink-0">
                  <Image src={aluno.foto_url} alt={aluno.nome} fill sizes="80px" className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-escola-vermelho flex items-center justify-center flex-shrink-0 ring-4 ring-white/10">
                  <span className="text-white text-2xl font-bold">{iniciais}</span>
                </div>
              )}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Portfólio Digital EMTI
                </p>
                <h1 className="font-playfair text-2xl md:text-3xl font-black">{aluno.nome}</h1>
                <p className="text-white/60 text-sm mt-1">{aluno.turma} · Ensino Médio em Tempo Integral</p>
              </div>
            </div>

            {perfis.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {perfis.slice(0, 3).map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    <span>{p.trilha?.icone}</span> {p.trilha?.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-4xl">
          {/* Perfil de competências */}
          {perfis.length > 0 && (
            <section className="mb-10">
              <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">Perfil de Competências</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                {perfis.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="text-gray-700 font-medium flex items-center gap-1.5">
                        <span>{p.trilha?.icone}</span> {p.trilha?.nome}
                      </span>
                      <span className="text-gray-400 text-xs font-mono">{p.pontuacao}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${trilhaBg(p.trilha?.cor_tailwind)}`} style={{ width: `${p.pontuacao}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projetos */}
          <section>
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">Projetos</h2>
            {projetos && projetos.length > 0 ? (
              <PortfolioProjetos projetos={projetos} />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <p className="text-gray-400 text-sm">Nenhum projeto publicado ainda.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer do portfólio */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6 max-w-4xl text-center">
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              Aluno(a) da E.E. Dr. João Beraldo · Carlos Chagas-MG · EMTI
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
