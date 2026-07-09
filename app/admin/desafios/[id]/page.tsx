import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
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
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  const [{ data: desafio }, { data: fases }, { data: papeis }, { data: equipes }, { data: ideias }, { data: alunos }] = await Promise.all([
    supabase.from('desafios').select('*').eq('id', id).maybeSingle(),
    supabase.from('desafio_fases').select('*').eq('desafio_id', id).order('ordem'),
    supabase.from('desafio_papeis').select('*').eq('desafio_id', id),
    supabase
      .from('equipes')
      .select('*, equipe_membros(*, profile:profiles(nome_completo), papel:desafio_papeis(nome)), entregas(*)')
      .eq('desafio_id', id)
      .order('created_at'),
    supabase.from('ideias').select('id, titulo, status').in('status', ['nova', 'em_analise']).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, nome_completo, turma').in('role', ['aluno', 'monitor']).eq('aprovado', true).order('nome_completo'),
  ])
  if (!desafio) notFound()

  const podeAvaliar = profile.role === 'direcao' || (profile.role === 'professor' && desafio.professor_id === user.id)
  const podeEntrarEquipe = profile.role === 'aluno' || profile.role === 'monitor'

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/desafios" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
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
