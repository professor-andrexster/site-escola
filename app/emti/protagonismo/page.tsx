import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Protagonismo Juvenil' }
export const revalidate = 3600

export default async function ProtagonismoPage() {
  const supabase = await createClient()
  const { data: pagina } = await supabase
    .from('paginas_conteudo')
    .select('*')
    .eq('pagina', 'protagonismo')
    .single()

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-fraunces text-4xl font-bold text-gray-900 mb-8">
          {pagina?.titulo ?? 'Protagonismo Juvenil'}
        </h1>
        {pagina?.conteudo ? (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: pagina.conteudo }} />
        ) : (
          <p className="text-gray-500">Conteúdo em breve.</p>
        )}
      </div>
    </PageLayout>
  )
}
