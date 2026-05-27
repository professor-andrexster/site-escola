'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { QuizPergunta } from '@/types/database'

const ALTERNATIVAS = ['a', 'b', 'c', 'd'] as const

const CORES = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', revealed: 'bg-red-700' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', revealed: 'bg-blue-700' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', revealed: 'bg-yellow-600', dark: true },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', revealed: 'bg-green-700' },
]

interface QuizPlayerProps {
  perguntas: QuizPergunta[]
  participanteId: string
  quizTitulo: string
  quizCodigo: string
  tempoPorPergunta: number
  jaRespondidas: Set<string>
}

export default function QuizPlayer({
  perguntas,
  participanteId,
  quizTitulo,
  quizCodigo,
  tempoPorPergunta,
  jaRespondidas,
}: QuizPlayerProps) {
  const router = useRouter()
  const supabase = createClient()

  const primeiraIndex = perguntas.findIndex(p => !jaRespondidas.has(p.id))
  const [currentIndex, setCurrentIndex] = useState(primeiraIndex === -1 ? 0 : primeiraIndex)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(tempoPorPergunta)
  const [runningScore, setRunningScore] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const pergunta = perguntas[currentIndex]

  useEffect(() => {
    if (primeiraIndex === -1) {
      finishQuiz()
    }
  }, [])

  useEffect(() => {
    if (!pergunta || answered || primeiraIndex === -1) return
    setTimeLeft(tempoPorPergunta)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAnswer(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex])

  async function handleAnswer(resposta: string | null) {
    if (answered) return
    if (timerRef.current) clearInterval(timerRef.current)
    setAnswered(true)
    setSelectedAnswer(resposta)

    const tempoResposta = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correta = resposta !== null && resposta === pergunta.resposta_correta
    const pontosObtidos = correta ? pergunta.pontos : 0

    if (correta) setRunningScore(prev => prev + pontosObtidos)

    await supabase.from('quiz_respostas').upsert(
      {
        participante_id: participanteId,
        pergunta_id: pergunta.id,
        resposta: resposta as 'a' | 'b' | 'c' | 'd' | null,
        correta,
        tempo_resposta: tempoResposta,
        pontos_obtidos: pontosObtidos,
      },
      { onConflict: 'participante_id,pergunta_id' }
    )
  }

  async function nextQuestion() {
    if (currentIndex >= perguntas.length - 1) {
      await finishQuiz()
    } else {
      setCurrentIndex(prev => prev + 1)
      setAnswered(false)
      setSelectedAnswer(null)
    }
  }

  async function finishQuiz() {
    setFinishing(true)
    const { data } = await supabase
      .from('quiz_respostas')
      .select('pontos_obtidos')
      .eq('participante_id', participanteId)

    const total = data?.reduce((sum, r) => sum + r.pontos_obtidos, 0) ?? 0

    await supabase
      .from('quiz_participantes')
      .update({ concluido: true, pontuacao_total: total })
      .eq('id', participanteId)

    router.push(`/quiz/${quizCodigo}/${participanteId}/resultado`)
  }

  if (finishing || primeiraIndex === -1) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Calculando resultado...</p>
        </div>
      </div>
    )
  }

  if (!pergunta) return null

  const timerPercent = (timeLeft / tempoPorPergunta) * 100
  const timerColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-400' : 'bg-green-400'

  const alternativasTexto = [
    { key: 'a', text: pergunta.alternativa_a },
    { key: 'b', text: pergunta.alternativa_b },
    { key: 'c', text: pergunta.alternativa_c },
    { key: 'd', text: pergunta.alternativa_d },
  ]

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs">{quizTitulo}</p>
          <p className="text-white text-sm font-semibold">
            Pergunta {currentIndex + 1} <span className="text-white/40">de {perguntas.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white/40 text-xs">Pontos</p>
            <p className="text-white font-mono font-bold">{runningScore}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg transition-colors ${
            answered ? 'bg-gray-600' : timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
          }`}>
            {answered ? '✓' : timeLeft}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-gray-700">
        <div
          className={`h-full transition-all duration-1000 linear ${timerColor}`}
          style={{ width: answered ? '0%' : `${timerPercent}%` }}
        />
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 justify-center py-2 px-4">
        {perguntas.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i < currentIndex ? 'bg-green-400' :
              i === currentIndex ? 'bg-white w-4' : 'bg-gray-600'
            } ${i === currentIndex ? 'w-4' : 'w-1'}`}
          />
        ))}
      </div>

      {/* Question + answers */}
      <div className="flex-1 flex flex-col items-center p-4 max-w-2xl mx-auto w-full">
        {/* Question box */}
        <div className="bg-white rounded-2xl p-5 md:p-7 w-full mb-5 shadow-lg">
          <p className="text-gray-900 text-lg md:text-xl font-bold text-center leading-snug">
            {pergunta.enunciado}
          </p>
        </div>

        {/* Answer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {alternativasTexto.map(({ key, text }, i) => {
            const cor = CORES[i]
            const isSelected = selectedAnswer === key
            const isCorrect = key === pergunta.resposta_correta
            const isWrong = answered && isSelected && !isCorrect

            let bgClass: string
            if (!answered) {
              bgClass = `${cor.bg} ${cor.hover} cursor-pointer active:scale-95`
            } else if (isCorrect) {
              bgClass = 'bg-green-500 ring-4 ring-green-300'
            } else if (isWrong) {
              bgClass = 'bg-red-600 ring-4 ring-red-300'
            } else {
              bgClass = 'bg-gray-600 opacity-60'
            }

            return (
              <button
                key={key}
                onClick={() => !answered && handleAnswer(key)}
                disabled={answered}
                className={`${bgClass} text-white rounded-xl p-4 text-left font-semibold transition-all flex items-center gap-3 disabled:cursor-default`}
              >
                <span className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 text-sm uppercase font-black ${cor.dark ? 'text-gray-800' : ''}`}>
                  {key.toUpperCase()}
                </span>
                <span className={`text-sm md:text-base flex-1 ${cor.dark && !answered ? 'text-gray-900' : ''}`}>{text}</span>
                {answered && isCorrect && <span className="ml-auto text-xl">✓</span>}
                {isWrong && <span className="ml-auto text-xl">✗</span>}
              </button>
            )
          })}
        </div>

        {/* After answer feedback */}
        {answered && (
          <div className="mt-6 text-center w-full">
            <div className={`rounded-xl px-6 py-4 mb-4 ${
              selectedAnswer === null ? 'bg-yellow-500/20 border border-yellow-500/30' :
              selectedAnswer === pergunta.resposta_correta ? 'bg-green-500/20 border border-green-500/30' :
              'bg-red-500/20 border border-red-500/30'
            }`}>
              {selectedAnswer === null ? (
                <p className="text-yellow-300 font-bold text-lg">Tempo esgotado!</p>
              ) : selectedAnswer === pergunta.resposta_correta ? (
                <p className="text-green-300 font-bold text-lg">Correto! +{pergunta.pontos} pontos</p>
              ) : (
                <p className="text-red-300 font-bold text-lg">
                  Errado! Resposta: <span className="uppercase">{pergunta.resposta_correta}</span>
                </p>
              )}
            </div>
            <button
              onClick={nextQuestion}
              className="bg-white text-escola-azul px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors text-base"
            >
              {currentIndex >= perguntas.length - 1 ? 'Ver Resultado →' : 'Próxima →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
