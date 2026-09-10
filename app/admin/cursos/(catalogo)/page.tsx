import { catalogoDoPainel } from '@/lib/db/cursos'
import { trilhasPublicadas, progressoNaTrilha } from '@/lib/db/trilhas'
import TrilhaCard from '@/components/cursos/TrilhaCard'
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
  const { user, profile } = await getProfileOrRedirect()

  const [cursos, progressos, trilhas] = await Promise.all([
    catalogoDoPainel(),
    progressoCursosPorUsuario(user.id),
    trilhasPublicadas(),
  ])

  // Quantos cursos de cada trilha o aluno já fechou. O critério é o mesmo do
  // resto do sistema: todas as aulas publicadas do curso concluídas.
  const idsDasTrilhas = trilhas.flatMap(t => t.cursos.map(c => c.id))
  const porCurso = await progressoNaTrilha(idsDasTrilhas, user.id)
  const concluidosPorTrilha = new Map(
    trilhas.map(t => [
      t.id,
      t.cursos.filter(c => {
        const p = porCurso.get(c.id)
        return p && p.total > 0 && p.feitas >= p.total
      }).length,
    ])
  )

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
            <p className="text-white/55 text-sm">por Professor André Gomes</p>
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

      {/* As trilhas vêm primeiro: quem chega quer saber por onde começar, e a
          grade de 17 cursos soltos não responde isso. A lista completa segue
          abaixo, para quem já sabe o que procura. */}
      {trilhas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-white font-bold text-lg font-geom mb-1">Trilhas</h2>
          <p className="text-white/65 text-[16px] mb-4">
            Cada trilha é uma sequência: um curso prepara o seguinte.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trilhas.map(t => (
              <TrilhaCard key={t.id} trilha={t} concluidos={concluidosPorTrilha.get(t.id) ?? 0} />
            ))}
          </div>
        </section>
      )}

      {trilhas.length > 0 && cursos.length > 0 && (
        <h2 className="text-white font-bold text-lg font-geom mb-4">Todos os cursos</h2>
      )}

      {cursos.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <GraduationCap className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/55">Nenhum curso publicado ainda.</p>
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
