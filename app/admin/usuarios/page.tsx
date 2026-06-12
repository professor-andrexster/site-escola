import { createClient } from '@/lib/supabase/server'
import UsuariosTable from '@/components/admin/UsuariosTable'
import CriarUsuarioForm from '@/components/admin/CriarUsuarioForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Usuários — Admin' }
export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('aprovado', { ascending: true })
    .order('created_at', { ascending: false })

  const { data: authUsers } = await supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }))

  // Mapeia emails dos usuários
  const emailMap: Record<string, string> = {}
  authUsers?.users?.forEach(u => { emailMap[u.id] = u.email ?? '' })

  const profilesComEmail = (profiles ?? []).map(p => ({
    ...p,
    email: emailMap[p.id] ?? '',
  }))

  const pendentes = profilesComEmail.filter(p => !p.aprovado).length

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
      <UsuariosTable profiles={profilesComEmail} />
    </div>
  )
}
