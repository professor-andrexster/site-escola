import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Award } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { buscarPorId } from '@/lib/db/cursos'
import { autorDoCurso, desafioFinalDoCurso, podeAvaliarCurso } from '@/lib/db/desafio-curso'
import { isGestao } from '@/lib/roles'
import FilaDesafioFinal from '@/components/admin/FilaDesafioFinal'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Desafio final — correção' }
export const dynamic = 'force-dynamic'

export default async function DesafioFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, profile } = await getProfileOrRedirect()

  const curso = await buscarPorId(id)
  if (!curso) notFound()

  // Quem nao avalia este curso nao ve a fila: sao trabalhos de alunos, com
  // nome e turma.
  if (!(await podeAvaliarCurso(id, user.id, profile.role))) redirect('/admin/cursos/gerenciar')

  const desafio = await desafioFinalDoCurso(id)
  const ehAutor = isGestao(profile.role) || (await autorDoCurso(id)) === user.id

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/cursos/gerenciar/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-escola-azul mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao curso
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <Award className="w-6 h-6 text-escola-azul" />
        Desafio final — {curso.titulo}
      </h1>

      {desafio ? (
        <p className="text-sm text-gray-500 mb-6">
          Aprovar o envio emite o certificado de {curso.carga_horaria ?? '—'} horas em nome do aluno.
        </p>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm my-6">
          Este curso ainda não tem desafio final. Sem ele, o certificado continua saindo pela
          prova de múltipla escolha — ou não sai, se o curso também não tiver prova.
        </div>
      )}

      <FilaDesafioFinal cursoSlug={curso.slug} cursoId={id} podeGerenciarAvaliadores={ehAutor} />
    </div>
  )
}
