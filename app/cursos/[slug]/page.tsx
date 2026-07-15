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
    .select('id, titulo, slug, descricao, ordem')
    .eq('curso_id', curso.id)
    .eq('publicado', true)
    .order('ordem', { ascending: true })

  const { data: desafios } = await supabase
    .from('curso_desafios')
    .select('id, titulo, tipo, aula_id')
    .eq('curso_id', curso.id)
    .order('ordem', { ascending: true })

  const desafiosPorAula = (desafios || []).reduce((acc: { [key: string]: any[] }, d: any) => {
    if (!acc[d.aula_id]) acc[d.aula_id] = []
    acc[d.aula_id].push(d)
    return acc
  }, {})

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
          <h2 className="text-2xl font-bold text-curso-azul mb-6">Trilha de Aulas</h2>

          {(!aulas || aulas.length === 0) ? (
            <p className="text-curso-texto-suave">Nenhuma aula disponível ainda.</p>
          ) : (
            <div className="space-y-4">
              {aulas.map((aula, idx) => (
                <div key={aula.id} className="border border-curso-linha rounded-lg p-4 hover:border-curso-azul transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-curso-azul text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-curso-azul">{aula.titulo}</h3>
                      <p className="text-curso-texto-suave text-sm mt-1">{aula.descricao}</p>

                      {desafiosPorAula[aula.id] && desafiosPorAula[aula.id].length > 0 && (
                        <div className="mt-3 ml-0">
                          <div className="text-xs font-semibold text-curso-azul mb-2">Desafios:</div>
                          <div className="flex flex-wrap gap-2">
                            {desafiosPorAula[aula.id].map((d: any) => (
                              <span key={d.id} className="inline-block text-xs bg-curso-azul/10 text-curso-azul px-2 py-1 rounded">
                                {d.tipo}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link href={`/cursos/${slug}/${aula.slug}`} className="inline-block mt-3 text-curso-azul hover:text-curso-azul/80 text-sm font-semibold transition-colors">
                        Ver aula →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
