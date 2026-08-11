import { buscarPorId as buscarQuiz, perguntasDoQuiz, contarParticipantes } from '@/lib/db/quiz'
import { notFound, redirect } from 'next/navigation'
import QuizControle from '@/components/admin/QuizControle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Controle do Quiz — Admin' }

export default async function QuizControlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [quiz, perguntas, totalParticipantes] = await Promise.all([
    buscarQuiz(id),
    perguntasDoQuiz(id),
    contarParticipantes(id),
  ])

  if (!quiz) notFound()
  if (quiz.encerrado) redirect(`/admin/quiz/${id}/ranking`)
  if (!quiz.ativo) redirect('/admin/quiz')

  return (
    <QuizControle
      quiz={quiz}
      perguntas={perguntas}
      totalParticipantes={totalParticipantes}
    />
  )
}
