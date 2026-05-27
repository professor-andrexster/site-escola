import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Home, RotateCcw } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Resultado — JBQuiz' }

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ codigo: string; participanteId: string }>
}) {
  const { codigo, participanteId } = await params
  const supabase = await createClient()

  const [{ data: participante }, { data: quiz }] = await Promise.all([
    supabase.from('quiz_participantes').select('*').eq('id', participanteId).single(),
    supabase.from('quizzes').select('*').eq('codigo', codigo).single(),
  ])

  if (!participante || !quiz) notFound()

  const [{ data: respostas }, { count: rankCount }, { data: perguntas }] = await Promise.all([
    supabase
      .from('quiz_respostas')
      .select('*, quiz_perguntas(enunciado, resposta_correta, pontos)')
      .eq('participante_id', participanteId),
    supabase
      .from('quiz_participantes')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quiz.id)
      .eq('concluido', true)
      .gt('pontuacao_total', participante.pontuacao_total),
    supabase
      .from('quiz_perguntas')
      .select('id')
      .eq('quiz_id', quiz.id),
  ])

  const totalPerguntas = perguntas?.length ?? 0
  const acertos = respostas?.filter(r => r.correta).length ?? 0
  const posicao = (rankCount ?? 0) + 1
  const percentual = totalPerguntas > 0 ? Math.round((acertos / totalPerguntas) * 100) : 0

  const emoji = percentual === 100 ? '🏆' : percentual >= 80 ? '⭐' : percentual >= 60 ? '👍' : percentual >= 40 ? '📚' : '💪'

  return (
    <div className="min-h-screen bg-gradient-to-br from-escola-azul to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main result card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Top section */}
          <div className="bg-gradient-to-r from-escola-azul to-blue-700 px-6 py-8 text-center text-white">
            <div className="text-5xl mb-3">{emoji}</div>
            <h1 className="font-playfair text-2xl font-black mb-1">{participante.nome}</h1>
            <p className="text-white/60 text-sm">{participante.turma} · {quiz.titulo}</p>
          </div>

          {/* Score */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="text-center mb-4">
              <div className="text-5xl font-mono font-black text-escola-azul">{participante.pontuacao_total}</div>
              <p className="text-gray-400 text-sm mt-1">pontos totais</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{acertos}</div>
                <div className="text-xs text-green-600/70">acertos</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-700">{totalPerguntas}</div>
                <div className="text-xs text-gray-400">perguntas</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-escola-azul">{percentual}%</div>
                <div className="text-xs text-escola-azul/70">aproveit.</div>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-700">Sua posição</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-escola-azul">#{posicao}</span>
                <span className="text-gray-400 text-sm">no ranking</span>
              </div>
            </div>
          </div>

          {/* Answers review */}
          {respostas && respostas.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Respostas</p>
              <div className="space-y-2">
                {respostas.map((r, i) => (
                  <div key={r.id} className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${r.correta ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${r.correta ? 'bg-green-500' : 'bg-red-400'}`}>
                      {r.correta ? '✓' : '✗'}
                    </span>
                    <span className={`flex-1 line-clamp-1 text-xs ${r.correta ? 'text-green-800' : 'text-red-800'}`}>
                      {i + 1}. {(r.quiz_perguntas as { enunciado: string } | null)?.enunciado ?? '—'}
                    </span>
                    <span className={`font-mono text-xs font-bold ${r.correta ? 'text-green-600' : 'text-gray-400'}`}>
                      +{r.pontos_obtidos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5 flex gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Início
            </Link>
            <Link
              href="/quiz"
              className="flex-1 flex items-center justify-center gap-2 bg-escola-azul text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Novo Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
