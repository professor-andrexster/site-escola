import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, FileText, Folder, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { alunoDoUsuario } from '@/lib/db/portfolio'
import { pastaDaSerie, pastaPeloSlug, trabalhosDaPasta } from '@/lib/db/projetos-turma'

interface Props { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Pasta de projetos' }
export const dynamic = 'force-dynamic'

export default async function PastaPage({ params }: Props) {
  const { slug } = await params
  const { user, profile } = await getProfileOrRedirect()
  const equipe = profile.role === 'professor' || isGestao(profile.role)

  const pasta = await pastaPeloSlug(slug)
  if (!pasta) notFound()

  // Aluno so entra na pasta da propria serie.
  if (!equipe) {
    const aluno = await alunoDoUsuario(user.id)
    const minha = await pastaDaSerie(aluno?.serie ?? null)
    if (!minha || minha.id !== pasta.id) redirect('/admin/projetos')
  }

  const trabalhos = await trabalhosDaPasta(pasta.id, !equipe)

  return (
    <div className="max-w-5xl mx-auto">
      {equipe && (
        <Link href="/admin/projetos" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Todas as pastas
        </Link>
      )}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-8 h-8 text-escola-azul flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pasta.serie}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {equipe ? 'Projetos desta série. Rascunho só aparece para você.' : 'Os projetos da sua série. Abra um para ler o briefing e enviar o seu link.'}
            </p>
          </div>
        </div>
        {equipe && (
          <Link
            href={`/admin/projetos/novo?pasta=${pasta.id}`}
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors flex-shrink-0 foco-painel"
          >
            <Plus className="w-4 h-4" />
            Novo projeto
          </Link>
        )}
      </div>

      {trabalhos.length === 0 ? (
        <div className="empty-state p-12">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {equipe ? 'Nenhum projeto nesta pasta ainda.' : 'O professor ainda não publicou projeto para a sua série.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trabalhos.map(t => (
            <Link key={t.id} href={`/admin/projetos/${t.id}`} className="panel-interativo p-5 block">
              <div className="flex items-center gap-2 mb-2">
                {!t.publicado && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Rascunho</span>}
                {t.arquivoUrl && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-escola-azul">PDF</span>}
              </div>
              <h2 className="font-playfair text-lg font-bold text-gray-900">{t.titulo}</h2>
              {t.resumo && <p className="text-sm text-gray-500 mt-1">{t.resumo}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
