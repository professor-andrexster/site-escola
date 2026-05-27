'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { QuizPergunta } from '@/types/database'
import { Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react'

const LETRAS = ['a', 'b', 'c', 'd'] as const
const LABELS = { a: 'A', b: 'B', c: 'C', d: 'D' }
const CORES = {
  a: 'bg-red-500',
  b: 'bg-blue-500',
  c: 'bg-yellow-400',
  d: 'bg-green-500',
}

const EMPTY_FORM = {
  enunciado: '',
  alternativa_a: '',
  alternativa_b: '',
  alternativa_c: '',
  alternativa_d: '',
  resposta_correta: 'a' as 'a' | 'b' | 'c' | 'd',
  pontos: 100,
}

interface QuizPerguntasEditorProps {
  quizId: string
  perguntas: QuizPergunta[]
}

export default function QuizPerguntasEditor({ quizId, perguntas: initial }: QuizPerguntasEditorProps) {
  const [perguntas, setPerguntas] = useState(initial)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function addPergunta() {
    if (!form.enunciado.trim() || !form.alternativa_a.trim() || !form.alternativa_b.trim() || !form.alternativa_c.trim() || !form.alternativa_d.trim()) {
      setError('Preencha o enunciado e todas as alternativas.')
      return
    }
    setSaving(true)
    setError('')
    const ordem = perguntas.length

    const { data, error } = await supabase
      .from('quiz_perguntas')
      .insert({ quiz_id: quizId, ordem, ...form })
      .select()
      .single()

    if (error) { setError(error.message); setSaving(false); return }
    setPerguntas(prev => [...prev, data])
    setForm(EMPTY_FORM)
    setAdding(false)
    setSaving(false)
    router.refresh()
  }

  async function deletePergunta(id: string) {
    if (!confirm('Remover esta pergunta?')) return
    setDeletingId(id)
    await supabase.from('quiz_perguntas').delete().eq('id', id)
    const updated = perguntas.filter(p => p.id !== id)
    // reorder remaining
    await Promise.all(updated.map((p, i) => supabase.from('quiz_perguntas').update({ ordem: i }).eq('id', p.id)))
    setPerguntas(updated.map((p, i) => ({ ...p, ordem: i })))
    setDeletingId(null)
    router.refresh()
  }

  async function movePergunta(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= perguntas.length) return

    const updated = [...perguntas]
    ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
    const reordered = updated.map((p, i) => ({ ...p, ordem: i }))
    setPerguntas(reordered)

    await Promise.all([
      supabase.from('quiz_perguntas').update({ ordem: reordered[index].ordem }).eq('id', reordered[index].id),
      supabase.from('quiz_perguntas').update({ ordem: reordered[targetIndex].ordem }).eq('id', reordered[targetIndex].id),
    ])
  }

  return (
    <div className="space-y-3">
      {perguntas.length === 0 && !adding && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
          Nenhuma pergunta ainda. Adicione a primeira abaixo.
        </div>
      )}

      {perguntas.map((pergunta, i) => (
        <div key={pergunta.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-0.5 pt-0.5">
              <button onClick={() => movePergunta(i, 'up')} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors">
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 text-center font-mono">{i + 1}</span>
              <button onClick={() => movePergunta(i, 'down')} disabled={i === perguntas.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm mb-2">{pergunta.enunciado}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {LETRAS.map(letra => {
                  const isCorrect = pergunta.resposta_correta === letra
                  return (
                    <div key={letra} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${CORES[letra]}`}>
                        {LABELS[letra]}
                      </span>
                      <span className={`truncate ${isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                        {pergunta[`alternativa_${letra}` as keyof QuizPergunta] as string}
                      </span>
                      {isCorrect && <Check className="w-3 h-3 text-green-600 flex-shrink-0 ml-auto" />}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">{pergunta.pontos} pontos</p>
            </div>

            <button
              onClick={() => deletePergunta(pergunta.id)}
              disabled={deletingId === pergunta.id}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="bg-white border border-escola-azul rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Nova Pergunta #{perguntas.length + 1}</h3>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Enunciado *</label>
            <textarea
              value={form.enunciado}
              onChange={e => setForm(f => ({ ...f, enunciado: e.target.value }))}
              rows={2}
              placeholder="Digite a pergunta aqui..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LETRAS.map(letra => (
              <div key={letra}>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                  <span className={`w-4 h-4 rounded text-white text-[10px] font-bold flex items-center justify-center ${CORES[letra]}`}>{LABELS[letra]}</span>
                  Alternativa {LABELS[letra]} *
                  {form.resposta_correta === letra && <span className="text-green-600 text-[10px]">(Correta)</span>}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={form[`alternativa_${letra}` as keyof typeof form] as string}
                    onChange={e => setForm(f => ({ ...f, [`alternativa_${letra}`]: e.target.value }))}
                    placeholder={`Alternativa ${LABELS[letra]}`}
                    className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
                  />
                  <button
                    onClick={() => setForm(f => ({ ...f, resposta_correta: letra }))}
                    title="Marcar como correta"
                    className={`px-2 rounded-lg border transition-colors ${form.resposta_correta === letra ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-500'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pontos</label>
              <input
                type="number"
                value={form.pontos}
                onChange={e => setForm(f => ({ ...f, pontos: Number(e.target.value) }))}
                min={10}
                max={1000}
                step={10}
                className="w-24 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={addPergunta}
              disabled={saving}
              className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adicionando...' : 'Adicionar Pergunta'}
            </button>
            <button
              onClick={() => { setAdding(false); setForm(EMPTY_FORM); setError('') }}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-escola-azul hover:text-escola-azul transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pergunta
        </button>
      )}
    </div>
  )
}
