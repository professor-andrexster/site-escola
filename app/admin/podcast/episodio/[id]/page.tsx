import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { acessoDe, buscarEpisodio, listarMembros, listarQuadros, paraAluno, paraEditor } from '@/lib/podcast/dados'
import { participa, podeAudio, podeEditar } from '@/lib/podcast/api'
import EditorEpisodio from '@/components/admin/podcast/EditorEpisodio'
import TranscricaoEpisodio from '@/components/admin/podcast/TranscricaoEpisodio'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Episódio' }
export const dynamic = 'force-dynamic'

export default async function EpisodioPage({ params }: Props) {
  const { id } = await params
  const { user } = await getProfileOrRedirect()
  const [acesso, ep] = await Promise.all([acessoDe(user.id), buscarEpisodio(id)])
  if (!ep || !acesso) notFound()
  if (!acesso.moderador && !participa(ep, user.id)) notFound()

  // So nome e turma vao ao navegador: o objeto Membro tem responsavel, CPF mascarado e matricula.
  const membros = await listarMembros()
  const equipe = membros.filter(m => m.liberado || ep.participantes.some(p => p.userId === m.userId)).map(paraEditor)
  // Participante que nao esta mais na equipe (ou a direcao) continua aparecendo, para poder desmarcar.
  for (const p of ep.participantes) if (!equipe.some(e => e.userId === p.userId)) equipe.push(paraEditor(p))

  const quadros = (await listarQuadros()).filter(q => q.ativo || q.chave === ep.quadro).map(q => ({ chave: q.chave, nome: q.nome, ideia: q.ideia }))

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/podcast" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Podcast
      </Link>
      <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-4">{ep.titulo}</h1>
      <EditorEpisodio inicial={acesso.moderador ? ep : paraAluno(ep)} podeEditar={podeEditar(ep, acesso)} moderador={acesso.moderador} equipe={equipe} userId={user.id} podeAudio={podeAudio(acesso)} quadros={quadros} />
      {acesso.moderador && (
        <div className="mt-6">
          <TranscricaoEpisodio
            episodioId={ep.id}
            publicado={ep.status === 'publicado'}
            temAudio={Boolean(ep.audioUrl)}
            status={ep.transcricaoStatus}
            erroIa={ep.transcricaoErro}
            texto={ep.transcricao}
            publica={ep.transcricaoPublica}
          />
        </div>
      )}
    </div>
  )
}
