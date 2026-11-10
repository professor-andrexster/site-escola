import Link from 'next/link'

export const ABAS = [
  { chave: 'visao', rotulo: 'Visão geral' },
  { chave: 'equipe', rotulo: 'Equipe' },
  { chave: 'revisao', rotulo: 'Revisão' },
  { chave: 'episodios', rotulo: 'Episódios' },
  { chave: 'auditoria', rotulo: 'Auditoria' },
] as const
export type Aba = (typeof ABAS)[number]['chave']

export default function AbasPodcast({ atual, contagem }: { atual: Aba; contagem: Partial<Record<Aba, number>> }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6 -mx-1 px-1" aria-label="Seções do podcast">
      {ABAS.map(a => {
        const ativo = a.chave === atual
        const n = contagem[a.chave]
        return (
          <Link key={a.chave} href={`/admin/podcast?aba=${a.chave}`} aria-current={ativo ? 'page' : undefined}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${ativo ? 'border-escola-azul text-escola-azul' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {a.rotulo}
            {n ? <span className="ml-1.5 rounded-full bg-amber-100 text-amber-800 text-[11px] px-1.5 py-0.5">{n}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}
