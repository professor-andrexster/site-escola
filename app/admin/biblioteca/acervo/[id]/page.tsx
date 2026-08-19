import { fichaDaObra } from '@/lib/db/biblioteca'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ObraForm from '@/components/admin/biblioteca/ObraForm'
import ExemplaresList from '@/components/admin/biblioteca/ExemplaresList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar Obra, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function ObraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Cinco consultas condicionais viraram uma: editora e categoria vem pelo
  // join, sem o ternario que devolvia Promise.resolve({ data: null }).
  const ficha = await fichaDaObra(id)
  if (!ficha) notFound()
  const { exemplares, editora, categoria, autores: autoresIniciais, ...obra } = ficha

  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/acervo" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para o acervo
      </Link>
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-6">{obra.titulo}</h1>

      <div className="mb-6">
        <ExemplaresList obraId={obra.id} exemplaresIniciais={exemplares ?? []} />
      </div>

      <ObraForm
        obra={obra}
        autoresIniciais={autoresIniciais}
        editoraNomeInicial={editora?.nome ?? null}
        categoriaNomeInicial={categoria?.nome ?? null}
      />
    </div>
  )
}
