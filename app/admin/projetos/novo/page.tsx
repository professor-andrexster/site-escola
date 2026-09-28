import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { requireProfessorOuGestao } from '@/lib/profile'
import { listarPastas } from '@/lib/db/projetos-turma'
import TrabalhoForm from '@/components/admin/projetos/TrabalhoForm'

interface Props { searchParams: Promise<{ pasta?: string }> }

export const metadata: Metadata = { title: 'Novo projeto' }
export const dynamic = 'force-dynamic'

export default async function NovoProjetoPage({ searchParams }: Props) {
  await requireProfessorOuGestao()
  const { pasta } = await searchParams
  const pastas = await listarPastas()

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/projetos" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Pastas
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo projeto</h1>
      <TrabalhoForm pastas={pastas.map(p => ({ id: p.id, serie: p.serie }))} pastaInicial={pasta ?? pastas[0]?.id ?? ''} />
    </div>
  )
}
