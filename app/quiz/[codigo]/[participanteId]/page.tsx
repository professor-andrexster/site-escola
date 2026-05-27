import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QuizPlayer from '@/components/quiz/QuizPlayer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('quizzes').select('titulo').eq('codigo', codigo).single()
  return { title: data?.titulo ?? 'JBQuiz' }
}

export default async function QuizJogarPage({
  params,
}: {
  params: Promise<{ codigo: string; participanteId: string }>
}) {
  const { codigo, participanteId } = await params
  const supabase = await createClient()

  const [{ data: quiz }, { data: participante }] = await Promise.all([
    supabase.from('quizzes').select('*').eq('codigo', codigo).single(),
    supabase.from('quiz_participantes').select('*').eq('id', participanteId).single(),
  ])

  if (!quiz || !participante) notFound()

  if (participante.concluido) {
    redirect(`/quiz/${codigo}/${participanteId}/resultado`)
  }

  if (!quiz.ativo && !quiz.encerrado) {
    redirect(`/quiz?codigo=${codigo}`)
  }

  const [{ data: perguntas }, { data: respostas }] = await Promise.all([
    supabase.from('quiz_perguntas').select('*').eq('quiz_id', quiz.id).order('ordem'),
    supabase.from('quiz_respostas').select('pergunta_id').eq('participante_id', participanteId),
  ])

  if (!perguntas || perguntas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl font-bold mb-2">Quiz sem perguntas</p>
          <p className="text-gray-400">O professor ainda não adicionou perguntas a este quiz.</p>
        </div>
      </div>
    )
  }

  const jaRespondidas = new Set((respostas ?? []).map(r => r.pergunta_id))

  return (
    <QuizPlayer
      perguntas={perguntas}
      participanteId={participanteId}
      quizTitulo={quiz.titulo}
      quizCodigo={codigo}
      tempoPorPergunta={quiz.tempo_por_pergunta}
      jaRespondidas={jaRespondidas}
    />
  )
}
