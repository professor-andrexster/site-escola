import Link from 'next/link'
import { Layers, Award, Lock, Check } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { modulosPublicados, NIVEIS } from '@/lib/db/modulos'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Módulos' }
export const dynamic = 'force-dynamic'

/** Cor por nível. Fácil → Médio → Difícil, do mais frio ao mais quente. */
const CORES: Record<string, { texto: string; borda: string; fundo: string }> = {
  'Fácil': { texto: 'text-emerald-300', borda: 'border-emerald-400/30', fundo: 'bg-emerald-400/10' },
  'Médio': { texto: 'text-amber-300', borda: 'border-amber-400/30', fundo: 'bg-amber-400/10' },
  'Difícil': { texto: 'text-rose-300', borda: 'border-rose-400/30', fundo: 'bg-rose-400/10' },
}

export default async function ModulosPage() {
  const { user } = await getProfileOrRedirect()
  const modulos = await modulosPublicados()

  // Progresso e certificados em duas consultas, não uma por módulo: com 8
  // módulos e 17 cursos, o laço faria dezenas de idas ao banco.
  const idsDeCurso = modulos.flatMap(m => m.cursos.map(c => c.id))
  const [aulas, feitas, certs] = await Promise.all([
    idsDeCurso.length
      ? prisma.aulas.findMany({
          where: { curso_id: { in: idsDeCurso }, publicado: true },
          select: { id: true, curso_id: true },
        })
      : [],
    prisma.progresso_aulas.findMany({
      where: { user_id: user.id, concluida: true },
      select: { aula_id: true },
    }),
    prisma.certificados.findMany({
      where: { user_id: user.id, NOT: { modulo_id: null } },
      select: { modulo_id: true, codigo: true },
    }),
  ])

  const concluidas = new Set(feitas.map(p => p.aula_id))
  const aulasPorCurso = new Map<string, string[]>()
  for (const a of aulas) {
    if (!a.curso_id) continue
    const lista = aulasPorCurso.get(a.curso_id) ?? []
    lista.push(a.id)
    aulasPorCurso.set(a.curso_id, lista)
  }
  const certPorModulo = new Map(certs.map(c => [c.modulo_id as string, c.codigo]))

  function progresso(cursos: { id: string }[]) {
    const ids = cursos.flatMap(c => aulasPorCurso.get(c.id) ?? [])
    const feito = ids.filter(id => concluidas.has(id)).length
    return { total: ids.length, feito, pct: ids.length ? Math.round((feito / ids.length) * 100) : 0 }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Layers className="w-8 h-8 text-curso-ciano flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-geom">Módulos</h1>
          <p className="text-white/55 text-sm">
            Trilhas de cursos com certificado próprio. Comece no Fácil e avance.
          </p>
        </div>
      </div>

      <p className="text-white/50 text-sm max-w-2xl mb-8">
        Cada módulo reúne cursos que se completam e termina num projeto grande, que treina tudo
        que você viu nele. Aprovado no projeto, sai o certificado do módulo — além do certificado
        de cada curso.
      </p>

      {NIVEIS.map(nivel => {
        const doNivel = modulos.filter(m => m.nivel === nivel)
        if (!doNivel.length) return null
        const cor = CORES[nivel]

        return (
          <section key={nivel} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[11px] font-jetbrains uppercase tracking-widest px-2.5 py-1 rounded-full border ${cor.borda} ${cor.fundo} ${cor.texto}`}>
                {nivel}
              </span>
              <span className="text-white/50 text-xs">
                {doNivel.length} {doNivel.length === 1 ? 'módulo' : 'módulos'} ·{' '}
                {doNivel.reduce((s, m) => s + (m.carga_horaria ?? 0), 0)}h
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doNivel.map(m => {
                const p = progresso(m.cursos)
                const codigo = certPorModulo.get(m.id)

                return (
                  <Link
                    key={m.id}
                    href={`/admin/modulos/${m.slug}`}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/25 transition-colors flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-white font-bold font-geom text-lg leading-tight group-hover:text-curso-ciano transition-colors">
                        {m.nome}
                      </h2>
                      {codigo ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-jetbrains uppercase tracking-wider text-green-300 bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">
                          <Award className="w-3 h-3" />
                          Certificado
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-white/50 text-xs font-jetbrains">
                          {m.carga_horaria}h
                        </span>
                      )}
                    </div>

                    <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">{m.descricao}</p>

                    <ul className="space-y-1.5 mb-4">
                      {m.cursos.map(cu => {
                        const ids = aulasPorCurso.get(cu.id) ?? []
                        const completo = ids.length > 0 && ids.every(id => concluidas.has(id))
                        return (
                          <li key={cu.id} className="flex items-center gap-2 text-sm">
                            {completo ? (
                              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                            )}
                            <span className={completo ? 'text-white/70' : 'text-white/50'}>
                              {cu.titulo}
                            </span>
                            <span className="text-white/25 text-xs font-jetbrains ms-auto flex-shrink-0">
                              {cu.carga_horaria}h
                            </span>
                          </li>
                        )
                      })}
                    </ul>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-white/55">
                          {p.feito} de {p.total} aulas
                        </span>
                        <span className="text-white/60 font-jetbrains">{p.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${p.pct === 100 ? 'bg-green-400' : 'bg-curso-ciano'}`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                      {p.pct < 100 && (
                        <p className="flex items-center gap-1.5 text-white/50 text-xs mt-2">
                          <Lock className="w-3 h-3" />
                          Projeto do módulo libera ao concluir as aulas
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
