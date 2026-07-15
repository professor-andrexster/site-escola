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
    <div className="bg-escola-creme min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <Link href="/cursos" className="inline-block text-escola-cinza hover:text-escola-vermelho text-sm mb-6 transition-colors">
          ← Voltar aos cursos
        </Link>

        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-black text-escola-azul mb-3">{curso.titulo}</h1>
          <p className="text-escola-cinza text-lg">{curso.descricao}</p>
        </div>

        <div className="bg-white border border-escola-cinza-claro rounded-lg p-8">
          <h2 className="font-playfair text-2xl font-bold text-escola-azul mb-6">
            Aulas ({aulas?.length || 0})
          </h2>

          {(!aulas || aulas.length === 0) ? (
            <p className="text-escola-cinza">Nenhuma aula disponível ainda.</p>
          ) : (
            <ol className="space-y-3">
              {aulas.map((aula, idx) => (
                <li key={aula.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-escola-azul text-white text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-escola-preto font-medium">{aula.titulo}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
