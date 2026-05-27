import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: noticia } = await supabase
    .from('noticias')
    .select('titulo, resumo, imagem_url')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (!noticia) return { title: 'Notícia não encontrada' }

  return {
    title: noticia.titulo,
    description: noticia.resumo ?? undefined,
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumo ?? undefined,
      images: noticia.imagem_url ? [{ url: noticia.imagem_url }] : [],
    },
  }
}


export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: noticia } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (!noticia) notFound()

  return (
    <PageLayout>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/noticias" className="text-escola-azul text-sm hover:underline mb-6 inline-block">
          ← Voltar para Notícias
        </Link>
        {noticia.imagem_url && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image src={noticia.imagem_url} alt={noticia.titulo} fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
          </div>
        )}
        <time className="text-gray-400 text-sm">{formatDate(noticia.created_at)}</time>
        <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
          {noticia.titulo}
        </h1>
        {noticia.resumo && (
          <p className="text-xl text-gray-600 border-l-4 border-escola-azul pl-4 mb-8 italic">
            {noticia.resumo}
          </p>
        )}
        {noticia.conteudo && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
          />
        )}
      </article>
    </PageLayout>
  )
}
