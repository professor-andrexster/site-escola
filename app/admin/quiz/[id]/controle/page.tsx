import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import QuizControle from '@/components/admin/QuizControle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Controle do Quiz — Admin' }

export default async function QuizControlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: quiz }, { data: perguntas }, { count: participantes }] = await Promise.all([
    supabase.from('quizzes').select('*').eq('id', id).single(),
    supabase.from('quiz_perguntas').select('*').eq('quiz_id', id).order('ordem'),
    supabase.from('quiz_participantes').select('id', { count: 'exact', head: true }).eq('quiz_id', id),
  ])

  if (!quiz) notFound()
  if (quiz.encerrado) redirect(`/admin/quiz/${id}/ranking`)
  if (!quiz.ativo) redirect('/admin/quiz')

  return (
    <QuizControle
      quiz={quiz}
      perguntas={perguntas ?? []}
      totalParticipantes={participantes ?? 0}
    />
  )
}
