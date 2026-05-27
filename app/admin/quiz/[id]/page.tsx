import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import QuizEditor from '@/components/admin/QuizEditor'
import QuizPerguntasEditor from '@/components/admin/QuizPerguntasEditor'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('quizzes').select('titulo').eq('id', id).single()
  return { title: data ? `${data.titulo} — Admin` : 'Quiz — Admin' }
}

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: quiz }, { data: perguntas }] = await Promise.all([
    supabase.from('quizzes').select('*').eq('id', id).single(),
    supabase.from('quiz_perguntas').select('*').eq('quiz_id', id).order('ordem'),
  ])

  if (!quiz) notFound()

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.titulo}</h1>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">Código:</span>
            <span className="text-sm font-bold tracking-widest text-escola-azul font-mono">{quiz.codigo}</span>
          </div>
          <Link
            href={`/admin/quiz/${id}/ranking`}
            className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Configurações do Quiz</h2>
        <QuizEditor quiz={quiz} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Perguntas</h2>
        <QuizPerguntasEditor quizId={id} perguntas={perguntas ?? []} />
      </div>
    </div>
  )
}
