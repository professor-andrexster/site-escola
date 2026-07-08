import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AulaForm from '@/components/admin/AulaForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nova Aula' }

interface Params {
  params: Promise<{ id: string }>
}

export default async function NovaAulaPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: curso } = await supabase.from('cursos').select('id, slug').eq('id', id).maybeSingle()
  if (!curso) notFound()

  const { count } = await supabase.from('aulas').select('*', { count: 'exact', head: true }).eq('curso_id', id)

  return (
    <div>
      <Link href={`/admin/cursos/gerenciar/${id}`} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao curso
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nova Aula</h1>
      <AulaForm cursoId={curso.id} cursoSlug={curso.slug} proximaOrdem={(count ?? 0) + 1} />
    </div>
  )
}
