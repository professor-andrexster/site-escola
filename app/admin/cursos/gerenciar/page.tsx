import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import CursoListTable from '@/components/admin/CursoListTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gerenciar Cursos' }
export const dynamic = 'force-dynamic'

export default async function GerenciarCursosPage() {
  const supabase = await createClient()
  const { data: cursos } = await supabase
    .from('cursos')
    .select('*, aulas(id)')
    .order('ordem')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
          <p className="text-gray-500 text-sm mt-1">Crie e edite os cursos disponíveis para alunos e professores</p>
        </div>
        <Link
          href="/admin/cursos/gerenciar/novo"
          className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
        </Link>
      </div>

      <CursoListTable cursos={cursos ?? []} />
    </div>
  )
}
