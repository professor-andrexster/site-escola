'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import type { Trilha } from '@/lib/db/trilhas'
import { iconeDaTrilha } from '@/lib/trilhaIcones'
import { formatarDuracao } from '@/lib/duracao'

/**
 * Os cursos de uma trilha, dentro de um modal.
 *
 * Este é o ÚNICO lugar do catálogo onde a lista de cursos aparece. A página
 * mostrava as trilhas e, logo abaixo, uma grade com os 25 cursos publicados —
 * a mesma informação duas vezes, e a segunda sem a ordem que a trilha dá. Quem
 * chegava via grade escolhia por capa bonita, não pela sequência.
 *
 * `<dialog>` nativo, e não uma div com z-index: o navegador já dá o foco preso
 * dentro do modal, o fechamento por Esc e a camada acima de todo o resto da
 * página. Reescrever isso à mão é onde se perde acessibilidade sem perceber.
 */

const CORES: Record<string, { texto: string; barra: string; borda: string }> = {
  'blue-600': { texto: 'text-blue-300', barra: 'bg-blue-400', borda: 'hover:border-blue-400/40' },
  'orange-600': { texto: 'text-orange-300', barra: 'bg-orange-400', borda: 'hover:border-orange-400/40' },
  'green-600': { texto: 'text-green-300', barra: 'bg-green-400', borda: 'hover:border-green-400/40' },
  'pink-600': { texto: 'text-pink-300', barra: 'bg-pink-400', borda: 'hover:border-pink-400/40' },
  'gray-600': { texto: 'text-white/70', barra: 'bg-white/50', borda: 'hover:border-white/30' },
}
const PADRAO = CORES['gray-600']

export type ProgressoDoCurso = { total: number; feitas: number }

export default function ModalTrilha({
  trilha,
  progressoPorCurso,
  onFechar,
}: {
  trilha: Trilha
  progressoPorCurso: Record<string, ProgressoDoCurso>
  onFechar: () => void
}) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (!el.open) el.showModal()
    // Trava a rolagem do fundo: sem isto, rolar dentro do modal arrasta a
    // página atrás dele no celular.
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const cor = CORES[trilha.cor ?? ''] ?? PADRAO
  const Icone = iconeDaTrilha(trilha)

  const concluidos = trilha.cursos.filter(c => {
    const p = progressoPorCurso[c.id]
    return p && p.total > 0 && p.feitas >= p.total
  }).length
  const pct = trilha.cursos.length ? Math.round((concluidos / trilha.cursos.length) * 100) : 0

  return (
    <dialog
      ref={dialogo}
      onClose={onFechar}
      // O clique no fundo fecha. O `<dialog>` entrega o clique do backdrop como
      // um clique no próprio elemento, então comparar o alvo é o que separa
      // "clicou fora" de "clicou num curso".
      onClick={e => { if (e.target === dialogo.current) dialogo.current?.close() }}
      aria-labelledby="titulo-da-trilha"
      className="w-[min(46rem,92vw)] max-h-[85vh] p-0 rounded-2xl bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="bg-curso-tinta border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <header className="flex items-start gap-3 p-5 border-b border-white/10 flex-shrink-0">
          <Icone className="w-7 h-7 flex-shrink-0 opacity-80 mt-0.5" strokeWidth={1.5} aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 id="titulo-da-trilha" className="text-white font-black text-xl font-geom">
              {trilha.nome}
            </h2>
            <p className={`text-[13px] font-jetbrains ${cor.texto}`}>
              {trilha.cursos.length} curso{trilha.cursos.length === 1 ? '' : 's'} ·{' '}
              {formatarDuracao(trilha.cargaTotalMin)} · {pct}% concluído
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label="Fechar"
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors foco-curso"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {trilha.descricao && (
          <p className="text-white/65 text-[15px] leading-relaxed px-5 pt-4 flex-shrink-0">
            {trilha.descricao}
          </p>
        )}

        {/* A lista rola dentro do modal, não a página: com 14 cursos a
            Programação não cabe em tela nenhuma. */}
        <ol className="p-5 space-y-2 overflow-y-auto">
          {trilha.cursos.map((curso, i) => {
            const p = progressoPorCurso[curso.id]
            const total = p?.total ?? 0
            const feitas = p?.feitas ?? 0
            const completo = total > 0 && feitas >= total
            const pctCurso = total ? Math.round((feitas / total) * 100) : 0

            return (
              <li key={curso.id}>
                <Link
                  href={`/admin/cursos/${curso.slug}`}
                  className={`group flex items-center gap-3 bg-white/5 border border-white/10 ${cor.borda} rounded-xl p-3.5 transition-colors`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-jetbrains font-bold ${
                      completo ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {completo ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-white font-bold text-[16px] leading-snug">
                      {curso.titulo}
                    </span>
                    <span className="block text-white/55 text-[13px] font-jetbrains mt-0.5">
                      {total} aula{total === 1 ? '' : 's'}
                      {feitas > 0 && !completo ? ` · ${feitas} concluída${feitas === 1 ? '' : 's'}` : ''}
                      {completo ? ' · concluído' : ''}
                    </span>
                    {feitas > 0 && !completo && (
                      <span className="block h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                        <span
                          className={`block h-full rounded-full ${cor.barra}`}
                          style={{ width: `${pctCurso}%` }}
                        />
                      </span>
                    )}
                  </span>

                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-white/55 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </dialog>
  )
}
