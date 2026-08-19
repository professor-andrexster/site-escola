import { buscarPorId } from '@/lib/db/alunos'
import { listarTrilhas, projetosDoAlunoComTrilha } from '@/lib/db/comunidade'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AlunoProjetosManager from '@/components/admin/AlunoProjetosManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Projetos do Aluno — Admin' }
export const dynamic = 'force-dynamic'

export default async function AlunoProjetosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const aluno = await buscarPorId(id)
  if (!aluno) notFound()

  const [projetos, trilhas] = await Promise.all([
    projetosDoAlunoComTrilha(id),
    listarTrilhas(),
  ])

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/alunos/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para perfil
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1">Projetos de {aluno.nome}</h1>
      <p className="text-sm text-gray-500 mb-6">Gerencie os projetos exibidos no portfólio público.</p>

      <AlunoProjetosManager
        alunoId={id}
        serieAtual={aluno.serie}
        trilhas={trilhas}
        projetosIniciais={projetos}
      />
    </div>
  )
}
