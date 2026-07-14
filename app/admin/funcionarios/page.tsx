import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosTable, { type UsuarioLinha } from '@/components/admin/UsuariosTable'
import CriarUsuarioForm from '@/components/admin/CriarUsuarioForm'
import AtividadeLog from '@/components/admin/AtividadeLog'
import { Users, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Funcionários — Admin' }
export const dynamic = 'force-dynamic'

export default async function FuncionariosPage() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: identidades }, { data: log }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .in('role', ['professor', 'monitor', 'bibliotecario'])
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

  const roleTitulo: Record<string, string> = {
    professor: '👨‍🏫 Professor',
    monitor: '📋 Monitor',
    bibliotecario: '📚 Bibliotecário',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-escola-azul" />
            Funcionários
          </h1>
          <p className="text-sm text-gray-400 mt-1">Professores, monitores, bibliotecários e staff. Gerenciar aprovação e roles.</p>
          {pendentes > 0 && (
            <p className="text-sm text-yellow-600 mt-2 font-medium">
              ⚠️ {pendentes} cadastro{pendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
          )}
        </div>
        <CriarUsuarioForm />
      </div>

      <UsuariosTable profiles={linhas} />

      <div className="mt-10">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-escola-azul" />
          Atividade Recente
        </h2>
        <AtividadeLog registros={
          (log ?? []).map(l => ({
            ...l,
            nome: nomePorId.get(l.user_id || '') || 'Desconhecido',
          }))
        } />
      </div>
    </div>
  )
}
