import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'EMTI — Ensino Médio em Tempo Integral' }
export const revalidate = 3600

const subpaginas = [
  { href: '/emti/projeto-vida', titulo: 'Projeto de Vida', icone: '🎯' },
  { href: '/emti/eletivas', titulo: 'Eletivas', icone: '📚' },
  { href: '/emti/protagonismo', titulo: 'Protagonismo Juvenil', icone: '⭐' },
]

export default async function EmtiPage() {
  const supabase = await createClient()
  const { data: pagina } = await supabase
    .from('paginas_conteudo')
    .select('*')
    .eq('pagina', 'emti')
    .single()

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-escola-azul to-escola-verde text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-fraunces text-4xl font-bold mb-4">
            {pagina?.titulo ?? 'Ensino Médio em Tempo Integral'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {pagina?.conteudo ? (
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: pagina.conteudo }}
          />
        ) : (
          <p className="text-gray-500 mb-12">Conteúdo em breve.</p>
        )}
        <h2 className="font-fraunces text-2xl font-bold text-gray-900 mb-6">Saiba mais sobre</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subpaginas.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-escola-azul transition-all group"
            >
              <span className="text-4xl mb-3 block">{sub.icone}</span>
              <h3 className="font-fraunces text-lg font-semibold text-gray-900 group-hover:text-escola-azul transition-colors">
                {sub.titulo}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
