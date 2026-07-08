import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import Image from 'next/image'
import Link from 'next/link'
import { GraduationCap, Settings } from 'lucide-react'
import CursoCard from '@/components/cursos/CursoCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cursos' }
export const dynamic = 'force-dynamic'

export default async function CursosPage() {
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  const [{ data: cursos }, { data: aulas }, { data: progresso }] = await Promise.all([
    supabase.from('cursos').select('*').eq('publicado', true).order('ordem'),
    supabase.from('aulas').select('id, curso_id').eq('publicado', true),
    supabase.from('progresso_aulas').select('aula_id').eq('user_id', user.id).eq('concluida', true),
  ])

  const aulasPorCurso = new Map<string, number>()
  for (const a of aulas ?? []) {
    aulasPorCurso.set(a.curso_id, (aulasPorCurso.get(a.curso_id) ?? 0) + 1)
  }

  const aulaIdParaCurso = new Map<string, string>()
  for (const a of aulas ?? []) aulaIdParaCurso.set(a.id, a.curso_id)

  const concluidasPorCurso = new Map<string, number>()
  for (const p of progresso ?? []) {
    const cursoId = aulaIdParaCurso.get(p.aula_id)
    if (!cursoId) continue
    concluidasPorCurso.set(cursoId, (concluidasPorCurso.get(cursoId) ?? 0) + 1)
  }

  const podeGerenciar = profile.role === 'professor' || profile.role === 'direcao'

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Image src="/cursos/simbolo-transparente.png" alt="" width={44} height={44} className="flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-geom">Cursos</h1>
            <p className="text-white/40 text-sm">por Professor André Gomes</p>
          </div>
        </div>
        {podeGerenciar && (
          <Link
            href="/admin/cursos/gerenciar"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Gerenciar</span>
          </Link>
        )}
      </div>

      {!cursos || cursos.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <GraduationCap className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">Nenhum curso publicado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cursos.map((curso) => (
            <CursoCard
              key={curso.id}
              curso={curso}
              totalAulas={aulasPorCurso.get(curso.id) ?? 0}
              aulasConcluidas={concluidasPorCurso.get(curso.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
