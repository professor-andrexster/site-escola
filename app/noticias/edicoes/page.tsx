import type { Metadata } from 'next'
import Link from 'next/link'
import { FileDown } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { listarEdicoes } from '@/lib/jornal/dados'
import { periodoDaEdicao } from '@/lib/jornal/tipos'

export const metadata: Metadata = {
  title: 'Edição da semana',
  description: 'Todas as edições semanais do JBInforma, o jornal dos alunos da Escola Estadual Dr. João Beraldo, com a folha em PDF para imprimir.',
}
export const revalidate = 60

export default async function EdicoesPage() {
  const edicoes = await listarEdicoes(true)
  const [atual, ...anteriores] = edicoes
  return (
    <PageLayout>
      <CabecalhoJornal atual="edicoes" titulo="Edição da semana" olho="JBInforma · Toda sexta-feira" sobre="O que aconteceu na escola, no bairro e na cidade, em uma página." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">No site e no papel</h2>
            <p className="text-escola-cinza mt-2">Cada edição tem uma folha em PDF. Imprima e cole no mural, na cantina, no comércio do bairro. Quem não tem internet também lê.</p>
          </div>
          <div className="min-w-0">
            {!atual ? (
              <div className="bg-white border border-dashed border-escola-cinza-claro p-6">
                <p className="font-semibold text-escola-preto">A primeira edição sai em breve.</p>
                <p className="text-escola-cinza mt-1">Enquanto isso, leia as <Link href="/noticias" className="text-escola-azul underline">últimas notícias</Link>.</p>
              </div>
            ) : (
              <>
                <div className="bg-white border-y-2 border-escola-azul p-6">
                  <p className="section-label mb-1">Edição nº {atual.numero} · {periodoDaEdicao(atual)}</p>
                  <p className="font-playfair text-2xl md:text-3xl font-black text-escola-azul">{atual.titulo}</p>
                  {atual.carta && <p className="font-serif text-escola-cinza mt-3 line-clamp-3">{atual.carta}</p>}
                  <div className="flex flex-wrap gap-3 mt-5">
                    <Link href={`/noticias/edicao/${atual.numero}`} className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors">Ler a edição</Link>
                    <a href={`/noticias/edicao/${atual.numero}/pdf`} className="inline-flex items-center gap-2 border border-escola-azul text-escola-azul px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul hover:text-white transition-colors"><FileDown className="w-4 h-4" /> Folha para imprimir</a>
                  </div>
                </div>
                {anteriores.length > 0 && (
                  <>
                    <h2 className="font-playfair text-xl font-bold text-escola-azul mt-10 mb-4">Edições anteriores</h2>
                    <ul className="divide-y divide-escola-cinza-claro bg-white border border-escola-cinza-claro">
                      {anteriores.map(e => (
                        <li key={e.id} className="flex flex-wrap items-center gap-3 p-4">
                          <Link href={`/noticias/edicao/${e.numero}`} className="flex-1 min-w-[14rem] hover:text-escola-azul">
                            <span className="font-mono text-xs text-escola-cinza">Nº {e.numero} · {periodoDaEdicao(e)}</span>
                            <span className="block font-playfair font-bold text-escola-preto">{e.titulo}</span>
                          </Link>
                          <a href={`/noticias/edicao/${e.numero}/pdf`} className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul inline-flex items-center gap-1"><FileDown className="w-3.5 h-3.5" /> PDF</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
