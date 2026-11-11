import type { Editoria, Veredito } from '@/lib/jornal/tipos'

/**
 * Cores do jornal. Ficam aqui, e nao em lib/jornal/tipos, porque o Tailwind so
 * gera as classes que encontra em app/ e components/: classe escrita em lib/
 * nao entra no CSS e o selo sai sem fundo.
 */
export const COR_EDITORIA: Record<Editoria, string> = {
  escola: 'bg-blue-100 text-blue-800 border-blue-200',
  bairro: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cidade: 'bg-amber-100 text-amber-800 border-amber-200',
}

export const COR_VEREDITO: Record<Veredito, { fundo: string; borda: string }> = {
  verdade: { fundo: 'bg-green-700 text-white', borda: 'border-green-700' },
  falso: { fundo: 'bg-red-700 text-white', borda: 'border-red-700' },
  enganoso: { fundo: 'bg-amber-600 text-white', borda: 'border-amber-600' },
  sem_prova: { fundo: 'bg-slate-600 text-white', borda: 'border-slate-600' },
}
