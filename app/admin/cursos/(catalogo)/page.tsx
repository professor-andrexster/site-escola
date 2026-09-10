import { trilhasPublicadas, progressoNaTrilha } from '@/lib/db/trilhas'
import TrilhasComModal from '@/components/cursos/TrilhasComModal'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { progressoCursosPorUsuario } from '@/lib/cursosProgresso'
import Image from 'next/image'
import Link from 'next/link'
import { GraduationCap, Settings } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cursos' }
export const dynamic = 'force-dynamic'

export default async function CursosPage() {
  const { user, profile } = await getProfileOrRedirect()

  // `catalogoDoPainel()` saiu junto com a grade: sem a lista de todos os
  // cursos na tela, ela era uma consulta ao banco por carregamento cujo
  // resultado ninguém lia.
  const [progressos, trilhas] = await Promise.all([
    progressoCursosPorUsuario(user.id),
    trilhasPublicadas(),
  ])

  // Quantos cursos de cada trilha o aluno já fechou. O critério é o mesmo do
  // resto do sistema: todas as aulas publicadas do curso concluídas.
  const idsDasTrilhas = trilhas.flatMap(t => t.cursos.map(c => c.id))
  const porCurso = await progressoNaTrilha(idsDasTrilhas, user.id)
  // O modal precisa do progresso por curso já como dado simples: componente
  // de cliente não recebe Map pelo limite servidor/cliente.
  const progressoPorCurso = Object.fromEntries(
    progressos.map(p => [p.id, { total: p.totalAulas, feitas: p.aulasConcluidas }])
  )
  const concluidosPorTrilha = Object.fromEntries(
    trilhas.map(t => [
      t.id,
      t.cursos.filter(c => {
        const p = porCurso.get(c.id)
        return p && p.total > 0 && p.feitas >= p.total
      }).length,
    ])
  )

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

      {/* A entrada para os cursos é a trilha, e a lista deles vive dentro do
          modal de cada uma.

          Antes esta página mostrava as trilhas E, logo abaixo, uma grade com
          todos os cursos publicados: a mesma informação duas vezes, e a segunda
          sem a ordem que a trilha dá. Quem descia até a grade escolhia por capa,
          não pela sequência — que é justamente o que a trilha existe para
          ensinar. */}
      {trilhas.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <GraduationCap className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/55">Nenhum curso publicado ainda.</p>
        </div>
      ) : (
        <section>
          <h2 className="text-white font-bold text-lg font-geom mb-1">Trilhas</h2>
          <p className="text-white/65 text-[16px] mb-4">
            Cada trilha é uma sequência: um curso prepara o seguinte. Abra uma para ver os cursos.
          </p>
          <TrilhasComModal
            trilhas={trilhas}
            progressoPorCurso={progressoPorCurso}
            concluidosPorTrilha={concluidosPorTrilha}
          />
        </section>
      )}
    </div>
  )
}
