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

  const { data: aulas } = await supabase
    .from('aulas')
    .select('id, titulo, ordem')
    .eq('curso_id', curso.id)
    .eq('publicado', true)
    .order('ordem', { ascending: true })

  return (
    <div className="bg-curso-papel min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <Link href="/cursos" className="inline-block text-curso-texto-suave hover:text-curso-azul text-sm mb-6 transition-colors">
          ← Voltar aos cursos
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-curso-azul mb-3">{curso.titulo}</h1>
          <p className="text-curso-texto-suave text-lg">{curso.descricao}</p>
        </div>

        <div className="bg-white border border-curso-linha rounded-lg p-8">
          <h2 className="text-2xl font-bold text-curso-azul mb-6">
            Aulas ({aulas?.length || 0})
          </h2>

          {(!aulas || aulas.length === 0) ? (
            <p className="text-curso-texto-suave">Nenhuma aula disponível ainda.</p>
          ) : (
            <ol className="space-y-3 list-decimal list-inside">
              {aulas.map((aula, idx) => (
                <li key={aula.id} className="text-curso-azul font-medium">
                  {aula.titulo}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
