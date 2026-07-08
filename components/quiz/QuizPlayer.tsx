'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock } from 'lucide-react'
import type { QuizPergunta } from '@/types/database'

const CORES = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', revealed: 'bg-red-700' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', revealed: 'bg-blue-700' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', revealed: 'bg-yellow-600', dark: true },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', revealed: 'bg-green-700' },
]

type RespostaStatus = 'correct' | 'wrong' | 'timeout' | 'already' | null

interface QuizPlayerProps {
  perguntas: QuizPergunta[]
  participanteId: string
  quizTitulo: string
  quizCodigo: string
  tempoPorPergunta: number
  jaRespondidas: Set<string>
  quizIniciadoEm: string | null
  encerrado: boolean
}

export default function QuizPlayer({
  perguntas,
  participanteId,
  quizTitulo,
  quizCodigo,
  tempoPorPergunta,
  jaRespondidas,
  quizIniciadoEm,
  encerrado,
}: QuizPlayerProps) {
  const router = useRouter()
  const supabase = createClient()

  const tempoMs = tempoPorPergunta * 1000
  const startMsRef = useRef<number>(quizIniciadoEm ? new Date(quizIniciadoEm).getTime() : Date.now())

  function computeIndex(nowMs: number) {
    const elapsed = Math.max(0, nowMs - startMsRef.current)
    return Math.floor(elapsed / tempoMs)
  }

  function computeTimeLeft(nowMs: number) {
    const elapsed = Math.max(0, nowMs - startMsRef.current)
    const rem = elapsed % tempoMs
    return Math.max(0, tempoPorPergunta - Math.floor(rem / 1000))
  }

  const [currentIndex, setCurrentIndex] = useState(() => computeIndex(Date.now()))
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(Date.now()))
  const [answered, setAnswered] = useState(() => {
    const p = perguntas[computeIndex(Date.now())]
    return p ? jaRespondidas.has(p.id) : false
  })
  const [status, setStatus] = useState<RespostaStatus>(() => {
    const p = perguntas[computeIndex(Date.now())]
    return p && jaRespondidas.has(p.id) ? 'already' : null
  })
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [runningScore, setRunningScore] = useState(0)
  const [finishing, setFinishing] = useState(false)

  const answeredRef = useRef(answered)
  const lastIndexRef = useRef(currentIndex)
  const finishedRef = useRef(false)

  const pergunta = perguntas[currentIndex]

  useEffect(() => {
    answeredRef.current = answered
  }, [answered])

  // Loop de sincronização: calcula a pergunta e o tempo restante a partir
  // do horário compartilhado em que o quiz foi iniciado, fazendo todos os
  // participantes avançarem juntos sem nenhuma ação manual.
  useEffect(() => {
    function tick() {
      const nowMs = Date.now()
      const idx = computeIndex(nowMs)
      const tl = computeTimeLeft(nowMs)
      setTimeLeft(tl)

      if (idx >= perguntas.length) {
        if (!finishedRef.current) {
          finishedRef.current = true
          finishQuiz()
        }
        return
      }

      if (idx !== lastIndexRef.current) {
        lastIndexRef.current = idx
        setCurrentIndex(idx)
        const p = perguntas[idx]
        const already = p ? jaRespondidas.has(p.id) : false
        setAnswered(already)
        setStatus(already ? 'already' : null)
        setSelectedAnswer(null)
        return
      }

      if (tl <= 0 && !answeredRef.current) {
        handleAnswer(null)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Quiz encerrado manualmente pelo professor — finaliza para todos.
  useEffect(() => {
    if (encerrado && !finishedRef.current) {
      finishedRef.current = true
      finishQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encerrado])

  async function handleAnswer(resposta: string | null) {
    if (answeredRef.current || !pergunta) return
    answeredRef.current = true
    setAnswered(true)
    setSelectedAnswer(resposta)

    const correta = resposta !== null && resposta === pergunta.resposta_correta
    const pontosObtidos = correta ? pergunta.pontos : 0
    setStatus(resposta === null ? 'timeout' : correta ? 'correct' : 'wrong')

    if (correta) setRunningScore(prev => prev + pontosObtidos)

    const tempoResposta = Math.max(0, tempoPorPergunta - timeLeft)

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

  if (finishing || !pergunta) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-lg">Calculando resultado...</p>
        </div>
      </div>
    )
  }

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
          style={{ width: `${timerPercent}%` }}
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
            {status !== 'already' && (
              <div className={`rounded-xl px-6 py-4 mb-4 ${
                status === 'timeout' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                status === 'correct' ? 'bg-green-500/20 border border-green-500/30' :
                'bg-red-500/20 border border-red-500/30'
              }`}>
                {status === 'timeout' ? (
                  <p className="text-yellow-300 font-bold text-lg">Tempo esgotado!</p>
                ) : status === 'correct' ? (
                  <p className="text-green-300 font-bold text-lg">Correto! +{pergunta.pontos} pontos</p>
                ) : (
                  <p className="text-red-300 font-bold text-lg">
                    Errado! Resposta: <span className="uppercase">{pergunta.resposta_correta}</span>
                  </p>
                )}
              </div>
            )}
            {status === 'already' && (
              <div className="rounded-xl px-6 py-4 mb-4 bg-white/5 border border-white/10">
                <p className="text-white/60 font-semibold text-sm">Você já respondeu esta pergunta.</p>
              </div>
            )}
            <div className="inline-flex items-center gap-2 text-white/50 text-sm">
              <Clock className="w-4 h-4" />
              <span>Próxima pergunta em {timeLeft}s — aguarde os colegas...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
