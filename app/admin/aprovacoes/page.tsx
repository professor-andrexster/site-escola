import { createAdminClient } from '@/lib/supabase/admin'
import { getProfileOrRedirect } from '@/lib/profile'
import AprovacaoAlunosTable, { type AlunoPendente } from '@/components/admin/AprovacaoAlunosTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Aprovações, Admin' }
export const dynamic = 'force-dynamic'

// Layout desta rota já exige professor ou gestão (requireProfessorOuGestao);
// aqui usamos o admin client porque professor não tem política de leitura
// sobre profiles de outras pessoas, só a de aprovação pontual.
//
// Traz aluno e professor pendentes juntos: professor só entra por aqui,
// nunca teve outra tela de aprovação, então antes de trazer o papel dele
// o cadastro dele nunca aparecia em lugar nenhum (bug real, corrigido aqui).
export default async function AprovacoesPage() {
  const { profile } = await getProfileOrRedirect()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: alunosBase }] = await Promise.all([
    admin
      .from('profiles')
      .select('*')
      .in('role', ['aluno', 'professor'])
      .eq('aprovado', false)
      .order('created_at', { ascending: true }),
    admin.from('alunos').select('user_id, matricula'),
  ])

  const matriculaPorUsuario = new Map((alunosBase ?? []).filter(a => a.user_id).map(a => [a.user_id as string, a.matricula]))

  const pendentes: AlunoPendente[] = (profiles ?? []).map(p => ({
    ...p,
    matricula: matriculaPorUsuario.get(p.id) ?? null,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aprovações</h1>
        <p className="text-sm text-gray-400 mt-1">
          Cadastro de aluno é aprovado por professor ou gestão. Cadastro de professor só por gestão.
        </p>
      </div>
      <AprovacaoAlunosTable pendentes={pendentes} viewerRole={profile.role} />
    </div>
  )
}
