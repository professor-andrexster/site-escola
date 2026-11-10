import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { acessoDe, buscarEpisodio, listarMembros } from '@/lib/podcast/dados'
import { participa, podeEditar } from '@/lib/podcast/api'
import EditorEpisodio from '@/components/admin/podcast/EditorEpisodio'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Episódio' }
export const dynamic = 'force-dynamic'

export default async function EpisodioPage({ params }: Props) {
  const { id } = await params
  const { user } = await getProfileOrRedirect()
  const [acesso, ep] = await Promise.all([acessoDe(user.id), buscarEpisodio(id)])
  if (!ep || !acesso) notFound()
  if (!acesso.moderador && !participa(ep, user.id)) notFound()

  const equipe = (await listarMembros()).filter(m => m.liberado || ep.participantes.some(p => p.userId === m.userId))

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/podcast" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Podcast
      </Link>
      <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-4">{ep.titulo}</h1>
      <EditorEpisodio inicial={ep} podeEditar={podeEditar(ep, acesso)} moderador={acesso.moderador} equipe={equipe} />
    </div>
  )
}
