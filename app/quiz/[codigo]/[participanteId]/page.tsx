import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QuizRoom from '@/components/quiz/QuizRoom'
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

  // Quiz encerrado sem o aluno ter concluído
  if (quiz.encerrado) {
    redirect(`/quiz?codigo=${codigo}`)
  }

  // Sala não aberta ainda
  if (!quiz.lobby_aberto && !quiz.ativo) {
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
          <p className="text-gray-400">O professor ainda não adicionou perguntas.</p>
        </div>
      </div>
    )
  }

  const jaRespondidas = new Set((respostas ?? []).map(r => r.pergunta_id))

  return (
    <QuizRoom
      quiz={{
        id: quiz.id,
        codigo: quiz.codigo,
        titulo: quiz.titulo,
        turma_alvo: quiz.turma_alvo,
        lobby_aberto: quiz.lobby_aberto,
        ativo: quiz.ativo,
        encerrado: quiz.encerrado,
        tempo_por_pergunta: quiz.tempo_por_pergunta,
        quiz_iniciado_em: quiz.quiz_iniciado_em,
        pergunta_atual: quiz.pergunta_atual ?? 0,
        pergunta_liberada_em: quiz.pergunta_liberada_em,
        resposta_revelada: quiz.resposta_revelada ?? false,
      }}
      participante={participante}
      perguntas={perguntas}
      jaRespondidas={jaRespondidas}
    />
  )
}
