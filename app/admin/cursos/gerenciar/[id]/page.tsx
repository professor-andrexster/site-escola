import { buscarPorId, cursoParaGestao } from '@/lib/db/cursos'
import { getProfileOrRedirect } from '@/lib/profile'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import CursoForm from '@/components/admin/CursoForm'
import AulaManager from '@/components/admin/AulaManager'
import CursoProvaEditor from '@/components/admin/CursoProvaEditor'
import { isGestao } from '@/lib/roles'
import type { Metadata } from 'next'

interface Params {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const curso = await buscarPorId(id)
  return { title: curso ? `Editar — ${curso.titulo}` : 'Curso' }
}

export const dynamic = 'force-dynamic'

export default async function EditarCursoPage({ params }: Params) {
  const { id } = await params
  const { profile } = await getProfileOrRedirect()

  const ficha = await cursoParaGestao(id)
  if (!ficha) notFound()
  const { curso, aulas } = ficha

  const isDirecao = isGestao(profile.role)

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
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Aula
          </Link>
        </div>
        <AulaManager cursoId={id} aulas={aulas} />
      </div>

      <div className="max-w-3xl mt-10">
        <CursoProvaEditor cursoId={id} />
      </div>

      <div className="max-w-3xl mt-10">
        <div className="flex items-center justify-between gap-3 panel p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Desafio final</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Corrigir os envios, emitir certificados e convidar quem mais pode corrigir.
            </p>
          </div>
          <Link
            href={`/admin/cursos/gerenciar/${id}/desafio-final`}
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors flex-shrink-0"
          >
            Abrir correção
          </Link>
        </div>
      </div>
    </div>
  )
}
