'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, ScrollText } from 'lucide-react'

interface PerguntaForm {
  enunciado: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  resposta_correta: 'a' | 'b' | 'c' | 'd'
}

const PERGUNTA_VAZIA: PerguntaForm = {
  enunciado: '',
  alternativa_a: '',
  alternativa_b: '',
  alternativa_c: '',
  alternativa_d: '',
  resposta_correta: 'a',
}

const LETRAS = ['a', 'b', 'c', 'd'] as const

// Monta a prova final do curso. Salvar regrava a prova inteira; quem já
// tem certificado emitido não é afetado (certificado é retrato da emissão).
export default function CursoProvaEditor({ cursoId }: { cursoId: string }) {
  const [perguntas, setPerguntas] = useState<PerguntaForm[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    async function carregar() {
      const res = await fetch(`/api/cursos/prova/gerenciar?cursoId=${cursoId}`)
      const json = await res.json()
      if (res.ok) setPerguntas(json.perguntas)
      else setErro(json.error ?? 'Erro ao carregar a prova.')
      setCarregando(false)
    }
    carregar()
  }, [cursoId])

  function atualizar(i: number, campo: keyof PerguntaForm, valor: string) {
    setPerguntas(prev => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p))
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    setSucesso(false)
    const res = await fetch('/api/cursos/prova/gerenciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursoId, perguntas }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao salvar a prova.')
    } else {
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    }
    setSalvando(false)
  }

  if (carregando) {
    return <div className="panel p-6 text-sm text-gray-400">Carregando prova...</div>
  }

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-escola-azul" />
          <h3 className="font-bold text-gray-900">Prova final</h3>
        </div>
        {perguntas.length > 0 && (
          <span className="text-xs text-gray-400">{perguntas.length} {perguntas.length === 1 ? 'questão' : 'questões'}</span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-5">
        O aluno faz a prova depois de concluir todas as aulas. Com 70% de acerto, o certificado sai automaticamente.
        Sem perguntas cadastradas, o curso não oferece certificado.
      </p>

      {perguntas.length === 0 && (
        <div className="empty-state p-8 text-sm mb-4">
          Nenhuma pergunta ainda. Adicione a primeira para ativar o certificado deste curso.
        </div>
      )}

      <div className="space-y-5">
        {perguntas.map((p, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Pergunta {i + 1}</label>
              <button
                onClick={() => setPerguntas(prev => prev.filter((_, idx) => idx !== i))}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                aria-label={`Remover pergunta ${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={p.enunciado}
              onChange={e => atualizar(i, 'enunciado', e.target.value)}
              placeholder="Enunciado da pergunta"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:border-escola-azul transition-colors"
            />
            <div className="space-y-2">
              {LETRAS.map(letra => (
                <div key={letra} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer" title="Marcar como correta">
                    <input
                      type="radio"
                      name={`correta-${i}`}
                      checked={p.resposta_correta === letra}
                      onChange={() => atualizar(i, 'resposta_correta', letra)}
                      className="accent-green-600"
                    />
                    <span className={`text-xs font-mono uppercase font-bold ${p.resposta_correta === letra ? 'text-green-600' : 'text-gray-400'}`}>
                      {letra})
                    </span>
                  </label>
                  <input
                    value={p[`alternativa_${letra}`]}
                    onChange={e => atualizar(i, `alternativa_${letra}`, e.target.value)}
                    placeholder={`Alternativa ${letra.toUpperCase()}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-escola-azul transition-colors"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">A bolinha verde marca a alternativa correta.</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          onClick={() => setPerguntas(prev => [...prev, { ...PERGUNTA_VAZIA }])}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-escola-azul hover:text-escola-azul transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pergunta
        </button>
        <button
          onClick={salvar}
          disabled={salvando}
          className="inline-flex items-center gap-1.5 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {salvando ? 'Salvando...' : 'Salvar Prova'}
        </button>
        {sucesso && <span className="text-sm text-green-600 font-semibold">Prova salva!</span>}
      </div>
      {erro && <p className="text-sm text-red-600 mt-3">{erro}</p>}
    </div>
  )
}
