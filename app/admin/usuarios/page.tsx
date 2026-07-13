import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosTable, { type UsuarioLinha } from '@/components/admin/UsuariosTable'
import CriarUsuarioForm from '@/components/admin/CriarUsuarioForm'
import AtividadeLog from '@/components/admin/AtividadeLog'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Usuários — Admin' }
export const dynamic = 'force-dynamic'

// Layout desta rota já exige direção (requireDirecao); aqui podemos usar o
// admin client para ler CPF/identidades e o log, que são protegidos por RLS.
export default async function UsuariosPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: identidades }, { data: log }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
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

  const nomePorId = new Map((profiles ?? []).map(p => [p.id as string, p.nome_completo as string]))
  const pendentes = linhas.filter(p => !p.aprovado).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          {pendentes > 0 && (
            <p className="text-sm text-yellow-600 mt-1 font-medium">
              {pendentes} cadastro{pendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
          )}
        </div>
        <CriarUsuarioForm />
      </div>
      <UsuariosTable profiles={linhas} />

      <div className="mt-10">
        <AtividadeLog
          registros={(log ?? []).map(l => ({ ...l, nome: l.user_id ? nomePorId.get(l.user_id) ?? null : null }))}
        />
      </div>
    </div>
  )
}
