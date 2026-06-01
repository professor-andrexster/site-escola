'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Gamepad2, ArrowRight, LogIn } from 'lucide-react'

interface QuizEntradaProps {
  codigoInicial?: string
}

export default function QuizEntrada({ codigoInicial }: QuizEntradaProps) {
  const [codigo, setCodigo] = useState(codigoInicial?.toUpperCase() ?? '')
  const [nome, setNome] = useState('')
  const [turma, setTurma] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Verifica se há aluno logado e pré-preenche dados
  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome_completo, turma, role, aprovado')
          .eq('id', user.id)
          .maybeSingle()
        if (profile?.aprovado) {
          setNome(profile.nome_completo)
          setTurma(profile.turma ?? '')
          setUserId(user.id)
        }
      }
      setLoadingSession(false)
    }
    checkSession()
  }, [])

  async function handleEntrar() {
    if (!codigo.trim()) { setError('Informe o código do quiz.'); return }
    if (!nome.trim()) { setError('Informe seu nome.'); return }
    if (!turma.trim()) { setError('Informe sua turma.'); return }

    setLoading(true)
    setError('')

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, titulo, lobby_aberto, ativo, encerrado')
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

    if (!quiz.lobby_aberto && !quiz.ativo) {
      setError('A sala ainda não foi aberta. Aguarde o professor.')
      setLoading(false)
      return
    }

    // Se o aluno já tem um participante neste quiz, redireciona
    if (userId) {
      const { data: existing } = await supabase
        .from('quiz_participantes')
        .select('id, concluido')
        .eq('quiz_id', quiz.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) {
        if (existing.concluido) {
          router.push(`/quiz/${codigo.trim().toUpperCase()}/${existing.id}/resultado`)
        } else {
          router.push(`/quiz/${codigo.trim().toUpperCase()}/${existing.id}`)
        }
        return
      }
    }

    const { data: participante, error: partError } = await supabase
      .from('quiz_participantes')
      .insert({
        quiz_id: quiz.id,
        nome: nome.trim(),
        turma: turma.trim(),
        user_id: userId ?? null,
      })
      .select()
      .single()

    if (partError || !participante) {
      setError('Erro ao entrar no quiz. Tente novamente.')
      setLoading(false)
      return
    }

    router.push(`/quiz/${codigo.trim().toUpperCase()}/${participante.id}`)
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-escola-azul to-blue-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
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

          {userId && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
              <LogIn className="w-4 h-4 flex-shrink-0" />
              <span>Logado como <strong>{nome}</strong> · {turma}</span>
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

          {!userId && (
            <>
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
                  placeholder="Ex: 1° Ano A"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-escola-azul transition-colors"
                />
              </div>
            </>
          )}

          <button
            onClick={handleEntrar}
            disabled={loading || !codigo}
            className="w-full bg-escola-azul text-white rounded-xl py-3.5 font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : (
              <>
                Entrar na Sala
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Voltar ao site
          </Link>
          {!userId && (
            <Link href="/admin/cadastro" className="text-white/50 hover:text-white text-sm transition-colors">
              Criar conta →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
