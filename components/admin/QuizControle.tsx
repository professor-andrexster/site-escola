'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, ArrowRight, Square, Users, CheckCircle2 } from 'lucide-react'
import type { Quiz, QuizPergunta } from '@/types/database'

const CORES = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400 text-gray-900', 'bg-green-500']

interface QuizControleProps {
  quiz: Quiz
  perguntas: QuizPergunta[]
  totalParticipantes: number
}

// Telão do professor: ele comanda quando revelar a resposta e quando
// passar para a próxima pergunta. Os alunos seguem via Realtime.
export default function QuizControle({ quiz: initialQuiz, perguntas, totalParticipantes }: QuizControleProps) {
  const [quiz, setQuiz] = useState(initialQuiz)
  const [respostasCount, setRespostasCount] = useState(0)
  const [contagem, setContagem] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const currentIndex = Math.min(quiz.pergunta_atual ?? 0, perguntas.length - 1)
  const pergunta = perguntas[currentIndex]
  const ultima = currentIndex >= perguntas.length - 1

  // Espelha o relógio dos alunos
  useEffect(() => {
    const liberadaMs = quiz.pergunta_liberada_em
      ? new Date(quiz.pergunta_liberada_em).getTime()
      : quiz.quiz_iniciado_em
        ? new Date(quiz.quiz_iniciado_em).getTime()
        : Date.now()
    function tick() {
      const elapsed = Math.max(0, Date.now() - liberadaMs)
      setTimeLeft(Math.max(0, quiz.tempo_por_pergunta - Math.floor(elapsed / 1000)))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [quiz.pergunta_liberada_em, quiz.quiz_iniciado_em, quiz.tempo_por_pergunta])

  // Acompanha o quiz (caso outra aba do professor também controle)
  useEffect(() => {
    const channel = supabase
      .channel(`quiz-controle-${quiz.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${quiz.id}` },
        (payload) => setQuiz(prev => ({ ...prev, ...payload.new }))
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id])

  // Contagem de respostas da pergunta atual, ao vivo
  const perguntaIdRef = useRef(pergunta?.id)
  useEffect(() => {
    perguntaIdRef.current = pergunta?.id
    if (!pergunta) return

    async function carregar() {
      const { data } = await supabase
        .from('quiz_respostas')
        .select('resposta')
        .eq('pergunta_id', pergunta.id)
      if (perguntaIdRef.current !== pergunta.id) return
      setRespostasCount(data?.length ?? 0)
      const cont: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 }
      for (const r of data ?? []) if (r.resposta) cont[r.resposta] = (cont[r.resposta] ?? 0) + 1
      setContagem(cont)
    }

    setRespostasCount(0)
    setContagem({ a: 0, b: 0, c: 0, d: 0 })
    carregar()

    const channel = supabase
      .channel(`respostas-${pergunta.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_respostas', filter: `pergunta_id=eq.${pergunta.id}` },
        (payload) => {
          setRespostasCount(prev => prev + 1)
          const resp = (payload.new as { resposta: string | null }).resposta
          if (resp) setContagem(prev => ({ ...prev, [resp]: (prev[resp] ?? 0) + 1 }))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pergunta?.id])

  async function atualizar(updates: Record<string, unknown>) {
    setLoading(true)
    await supabase.from('quizzes').update(updates).eq('id', quiz.id)
    setQuiz(prev => ({ ...prev, ...updates } as Quiz))
    setLoading(false)
  }

  async function revelar() {
    await atualizar({ resposta_revelada: true })
  }

  async function proxima() {
    await atualizar({
      pergunta_atual: currentIndex + 1,
      pergunta_liberada_em: new Date().toISOString(),
      resposta_revelada: false,
    })
  }

  async function encerrar() {
    if (!confirm('Encerrar o quiz para todos os alunos?')) return
    await atualizar({ ativo: false, lobby_aberto: false, encerrado: true })
    router.push(`/admin/quiz/${quiz.id}/ranking`)
  }

  if (!pergunta) return null

  const revelada = quiz.resposta_revelada
  const alternativas = [
    { key: 'a', text: pergunta.alternativa_a },
    { key: 'b', text: pergunta.alternativa_b },
    { key: 'c', text: pergunta.alternativa_c },
    { key: 'd', text: pergunta.alternativa_d },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra de status */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Comando do professor</p>
          <h1 className="text-xl font-bold text-gray-900">{quiz.titulo}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {respostasCount}/{totalParticipantes} responderam
          </span>
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
            timeLeft <= 5 ? 'bg-red-500' : 'bg-gray-700'
          }`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Pergunta */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <p className="text-xs text-gray-400 font-mono mb-2">
          Pergunta {currentIndex + 1} de {perguntas.length}
        </p>
        <p className="text-gray-900 text-xl md:text-2xl font-bold leading-snug">{pergunta.enunciado}</p>
      </div>

      {/* Alternativas com contagem ao vivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {alternativas.map(({ key, text }, i) => {
          const isCorrect = key === pergunta.resposta_correta
          return (
            <div
              key={key}
              className={`rounded-xl p-4 flex items-center gap-3 text-white font-semibold transition-all ${
                revelada
                  ? isCorrect
                    ? 'bg-green-500 ring-4 ring-green-200'
                    : 'bg-gray-400 opacity-60'
                  : CORES[i]
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 text-sm uppercase font-black">
                {key.toUpperCase()}
              </span>
              <span className="text-sm md:text-base flex-1">{text}</span>
              <span className="ml-auto bg-black/25 rounded-lg px-2.5 py-1 text-sm font-mono font-bold">
                {contagem[key] ?? 0}
              </span>
              {revelada && isCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Comandos */}
      <div className="flex items-center gap-3 flex-wrap">
        {!revelada ? (
          <button
            onClick={revelar}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-escola-azul text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            Revelar Resposta
          </button>
        ) : !ultima ? (
          <button
            onClick={proxima}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Próxima Pergunta
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : null}

        {revelada && ultima && (
          <button
            onClick={encerrar}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Square className="w-4 h-4" />
            Encerrar e Ver Ranking
          </button>
        )}

        {!revelada && (
          <p className="text-xs text-gray-400">
            Os alunos não veem certo ou errado até você revelar. Revele quando o tempo zerar ou quando todos responderem.
          </p>
        )}
        {revelada && !ultima && (
          <button
            onClick={encerrar}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            Encerrar quiz agora
          </button>
        )}
      </div>
    </div>
  )
}
