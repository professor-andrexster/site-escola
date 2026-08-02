import { createAdminClient } from '@/lib/supabase/admin'
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
  const admin = createAdminClient()

  const { data: obra } = await admin.from('biblioteca_obras').select('*').eq('id', id).maybeSingle()
  if (!obra) notFound()

  const [{ data: vinculos }, { data: exemplares }, { data: editora }, { data: categoria }] = await Promise.all([
    admin.from('biblioteca_obras_autores').select('biblioteca_autores(id, nome)').eq('obra_id', id),
    admin.from('biblioteca_exemplares').select('*').eq('obra_id', id).order('tombo'),
    obra.editora_id ? admin.from('biblioteca_editoras').select('nome').eq('id', obra.editora_id).maybeSingle() : Promise.resolve({ data: null }),
    obra.categoria_id ? admin.from('biblioteca_categorias').select('nome').eq('id', obra.categoria_id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const autoresIniciais = (vinculos ?? [])
    .map(v => (Array.isArray(v.biblioteca_autores) ? v.biblioteca_autores[0] : v.biblioteca_autores))
    .filter((a): a is { id: string; nome: string } => !!a)

  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/acervo" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
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
