'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Barcode } from 'lucide-react'
import type { BibliotecaExemplar } from '@/types/database'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

const SITUACAO_LABELS: Record<string, { label: string; cor: string }> = {
  disponivel: { label: 'Disponível', cor: 'bg-green-50 text-green-700 border-green-200' },
  emprestado: { label: 'Emprestado', cor: 'bg-blue-50 text-blue-700 border-blue-200' },
  reservado: { label: 'Reservado', cor: 'bg-purple-50 text-purple-700 border-purple-200' },
  em_reparo: { label: 'Em reparo', cor: 'bg-amber-50 text-amber-700 border-amber-200' },
  extraviado: { label: 'Extraviado', cor: 'bg-red-50 text-red-700 border-red-200' },
  baixado: { label: 'Baixado', cor: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const SITUACOES_EDITAVEIS = ['disponivel', 'em_reparo', 'extraviado', 'baixado']

export default function ExemplaresList({ obraId, exemplaresIniciais }: { obraId: string; exemplaresIniciais: BibliotecaExemplar[] }) {
  const router = useRouter()
  const [exemplares, setExemplares] = useState(exemplaresIniciais)
  const [aberto, setAberto] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [quantidade, setQuantidade] = useState('1')
  const [tombo, setTombo] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [estante, setEstante] = useState('')
  const [prateleira, setPrateleira] = useState('')
  const [origemAquisicao, setOrigemAquisicao] = useState('compra')
  const [estadoConservacao, setEstadoConservacao] = useState('bom')
  const [consultaLocal, setConsultaLocal] = useState(false)

  async function adicionarExemplares(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    const res = await fetch('/api/biblioteca/exemplares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obraId,
        quantidade: parseInt(quantidade, 10) || 1,
        tombo: tombo || undefined,
        codigoBarras: codigoBarras || undefined,
        estante: estante || undefined,
        prateleira: prateleira || undefined,
        origemAquisicao,
        estadoConservacao,
        consultaLocal,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao criar exemplar.')
      setSalvando(false)
      return
    }

    setExemplares(prev => [...prev, ...json.exemplares])
    setQuantidade('1'); setTombo(''); setCodigoBarras(''); setEstante(''); setPrateleira('')
    setSalvando(false)
    setAberto(false)
    router.refresh()
  }

  async function mudarSituacao(exemplarId: string, situacaoAtual: string, novaSituacao: string) {
    if (novaSituacao === situacaoAtual) return
    if (['emprestado', 'reservado'].includes(situacaoAtual)) {
      alert('Este exemplar está emprestado ou reservado. Registre a devolução antes de mudar a situação.')
      return
    }
    const motivo = window.prompt(`Motivo da mudança para "${SITUACAO_LABELS[novaSituacao]?.label ?? novaSituacao}":`)
    if (!motivo?.trim()) return

    setLoadingId(exemplarId)
    setErro('')
    const res = await fetch(`/api/biblioteca/exemplares/${exemplarId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situacao: novaSituacao, motivo }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao mudar situação.')
      setLoadingId(null)
      return
    }
    setExemplares(prev => prev.map(ex => (ex.id === exemplarId ? json.exemplar : ex)))
    setLoadingId(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Barcode className="w-4 h-4 text-escola-azul" />
          Exemplares ({exemplares.length})
        </h2>
        <button
          onClick={() => setAberto(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-escola-azul/10 text-escola-azul rounded-lg text-xs font-semibold hover:bg-escola-azul/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erro}</div>}

      {aberto && (
        <form onSubmit={adicionarExemplares} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Quantidade</label>
              <input type="number" min={1} max={50} value={quantidade} onChange={e => setQuantidade(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tombo manual</label>
              <input
                value={tombo}
                onChange={e => setTombo(e.target.value)}
                disabled={quantidade !== '1'}
                placeholder="Deixe vazio para gerar"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Código de barras</label>
              <input value={codigoBarras} onChange={e => setCodigoBarras(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select value={estadoConservacao} onChange={e => setEstadoConservacao(e.target.value)} className={inputClass}>
                <option value="novo">Novo</option>
                <option value="bom">Bom</option>
                <option value="regular">Regular</option>
                <option value="ruim">Ruim</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Estante</label>
              <input value={estante} onChange={e => setEstante(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prateleira</label>
              <input value={prateleira} onChange={e => setPrateleira(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Origem</label>
              <select value={origemAquisicao} onChange={e => setOrigemAquisicao(e.target.value)} className={inputClass}>
                <option value="compra">Compra</option>
                <option value="doacao">Doação</option>
                <option value="programa_governo">Programa do governo</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={consultaLocal} onChange={e => setConsultaLocal(e.target.checked)} className="w-4 h-4 accent-escola-azul" />
                <span className="text-sm text-gray-700">Só consulta local</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul/90 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Criar Exemplar(es)'}
          </button>
        </form>
      )}

      {exemplares.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Nenhum exemplar cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {exemplares.map(ex => {
            const cfg = SITUACAO_LABELS[ex.situacao] ?? { label: ex.situacao, cor: 'bg-gray-50 text-gray-600 border-gray-200' }
            return (
              <div key={ex.id} className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-gray-500 w-28 flex-shrink-0">{ex.tombo}</span>
                <span className="text-xs text-gray-400 flex-1 truncate">
                  {[ex.estante, ex.prateleira].filter(Boolean).join(' · ') || 'Sem localização'}
                  {ex.consulta_local ? ' · Consulta local' : ''}
                </span>
                <select
                  value={ex.situacao}
                  onChange={e => mudarSituacao(ex.id, ex.situacao, e.target.value)}
                  disabled={loadingId === ex.id}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border ${cfg.cor} disabled:opacity-50`}
                >
                  {SITUACOES_EDITAVEIS.includes(ex.situacao) ? (
                    SITUACOES_EDITAVEIS.map(s => (
                      <option key={s} value={s}>{SITUACAO_LABELS[s].label}</option>
                    ))
                  ) : (
                    <option value={ex.situacao}>{cfg.label}</option>
                  )}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
