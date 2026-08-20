'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Trophy, Play, Square, Copy, DoorOpen, Users, MonitorPlay, CopyPlus, RotateCcw } from 'lucide-react'

interface QuizRow {
  id: string
  titulo: string
  codigo: string
  turma_alvo: string
  lobby_aberto: boolean
  ativo: boolean
  encerrado: boolean
  tempo_por_pergunta: number
  quiz_iniciado_em: string | null
  created_at: string
  quiz_perguntas: { id: string }[]
  quiz_participantes: { id: string }[]
}

interface QuizListTableProps {
  quizzes: QuizRow[]
}

type QuizStatus = 'rascunho' | 'lobby' | 'ativo' | 'encerrado'

function getStatus(q: QuizRow): QuizStatus {
  if (q.encerrado) return 'encerrado'
  if (q.ativo) return 'ativo'
  if (q.lobby_aberto) return 'lobby'
  return 'rascunho'
}

const STATUS_STYLE: Record<QuizStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-600 border-gray-200',
  lobby: 'bg-blue-100 text-blue-700 border-blue-200',
  ativo: 'bg-green-100 text-green-700 border-green-200',
  encerrado: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABEL: Record<QuizStatus, string> = {
  rascunho: 'Rascunho',
  lobby: 'Sala Aberta',
  ativo: 'Em andamento',
  encerrado: 'Encerrado',
}

export default function QuizListTable({ quizzes: initial }: QuizListTableProps) {
  const [quizzes, setQuizzes] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  // Estado da sala e comando nomeado: o servidor decide o que cada um muda.
  async function comandar(id: string, acao: string, otimista: Partial<QuizRow>) {
    setLoadingId(id)
    const res = await fetch(`/api/quiz/${id}/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    })
    if (res.ok) {
      setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...otimista } : q))
    } else {
      alert((await res.json().catch(() => ({}))).error ?? 'Erro ao mudar o estado da sala.')
    }
    setLoadingId(null)
    return res.ok
  }

  async function abrirSala(id: string) {
    await comandar(id, 'abrir-sala', { lobby_aberto: true, ativo: false, encerrado: false })
  }

  async function iniciarQuiz(id: string) {
    const ok = await comandar(id, 'iniciar', { ativo: true, lobby_aberto: true, encerrado: false })
    // Professor vai direto para o telão de comando
    if (ok) router.push(`/admin/quiz/${id}/controle`)
  }

  async function encerrarQuiz(id: string) {
    setLoadingId(id)
    // Rota consolida a pontuação de todos os participantes no servidor
    const res = await fetch('/api/quiz/encerrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: id }),
    })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? 'Erro ao encerrar o quiz.')
    } else {
      setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ativo: false, lobby_aberto: false, encerrado: true } : q))
      router.refresh()
    }
    setLoadingId(null)
  }

  async function fecharSala(id: string) {
    await comandar(id, 'fechar-sala', { lobby_aberto: false, ativo: false })
  }

  async function duplicarQuiz(quiz: QuizRow) {
    setLoadingId(quiz.id)
    // Copiar quiz e perguntas eram tres chamadas soltas; virou uma transacao.
    const res = await fetch(`/api/quiz/${quiz.id}/duplicar`, { method: 'POST' })
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error ?? 'Erro ao duplicar o quiz.')
    } else {
      router.refresh()
    }
    setLoadingId(null)
  }

  async function reabrirQuiz(id: string) {
    if (!confirm('Reabrir este quiz? As respostas e os participantes da rodada anterior serão APAGADOS e a sala volta a ficar aberta.')) return
    setLoadingId(id)
    const res = await fetch('/api/quiz/reabrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: id }),
    })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? 'Erro ao reabrir o quiz.')
    } else {
      setQuizzes(prev => prev.map(q => q.id === id
        ? { ...q, encerrado: false, ativo: false, lobby_aberto: true, quiz_participantes: [] }
        : q))
      router.refresh()
    }
    setLoadingId(null)
  }

  async function deleteQuiz(id: string) {
    if (!confirm('Deletar este quiz e todos os dados? Essa ação não pode ser desfeita.')) return
    setLoadingId(id)
    const res = await fetch(`/api/quiz/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setQuizzes(prev => prev.filter(q => q.id !== id))
      router.refresh()
    } else {
      alert((await res.json().catch(() => ({}))).error ?? 'Erro ao remover o quiz.')
    }
    setLoadingId(null)
  }

  function copyLink(codigo: string) {
    const url = `${window.location.origin}/quiz?codigo=${codigo}`
    navigator.clipboard.writeText(url)
    setCopied(codigo)
    setTimeout(() => setCopied(null), 2000)
  }

  if (quizzes.length === 0) {
    return (
      <div className="panel p-12 text-center text-gray-500">
        Nenhum quiz criado ainda.{' '}
        <Link href="/admin/quiz/novo" className="text-escola-azul hover:underline">Criar primeiro quiz</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => {
        const status = getStatus(quiz)
        const isLoading = loadingId === quiz.id

        return (
          <div key={quiz.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{quiz.titulo}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Turma: <strong className="text-gray-600">{quiz.turma_alvo}</strong>
                  </span>
                  <span className="text-xs text-gray-500">{quiz.quiz_perguntas?.length ?? 0} perguntas</span>
                  <span className="text-xs text-gray-500">{quiz.quiz_participantes?.length ?? 0} participantes</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-escola-azul tracking-widest">{quiz.codigo}</span>
                    <button
                      onClick={() => copyLink(quiz.codigo)}
                      title="Copiar link"
                      className="p-0.5 text-gray-500 hover:text-escola-azul transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copied === quiz.codigo && <span className="text-xs text-green-600">Copiado!</span>}
                  </div>
                </div>
              </div>

              {/* Controles de estado */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Ações de estado */}
                {status === 'rascunho' && (
                  <button
                    onClick={() => abrirSala(quiz.id)}
                    disabled={isLoading || (quiz.quiz_perguntas?.length ?? 0) === 0}
                    title={(quiz.quiz_perguntas?.length ?? 0) === 0 ? 'Adicione perguntas primeiro' : 'Abrir sala de espera'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-escola-azul text-white rounded-lg text-xs font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-40"
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    Abrir Sala
                  </button>
                )}

                {status === 'lobby' && (
                  <>
                    <button
                      onClick={() => iniciarQuiz(quiz.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Iniciar Quiz
                    </button>
                    <button
                      onClick={() => fecharSala(quiz.id)}
                      disabled={isLoading}
                      title="Fechar sala sem iniciar"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </>
                )}

                {status === 'ativo' && (
                  <>
                    <Link
                      href={`/admin/quiz/${quiz.id}/controle`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-escola-azul text-white rounded-lg text-xs font-semibold hover:bg-escola-azul-medio transition-colors"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      Controlar
                    </Link>
                    <button
                      onClick={() => encerrarQuiz(quiz.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Encerrar
                    </button>
                  </>
                )}

                {status === 'encerrado' && (
                  <button
                    onClick={() => reabrirQuiz(quiz.id)}
                    disabled={isLoading}
                    title="Reabrir: apaga as respostas da rodada e abre a sala de novo"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reabrir
                  </button>
                )}

                {/* Ações fixas */}
                <button
                  onClick={() => duplicarQuiz(quiz)}
                  disabled={isLoading}
                  title="Duplicar quiz (cria uma cópia em rascunho com as mesmas perguntas)"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <CopyPlus className="w-4 h-4" />
                </button>
                <Link
                  href={`/admin/quiz/${quiz.id}/ranking`}
                  className="p-1.5 rounded-lg text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                  title="Ver ranking"
                >
                  <Trophy className="w-4 h-4" />
                </Link>
                {!quiz.encerrado && (
                  <Link
                    href={`/admin/quiz/${quiz.id}`}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    title="Editar quiz"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => deleteQuiz(quiz.id)}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sala aberta: instrução de envio */}
            {(status === 'lobby' || status === 'ativo') && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <DoorOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>
                  Compartilhe o código <strong className="font-mono text-escola-azul">{quiz.codigo}</strong> ou o link para os alunos da turma entrarem.
                  {status === 'lobby' && <span className="text-blue-600 font-medium"> Aguardando você iniciar...</span>}
                  {status === 'ativo' && <span className="text-green-600 font-medium"> Quiz em andamento!</span>}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
