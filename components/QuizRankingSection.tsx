import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Medal, Gamepad2, ArrowRight } from 'lucide-react'

export default async function QuizRankingSection() {
  const supabase = await createClient()

  // Pega o quiz mais recente que está ativo ou encerrado
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, titulo, codigo, ativo, encerrado')
    .or('ativo.eq.true,encerrado.eq.true')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!quiz) return null

  const { data: participantes } = await supabase
    .from('quiz_participantes')
    .select('id, nome, turma, pontuacao_total')
    .eq('quiz_id', quiz.id)
    .eq('concluido', true)
    .order('pontuacao_total', { ascending: false })
    .limit(10)

  if (!participantes || participantes.length === 0) {
    // Mostra convite para participar se o quiz está ativo mas sem participantes ainda
    if (!quiz.ativo) return null
    return (
      <section className="bg-escola-azul py-14 border-t-2 border-escola-vermelho">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-escola-vermelho/20 border border-escola-vermelho/30 px-4 py-1.5 mb-5">
            <Gamepad2 className="w-3.5 h-3.5 text-escola-vermelho" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho">JBQuiz ao vivo</span>
          </div>
          <h2 className="font-playfair text-white font-black text-3xl md:text-4xl mb-3">{quiz.titulo}</h2>
          <p className="font-serif text-white/60 mb-8">Seja o primeiro a completar este quiz!</p>
          <Link
            href={`/quiz?codigo=${quiz.codigo}`}
            className="inline-flex items-center gap-2 bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-red-700 transition-colors"
          >
            <Gamepad2 className="w-4 h-4" />
            Participar agora — código: {quiz.codigo}
          </Link>
        </div>
      </section>
    )
  }

  const top3 = participantes.slice(0, 3)
  const resto = participantes.slice(3)
  const medalColors = [
    { ring: 'ring-yellow-400', num: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { ring: 'ring-gray-300',   num: 'text-gray-300',   bg: 'bg-gray-300/10' },
    { ring: 'ring-amber-600',  num: 'text-amber-500',  bg: 'bg-amber-600/10' },
  ]

  return (
    <section className="bg-escola-azul py-14 border-t-2 border-escola-vermelho">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-escola-vermelho/20 border border-escola-vermelho/30 px-3 py-1 inline-flex items-center gap-1.5">
                <Gamepad2 className="w-3 h-3 text-escola-vermelho" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-escola-vermelho">
                  JBQuiz · {quiz.ativo ? 'ao vivo' : 'encerrado'}
                </span>
              </div>
              {quiz.ativo && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-400 flex-shrink-0" />
              <h2 className="font-playfair text-white font-black text-3xl md:text-4xl leading-tight">
                Ranking — {quiz.titulo}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {quiz.ativo && (
              <Link
                href={`/quiz?codigo=${quiz.codigo}`}
                className="bg-escola-vermelho text-white font-mono text-xs uppercase tracking-widest px-5 py-3 hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Participar · {quiz.codigo}
              </Link>
            )}
            <Link
              href="/ranking"
              className="border border-white/20 text-white/70 font-mono text-xs uppercase tracking-widest px-5 py-3 hover:border-white hover:text-white transition-colors inline-flex items-center gap-2"
            >
              Ver tudo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pódio — top 3 */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {top3.map((p, i) => {
              const cor = medalColors[i]
              return (
                <div
                  key={p.id}
                  className={`${cor.bg} border ${i === 0 ? 'border-yellow-400/40' : i === 1 ? 'border-gray-300/30' : 'border-amber-600/30'} rounded-none p-5 flex items-center gap-4 ${i === 0 ? 'sm:order-2' : i === 1 ? 'sm:order-1' : 'sm:order-3'}`}
                >
                  <div className={`w-12 h-12 rounded-full ring-2 ${cor.ring} flex items-center justify-center flex-shrink-0 bg-white/5`}>
                    {i === 0 ? (
                      <Medal className="w-6 h-6 text-yellow-400" />
                    ) : i === 1 ? (
                      <Medal className="w-6 h-6 text-gray-300" />
                    ) : (
                      <Medal className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-mono text-[10px] uppercase tracking-widest ${cor.num} mb-0.5`}>
                      {i + 1}º lugar
                    </div>
                    <p className="font-playfair font-bold text-white text-lg leading-tight truncate">{p.nome}</p>
                    <p className="font-mono text-white/40 text-xs">{p.turma}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-mono font-black text-2xl ${cor.num}`}>{p.pontuacao_total}</div>
                    <div className="font-mono text-white/30 text-[10px]">pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Posições 4–10 */}
        {resto.length > 0 && (
          <div className="border border-white/10 divide-y divide-white/5">
            {resto.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="font-mono text-white/30 text-sm w-6 text-center flex-shrink-0">{i + 4}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-serif text-white text-sm font-medium">{p.nome}</span>
                  <span className="font-mono text-white/30 text-xs ml-2">{p.turma}</span>
                </div>
                <span className="font-mono font-bold text-white/80 text-sm">{p.pontuacao_total} <span className="text-white/30 font-normal text-xs">pts</span></span>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif text-white/40 text-sm">
            {participantes.length} aluno{participantes.length !== 1 ? 's' : ''} concluíram este quiz
          </p>
          <Link href="/ranking" className="font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors inline-flex items-center gap-1">
            Ranking completo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
