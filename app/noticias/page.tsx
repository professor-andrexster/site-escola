import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import NewsCard from '@/components/NewsCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notícias' }
export const revalidate = 60

export default async function NoticiasPage() {
  const supabase = await createClient()
  const { data: noticias } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  return (
    <PageLayout>
      <div className="bg-escola-azul text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-fraunces text-4xl font-bold">Notícias</h1>
          <p className="text-blue-200 mt-2">Fique por dentro de tudo que acontece na escola</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {noticias && noticias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <NewsCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">Nenhuma notícia publicada ainda.</p>
        )}
      </div>
    </PageLayout>
  )
}
