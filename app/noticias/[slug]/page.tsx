import PageLayout from '@/components/PageLayout'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Etiqueta } from '@/components/jornal/CartaoMateria'
import { assinaturas, correcoesDaNoticia, publicadaPorSlug } from '@/lib/jornal/dados'
import { COMO_OUVIU, TEMAS, VEREDITOS, dataCurta, dataLonga, hojeSP } from '@/lib/jornal/tipos'
import { COR_VEREDITO } from '@/components/jornal/estilos'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

const BASE = (process.env.APP_URL ?? '').replace(/\/$/, '')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const achada = await publicadaPorSlug(slug)
  if (!achada) return { title: 'Notícia não encontrada' }
  const n = achada.materia
  return {
    title: n.titulo,
    description: n.resumo ?? undefined,
    openGraph: {
      title: n.titulo,
      description: n.resumo ?? undefined,
      type: 'article',
      images: n.imagemUrl ? [{ url: n.imagemUrl }] : [],
    },
  }
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params
  const achada = await publicadaPorSlug(slug)
  if (!achada) notFound()
  const { materia: m, conteudo } = achada

  const [nomes, correcoes] = await Promise.all([assinaturas([m.autorId]), correcoesDaNoticia(m.id)])
  const assinatura = m.autorId ? nomes.get(m.autorId) : undefined
  const daRedacao = m.fontes.length > 0 || m.tipo !== 'materia' || Boolean(m.editoria)
  const selo = m.tipo === 'checagem' && m.veredito ? { ...VEREDITOS[m.veredito], ...COR_VEREDITO[m.veredito] } : null
  const vencido = m.tipo === 'servico' && m.validoAte ? m.validoAte < hojeSP() : false
  const data = m.publicadoEm ?? m.criadoEm

  // Dados estruturados: materia de jornal e, na checagem, a avaliacao do boato.
  const url = `${BASE}/noticias/${m.slug}`
  const ld: Record<string, unknown>[] = [{
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: m.titulo, datePublished: data, dateModified: m.atualizadoEm,
    ...(m.resumo ? { description: m.resumo } : {}), ...(m.imagemUrl ? { image: [`${BASE}${m.imagemUrl}`] } : {}),
    mainEntityOfPage: url, author: { '@type': 'Organization', name: 'JBInforma, Escola Estadual Dr. João Beraldo' },
    publisher: { '@type': 'Organization', name: 'Escola Estadual Dr. João Beraldo' },
  }]
  if (selo && m.boato) {
    ld.push({
      '@context': 'https://schema.org', '@type': 'ClaimReview', url, datePublished: data, claimReviewed: m.boato,
      author: { '@type': 'Organization', name: 'JBInforma, Escola Estadual Dr. João Beraldo' },
      reviewRating: { '@type': 'Rating', ratingValue: { verdade: 4, enganoso: 2, falso: 1, sem_prova: 2 }[m.veredito!], bestRating: 4, worstRating: 1, alternateName: selo.nome },
    })
  }

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href={m.tipo === 'checagem' ? '/noticias/e-verdade' : '/noticias'} className="text-escola-azul text-sm hover:underline mb-6 inline-block">
          ← {m.tipo === 'checagem' ? 'Voltar para É verdade?' : 'Voltar para Notícias'}
        </Link>
        {m.imagemUrl && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image src={m.imagemUrl} unoptimized={m.imagemUrl.startsWith('/api/podcast/capa/')} alt={m.titulo} fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta m={m} />
          {m.tipo === 'checagem' && m.tema && <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">{TEMAS[m.tema]}</span>}
          {m.tipo === 'memoria' && m.memoriaAno && <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">{m.memoriaAno}</span>}
          <time className="text-gray-500 text-sm" dateTime={data}>{dataLonga(data)}</time>
        </div>
        <h1 className="font-playfair text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
          {m.titulo}
        </h1>
        {daRedacao && (
          <p className="text-sm text-gray-600 mb-6">
            Por {assinatura ? <Link href={`/noticias/reporter/${assinatura.membroId}`} className="font-semibold text-escola-azul hover:underline">{assinatura.nome}</Link> : <span className="font-semibold">Redação JBInforma</span>}
            , com revisão de professor monitor
          </p>
        )}
        {vencido && (
          <p className="border-l-4 border-gray-400 bg-gray-50 px-4 py-3 text-sm text-gray-700 mb-6">Este aviso valia até {dataCurta(m.validoAte!, true)}. Fica aqui só como registro.</p>
        )}
        {correcoes.length > 0 && (
          <aside className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 mb-8" aria-label="Correções">
            <p className="font-semibold text-amber-900 text-sm mb-1">Erramos</p>
            <ul className="space-y-1.5">
              {correcoes.map(c => <li key={c.id} className="text-sm text-amber-900"><span className="font-mono text-xs">{dataLonga(c.criadoEm)}:</span> {c.texto}</li>)}
            </ul>
          </aside>
        )}
        {selo && (
          <section className={`border-2 ${selo.borda} rounded-xl overflow-hidden mb-8`} aria-label="Resultado da checagem">
            <div className={`${selo.fundo} px-5 py-3 flex flex-wrap items-baseline gap-x-3`}>
              <span className="font-playfair text-2xl font-black">{selo.nome}</span>
              <span className="text-sm opacity-90">{selo.frase}</span>
            </div>
            {m.boato && (
              <div className="px-5 py-4 bg-white">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">O que estavam dizendo</p>
                <p className="text-lg text-gray-800 italic">“{m.boato}”</p>
              </div>
            )}
          </section>
        )}
        {m.resumo && (
          <p className="text-xl text-gray-600 border-l-4 border-escola-azul pl-4 mb-8 italic">
            {m.resumo}
          </p>
        )}
        {conteudo && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: conteudo }}
          />
        )}

        {m.comoChecamos.length > 0 && (
          <section className="mt-10">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-3">Como a gente checou</h2>
            <ol className="space-y-3">
              {m.comoChecamos.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-escola-azul text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-gray-800 pt-0.5">{p}</span>
                </li>
              ))}
            </ol>
            <p className="text-sm text-gray-500 mt-4">Você pode refazer estes passos e conferir sozinho. Se chegar a outro resultado, <Link href="/noticias/pauta" className="text-escola-azul underline">avise a redação</Link>.</p>
          </section>
        )}

        {m.fontes.length > 0 && (
          <section className="mt-10 bg-escola-creme border border-escola-cinza-claro rounded-xl p-5">
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-3">{m.tipo === 'checagem' || m.tipo === 'servico' ? 'De onde veio a informação' : 'Quem a gente ouviu'}</h2>
            <ul className="space-y-2">
              {m.fontes.map((f, i) => (
                <li key={i} className="text-gray-800">
                  <span className="font-semibold">{f.nome}</span>{f.papel ? `, ${f.papel}` : ''}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 ml-2">{COMO_OUVIU[f.como]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {daRedacao && (
          <footer className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-600">
            Achou um erro nesta matéria? <Link href="/noticias/pauta" className="text-escola-azul underline">Avise a redação</Link>: a gente corrige e avisa em <Link href="/noticias/erramos" className="text-escola-azul underline">Erramos</Link>. Veja também <Link href="/noticias/como-fazemos" className="text-escola-azul underline">como o jornal é feito</Link>.
          </footer>
        )}
      </article>
    </PageLayout>
  )
}
