import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosTable, { type UsuarioLinha } from '@/components/admin/UsuariosTable'
import { GraduationCap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Alunos Autenticados — Admin' }
export const dynamic = 'force-dynamic'

export default async function AlunosAutenticadosPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: identidades }, { data: log }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'aluno')
      .order('aprovado', { ascending: true })
      .order('created_at', { ascending: false }),
    admin.from('identidades').select('user_id, cpf, email_alternativo, criado_via'),
    admin.from('log_atividades').select('*').order('criado_em', { ascending: false }).limit(100),
  ])

  const identidadeMap = new Map((identidades ?? []).map(i => [i.user_id, i]))

  const linhas: UsuarioLinha[] = (profiles ?? []).map(p => {
    const ident = identidadeMap.get(p.id)
    return {
      ...p,
      email: p.email ?? '',
      cpf: ident?.cpf ?? null,
      email_alternativo: ident?.email_alternativo ?? null,
      criado_via: ident?.criado_via ?? null,
    }
  })

  const pendentes = linhas.filter(p => !p.aprovado).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-escola-azul" />
            Alunos Autenticados
          </h1>
          <p className="text-sm text-gray-400 mt-1">Alunos que criaram conta no sistema. Gerenciar aprovação e acesso.</p>
          {pendentes > 0 && (
            <p className="text-sm text-yellow-600 mt-2 font-medium">
              ⚠️ {pendentes} aluno{pendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
          )}
        </div>
      </div>

      <UsuariosTable profiles={linhas} />
    </div>
  )
}
