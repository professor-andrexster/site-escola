import { aulaDoCurso, buscarPorId } from '@/lib/db/cursos'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AulaForm from '@/components/admin/AulaForm'
import type { Metadata } from 'next'

interface Params {
  params: Promise<{ id: string; aulaId: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id, aulaId } = await params
  const aula = await aulaDoCurso(id, aulaId)
  return { title: aula ? `Editar — ${aula.titulo}` : 'Aula' }
}

export default async function EditarAulaPage({ params }: Params) {
  const { id, aulaId } = await params
  const curso = await buscarPorId(id)
  if (!curso) notFound()

  const aula = await aulaDoCurso(id, aulaId)
  if (!aula) notFound()

  return (
    <div>
      <Link href={`/admin/cursos/gerenciar/${id}`} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao curso
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Aula</h1>
      <AulaForm cursoId={curso.id} cursoSlug={curso.slug} aula={aula} />
    </div>
  )
}
