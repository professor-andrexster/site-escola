import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileDown, Headphones } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import CartaoMateria from '@/components/jornal/CartaoMateria'
import { assinaturas, edicaoPublicada, episodioDaEdicao, materiasDaEdicao } from '@/lib/jornal/dados'
import { periodoDaEdicao } from '@/lib/jornal/tipos'

export const revalidate = 60
interface Props { params: Promise<{ numero: string }> }

async function carregar(numero: string) {
  return /^\d{1,5}$/.test(numero) ? edicaoPublicada(Number(numero)) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await carregar((await params).numero)
  if (!e) return { title: 'Edição não encontrada' }
  return { title: `Edição nº ${e.numero}: ${e.titulo}`, description: e.carta ?? `Edição semanal do JBInforma, ${periodoDaEdicao(e)}.` }
}

export default async function EdicaoPage({ params }: Props) {
  const e = await carregar((await params).numero)
  if (!e) notFound()
  const [materias, giro] = await Promise.all([materiasDaEdicao(e), episodioDaEdicao(e.episodioId)])
  const nomes = await assinaturas(materias.map(m => m.autorId))
  const quem = (id: string | null) => (id ? nomes.get(id)?.nome ?? null : null)
  const [manchete, ...resto] = materias

  return (
    <PageLayout>
      <CabecalhoJornal atual="edicoes" titulo={e.titulo} olho={`JBInforma · Edição nº ${e.numero} · ${periodoDaEdicao(e)}`} sobre="A semana da escola, do bairro e da cidade em uma página." />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <a href={`/noticias/edicao/${e.numero}/pdf`} className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors"><FileDown className="w-4 h-4" /> Folha para imprimir (PDF)</a>
          {giro && <Link href={`/podcast/${giro.slug}`} className="inline-flex items-center gap-2 border border-escola-azul text-escola-azul px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul hover:text-white transition-colors"><Headphones className="w-4 h-4" /> Ouvir o Giro JB da semana</Link>}
          <Link href="/noticias/edicoes" className="font-mono text-xs uppercase tracking-widest text-escola-cinza hover:text-escola-azul ml-auto">Todas as edições →</Link>
        </div>

        {manchete && <div className="mb-10"><CartaoMateria m={manchete} assinatura={quem(manchete.autorId)} grande /></div>}

        {e.carta && (
          <section className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr] mb-10 bg-white border-l-4 border-escola-vermelho p-6">
            <h2 className="font-playfair text-xl font-bold text-escola-azul">Recado da redação</h2>
            <p className="font-serif text-lg text-escola-preto whitespace-pre-line min-w-0">{e.carta}</p>
          </section>
        )}

        {resto.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resto.map(m => <CartaoMateria key={m.id} m={m} assinatura={quem(m.autorId)} />)}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
