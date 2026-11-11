import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { acessoDe } from '@/lib/podcast/dados'
import { buscarEdicao, candidatasDaEdicao, episodiosParaEdicao } from '@/lib/jornal/dados'
import EditorEdicao from '@/components/admin/jornal/EditorEdicao'

export const metadata: Metadata = { title: 'Edição da semana' }
export const dynamic = 'force-dynamic'

export default async function EdicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await getProfileOrRedirect()
  const [acesso, e] = await Promise.all([acessoDe(user.id), buscarEdicao(id)])
  if (!e || !acesso?.moderador) notFound()
  const [candidatas, episodios] = await Promise.all([candidatasDaEdicao(), episodiosParaEdicao()])

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/jornal?aba=edicoes" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Edições
      </Link>
      <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-4">Edição nº {e.numero}</h1>
      <EditorEdicao inicial={e} candidatas={candidatas} episodios={episodios.map(p => ({ id: p.id, titulo: p.titulo }))} />
    </div>
  )
}
