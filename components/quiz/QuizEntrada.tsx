'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Gamepad2, ArrowRight } from 'lucide-react'

interface QuizEntradaProps {
  codigoInicial?: string
}

export default function QuizEntrada({ codigoInicial }: QuizEntradaProps) {
  const [codigo, setCodigo] = useState(codigoInicial?.toUpperCase() ?? '')
  const [nome, setNome] = useState('')
  const [turma, setTurma] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleEntrar() {
    if (!codigo.trim() || !nome.trim() || !turma.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, titulo, ativo, encerrado')
      .eq('codigo', codigo.trim().toUpperCase())
      .single()

    if (quizError || !quiz) {
      setError('Quiz não encontrado. Verifique o código.')
      setLoading(false)
      return
    }

    if (quiz.encerrado) {
      setError('Este quiz foi encerrado.')
      setLoading(false)
      return
    }

    if (!quiz.ativo) {
      setError('Este quiz ainda não está ativo. Aguarde o professor iniciar.')
      setLoading(false)
      return
    }

    const { data: participante, error: partError } = await supabase
      .from('quiz_participantes')
      .insert({ quiz_id: quiz.id, nome: nome.trim(), turma: turma.trim() })
      .select()
      .single()

    if (partError || !participante) {
      setError('Erro ao entrar no quiz. Tente novamente.')
      setLoading(false)
      return
    }

    router.push(`/quiz/${codigo.trim().toUpperCase()}/${participante.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-escola-azul to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-playfair text-4xl font-black text-white">JBQuiz</h1>
          <p className="text-white/60 mt-2">Quiz interativo da E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Código do Quiz</label>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              placeholder="Ex: AB3K9Z"
              maxLength={6}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-[0.3em] text-escola-azul focus:outline-none focus:border-escola-azul uppercase transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seu Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              placeholder="Como você quer aparecer no ranking"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Turma</label>
            <input
              type="text"
              value={turma}
              onChange={e => setTurma(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              placeholder="Ex: 1A, 2B, 3C"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>

          <button
            onClick={handleEntrar}
            disabled={loading || !codigo || !nome || !turma}
            className="w-full bg-escola-azul text-white rounded-xl py-3.5 font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : (
              <>
                Entrar no Quiz
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
