import QuizEditor from '@/components/admin/QuizEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Quiz — Admin' }

export default function NovoQuizPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Quiz</h1>
      <QuizEditor />
    </div>
  )
}
