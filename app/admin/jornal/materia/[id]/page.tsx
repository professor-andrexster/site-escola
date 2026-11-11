import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { acessoDe } from '@/lib/podcast/dados'
import { podeEditarMateria, podeVerMateria } from '@/lib/jornal/api'
import { buscarMateria, correcoesDaNoticia } from '@/lib/jornal/dados'
import EditorMateria from '@/components/admin/jornal/EditorMateria'
import CorrecoesMateria from '@/components/admin/jornal/CorrecoesMateria'

export const metadata: Metadata = { title: 'Matéria' }
export const dynamic = 'force-dynamic'

export default async function MateriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await getProfileOrRedirect()
  const [acesso, m] = await Promise.all([acessoDe(user.id), buscarMateria(id)])
  if (!m || !acesso || !podeVerMateria(m, acesso)) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/jornal?aba=materias" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Redação
      </Link>
      <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 mb-4">{m.titulo}</h1>
      <EditorMateria inicial={m} podeEditar={podeEditarMateria(m, acesso)} moderador={acesso.moderador} souAutor={m.autorId === user.id} />
      {acesso.moderador && m.status === 'publicado' && (
        <div className="mt-6"><CorrecoesMateria noticiaId={m.id} correcoes={await correcoesDaNoticia(m.id)} /></div>
      )}
    </div>
  )
}
