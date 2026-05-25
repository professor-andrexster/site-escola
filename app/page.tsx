import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import HeroBanner from '@/components/HeroBanner'
import NewsGrid from '@/components/NewsGrid'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const { data: noticiasDestaque } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .eq('destaque_home', true)
    .limit(1)
    .single()

  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 7)

  const { data: noticiasRecentes } = await supabase
    .from('noticias')
    .select('*')
    .eq('publicado', true)
    .gte('created_at', dataLimite.toISOString())
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <PageLayout>
      {noticiasDestaque && <HeroBanner noticia={noticiasDestaque} />}
      {!noticiasDestaque && (
        <div className="bg-gradient-to-br from-escola-azul to-escola-verde text-white py-24 text-center">
          <h1 className="font-fraunces text-4xl md:text-6xl font-bold mb-4">Escola EMTI</h1>
          <p className="text-xl text-blue-100">Ensino Médio em Tempo Integral</p>
        </div>
      )}
      <NewsGrid noticias={noticiasRecentes ?? []} />
    </PageLayout>
  )
}
