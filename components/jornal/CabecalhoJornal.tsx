import Link from 'next/link'

export const SECOES = [
  { chave: 'ultimas', href: '/noticias', rotulo: 'Últimas' },
  { chave: 'edicoes', href: '/noticias/edicoes', rotulo: 'Edição da semana' },
  { chave: 'e-verdade', href: '/noticias/e-verdade', rotulo: 'É verdade?' },
  { chave: 'pauta', href: '/noticias/pauta', rotulo: 'Mande sua pauta' },
  { chave: 'servico', href: '/noticias/servico', rotulo: 'Serviço' },
  { chave: 'memoria', href: '/noticias/memoria', rotulo: 'Memória JB' },
  { chave: 'podcast', href: '/podcast', rotulo: 'Podcast' },
] as const
export type Secao = (typeof SECOES)[number]['chave'] | 'outra'

/** Faixa azul e menu do jornal: iguais em todas as páginas de /noticias. */
export default function CabecalhoJornal({ atual, titulo = 'JBInforma', sobre, olho = 'Escola Estadual Dr. João Beraldo · Carlos Chagas, MG' }: { atual: Secao; titulo?: string; sobre: string; olho?: string }) {
  return (
    <>
      <div className="bg-escola-azul text-white py-12 border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho-claro mb-2">{olho}</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-black">{titulo}</h1>
          <p className="text-white/70 mt-2 font-serif">{sobre}</p>
        </div>
      </div>
      <nav className="bg-escola-creme border-b border-escola-cinza-claro" aria-label="Seções do jornal">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {SECOES.map(s => (
              <li key={s.chave} className="flex-shrink-0">
                <Link href={s.href} aria-current={s.chave === atual ? 'page' : undefined}
                  className={`block font-mono text-xs uppercase tracking-widest px-3 py-3 border-b-2 -mb-px transition-colors ${s.chave === atual ? 'border-escola-vermelho text-escola-azul font-semibold' : 'border-transparent text-escola-cinza hover:text-escola-azul'}`}>
                  {s.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}
