import QuizEntrada from '@/components/quiz/QuizEntrada'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JBQuiz — E.E. Dr. João Beraldo',
  description: 'Participe do quiz interativo da escola!',
}

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>
}) {
  const params = await searchParams
  return <QuizEntrada codigoInicial={params.codigo} />
}
