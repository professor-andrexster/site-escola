import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { memorias } from '@/lib/jornal/dados'

export const metadata: Metadata = {
  title: 'Memória JB: 80 anos de histórias',
  description: 'A história da Escola Estadual Dr. João Beraldo, de 1946 a hoje, contada por quem estudou e trabalhou nela. Fotos antigas e depoimentos recolhidos pelos alunos.',
}
export const revalidate = 60

const DECADAS = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]

export default async function MemoriaPage() {
  const itens = await memorias()
  const total = itens.length
  return (
    <PageLayout>
      <CabecalhoJornal atual="memoria" titulo="Memória JB" olho="JBInforma · 1946 a 2026" sobre="Oitenta anos de escola contados por quem passou por ela." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mb-14">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Um arquivo feito de gente</h2>
            <p className="text-escola-cinza mt-2">A escola abriu as portas em 1946. Os alunos de hoje estão procurando quem estudou e trabalhou aqui para guardar essas histórias antes que se percam.</p>
          </div>
          <div className="min-w-0 bg-white border-l-4 border-escola-vermelho p-6">
            <p className="font-playfair text-xl font-bold text-escola-preto">Você estudou no João Beraldo? Tem foto antiga em casa?</p>
            <p className="text-escola-cinza mt-2">Conte para a redação de que ano é e quem aparece. Um repórter procura você para ouvir a história. A foto é devolvida no mesmo dia.</p>
            <Link href="/noticias/pauta" className="inline-block bg-escola-azul text-white px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors mt-4">Quero contar minha história</Link>
            <p className="font-mono text-[10px] uppercase tracking-widest text-escola-cinza mt-4">{total === 0 ? 'Nenhuma história guardada ainda. A sua pode ser a primeira.' : `${total} ${total === 1 ? 'história guardada' : 'histórias guardadas'} até agora`}</p>
          </div>
        </section>

        <ol className="space-y-10">
          {DECADAS.map(d => {
            const lista = itens.filter(m => m.memoriaAno != null && m.memoriaAno >= d && m.memoriaAno < d + 10)
            return (
              <li key={d} className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr] border-t border-escola-cinza-claro pt-8">
                <div>
                  <p className="font-playfair text-5xl font-black text-escola-azul/25 leading-none">{d === 1940 ? '1946' : d}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-escola-cinza mt-1">{d === 1940 ? 'a fundação e os primeiros anos' : `anos ${d}`}</p>
                </div>
                <div className="min-w-0">
                  {lista.length === 0 ? (
                    <p className="text-escola-cinza">Ainda não temos histórias desta época. <Link href="/noticias/pauta" className="text-escola-azul underline">Você conhece alguém que estudou aqui nesses anos?</Link></p>
                  ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {lista.map(m => (
                        <li key={m.id}>
                          <Link href={`/noticias/${m.slug}`} className="flex gap-4 bg-white border border-escola-cinza-claro p-3 card-lift h-full">
                            {m.imagemUrl && (
                              <div className="relative w-24 h-24 flex-shrink-0 bg-escola-creme-escuro overflow-hidden">
                                <Image src={m.imagemUrl} alt="" fill sizes="96px" className="object-cover sepia-[.35]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-mono text-xs text-escola-vermelho font-semibold">{m.memoriaAno}</span>
                              <p className="font-playfair font-bold text-escola-preto leading-snug">{m.titulo}</p>
                              {m.resumo && <p className="text-sm text-escola-cinza mt-1 line-clamp-2">{m.resumo}</p>}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </PageLayout>
  )
}
