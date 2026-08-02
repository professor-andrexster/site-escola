'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, ScanLine, X, CheckCircle2, GraduationCap, BookOpen, Briefcase, Users as UsersIcon, Keyboard } from 'lucide-react'
import { calcularDataPrevista, prazoDiasPorTipo } from '@/lib/biblioteca/emprestimos'
import { GESTAO_ROLES } from '@/lib/roles'
import type { BibliotecaConfiguracoes, BibliotecaLeitor, Profile } from '@/types/database'

const TIPO_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  aluno: GraduationCap, professor: BookOpen, funcionario: Briefcase, comunidade: UsersIcon,
}

interface ExemplarCarrinho {
  id: string
  tombo: string
  obraTitulo: string
}

interface LeitorComAbertos {
  leitor: BibliotecaLeitor
  emprestimosAbertos: { id: string; data_prevista: string; biblioteca_exemplares: { tombo: string; biblioteca_obras: { titulo: string } } }[]
}

export default function EmprestimoConsole({ role }: { role: Profile['role'] }) {
  const souGestao = (GESTAO_ROLES as string[]).includes(role)

  const [config, setConfig] = useState<BibliotecaConfiguracoes | null>(null)
  const [diasSemExpediente, setDiasSemExpediente] = useState<Set<string>>(new Set())

  const [termoBusca, setTermoBusca] = useState('')
  const [resultados, setResultados] = useState<BibliotecaLeitor[]>([])
  const [buscando, setBuscando] = useState(false)
  const [leitorAtual, setLeitorAtual] = useState<LeitorComAbertos | null>(null)

  const [codigoExemplar, setCodigoExemplar] = useState('')
  const [carrinho, setCarrinho] = useState<ExemplarCarrinho[]>([])
  const [dataPrevistaAjustada, setDataPrevistaAjustada] = useState('')

  const [erro, setErro] = useState('')
  const [avisos, setAvisos] = useState<string[]>([])
  const [sucesso, setSucesso] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const buscaRef = useRef<HTMLInputElement>(null)
  const exemplarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    buscaRef.current?.focus()
    fetch('/api/biblioteca/configuracoes').then(r => r.json()).then(j => j.config && setConfig(j.config))
    fetch('/api/biblioteca/calendario').then(r => r.json()).then(j => {
      if (j.dias) setDiasSemExpediente(new Set(j.dias.map((d: { data: string }) => d.data)))
    })
  }, [])

  useEffect(() => {
    if (!termoBusca.trim()) { setResultados([]); return }
    setBuscando(true)
    const t = setTimeout(async () => {
      const res = await fetch(`/api/biblioteca/leitores?q=${encodeURIComponent(termoBusca.trim())}`)
      const json = await res.json()
      setResultados(json.leitores ?? [])
      setBuscando(false)
    }, 250)
    return () => clearTimeout(t)
  }, [termoBusca])

  async function selecionarLeitor(id: string) {
    setErro('')
    const res = await fetch(`/api/biblioteca/leitores/${id}`)
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao carregar leitor.'); return }
    setLeitorAtual(json)
    setTermoBusca('')
    setResultados([])
    setTimeout(() => exemplarRef.current?.focus(), 50)
  }

  async function lerExemplar(e: React.FormEvent) {
    e.preventDefault()
    const codigo = codigoExemplar.trim()
    if (!codigo) return
    setErro('')

    if (carrinho.some(c => c.tombo === codigo)) {
      setErro(`O exemplar ${codigo} já está na lista.`)
      setCodigoExemplar('')
      return
    }

    const res = await fetch(`/api/biblioteca/exemplares?codigo=${encodeURIComponent(codigo)}`)
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Exemplar não encontrado.'); setCodigoExemplar(''); return }

    const exemplar = json.exemplar
    if (exemplar.consulta_local) { setErro('Este exemplar é só para consulta local, não pode ser emprestado.'); setCodigoExemplar(''); return }
    if (exemplar.situacao !== 'disponivel') { setErro(`Este exemplar não está disponível (${exemplar.situacao}).`); setCodigoExemplar(''); return }

    setCarrinho(prev => [...prev, { id: exemplar.id, tombo: exemplar.tombo, obraTitulo: exemplar.biblioteca_obras?.titulo ?? 'Obra' }])
    setCodigoExemplar('')
  }

  function removerDoCarrinho(id: string) {
    setCarrinho(prev => prev.filter(c => c.id !== id))
  }

  function limparTudo() {
    setLeitorAtual(null)
    setCarrinho([])
    setDataPrevistaAjustada('')
    setErro('')
    setAvisos([])
    setTermoBusca('')
    buscaRef.current?.focus()
  }

  const previstaCalculada = leitorAtual && config
    ? calcularDataPrevista(new Date(), prazoDiasPorTipo(config, leitorAtual.leitor.tipo_leitor), diasSemExpediente).toISOString().slice(0, 10)
    : null

  async function confirmarEmprestimo() {
    if (!leitorAtual || carrinho.length === 0) return
    setConfirmando(true)
    setErro('')
    setAvisos([])
    setSucesso('')

    const res = await fetch('/api/biblioteca/emprestimo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leitorId: leitorAtual.leitor.id,
        exemplarIds: carrinho.map(c => c.id),
        dataPrevistaAjustada: souGestao && dataPrevistaAjustada ? dataPrevistaAjustada : undefined,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao registrar empréstimo.'); setConfirmando(false); return }

    setSucesso(`${carrinho.length} exemplar(es) emprestado(s) para ${leitorAtual.leitor.nome_completo}. Devolução prevista: ${new Date(json.dataPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}.`)
    if (json.erros?.length) setAvisos(json.erros)
    setConfirmando(false)
    limparTudo()
  }

  const TipoIcon = leitorAtual ? TIPO_ICON[leitorAtual.leitor.tipo_leitor] ?? UsersIcon : null

  return (
    <div className="max-w-2xl">
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <ScanLine className="w-6 h-6 text-escola-azul" />
        Empréstimo
      </h1>
      <p className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Keyboard className="w-3.5 h-3.5" />
        Funciona todo por teclado: busque o leitor, leia o código de barras ou tombo, aperte Enter para cada exemplar.
      </p>

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {sucesso}
        </div>
      )}
      {avisos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm mb-4 space-y-1">
          {avisos.map((a, i) => <p key={i}>{a}</p>)}
        </div>
      )}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{erro}</div>}

      {!leitorAtual ? (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Leitor</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={buscaRef}
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
              placeholder="Nome, matrícula ou turma..."
              className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>
          {buscando && <p className="text-xs text-gray-400 mt-2">Buscando...</p>}
          {resultados.length > 0 && (
            <div className="mt-3 space-y-1">
              {resultados.map(l => {
                const Icon = TIPO_ICON[l.tipo_leitor] ?? UsersIcon
                return (
                  <button
                    key={l.id}
                    onClick={() => selecionarLeitor(l.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors border border-transparent hover:border-gray-200"
                  >
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{l.nome_completo}</p>
                      <p className="text-xs text-gray-400">{l.turma ? `Turma ${l.turma}` : l.tipo_leitor}{l.matricula ? ` · ${l.matricula}` : ''}</p>
                    </div>
                    {l.situacao !== 'ativo' && (
                      <span className="text-xs font-semibold text-red-600 flex-shrink-0">{l.situacao}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {TipoIcon && (
                  <div className="w-10 h-10 rounded-full bg-escola-azul/10 flex items-center justify-center flex-shrink-0">
                    <TipoIcon className="w-5 h-5 text-escola-azul" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{leitorAtual.leitor.nome_completo}</p>
                  <p className="text-xs text-gray-400">
                    {leitorAtual.leitor.turma ? `Turma ${leitorAtual.leitor.turma}` : leitorAtual.leitor.tipo_leitor}
                    {' · '}{leitorAtual.emprestimosAbertos.length} livro(s) com o leitor agora
                  </p>
                </div>
              </div>
              <button onClick={limparTudo} className="text-xs text-gray-400 hover:text-escola-vermelho flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Trocar leitor
              </button>
            </div>
            {leitorAtual.emprestimosAbertos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {leitorAtual.emprestimosAbertos.map(e => (
                  <p key={e.id} className="text-xs text-gray-500">
                    {e.biblioteca_exemplares?.biblioteca_obras?.titulo} — devolução {new Date(e.data_prevista + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Exemplar (tombo ou código de barras)</label>
            <form onSubmit={lerExemplar} className="flex gap-2">
              <input
                ref={exemplarRef}
                value={codigoExemplar}
                onChange={e => setCodigoExemplar(e.target.value)}
                placeholder="Leia o código ou digite o tombo, e aperte Enter"
                className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-escola-azul transition-colors font-mono"
              />
            </form>

            {carrinho.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {carrinho.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-800">{c.obraTitulo}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.tombo}</p>
                    </div>
                    <button onClick={() => removerDoCarrinho(c.id)} className="text-gray-400 hover:text-escola-vermelho">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Devolução prevista</label>
              {souGestao ? (
                <input
                  type="date"
                  value={dataPrevistaAjustada || previstaCalculada || ''}
                  onChange={e => setDataPrevistaAjustada(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-escola-azul transition-colors"
                />
              ) : (
                <p className="text-sm text-gray-700 font-medium">
                  {previstaCalculada && new Date(previstaCalculada + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}

              <button
                onClick={confirmarEmprestimo}
                disabled={confirmando}
                className="w-full mt-4 bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-escola-azul/90 transition-colors disabled:opacity-50 text-sm"
              >
                {confirmando ? 'Registrando...' : `Confirmar Empréstimo (${carrinho.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
