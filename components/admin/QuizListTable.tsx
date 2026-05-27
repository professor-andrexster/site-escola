'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Trophy, Play, Square, Copy } from 'lucide-react'

interface QuizRow {
  id: string
  titulo: string
  codigo: string
  ativo: boolean
  encerrado: boolean
  tempo_por_pergunta: number
  created_at: string
  quiz_perguntas: { id: string }[]
  quiz_participantes: { id: string }[]
}

interface QuizListTableProps {
  quizzes: QuizRow[]
}

export default function QuizListTable({ quizzes: initial }: QuizListTableProps) {
  const [quizzes, setQuizzes] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function toggleAtivo(id: string, current: boolean) {
    const updates = current
      ? { ativo: false }
      : { ativo: true, encerrado: false }
    await supabase.from('quizzes').update(updates).eq('id', id)
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  async function deleteQuiz(id: string) {
    if (!confirm('Deletar este quiz e todos os dados? Essa ação não pode ser desfeita.')) return
    setDeletingId(id)
    await supabase.from('quizzes').delete().eq('id', id)
    setQuizzes(prev => prev.filter(q => q.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  function copyLink(codigo: string) {
    const url = `${window.location.origin}/quiz?codigo=${codigo}`
    navigator.clipboard.writeText(url)
    setCopied(codigo)
    setTimeout(() => setCopied(null), 2000)
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
        Nenhum quiz criado ainda.{' '}
        <Link href="/admin/quiz/novo" className="text-escola-azul hover:underline">Criar primeiro quiz</Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Título</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Código</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Perguntas</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Participantes</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quizzes.map((quiz) => {
              const status = quiz.encerrado ? 'encerrado' : quiz.ativo ? 'ativo' : 'rascunho'
              const statusStyle = {
                ativo: 'bg-green-100 text-green-700 border-green-200',
                encerrado: 'bg-red-100 text-red-700 border-red-200',
                rascunho: 'bg-gray-100 text-gray-600 border-gray-200',
              }[status]

              return (
                <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{quiz.titulo}</p>
                    {quiz.encerrado && <p className="text-xs text-red-500 mt-0.5">Encerrado</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono font-bold text-escola-azul tracking-widest text-sm">{quiz.codigo}</span>
                      <button
                        onClick={() => copyLink(quiz.codigo)}
                        title="Copiar link"
                        className="p-1 text-gray-400 hover:text-escola-azul transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copied === quiz.codigo && <span className="text-xs text-green-600">Copiado!</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden lg:table-cell">
                    {quiz.quiz_perguntas?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">
                    {quiz.quiz_participantes?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleAtivo(quiz.id, quiz.ativo)}
                        title={quiz.ativo ? 'Pausar' : 'Ativar'}
                        disabled={quiz.encerrado}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${quiz.ativo ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {quiz.ativo ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <Link
                        href={`/admin/quiz/${quiz.id}/ranking`}
                        className="p-1.5 rounded-lg text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        title="Ver ranking"
                      >
                        <Trophy className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/quiz/${quiz.id}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-escola-azul-claro hover:text-escola-azul transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        disabled={deletingId === quiz.id}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
