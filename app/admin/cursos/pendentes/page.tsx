import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react'
import CursoPendenteForm from '@/components/admin/CursoPendenteForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cursos Pendentes — Admin' }
export const dynamic = 'force-dynamic'

export default async function CursosPendentesPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  // Apenas direção pode aprovar
  if (profile?.role !== 'direcao') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 p-6">
        <p className="font-semibold">Acesso Negado</p>
        <p className="text-sm">Apenas a direção pode aprovar cursos.</p>
      </div>
    )
  }

  // Buscar cursos não publicados (rascunhos)
  const { data: cursos } = await admin
    .from('cursos')
    .select(`
      *,
      profiles!cursos_criado_por_fkey(nome_completo, role)
    `)
    .eq('publicado', false)
    .order('criado_em', { ascending: false })

  return (
    <div>
      <Link
        href="/admin/cursos/gerenciar"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para cursos
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <Clock className="w-6 h-6 text-amber-500" />
        Cursos Pendentes de Aprovação
      </h1>
      <p className="text-sm text-gray-400 mb-6">Professores criam cursos como rascunho. Você aprova aqui para publicar.</p>

      {(!cursos || cursos.length === 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">Todos os cursos foram aprovados!</p>
          <p className="text-sm text-gray-400 mt-1">Não há cursos pendentes no momento.</p>
        </div>
      )}

      {cursos && cursos.length > 0 && (
        <div className="space-y-4">
          {cursos.map((curso: any) => (
            <CursoPendenteForm
              key={curso.id}
              curso={curso}
              autorNome={curso.profiles?.nome_completo || 'Desconhecido'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
