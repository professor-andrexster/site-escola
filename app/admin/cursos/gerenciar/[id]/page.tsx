import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import CursoForm from '@/components/admin/CursoForm'
import AulaManager from '@/components/admin/AulaManager'
import type { Metadata } from 'next'

interface Params {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: curso } = await supabase.from('cursos').select('titulo').eq('id', id).maybeSingle()
  return { title: curso ? `Editar — ${curso.titulo}` : 'Curso' }
}

export const dynamic = 'force-dynamic'

export default async function EditarCursoPage({ params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  const { data: curso } = await supabase.from('cursos').select('*').eq('id', id).maybeSingle()
  if (!curso) notFound()

  const { data: aulas } = await supabase.from('aulas').select('*').eq('curso_id', id).order('ordem')

  const isDirecao = profile?.role === 'direcao'

  return (
    <div>
      <Link href="/admin/cursos/gerenciar" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Curso</h1>
      <CursoForm curso={curso} isDirecao={isDirecao} />

      <div className="max-w-3xl mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Aulas</h2>
          <Link
            href={`/admin/cursos/gerenciar/${id}/aulas/nova`}
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Aula
          </Link>
        </div>
        <AulaManager cursoId={id} aulas={aulas ?? []} />
      </div>
    </div>
  )
}
