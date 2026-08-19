import Link from 'next/link'
import { Target, Check, Clock, RotateCcw, Trophy, BookOpen, Layers } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { trilhaDoAluno, type ItemDaTrilha } from '@/lib/db/trilha-desafios'
import { NIVEIS } from '@/lib/db/modulos'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Desafios' }
export const dynamic = 'force-dynamic'

const CORES: Record<string, { chip: string; barra: string }> = {
  'Fácil': { chip: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10', barra: 'bg-emerald-400' },
  'Médio': { chip: 'text-amber-300 border-amber-400/30 bg-amber-400/10', barra: 'bg-amber-400' },
  'Difícil': { chip: 'text-rose-300 border-rose-400/30 bg-rose-400/10', barra: 'bg-rose-400' },
}

const ESTADO = {
  concluido: { rotulo: 'Concluído', classe: 'text-green-300 bg-green-400/10 border-green-400/30', Icone: Check },
  entregue: { rotulo: 'Aguardando correção', classe: 'text-amber-300 bg-amber-400/10 border-amber-400/30', Icone: Clock },
  devolvido: { rotulo: 'Devolvido', classe: 'text-rose-300 bg-rose-400/10 border-rose-400/30', Icone: RotateCcw },
  disponivel: { rotulo: '', classe: '', Icone: Target },
  bloqueado: { rotulo: 'Bloqueado', classe: 'text-white/50 bg-white/5 border-white/10', Icone: Target },
} as const

export default async function DesafiosDaTrilhaPage() {
  const { user } = await getProfileOrRedirect()
  const trilha = await trilhaDoAluno(user.id)

  const feitos = trilha.filter(i => i.estado === 'concluido').length
  const pct = trilha.length ? Math.round((feitos / trilha.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Target className="w-8 h-8 text-curso-ciano flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-geom">Desafios</h1>
          <p className="text-white/55 text-sm">Do mais simples ao mais difícil, na ordem.</p>
        </div>
      </div>

      <p className="text-white/50 text-sm max-w-2xl mb-6">
        Todos os desafios dos cursos numa sequência só. Os de aula são exercícios para fazer junto
        do conteúdo; os projetos de curso e de módulo valem certificado.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">
            {feitos} de {trilha.length} desafios concluídos
          </span>
          <span className="text-white font-jetbrains">{pct}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-400' : 'bg-curso-ciano'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {trilha.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
          <Target className="w-10 h-10 text-white/50 mx-auto mb-3" />
          <p className="text-white/50">Nenhum desafio disponível ainda.</p>
        </div>
      ) : (
        NIVEIS.map(nivel => {
          const doNivel = trilha.filter(i => i.nivel === nivel)
          if (!doNivel.length) return null
          const feitosNivel = doNivel.filter(i => i.estado === 'concluido').length
          const cor = CORES[nivel]

          return (
            <section key={nivel} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[11px] font-jetbrains uppercase tracking-widest px-2.5 py-1 rounded-full border ${cor.chip}`}>
                  {nivel}
                </span>
                <span className="text-white/50 text-xs">
                  {feitosNivel} de {doNivel.length} concluídos
                </span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className={`h-full rounded-full ${cor.barra}`}
                    style={{ width: `${doNivel.length ? (feitosNivel / doNivel.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <ol className="space-y-2">
                {doNivel.map((item, i) => (
                  <ItemTrilha key={item.id} item={item} numero={i + 1} />
                ))}
              </ol>
            </section>
          )
        })
      )}
    </div>
  )
}

function ItemTrilha({ item, numero }: { item: ItemDaTrilha; numero: number }) {
  const e = ESTADO[item.estado]
  const concluido = item.estado === 'concluido'
  const TipoIcone = item.tipo === 'modulo' ? Layers : item.tipo === 'curso' ? Trophy : BookOpen

  return (
    <li>
      <Link
        href={`/admin/cursos/desafios/${item.id}`}
        className="group flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/25 transition-colors"
      >
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-jetbrains font-bold ${
            concluido ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-white/55'
          }`}
        >
          {concluido ? <Check className="w-4 h-4" /> : numero}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate group-hover:text-curso-ciano transition-colors">
            {item.titulo}
          </p>
          <p className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
            <TipoIcone className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {item.tipo === 'modulo' ? 'Projeto do módulo' : item.tipo === 'curso' ? 'Projeto do curso' : 'Exercício'}
              {' · '}{item.origem}
            </span>
          </p>
        </div>

        {item.valeCertificado && !concluido && (
          <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 text-[11px] text-curso-ciano bg-curso-azul/10 border border-curso-azul/20 px-2 py-1 rounded-full">
            <Trophy className="w-3 h-3" />
            Certificado
          </span>
        )}

        {e.rotulo && (
          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${e.classe}`}>
            <e.Icone className="w-3 h-3" />
            <span className="hidden sm:inline">{e.rotulo}</span>
          </span>
        )}
      </Link>
    </li>
  )
}
