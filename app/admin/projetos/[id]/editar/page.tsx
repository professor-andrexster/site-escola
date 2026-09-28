import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { requireProfessorOuGestao } from '@/lib/profile'
import { buscarTrabalho, listarPastas } from '@/lib/db/projetos-turma'
import TrabalhoForm from '@/components/admin/projetos/TrabalhoForm'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Editar projeto' }
export const dynamic = 'force-dynamic'

export default async function EditarProjetoPage({ params }: Props) {
  await requireProfessorOuGestao()
  const { id } = await params
  const [trabalho, pastas] = await Promise.all([buscarTrabalho(id), listarPastas()])
  if (!trabalho) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/admin/projetos/${id}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao projeto
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar projeto</h1>
      <TrabalhoForm pastas={pastas.map(p => ({ id: p.id, serie: p.serie }))} pastaInicial={trabalho.pastaId} trabalho={trabalho} />
    </div>
  )
}
