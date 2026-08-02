'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, RotateCcw, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { calcularDiasAtraso } from '@/lib/biblioteca/emprestimos'

interface ItemDevolucao {
  exemplarId: string
  tombo: string
  obraTitulo: string
  leitorNome: string
  dataPrevista: string
}

interface LeitorBusca {
  id: string
  nome_completo: string
  turma: string | null
  tipo_leitor: string
}

interface EmprestimoAberto {
  id: string
  exemplar_id: string
  data_prevista: string
  biblioteca_exemplares: { tombo: string; biblioteca_obras: { titulo: string } }
}

export default function DevolucaoConsole() {
  const [codigo, setCodigo] = useState('')
  const [item, setItem] = useState<ItemDevolucao | null>(null)
  const [dano, setDano] = useState(false)
  const [observacaoDano, setObservacaoDano] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [buscando, setBuscando] = useState(false)

  const [termoLeitor, setTermoLeitor] = useState('')
  const [resultadosLeitor, setResultadosLeitor] = useState<LeitorBusca[]>([])
  const [emprestimosLeitor, setEmprestimosLeitor] = useState<EmprestimoAberto[] | null>(null)
  const [nomeLeitorAtual, setNomeLeitorAtual] = useState('')

  const codigoRef = useRef<HTMLInputElement>(null)

  useEffect(() => { codigoRef.current?.focus() }, [])

  async function buscarExemplar(e: React.FormEvent) {
    e.preventDefault()
    const valor = codigo.trim()
    if (!valor) return
    setErro('')
    setSucesso('')
    setBuscando(true)

    const res = await fetch(`/api/biblioteca/exemplares?codigo=${encodeURIComponent(valor)}`)
    const json = await res.json()
    setBuscando(false)
    if (!res.ok) { setErro(json.error ?? 'Exemplar não encontrado.'); setCodigo(''); return }

    if (json.exemplar.situacao !== 'emprestado' || !json.emprestimo) {
      setErro('Este exemplar não está emprestado no momento.')
      setCodigo('')
      return
    }

    setItem({
      exemplarId: json.exemplar.id,
      tombo: json.exemplar.tombo,
      obraTitulo: json.exemplar.biblioteca_obras?.titulo ?? 'Obra',
      leitorNome: json.emprestimo.biblioteca_leitores?.nome_completo ?? 'Leitor',
      dataPrevista: json.emprestimo.data_prevista,
    })
    setCodigo('')
  }

  async function confirmarDevolucao() {
    if (!item) return
    setConfirmando(true)
    setErro('')

    const res = await fetch('/api/biblioteca/devolucao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exemplarId: item.exemplarId, dano, observacaoDano: dano ? observacaoDano : undefined }),
    })
    const json = await res.json()
    setConfirmando(false)
    if (!res.ok) { setErro(json.error ?? 'Erro ao registrar devolução.'); return }

    setSucesso(
      json.atrasado
        ? `Devolução registrada com ${json.diasAtraso} dia(s) de atraso. ${json.leitorSuspenso ? 'O leitor foi suspenso automaticamente.' : ''}`
        : 'Devolução registrada no prazo.'
    )
    setItem(null)
    setDano(false)
    setObservacaoDano('')
    setEmprestimosLeitor(null)
    codigoRef.current?.focus()
  }

  useEffect(() => {
    if (!termoLeitor.trim()) { setResultadosLeitor([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/biblioteca/leitores?q=${encodeURIComponent(termoLeitor.trim())}`)
      const json = await res.json()
      setResultadosLeitor(json.leitores ?? [])
    }, 250)
    return () => clearTimeout(t)
  }, [termoLeitor])

  async function selecionarLeitor(id: string, nome: string) {
    const res = await fetch(`/api/biblioteca/leitores/${id}`)
    const json = await res.json()
    if (!res.ok) return
    setEmprestimosLeitor(json.emprestimosAbertos ?? [])
    setNomeLeitorAtual(nome)
    setTermoLeitor('')
    setResultadosLeitor([])
  }

  async function devolverDoLeitor(emprestimoId: string, exemplarId: string) {
    setErro('')
    const res = await fetch('/api/biblioteca/devolucao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exemplarId }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao registrar devolução.'); return }
    setSucesso(json.atrasado ? `Devolução registrada com ${json.diasAtraso} dia(s) de atraso.` : 'Devolução registrada no prazo.')
    setEmprestimosLeitor(prev => (prev ?? []).filter(e => e.id !== emprestimoId))
  }

  const diasAtrasoItem = item ? calcularDiasAtraso(item.dataPrevista) : 0

  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <RotateCcw className="w-6 h-6 text-escola-azul" />
        Devolução
      </h1>
      <p className="text-sm text-gray-400 mb-6">Leia o código de barras, digite o tombo, ou busque pelo leitor mais abaixo.</p>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {sucesso}
        </div>
      )}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{erro}</div>}

      {!item ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tombo ou código de barras</label>
          <form onSubmit={buscarExemplar} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={codigoRef}
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Leia o código ou digite, e aperte Enter"
                className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-escola-azul transition-colors font-mono"
              />
            </div>
          </form>
          {buscando && <p className="text-xs text-gray-400 mt-2">Buscando...</p>}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="font-semibold text-gray-900">{item.obraTitulo}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{item.tombo}</p>
          <p className="text-sm text-gray-600 mt-2">Com: <strong>{item.leitorNome}</strong></p>
          <p className="text-sm text-gray-600">Devolução prevista: {new Date(item.dataPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}</p>

          {diasAtrasoItem > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Atrasado há {diasAtrasoItem} dia(s).
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={dano} onChange={e => setDano(e.target.checked)} className="w-4 h-4 accent-escola-azul" />
              <span className="text-sm text-gray-700">Voltou com dano (vai para reparo)</span>
            </label>
            {dano && (
              <textarea
                value={observacaoDano}
                onChange={e => setObservacaoDano(e.target.value)}
                placeholder="Descreva o dano"
                rows={2}
                className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-escola-azul transition-colors"
              />
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={confirmarDevolucao}
              disabled={confirmando}
              className={`flex-1 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm text-white ${diasAtrasoItem > 0 ? 'bg-escola-vermelho hover:bg-escola-vermelho/90' : 'bg-escola-azul hover:bg-escola-azul/90'}`}
            >
              {confirmando ? 'Registrando...' : 'Confirmar Devolução'}
            </button>
            <button
              onClick={() => { setItem(null); codigoRef.current?.focus() }}
              className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ou busque pelo leitor</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={termoLeitor}
            onChange={e => setTermoLeitor(e.target.value)}
            placeholder="Nome, matrícula ou turma..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        {resultadosLeitor.length > 0 && (
          <div className="mt-2 space-y-1">
            {resultadosLeitor.map(l => (
              <button
                key={l.id}
                onClick={() => selecionarLeitor(l.id, l.nome_completo)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                {l.nome_completo} {l.turma && <span className="text-gray-400">· Turma {l.turma}</span>}
              </button>
            ))}
          </div>
        )}

        {emprestimosLeitor && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500">Com {nomeLeitorAtual}:</p>
            {emprestimosLeitor.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum empréstimo em aberto.</p>
            ) : (
              emprestimosLeitor.map(e => {
                const diasAtraso = calcularDiasAtraso(e.data_prevista)
                return (
                  <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-800">{e.biblioteca_exemplares?.biblioteca_obras?.titulo}</p>
                      <p className={`text-xs ${diasAtraso > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                        {diasAtraso > 0 ? `Atrasado há ${diasAtraso} dia(s)` : `Devolução ${new Date(e.data_prevista + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => devolverDoLeitor(e.id, e.exemplar_id)}
                      className="text-xs font-semibold text-escola-azul hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      Devolver
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
