import { FolderGit2 } from 'lucide-react'
import { requireProfessorOuGestao } from '@/lib/profile'
import { filaDeRevisao } from '@/lib/db/portfolio'
import FilaPortfolio from '@/components/admin/FilaPortfolio'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Revisar portfólio' }
export const dynamic = 'force-dynamic'

export default async function RevisaoPortfolioPage() {
  await requireProfessorOuGestao()
  const fila = await filaDeRevisao()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <FolderGit2 className="w-7 h-7 text-escola-azul flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">Revisar portfólio</h1>
          <p className="text-gray-600 text-sm">Projetos que os alunos enviaram.</p>
        </div>
      </div>

      <p className="text-gray-600 text-sm max-w-2xl mb-6">
        Aprovar publica o projeto na vitrine da escola, com o nome do aluno. Devolver não apaga
        nada — o aluno recebe o que precisa corrigir e reenvia.
      </p>

      <FilaPortfolio itens={fila.map(i => ({
        ...i,
        criadoEm: i.criadoEm ? i.criadoEm.toISOString() : null,
        revisadoEm: null,
      }))} />
    </div>
  )
}
