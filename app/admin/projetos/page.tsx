import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Folder, FolderKanban, Info } from 'lucide-react'
import type { Metadata } from 'next'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { alunoDoUsuario } from '@/lib/db/portfolio'
import { listarPastas, pastaDaSerie, seriesSemPasta, slugDaSerie } from '@/lib/db/projetos-turma'
import NovaPastaForm from '@/components/admin/projetos/NovaPastaForm'

export const metadata: Metadata = { title: 'Projetos' }
export const dynamic = 'force-dynamic'

/**
 * Aba Projetos. Professor e gestao veem as pastas (uma por serie). Aluno cai
 * direto na pasta da propria serie: nao ha por que ele escolher.
 */
export default async function ProjetosPage() {
  const { user, profile } = await getProfileOrRedirect()
  const equipe = profile.role === 'professor' || isGestao(profile.role)

  if (!equipe) {
    const aluno = await alunoDoUsuario(user.id)
    const pasta = await pastaDaSerie(aluno?.serie ?? null)
    if (pasta) redirect(`/admin/projetos/pasta/${slugDaSerie(pasta.serie)}`)
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Projetos</h1>
        <div className="panel p-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-600 text-sm">
            {aluno
              ? `Ainda não há pasta de projetos para a sua série (${aluno.serie}). Quando o professor criar, ela aparece aqui.`
              : 'Sua conta não tem ficha de aluno na escola. Se isso estiver errado, fale com a secretaria.'}
          </p>
        </div>
      </div>
    )
  }

  const [pastas, livres] = await Promise.all([listarPastas(), seriesSemPasta()])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-8 h-8 text-escola-azul flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
            <p className="text-gray-500 text-sm mt-1">Uma pasta por série. O aluno posta o link do projeto; você abre e avalia o andamento.</p>
          </div>
        </div>
        {livres.length > 0 && <NovaPastaForm series={livres} />}
      </div>

      {pastas.length === 0 ? (
        <div className="empty-state p-12">
          <Folder className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma pasta ainda. Crie a primeira com o botão acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastas.map(p => (
            <Link key={p.id} href={`/admin/projetos/pasta/${slugDaSerie(p.serie)}`} className="panel-interativo p-5 block">
              <Folder className="w-8 h-8 text-escola-azul mb-3" />
              <h2 className="font-playfair text-lg font-bold text-gray-900">{p.serie}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {p.totalTrabalhos === 0
                  ? 'Nenhum projeto'
                  : `${p.totalTrabalhos} projeto${p.totalTrabalhos > 1 ? 's' : ''}` +
                    (p.totalPublicados < p.totalTrabalhos ? ` · ${p.totalPublicados} publicado${p.totalPublicados === 1 ? '' : 's'}` : '')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
