import { buscarDesafio, fasesDoDesafio, papeisDoDesafio, equipesDoDesafio,
         ideiasEmTriagem } from '@/lib/db/desafios'
import { listarAprovadosPorPapeis } from '@/lib/db/perfis'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DesafioWorkspace from '@/components/admin/DesafioWorkspace'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Desafio' }
export const dynamic = 'force-dynamic'

export default async function DesafioPage({ params }: Props) {
  const { id } = await params
  const { user, profile } = await getProfileOrRedirect()

  const [desafio, fases, papeis, equipes, ideias, alunos] = await Promise.all([
    buscarDesafio(id),
    fasesDoDesafio(id),
    papeisDoDesafio(id),
    equipesDoDesafio(id),
    ideiasEmTriagem(),
    listarAprovadosPorPapeis(['aluno', 'monitor']),
  ])
  if (!desafio) notFound()

  const podeAvaliar = isGestao(profile.role) || (profile.role === 'professor' && desafio.professor_id === user.id)
  const podeEntrarEquipe = profile.role === 'aluno' || profile.role === 'monitor'

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/desafios" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar aos desafios
      </Link>
      <DesafioWorkspace
        desafio={desafio}
        fases={fases ?? []}
        papeis={papeis ?? []}
        equipesIniciais={equipes ?? []}
        ideiasDisponiveis={ideias ?? []}
        alunosDisponiveis={alunos ?? []}
        profileId={user.id}
        podeAvaliar={podeAvaliar}
        podeEntrarEquipe={podeEntrarEquipe}
      />
    </div>
  )
}
