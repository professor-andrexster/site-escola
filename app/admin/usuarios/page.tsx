import UsuariosTable, { type UsuarioLinha } from '@/components/admin/UsuariosTable'
import CriarUsuarioForm from '@/components/admin/CriarUsuarioForm'
import AtividadeLog from '@/components/admin/AtividadeLog'
import { GESTAO_ROLES } from '@/lib/roles'
import { AlertTriangle } from 'lucide-react'
import { painelDeUsuarios } from '@/lib/db/perfis'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Usuários — Admin' }
export const dynamic = 'force-dynamic'

// Layout desta rota já exige gestão (requireGestao); aqui podemos usar o
// admin client para ler CPF/identidades e o log, que são protegidos por RLS.
export default async function UsuariosPage() {
  const { perfis: linhas, log } = await painelDeUsuarios(GESTAO_ROLES as string[])
  const pendentes = linhas.filter(p => !p.aprovado).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administradores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Diretora, vice diretora e admin. Acesso total ao sistema. Professores e monitores são
            criados em Funcionários; contas de aluno, na tela Alunos ou pelo autocadastro.
          </p>
          {pendentes > 0 && (
            <p className="text-sm text-yellow-600 mt-2 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {pendentes} cadastro{pendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
          )}
        </div>
        <CriarUsuarioForm rolesPermitidos={GESTAO_ROLES} rolesListados={GESTAO_ROLES} />
      </div>
      <UsuariosTable profiles={linhas} rolesDaTela={GESTAO_ROLES} />

      <div className="mt-10">
        <AtividadeLog
          registros={log}
        />
      </div>
    </div>
  )
}
