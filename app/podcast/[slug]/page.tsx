import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageLayout from '@/components/PageLayout'
import CapaEpisodio from '@/components/podcast/CapaEpisodio'
import { episodioPublicadoPorSlug } from '@/lib/podcast/dados'
import { NOME_PODCAST, nomeDoQuadro, nomePublico, textoParaHtml } from '@/lib/podcast/tipos'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ep = await episodioPublicadoPorSlug(slug)
  if (!ep) return { title: 'Episódio não encontrado' }
  return {
    title: `${ep.titulo} · ${NOME_PODCAST}`,
    description: ep.resumo ?? undefined,
    openGraph: { title: ep.titulo, description: ep.resumo ?? undefined, type: 'article' },
  }
}

export default async function EpisodioPublicoPage({ params }: Props) {
  const { slug } = await params
  const ep = await episodioPublicadoPorSlug(slug)
  if (!ep) notFound()
  const html = textoParaHtml(ep.texto)

  return (
    <PageLayout>
      <article className="container mx-auto px-4 py-12 max-w-5xl">
        <Link href="/podcast" className="text-escola-azul text-sm hover:underline mb-6 inline-block">← Todos os episódios do {NOME_PODCAST}</Link>
        <div className="grid gap-8 md:grid-cols-[minmax(0,16rem)_1fr] items-start">
          <CapaEpisodio quadro={ep.quadro} tipo={ep.tipo} grande />
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-escola-vermelho mb-2">
              {[nomeDoQuadro(ep.quadro), ep.publicadoEm ? formatDate(ep.publicadoEm) : null].filter(Boolean).join(' · ')}
            </p>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold text-gray-900 mb-4">{ep.titulo}</h1>
            {ep.resumo && <p className="text-xl text-gray-600 border-l-4 border-escola-azul pl-4 mb-6 italic">{ep.resumo}</p>}
            {ep.audioUrl && <audio controls preload="metadata" src={ep.audioUrl} className="w-full mb-6" />}
            <dl className="grid gap-3 sm:grid-cols-2 text-sm mb-8">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-widest text-escola-cinza">Quem fez</dt>
                <dd className="text-gray-800">{ep.participantes.map(p => nomePublico(p.nome, p.turma)).join(' · ')}</dd>
              </div>
              {ep.entrevistadoNome && (
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-escola-cinza">Entrevistado</dt>
                  <dd className="text-gray-800">{ep.entrevistadoNome}{ep.entrevistadoDescricao ? `, ${ep.entrevistadoDescricao}` : ''}</dd>
                </div>
              )}
            </dl>
            {html && <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />}
          </div>
        </div>
      </article>
    </PageLayout>
  )
}
