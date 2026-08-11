import UsuariosTable, { type UsuarioLinha } from '@/components/admin/UsuariosTable'
import CriarUsuarioForm from '@/components/admin/CriarUsuarioForm'
import ConvidarBibliotecariaForm from '@/components/admin/ConvidarBibliotecariaForm'
import AtividadeLog from '@/components/admin/AtividadeLog'
import { Users, BookOpen, AlertTriangle } from 'lucide-react'
import { painelDeUsuarios } from '@/lib/db/perfis'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Funcionários — Admin' }
export const dynamic = 'force-dynamic'

export default async function FuncionariosPage() {
  const { perfis: linhas, log } = await painelDeUsuarios(['professor', 'monitor', 'bibliotecario', 'aluno_fundamental'] as string[])
  const pendentes = linhas.filter(p => !p.aprovado).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-escola-azul" />
            Funcionários
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Professores, monitores, bibliotecários e contas de aluno do fundamental.
            Bibliotecária entra por convite; contas de aluno do médio, pelo autocadastro ou pela tela Alunos.
          </p>
          {pendentes > 0 && (
            <p className="text-sm text-yellow-600 mt-2 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {pendentes} cadastro{pendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ConvidarBibliotecariaForm />
          <CriarUsuarioForm
            rolesPermitidos={['professor', 'monitor', 'aluno', 'aluno_fundamental']}
            rolesListados={['professor', 'monitor', 'bibliotecario', 'aluno_fundamental']}
          />
        </div>
      </div>

      <UsuariosTable profiles={linhas} rolesDaTela={['professor', 'monitor', 'bibliotecario', 'aluno_fundamental']} />

      <div className="mt-10">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-escola-azul" />
          Atividade Recente
        </h2>
        <AtividadeLog registros={log} />
      </div>
    </div>
  )
}
