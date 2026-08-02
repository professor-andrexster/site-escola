import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { progressoCursosPorUsuario } from '@/lib/cursosProgresso'
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

  const [{ data: cursos }, progressos] = await Promise.all([
    supabase.from('cursos').select('*').eq('publicado', true).order('ordem'),
    progressoCursosPorUsuario(supabase, user.id),
  ])

  const aulasPorCurso = new Map(progressos.map(p => [p.id, p.totalAulas]))
  const concluidasPorCurso = new Map(progressos.map(p => [p.id, p.aulasConcluidas]))

  const podeGerenciar = profile.role === 'professor' || isGestao(profile.role)

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
