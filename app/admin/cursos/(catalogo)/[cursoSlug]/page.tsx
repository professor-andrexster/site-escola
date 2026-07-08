import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Play } from 'lucide-react'
import AulaListItem, { type AulaStatus } from '@/components/cursos/AulaListItem'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ cursoSlug: string }> }): Promise<Metadata> {
  const { cursoSlug } = await params
  const supabase = await createClient()
  const { data: curso } = await supabase.from('cursos').select('titulo').eq('slug', cursoSlug).maybeSingle()
  return { title: curso?.titulo ?? 'Curso' }
}

export default async function CursoDetalhePage({ params }: { params: Promise<{ cursoSlug: string }> }) {
  const { cursoSlug } = await params
  const supabase = await createClient()
  const { user } = await getProfileOrRedirect()

  const { data: curso } = await supabase
    .from('cursos')
    .select('*')
    .eq('slug', cursoSlug)
    .eq('publicado', true)
    .maybeSingle()

  if (!curso) notFound()

  const { data: aulas } = await supabase
    .from('aulas')
    .select('*')
    .eq('curso_id', curso.id)
    .eq('publicado', true)
    .order('ordem')

  const { data: progresso } = await supabase
    .from('progresso_aulas')
    .select('aula_id, slide_atual, concluida')
    .eq('user_id', user.id)
    .in('aula_id', (aulas ?? []).map((a) => a.id))

  const progressoMap = new Map((progresso ?? []).map((p) => [p.aula_id, p]))

  function statusDe(aulaId: string): AulaStatus {
    const p = progressoMap.get(aulaId)
    if (!p) return 'nao_iniciada'
    if (p.concluida) return 'concluida'
    return 'em_andamento'
  }

  const listaAulas = aulas ?? []
  const primeiraNaoConcluida = listaAulas.find((a) => statusDe(a.id) !== 'concluida') ?? listaAulas[0]
  const totalConcluidas = listaAulas.filter((a) => statusDe(a.id) === 'concluida').length
  const progressoPct = listaAulas.length > 0 ? Math.round((totalConcluidas / listaAulas.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/admin/cursos" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar aos cursos
      </Link>

      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-black mb-6">
        {curso.capa_url && (
          <Image src={curso.capa_url} alt={curso.titulo} fill sizes="800px" className="object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-curso-tinta via-curso-tinta/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          {curso.categoria && (
            <p className="text-curso-ciano text-xs font-jetbrains uppercase tracking-widest mb-2">{curso.categoria}</p>
          )}
          <h1 className="text-2xl md:text-4xl font-black text-white font-geom mb-2">{curso.titulo}</h1>
          <p className="text-white/60 text-sm max-w-2xl">{curso.descricao}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-white/40 font-jetbrains mb-1.5">
            <span>{totalConcluidas} de {listaAulas.length} aulas concluídas</span>
            <span>{progressoPct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-curso-azul rounded-full transition-all" style={{ width: `${progressoPct}%` }} />
          </div>
        </div>
        {primeiraNaoConcluida && (
          <Link
            href={`/admin/cursos/${curso.slug}/${primeiraNaoConcluida.slug}`}
            className="inline-flex items-center gap-2 bg-curso-azul hover:bg-curso-azul-claro text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
          >
            <Play className="w-4 h-4" />
            {totalConcluidas === 0 ? 'Começar' : 'Continuar'}
          </Link>
        )}
      </div>

      <div className="space-y-2.5">
        {listaAulas.map((aula, i) => (
          <AulaListItem
            key={aula.id}
            aula={aula}
            numero={i + 1}
            status={statusDe(aula.id)}
            href={`/admin/cursos/${curso.slug}/${aula.slug}`}
          />
        ))}
      </div>
    </div>
  )
}
