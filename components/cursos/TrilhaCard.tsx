import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import type { Trilha } from '@/lib/db/trilhas'
import { iconeDaTrilha } from '@/lib/trilhaIcones'
import { formatarDuracao } from '@/lib/duracao'

/**
 * O cartão de entrada de uma trilha.
 *
 * Mostra os três primeiros cursos da sequência porque é isso que responde a
 * pergunta de quem está escolhendo: não "quantos cursos tem", e sim "por onde
 * começa". Um cartão que só diz "8 cursos · 97h" obriga a abrir para descobrir
 * se é o que a pessoa quer.
 */

/**
 * A cor de cada trilha, em classes literais — o Tailwind precisa das strings
 * inteiras no código para gerar o CSS, então interpolar `cor_tailwind` do banco
 * produziria classe que não existe.
 */
const CORES: Record<string, { anel: string; texto: string; barra: string }> = {
  'blue-600': { anel: 'group-hover:border-blue-400/40', texto: 'text-blue-300', barra: 'bg-blue-400' },
  'orange-600': { anel: 'group-hover:border-orange-400/40', texto: 'text-orange-300', barra: 'bg-orange-400' },
  'green-600': { anel: 'group-hover:border-green-400/40', texto: 'text-green-300', barra: 'bg-green-400' },
  'pink-600': { anel: 'group-hover:border-pink-400/40', texto: 'text-pink-300', barra: 'bg-pink-400' },
  'gray-600': { anel: 'group-hover:border-white/30', texto: 'text-white/70', barra: 'bg-white/50' },
}
const PADRAO = CORES['gray-600']

interface Props {
  trilha: Trilha
  /** Quantos cursos da trilha o aluno já concluiu. */
  concluidos: number
}

export default function TrilhaCard({ trilha, concluidos }: Props) {
  const cor = CORES[trilha.cor ?? ''] ?? PADRAO
  const Icone = iconeDaTrilha(trilha)
  const pct = trilha.cursos.length ? Math.round((concluidos / trilha.cursos.length) * 100) : 0
  const proximo = trilha.cursos[Math.min(concluidos, trilha.cursos.length - 1)]

  return (
    <Link
      href={`/admin/cursos/trilhas/${trilha.slug}`}
      className={`group flex flex-col bg-white/5 border border-white/10 ${cor.anel} rounded-2xl p-5 transition-colors`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icone className="w-6 h-6 flex-shrink-0 opacity-80" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0">
          <h2 className="text-white font-black text-lg font-geom truncate">{trilha.nome}</h2>
          <p className={`text-xs font-jetbrains ${cor.texto}`}>
            {trilha.cursos.length} curso{trilha.cursos.length === 1 ? '' : 's'} · {formatarDuracao(trilha.cargaTotalMin)}
          </p>
        </div>
      </div>

      {trilha.descricao && (
        <p className="text-white/65 text-[16px] leading-relaxed mb-4 line-clamp-2">{trilha.descricao}</p>
      )}

      {/* A sequência é o que a trilha tem de próprio: mostrar o começo dela é
          mostrar o produto. */}
      <ol className="space-y-1.5 mb-4">
        {trilha.cursos.slice(0, 3).map((c, i) => (
          <li key={c.id} className="flex items-center gap-2 text-[15px]">
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-jetbrains font-bold ${
                i < concluidos ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-white/60'
              }`}
            >
              {i < concluidos ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className="text-white/70 truncate">{c.titulo}</span>
          </li>
        ))}
        {trilha.cursos.length > 3 && (
          <li className="text-white/50 text-xs ps-7">+{trilha.cursos.length - 3} depois</li>
        )}
      </ol>

      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-white/60">
            {concluidos === 0
              ? proximo ? `Começa em ${proximo.titulo}` : 'Nenhum curso ainda'
              : concluidos === trilha.cursos.length
                ? 'Trilha concluída'
                : `${concluidos} de ${trilha.cursos.length} concluídos`}
          </span>
          <span className="text-white/70 font-jetbrains flex items-center gap-1">
            {pct}%
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${cor.barra}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  )
}
