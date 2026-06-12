import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FolderKanban, ExternalLink } from 'lucide-react'
import AlunoEditForm from '@/components/admin/AlunoEditForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar Aluno — Admin' }
export const dynamic = 'force-dynamic'

export default async function AlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: aluno } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!aluno) notFound()

  const { data: perfis } = await supabase
    .from('perfis_vocacionais')
    .select('pontuacao, trilhas(nome, icone, cor_tailwind)')
    .eq('aluno_id', id)
    .order('pontuacao', { ascending: false })

  const { count: projetosCount } = await supabase
    .from('projetos')
    .select('id', { count: 'exact', head: true })
    .eq('aluno_id', id)

  return (
    <div className="max-w-2xl">
      <Link href="/admin/alunos" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para listagem
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1">{aluno.nome}</h1>
      <p className="text-sm text-gray-400 mb-6">Matrícula {aluno.matricula} · {aluno.turma}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          href={`/admin/alunos/${id}/projetos`}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-escola-azul/30 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-escola-azul" />
              Projetos do portfólio
            </p>
            <p className="text-xs text-gray-400 mt-1">{projetosCount ?? 0} projeto(s) cadastrado(s)</p>
          </div>
        </Link>

        <Link
          href={`/portfolio/${aluno.matricula}`}
          target="_blank"
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-escola-azul/30 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-escola-azul" />
              Ver portfólio público
            </p>
            <p className="text-xs text-gray-400 mt-1">escolaestadualdrjoaoberaldo.com/portfolio/{aluno.matricula}</p>
          </div>
        </Link>
      </div>

      {perfis && perfis.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Perfil Vocacional</h2>
          <div className="space-y-2">
            {perfis.map((p, i) => {
              const trilha = Array.isArray(p.trilhas) ? p.trilhas[0] : p.trilhas
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-center">{trilha?.icone}</span>
                  <span className="flex-1 text-gray-700">{trilha?.nome}</span>
                  <span className="text-gray-400 text-xs">{p.pontuacao}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AlunoEditForm aluno={aluno} />
    </div>
  )
}
