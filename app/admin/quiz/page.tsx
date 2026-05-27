import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import QuizListTable from '@/components/admin/QuizListTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'JBQuiz — Admin' }
export const dynamic = 'force-dynamic'

export default async function QuizAdminPage() {
  const supabase = await createClient()
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, quiz_perguntas(id), quiz_participantes(id)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JBQuiz</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie quizzes para os alunos</p>
        </div>
        <Link
          href="/admin/quiz/novo"
          className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Quiz
        </Link>
      </div>

      <QuizListTable quizzes={quizzes ?? []} />
    </div>
  )
}
