import { createClient } from '@/lib/supabase/server'
import PageLayout from '@/components/PageLayout'
import Link from 'next/link'
import { Trophy, Medal, Gamepad2, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ranking JBQuiz — E.E. Dr. João Beraldo',
  description: 'Veja o ranking dos melhores alunos nos quizzes interativos da escola.',
}
export const revalidate = 60

export default async function RankingPublicoPage() {
  const supabase = await createClient()

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, titulo, codigo, ativo, encerrado, created_at')
    .or('ativo.eq.true,encerrado.eq.true')
    .order('created_at', { ascending: false })

  if (!quizzes || quizzes.length === 0) {
    return (
      <PageLayout>
        <div className="bg-escola-azul text-white py-12 border-b-2 border-escola-vermelho">
          <div className="container mx-auto px-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-2">
              E.E. Dr. João Beraldo
            </p>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="font-playfair text-4xl md:text-5xl font-black">JBQuiz · Ranking</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center">
          <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-serif text-escola-cinza text-lg">Nenhum quiz disponível ainda.</p>
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors mt-4 inline-block">
            ← Voltar ao início
          </Link>
        </div>
      </PageLayout>
    )
  }

  // Para cada quiz, busca os top 10 participantes
  const quizzesComRanking = await Promise.all(
    quizzes.map(async (quiz) => {
      const { data: participantes } = await supabase
        .from('quiz_participantes')
        .select('id, nome, turma, pontuacao_total, created_at')
        .eq('quiz_id', quiz.id)
        .eq('concluido', true)
        .order('pontuacao_total', { ascending: false })
        .limit(10)
      return { ...quiz, participantes: participantes ?? [] }
    })
  )

  const medalColors = [
    { icon: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', num: 'text-yellow-600' },
    { icon: 'text-gray-400',   bg: 'bg-gray-50',   border: 'border-gray-200',   num: 'text-gray-500' },
    { icon: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  num: 'text-amber-600' },
  ]

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-escola-azul text-white py-12 border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho mb-2">
            E.E. Dr. João Beraldo · Carlos Chagas, MG
          </p>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="font-playfair text-4xl md:text-5xl font-black">JBQuiz · Ranking</h1>
          </div>
          <p className="text-white/60 font-serif">Os melhores alunos de cada quiz da escola</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-14">
        {quizzesComRanking.map((quiz) => (
          <div key={quiz.id}>
            {/* Quiz header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${
                    quiz.ativo
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {quiz.ativo ? '● Ao vivo' : 'Encerrado'}
                  </div>
                  <span className="font-mono text-xs text-escola-cinza tracking-wider">código: <strong className="text-escola-azul">{quiz.codigo}</strong></span>
                </div>
                <h2 className="font-playfair text-escola-azul font-black text-2xl md:text-3xl">{quiz.titulo}</h2>
              </div>
              {quiz.ativo && (
                <Link
                  href={`/quiz?codigo=${quiz.codigo}`}
                  className="flex-shrink-0 bg-escola-azul text-white font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Participar agora
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {quiz.participantes.length === 0 ? (
              <div className="border border-escola-cinza-claro bg-escola-creme rounded-none p-10 text-center">
                <Gamepad2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="font-serif text-escola-cinza">
                  {quiz.ativo ? 'Nenhum aluno completou ainda. Seja o primeiro!' : 'Nenhum participante neste quiz.'}
                </p>
              </div>
            ) : (
              <div className="border border-escola-cinza-claro overflow-hidden">
                {/* Top 3 — destaque */}
                {quiz.participantes.slice(0, 3).map((p, i) => {
                  const cor = medalColors[i]
                  return (
                    <div key={p.id} className={`${cor.bg} border-b ${cor.border} flex items-center gap-4 px-5 py-4`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white border ${cor.border}`}>
                        <Medal className={`w-5 h-5 ${cor.icon}`} />
                      </div>
                      <div className={`font-mono text-xs font-bold ${cor.num} w-6 text-center flex-shrink-0`}>{i + 1}º</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-playfair font-bold text-escola-preto text-base leading-tight truncate">{p.nome}</p>
                        <p className="font-mono text-escola-cinza text-xs">{p.turma}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-black text-xl text-escola-azul">{p.pontuacao_total}</div>
                        <div className="font-mono text-escola-cinza text-[10px]">pontos</div>
                      </div>
                    </div>
                  )
                })}

                {/* 4º em diante */}
                {quiz.participantes.slice(3).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-escola-cinza-claro last:border-0 hover:bg-escola-creme transition-colors">
                    <span className="font-mono text-escola-cinza text-sm w-6 text-center flex-shrink-0">{i + 4}</span>
                    <div className="w-9 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-serif text-escola-preto text-sm">{p.nome}</span>
                      <span className="font-mono text-escola-cinza text-xs ml-2">{p.turma}</span>
                    </div>
                    <span className="font-mono text-escola-azul font-semibold text-sm">{p.pontuacao_total} <span className="text-escola-cinza font-normal text-xs">pts</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
