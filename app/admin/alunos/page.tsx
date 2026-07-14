import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, GraduationCap } from 'lucide-react'
import AlunosView from '@/components/admin/AlunosView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Alunos — Admin' }
export const dynamic = 'force-dynamic'

export default async function AlunosPage({ searchParams }: { searchParams: Promise<{ criado?: string }> }) {
  // Layout já exige direção; admin client lê as colunas protegidas (cpf, user_id)
  const supabase = createAdminClient()
  const { criado } = await searchParams

  const { data: alunos } = await supabase
    .from('alunos')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div>
      {criado && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          Aluno cadastrado com sucesso!
        </div>
      )}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-escola-azul" />
            Alunos
          </h1>
          <p className="text-sm text-gray-400 mt-1">Base de dados de alunos. Aqui você cria, edita, gerencia matrícula, CPF e dados pessoais. Alunos cadastrados aqui podem criar sua conta de acesso em /admin/cadastro.</p>
        </div>
        <Link
          href="/admin/alunos/novo"
          className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-escola-azul/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </Link>
      </div>

      <AlunosView alunos={alunos ?? []} />
    </div>
  )
}
