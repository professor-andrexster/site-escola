'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Quiz } from '@/types/database'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface QuizEditorProps {
  quiz?: Quiz
}

export default function QuizEditor({ quiz }: QuizEditorProps) {
  const isEditing = !!quiz
  const [titulo, setTitulo] = useState(quiz?.titulo ?? '')
  const [descricao, setDescricao] = useState(quiz?.descricao ?? '')
  const [tempo, setTempo] = useState(quiz?.tempo_por_pergunta ?? 30)
  const [ativo, setAtivo] = useState(quiz?.ativo ?? false)
  const [encerrado, setEncerrado] = useState(quiz?.encerrado ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (!titulo.trim()) return
    setSaving(true)
    setError('')

    if (isEditing) {
      const { error } = await supabase
        .from('quizzes')
        .update({ titulo, descricao: descricao || null, tempo_por_pergunta: tempo, ativo, encerrado, updated_at: new Date().toISOString() })
        .eq('id', quiz.id)
      if (error) { setError(error.message); setSaving(false); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } else {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ titulo, descricao: descricao || null, tempo_por_pergunta: tempo, codigo: generateCode(), ativo: false, encerrado: false })
        .select()
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      router.push(`/admin/quiz/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Quiz de Matemática — Turma A"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Breve descrição do quiz para os alunos"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
        />
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
          className="w-full accent-escola-azul"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10s</span>
          <span>2 min</span>
        </div>
      </div>

      {isEditing && (
        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => { setAtivo(!ativo); if (!ativo) setEncerrado(false) }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${ativo ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Ativo (alunos podem responder)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => { setEncerrado(!encerrado); if (!encerrado) setAtivo(false) }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${encerrado ? 'bg-red-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${encerrado ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Encerrado</span>
          </label>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !titulo.trim()}
          className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : saved ? 'Salvo!' : isEditing ? 'Salvar Alterações' : 'Criar Quiz'}
        </button>
      </div>
    </div>
  )
}
