'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TURMAS_ALVO } from '@/lib/turmas'
import type { Quiz } from '@/types/database'

interface QuizEditorProps {
  quiz?: Quiz
}

export default function QuizEditor({ quiz }: QuizEditorProps) {
  const isEditing = !!quiz
  const [titulo, setTitulo] = useState(quiz?.titulo ?? '')
  const [descricao, setDescricao] = useState(quiz?.descricao ?? '')
  const [tempo, setTempo] = useState(quiz?.tempo_por_pergunta ?? 30)
  const [turmaAlvo, setTurmaAlvo] = useState(quiz?.turma_alvo ?? 'Todos')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    if (!titulo.trim()) return
    setSaving(true)
    setError('')

    // O codigo da sala e sorteado no servidor, que confere se ja existe.
    const res = await fetch(isEditing ? `/api/quiz/${quiz.id}` : '/api/quiz', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        descricao: descricao || null,
        tempo_por_pergunta: tempo,
        turma_alvo: turmaAlvo,
      }),
    })
    const resposta = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(resposta.error ?? 'Erro ao salvar o quiz.')
      setSaving(false)
      return
    }

    if (isEditing) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } else {
      router.push(`/admin/quiz/${resposta.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="panel p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Quiz de Matemática — Funções"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Breve descrição do quiz"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turma Alvo</label>
          <select
            value={turmaAlvo}
            onChange={e => setTurmaAlvo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul bg-white"
          >
            {TURMAS_ALVO.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Alunos desta turma verão o quiz automaticamente</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tempo por pergunta: <span className="font-bold text-escola-azul">{tempo}s</span>
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full accent-escola-azul mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10s</span>
            <span>2 min</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !titulo.trim()}
          className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : saved ? 'Salvo!' : isEditing ? 'Salvar Alterações' : 'Criar Quiz'}
        </button>
      </div>
    </div>
  )
}
