import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function CursoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: curso } = await supabase
    .from('cursos')
    .select('id, titulo, descricao')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle()

  if (!curso) notFound()

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <Link href="/cursos" className="inline-block text-gray-500 hover:text-gray-700 text-sm mb-6">
          ← Voltar aos cursos
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{curso.titulo}</h1>
        <p className="text-gray-600 text-lg mb-6">{curso.descricao}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Para visualizar as aulas deste curso, é necessário estar logado.</p>
          <Link href="/admin/login" className="inline-block bg-curso-azul text-white px-6 py-2 rounded-lg font-semibold hover:bg-curso-azul/90 transition-colors">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  )
}
