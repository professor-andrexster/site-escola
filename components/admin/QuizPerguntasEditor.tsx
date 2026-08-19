'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizPergunta } from '@/types/database'
import { Plus, Trash2, ChevronUp, ChevronDown, Check, Pencil, Sparkles } from 'lucide-react'

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

type PerguntaForm = typeof EMPTY_FORM

function PerguntaFields({ value, onChange }: { value: PerguntaForm; onChange: (updater: (f: PerguntaForm) => PerguntaForm) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Enunciado *</label>
        <textarea
          value={value.enunciado}
          onChange={e => onChange(f => ({ ...f, enunciado: e.target.value }))}
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
              {value.resposta_correta === letra && <span className="text-green-600 text-[10px]">(Correta)</span>}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={value[`alternativa_${letra}` as keyof PerguntaForm] as string}
                onChange={e => onChange(f => ({ ...f, [`alternativa_${letra}`]: e.target.value }))}
                placeholder={`Alternativa ${LABELS[letra]}`}
                className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
              />
              <button
                onClick={() => onChange(f => ({ ...f, resposta_correta: letra }))}
                title="Marcar como correta"
                className={`px-2 rounded-lg border transition-colors ${value.resposta_correta === letra ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-500'}`}
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
            value={value.pontos}
            onChange={e => onChange(f => ({ ...f, pontos: Number(e.target.value) }))}
            min={10}
            max={1000}
            step={10}
            className="w-24 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
          />
        </div>
      </div>
    </>
  )
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)
  const [materiaIA, setMateriaIA] = useState('')
  const [quantidadeIA, setQuantidadeIA] = useState(10)
  const [gerando, setGerando] = useState(false)
  const [erroIA, setErroIA] = useState('')
  const router = useRouter()

  async function addPergunta() {
    if (!form.enunciado.trim() || !form.alternativa_a.trim() || !form.alternativa_b.trim() || !form.alternativa_c.trim() || !form.alternativa_d.trim()) {
      setError('Preencha o enunciado e todas as alternativas.')
      return
    }
    setSaving(true)
    setError('')

    // A ordem e decidida no servidor, a partir da ultima pergunta gravada.
    const res = await fetch(`/api/quiz/${quizId}/perguntas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError(json.error ?? 'Erro ao salvar a pergunta.'); setSaving(false); return }

    setPerguntas(prev => [...prev, ...json.perguntas])
    setForm(EMPTY_FORM)
    setAdding(false)
    setSaving(false)
    router.refresh()
  }

  async function deletePergunta(id: string) {
    if (!confirm('Remover esta pergunta?')) return
    setDeletingId(id)
    setError('')
    // Remover e reenumerar viraram uma coisa so no servidor; eram N updates
    // soltos, e uma falha no meio deixava a ordem furada.
    const res = await fetch(`/api/quiz/perguntas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPerguntas(perguntas.filter(p => p.id !== id).map((p, i) => ({ ...p, ordem: i })))
      router.refresh()
    } else {
      setError((await res.json().catch(() => ({}))).error ?? 'Erro ao remover a pergunta.')
    }
    setDeletingId(null)
  }

  async function movePergunta(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= perguntas.length) return

    const a = perguntas[index]
    const b = perguntas[targetIndex]

    const res = await fetch('/api/quiz/perguntas/ordem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perguntaA: a.id, ordemA: b.ordem, perguntaB: b.id, ordemB: a.ordem }),
    })
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? 'Erro ao reordenar as perguntas.')
      return
    }

    const updated = [...perguntas]
    ;[updated[index], updated[targetIndex]] = [
      { ...updated[targetIndex], ordem: a.ordem },
      { ...updated[index], ordem: b.ordem },
    ]
    setPerguntas(updated)
  }

  function startEdit(pergunta: QuizPergunta) {
    setEditingId(pergunta.id)
    setEditForm({
      enunciado: pergunta.enunciado,
      alternativa_a: pergunta.alternativa_a,
      alternativa_b: pergunta.alternativa_b,
      alternativa_c: pergunta.alternativa_c,
      alternativa_d: pergunta.alternativa_d,
      resposta_correta: pergunta.resposta_correta,
      pontos: pergunta.pontos,
    })
    setError('')
  }

  async function saveEdit(id: string) {
    if (!editForm.enunciado.trim() || !editForm.alternativa_a.trim() || !editForm.alternativa_b.trim() || !editForm.alternativa_c.trim() || !editForm.alternativa_d.trim()) {
      setError('Preencha o enunciado e todas as alternativas.')
      return
    }
    setSavingEdit(true)
    setError('')

    const res = await fetch(`/api/quiz/perguntas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setError(json.error ?? 'Erro ao salvar a pergunta.'); setSavingEdit(false); return }

    setPerguntas(prev => prev.map(p => p.id === id ? json.pergunta : p))
    setEditingId(null)
    setSavingEdit(false)
    router.refresh()
  }

  async function gerarComIA() {
    if (!materiaIA.trim()) { setErroIA('Informe a matéria/tema.'); return }

    setGerando(true)
    setErroIA('')

    try {
      const res = await fetch('/api/gerar-perguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia: materiaIA.trim(), quantidade: quantidadeIA }),
      })
      const json = await res.json()

      if (!res.ok) {
        setErroIA(json.error ?? 'Erro ao gerar perguntas.')
        return
      }

      const geradas = (json.perguntas as Array<Record<string, string>>).map(p => ({
        enunciado: p.enunciado,
        alternativa_a: p.alternativa_a,
        alternativa_b: p.alternativa_b,
        alternativa_c: p.alternativa_c,
        alternativa_d: p.alternativa_d,
        resposta_correta: p.resposta_correta,
        pontos: 100,
      }))

      const salvas = await fetch(`/api/quiz/${quizId}/perguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perguntas: geradas }),
      })
      const salvasJson = await salvas.json().catch(() => ({}))
      if (!salvas.ok) { setErroIA(salvasJson.error ?? 'Erro ao salvar as perguntas geradas.'); return }

      setPerguntas(prev => [...prev, ...salvasJson.perguntas])
      setMateriaIA('')
      router.refresh()
    } catch {
      setErroIA('Erro ao gerar perguntas. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="space-y-3">
      {perguntas.length === 0 && !adding && (
        <div className="empty-state p-8 text-sm">
          Nenhuma pergunta ainda. Adicione a primeira abaixo.
        </div>
      )}

      {perguntas.map((pergunta, i) => (
        <div key={pergunta.id} className="panel p-4">
          {editingId === pergunta.id ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Editar Pergunta #{i + 1}</h3>

              {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <PerguntaFields value={editForm} onChange={setEditForm} />

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => saveEdit(pergunta.id)}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50"
                >
                  {savingEdit ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => { setEditingId(null); setError('') }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button onClick={() => movePergunta(i, 'up')} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 text-center font-mono">{i + 1}</span>
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
                <p className="text-xs text-gray-500 mt-2">{pergunta.pontos} pontos</p>
              </div>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(pergunta)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-escola-azul transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePergunta(pergunta.id)}
                  disabled={deletingId === pergunta.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Geração de perguntas com IA */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          Gerar perguntas com IA
        </div>
        {erroIA && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erroIA}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={materiaIA}
            onChange={e => setMateriaIA(e.target.value)}
            placeholder="Ex: Revolução Francesa, Funções do 2° grau, Ecossistemas..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
          />
          <select
            value={quantidadeIA}
            onChange={e => setQuantidadeIA(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul"
            aria-label="Quantidade de perguntas"
          >
            <option value={5}>5 perguntas</option>
            <option value={10}>10 perguntas</option>
            <option value={15}>15 perguntas</option>
            <option value={20}>20 perguntas</option>
          </select>
          <button
            onClick={gerarComIA}
            disabled={gerando || !materiaIA.trim()}
            className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {gerando ? 'Gerando...' : 'Gerar'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          As perguntas geradas são adicionadas à lista acima e podem ser editadas ou removidas livremente.
        </p>
      </div>

      {adding ? (
        <div className="bg-white border border-escola-azul rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Nova Pergunta #{perguntas.length + 1}</h3>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <PerguntaFields value={form} onChange={setForm} />

          <div className="flex gap-2 pt-1">
            <button
              onClick={addPergunta}
              disabled={saving}
              className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50"
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
