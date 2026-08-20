import Link from 'next/link'
import { FolderGit2, Info } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { alunoDoUsuario, projetosDoAluno } from '@/lib/db/portfolio'
import PainelPortfolio from '@/components/portfolio/PainelPortfolio'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu Portfólio' }
export const dynamic = 'force-dynamic'

export default async function MeuPortfolioPage() {
  const { user } = await getProfileOrRedirect()
  const aluno = await alunoDoUsuario(user.id)

  // Professor e gestão não têm ficha de aluno, e portfólio é do aluno. Dizer
  // isso é melhor do que mostrar uma tela vazia que parece defeito.
  if (!aluno) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-white font-geom mb-3">Meu Portfólio</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
          <p className="text-white/70 text-sm">
            O portfólio é dos alunos. Sua conta não tem ficha de aluno na escola — se isso estiver
            errado, fale com a secretaria.
          </p>
        </div>
      </div>
    )
  }

  const projetos = await projetosDoAluno(aluno.id)

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FolderGit2 className="w-8 h-8 text-curso-ciano flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-geom">Meu Portfólio</h1>
          <p className="text-white/60 text-sm">O que você já colocou no ar.</p>
        </div>
      </div>

      <p className="text-white/70 text-sm max-w-2xl mb-6 leading-relaxed">
        Cada projeto aqui vira um cartão na{' '}
        <Link href="/projetos" target="_blank" className="text-curso-ciano hover:underline">
          vitrine da escola
        </Link>{' '}
        depois que um professor revisa. O curso{' '}
        <Link href="/admin/cursos/do-codigo-ao-ar" className="text-curso-ciano hover:underline">
          Do Código ao Ar
        </Link>{' '}
        ensina a publicar na Vercel e a escrever a descrição.
      </p>

      <PainelPortfolio projetos={projetos} />
    </div>
  )
}
