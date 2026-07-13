'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Hourglass, CheckCircle2 } from 'lucide-react'
import type { QuizPergunta } from '@/types/database'

const CORES = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', dark: true },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
]

type RespostaStatus = 'answered' | 'timeout' | 'already' | null

interface QuizPlayerProps {
  perguntas: QuizPergunta[]
  participanteId: string
  quizTitulo: string
  quizCodigo: string
  tempoPorPergunta: number
  jaRespondidas: Set<string>
  quizIniciadoEm: string | null
  perguntaAtual: number
  perguntaLiberadaEm: string | null
  respostaRevelada: boolean
  encerrado: boolean
}

// Modo comandado pelo professor (estilo Kahoot): a pergunta só troca quando
// o professor avança, e o certo/errado só aparece quando ele revela, ao
// mesmo tempo para a sala inteira.
export default function QuizPlayer({
  perguntas,
  participanteId,
  quizTitulo,
  quizCodigo,
  tempoPorPergunta,
  jaRespondidas,
  quizIniciadoEm,
  perguntaAtual,
  perguntaLiberadaEm,
  respostaRevelada,
  encerrado,
}: QuizPlayerProps) {
  const router = useRouter()
  const supabase = createClient()

  const currentIndex = Math.min(perguntaAtual, perguntas.length - 1)
  const pergunta = perguntas[currentIndex]

  const liberadaMs = perguntaLiberadaEm
    ? new Date(perguntaLiberadaEm).getTime()
    : quizIniciadoEm
      ? new Date(quizIniciadoEm).getTime()
      : Date.now()

  function computeTimeLeft() {
    const elapsed = Math.max(0, Date.now() - liberadaMs)
    return Math.max(0, tempoPorPergunta - Math.floor(elapsed / 1000))
  }

  const [timeLeft, setTimeLeft] = useState(computeTimeLeft)
  const [answered, setAnswered] = useState(() => (pergunta ? jaRespondidas.has(pergunta.id) : false))
  const [status, setStatus] = useState<RespostaStatus>(() =>
    pergunta && jaRespondidas.has(pergunta.id) ? 'already' : null
  )
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [ultimaCorreta, setUltimaCorreta] = useState(false)
  const [runningScore, setRunningScore] = useState(0)
  const [finishing, setFinishing] = useState(false)

  const answeredRef = useRef(answered)
  const finishedRef = useRef(false)
  const lastIndexRef = useRef(currentIndex)
  const pontosAplicadosRef = useRef(false)

  useEffect(() => {
    answeredRef.current = answered
  }, [answered])

  // Professor avançou para outra pergunta: zera o estado local
  useEffect(() => {
    if (currentIndex !== lastIndexRef.current) {
      lastIndexRef.current = currentIndex
      const p = perguntas[currentIndex]
      const already = p ? jaRespondidas.has(p.id) : false
      setAnswered(already)
      answeredRef.current = already
      setStatus(already ? 'already' : null)
      setSelectedAnswer(null)
      setUltimaCorreta(false)
      pontosAplicadosRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Relógio da pergunta: só trava as respostas quando zera, não avança nada
  useEffect(() => {
    function tick() {
      const tl = computeTimeLeft()
      setTimeLeft(tl)
      if (tl <= 0 && !answeredRef.current) {
        handleAnswer(null)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaLiberadaEm, currentIndex])

  // Professor revelou: aplica os pontos desta pergunta no placar local (uma vez)
  useEffect(() => {
    if (respostaRevelada && ultimaCorreta && !pontosAplicadosRef.current && pergunta) {
      pontosAplicadosRef.current = true
      setRunningScore(prev => prev + pergunta.pontos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respostaRevelada])

  // Professor encerrou: fecha para todo mundo
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
    setStatus(resposta === null ? 'timeout' : 'answered')

    const correta = resposta !== null && resposta === pergunta.resposta_correta
    setUltimaCorreta(correta)

    const tempoResposta = Math.max(0, tempoPorPergunta - computeTimeLeft())

    await supabase.from('quiz_respostas').upsert(
      {
        participante_id: participanteId,
        pergunta_id: pergunta.id,
        resposta: resposta as 'a' | 'b' | 'c' | 'd' | null,
        correta,
        tempo_resposta: tempoResposta,
        pontos_obtidos: correta ? pergunta.pontos : 0,
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

  const revelada = respostaRevelada
  const timerPercent = (timeLeft / tempoPorPergunta) * 100
  const timerColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-400' : 'bg-green-400'
  const tempoEsgotado = timeLeft <= 0

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
            answered || tempoEsgotado ? 'bg-gray-600' : timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
          }`}>
            {answered ? '✓' : tempoEsgotado ? '0' : timeLeft}
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
        <div className="bg-white rounded-2xl p-5 md:p-7 w-full mb-5 shadow-lg">
          <p className="text-gray-900 text-lg md:text-xl font-bold text-center leading-snug">
            {pergunta.enunciado}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {alternativasTexto.map(({ key, text }, i) => {
            const cor = CORES[i]
            const isSelected = selectedAnswer === key
            const isCorrect = key === pergunta.resposta_correta
            const bloqueado = answered || tempoEsgotado

            let bgClass: string
            if (!bloqueado) {
              bgClass = `${cor.bg} ${cor.hover} cursor-pointer active:scale-95`
            } else if (revelada && isCorrect) {
              bgClass = 'bg-green-500 ring-4 ring-green-300'
            } else if (revelada && isSelected && !isCorrect) {
              bgClass = 'bg-red-600 ring-4 ring-red-300'
            } else if (!revelada && isSelected) {
              bgClass = `${cor.bg} ring-4 ring-white/60`
            } else {
              bgClass = 'bg-gray-600 opacity-60'
            }

            return (
              <button
                key={key}
                onClick={() => !bloqueado && handleAnswer(key)}
                disabled={bloqueado}
                className={`${bgClass} text-white rounded-xl p-4 text-left font-semibold transition-all flex items-center gap-3 disabled:cursor-default`}
              >
                <span className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 text-sm uppercase font-black ${cor.dark ? 'text-gray-800' : ''}`}>
                  {key.toUpperCase()}
                </span>
                <span className={`text-sm md:text-base flex-1 ${cor.dark && !bloqueado ? 'text-gray-900' : ''}`}>{text}</span>
                {revelada && isCorrect && <span className="ml-auto text-xl">✓</span>}
                {revelada && isSelected && !isCorrect && <span className="ml-auto text-xl">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className="mt-6 text-center w-full">
          {!revelada && answered && status !== 'timeout' && (
            <div className="rounded-xl px-6 py-4 mb-4 bg-blue-500/15 border border-blue-500/30">
              <p className="text-blue-300 font-bold text-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Resposta registrada!
              </p>
              <p className="text-white/50 text-sm mt-1">Aguarde o professor revelar no telão...</p>
            </div>
          )}
          {!revelada && status === 'timeout' && (
            <div className="rounded-xl px-6 py-4 mb-4 bg-yellow-500/20 border border-yellow-500/30">
              <p className="text-yellow-300 font-bold text-lg">Tempo esgotado!</p>
              <p className="text-white/50 text-sm mt-1">Aguarde o professor revelar a resposta...</p>
            </div>
          )}
          {!revelada && status === 'already' && (
            <div className="rounded-xl px-6 py-4 mb-4 bg-white/5 border border-white/10">
              <p className="text-white/60 font-semibold text-sm">Você já respondeu esta pergunta. Aguarde o professor.</p>
            </div>
          )}
          {revelada && status !== 'already' && (
            <div className={`rounded-xl px-6 py-4 mb-4 ${
              status === 'timeout' ? 'bg-yellow-500/20 border border-yellow-500/30' :
              ultimaCorreta ? 'bg-green-500/20 border border-green-500/30' :
              'bg-red-500/20 border border-red-500/30'
            }`}>
              {status === 'timeout' ? (
                <p className="text-yellow-300 font-bold text-lg">Tempo esgotado! A resposta era <span className="uppercase">{pergunta.resposta_correta}</span></p>
              ) : ultimaCorreta ? (
                <p className="text-green-300 font-bold text-lg">Correto! +{pergunta.pontos} pontos</p>
              ) : (
                <p className="text-red-300 font-bold text-lg">
                  Errado! Resposta: <span className="uppercase">{pergunta.resposta_correta}</span>
                </p>
              )}
            </div>
          )}
          {(answered || tempoEsgotado) && (
            <div className="inline-flex items-center gap-2 text-white/50 text-sm">
              {revelada ? (
                <>
                  <Hourglass className="w-4 h-4" />
                  <span>Aguarde o professor passar para a próxima pergunta...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Todo mundo verá a resposta junto, no comando do professor.</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
