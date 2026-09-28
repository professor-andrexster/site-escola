'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import TipTapEditor from '@/components/admin/TipTapEditor'
import type { Criterio, Etapa, Trabalho } from '@/lib/projetos-turma-tipos'

interface Props {
  pastas: { id: string; serie: string }[]
  pastaInicial: string
  trabalho?: Trabalho
}

const CAMPO = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'
const CAMPO_MINI = 'border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'

const ETAPA_VAZIA: Etapa = { titulo: '', foco: '', entrega: '', inicio: null, fim: null, aviso: null }
const CRITERIO_VAZIO: Criterio = { titulo: '', descricao: '', peso: 1 }

function mover<T>(lista: T[], i: number, delta: number): T[] {
  const j = i + delta
  if (j < 0 || j >= lista.length) return lista
  const copia = [...lista]
  ;[copia[i], copia[j]] = [copia[j], copia[i]]
  return copia
}

/**
 * Cria ou edita um projeto da pasta. A pasta so se escolhe na criacao: mover
 * um projeto de serie levaria os envios dos alunos junto.
 *
 * Cronograma e criterios sao listas editadas aqui e gravadas inteiras:
 * mudar as datas e trocar os campos "de" e "ate" de cada etapa.
 */
export default function TrabalhoForm({ pastas, pastaInicial, trabalho }: Props) {
  const [pastaId, setPastaId] = useState(pastaInicial)
  const [titulo, setTitulo] = useState(trabalho?.titulo ?? '')
  const [resumo, setResumo] = useState(trabalho?.resumo ?? '')
  const [arquivoUrl, setArquivoUrl] = useState(trabalho?.arquivoUrl ?? '')
  const [briefing, setBriefing] = useState(trabalho?.briefing ?? '')
  const [cronograma, setCronograma] = useState<Etapa[]>(trabalho?.cronograma ?? [])
  const [criterios, setCriterios] = useState<Criterio[]>(trabalho?.criterios ?? [])
  const [pedeLinkGrupo, setPedeLinkGrupo] = useState(trabalho?.pedeLinkGrupo ?? false)
  const [publicado, setPublicado] = useState(trabalho?.publicado ?? false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const editando = Boolean(trabalho)

  function etapa(i: number, campo: keyof Etapa, valor: string) {
    setCronograma(prev => prev.map((e, idx) => idx === i ? { ...e, [campo]: valor === '' && (campo === 'inicio' || campo === 'fim' || campo === 'aviso') ? null : valor } : e))
  }
  function criterio(i: number, campo: keyof Criterio, valor: string) {
    setCriterios(prev => prev.map((c, idx) => idx === i ? { ...c, [campo]: campo === 'peso' ? Math.max(1, Math.min(10, Number(valor) || 1)) : valor } : c))
  }

  async function salvar() {
    if (!titulo.trim()) { setErro('Dê um título ao projeto.'); return }
    if (!editando && !pastaId) { setErro('Escolha a pasta.'); return }
    setOcupado(true)
    setErro('')
    try {
      const corpo = {
        titulo, resumo, arquivoUrl, briefing, publicado, pedeLinkGrupo,
        cronograma: cronograma.filter(e => e.titulo.trim()),
        criterios: criterios.filter(c => c.titulo.trim()),
        ...(editando ? {} : { pastaId }),
      }
      const res = await fetch(editando ? `/api/projetos-turma/trabalhos/${trabalho!.id}` : '/api/projetos-turma/trabalhos', {
        method: editando ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(dados.error ?? 'Não foi possível salvar. O que você escreveu continua aqui.')
        return
      }
      router.push(`/admin/projetos/${dados.trabalho.id}`)
      router.refresh()
    } catch {
      setErro('Sem conexão. O que você escreveu continua aqui, tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  async function apagar() {
    if (!trabalho) return
    if (!window.confirm(`Apagar o projeto "${trabalho.titulo}"? Só funciona se nenhum aluno enviou nada.`)) return
    setOcupado(true)
    setErro('')
    try {
      const res = await fetch(`/api/projetos-turma/trabalhos/${trabalho.id}`, { method: 'DELETE' })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(dados.error ?? 'Não foi possível apagar.')
        return
      }
      router.push('/admin/projetos')
      router.refresh()
    } catch {
      setErro('Sem conexão. Tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6 space-y-5">
        {!editando && (
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1">Pasta (série)</span>
            <select value={pastaId} onChange={e => setPastaId(e.target.value)} className={CAMPO}>
              {pastas.map(p => <option key={p.id} value={p.id}>{p.serie}</option>)}
            </select>
          </label>
        )}

        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Título</span>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} className={CAMPO} placeholder="Ex.: Meu Portfólio Digital" />
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Resumo <span className="text-gray-400 font-normal">(uma frase, aparece no card)</span></span>
          <input value={resumo} onChange={e => setResumo(e.target.value)} maxLength={300} className={CAMPO} />
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-gray-700 mb-1">Link do PDF do trabalho <span className="text-gray-400 font-normal">(opcional)</span></span>
          <input value={arquivoUrl} onChange={e => setArquivoUrl(e.target.value)} maxLength={300} className={CAMPO} placeholder="https://..." />
          <span className="block text-xs text-gray-400 mt-1">Arquivo em /arquivos/projetos-turma/ no servidor, ou qualquer link público.</span>
        </label>

        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1">Briefing <span className="text-gray-400 font-normal">(o que o aluno lê na página do projeto)</span></span>
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <TipTapEditor content={briefing} onChange={setBriefing} />
          </div>
        </div>
      </div>

      {/* Cronograma */}
      <div className="panel p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Cronograma</h2>
            <p className="text-xs text-gray-500">Uma linha por etapa. As datas são opcionais: deixe em branco e preencha quando marcar a semana.</p>
          </div>
          <button type="button" onClick={() => setCronograma(prev => [...prev, { ...ETAPA_VAZIA }])}
            className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul transition-colors foco-painel">
            <Plus className="w-4 h-4" /> Etapa
          </button>
        </div>
        {cronograma.length === 0 && <p className="text-sm text-gray-400">Sem etapas. Clique em "Etapa" para começar.</p>}
        <ol className="space-y-3">
          {cronograma.map((e, i) => (
            <li key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                <input value={e.titulo} onChange={ev => etapa(i, 'titulo', ev.target.value)} maxLength={120} placeholder="Título da etapa (ex.: Semana 03 · Home completa)" className={`${CAMPO} flex-1`} />
                <button type="button" onClick={() => setCronograma(prev => mover(prev, i, -1))} title="Subir" className="p-1.5 text-gray-400 hover:text-gray-700 foco-painel"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCronograma(prev => mover(prev, i, 1))} title="Descer" className="p-1.5 text-gray-400 hover:text-gray-700 foco-painel"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCronograma(prev => prev.filter((_, idx) => idx !== i))} title="Remover" className="p-1.5 text-gray-400 hover:text-red-600 foco-painel"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                <input value={e.foco} onChange={ev => etapa(i, 'foco', ev.target.value)} maxLength={300} placeholder="Foco da etapa" className={CAMPO} />
                <input value={e.entrega} onChange={ev => etapa(i, 'entrega', ev.target.value)} maxLength={300} placeholder="Você termina a etapa com..." className={CAMPO} />
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-7 text-sm text-gray-600">
                <label className="inline-flex items-center gap-1.5">De <input type="date" value={e.inicio ?? ''} onChange={ev => etapa(i, 'inicio', ev.target.value)} className={CAMPO_MINI} /></label>
                <label className="inline-flex items-center gap-1.5">até <input type="date" value={e.fim ?? ''} onChange={ev => etapa(i, 'fim', ev.target.value)} className={CAMPO_MINI} /></label>
                <input value={e.aviso ?? ''} onChange={ev => etapa(i, 'aviso', ev.target.value)} maxLength={200} placeholder="Aviso (ex.: 12/10 é feriado, a semana perde um dia)" className={`${CAMPO} flex-1 min-w-[12rem]`} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Criterios */}
      <div className="panel p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Critérios de avaliação</h2>
            <p className="text-xs text-gray-500">Na correção, cada critério recebe OK, Parcial ou Falta; a nota sugerida sai do peso de cada um.</p>
          </div>
          <button type="button" onClick={() => setCriterios(prev => [...prev, { ...CRITERIO_VAZIO }])}
            className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul transition-colors foco-painel">
            <Plus className="w-4 h-4" /> Critério
          </button>
        </div>
        {criterios.length === 0 && <p className="text-sm text-gray-400">Sem critérios. Sem eles a avaliação é só status, nota e comentário.</p>}
        <ol className="space-y-2">
          {criterios.map((c, i) => (
            <li key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                <input value={c.titulo} onChange={ev => criterio(i, 'titulo', ev.target.value)} maxLength={140} placeholder="Critério (ex.: Captura de leads)" className={`${CAMPO} flex-1`} />
                <label className="inline-flex items-center gap-1.5 text-sm text-gray-600">Peso
                  <input type="number" min={1} max={10} value={c.peso} onChange={ev => criterio(i, 'peso', ev.target.value)} className={`${CAMPO_MINI} w-16`} />
                </label>
                <button type="button" onClick={() => setCriterios(prev => mover(prev, i, -1))} title="Subir" className="p-1.5 text-gray-400 hover:text-gray-700 foco-painel"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCriterios(prev => mover(prev, i, 1))} title="Descer" className="p-1.5 text-gray-400 hover:text-gray-700 foco-painel"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCriterios(prev => prev.filter((_, idx) => idx !== i))} title="Remover" className="p-1.5 text-gray-400 hover:text-red-600 foco-painel"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input value={c.descricao} onChange={ev => criterio(i, 'descricao', ev.target.value)} maxLength={400} placeholder="O que o professor observa" className={`${CAMPO} ml-7 w-[calc(100%-1.75rem)]`} />
            </li>
          ))}
        </ol>
      </div>

      <div className="panel p-6 space-y-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={pedeLinkGrupo} onChange={e => setPedeLinkGrupo(e.target.checked)} className="rounded border-gray-300" />
          Pedir também o link do projeto em grupo (além do site individual)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={publicado} onChange={e => setPublicado(e.target.checked)} className="rounded border-gray-300" />
          Publicado (os alunos da série veem e podem enviar o link)
        </label>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          {editando ? (
            <button onClick={apagar} disabled={ocupado} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 foco-painel">
              <Trash2 className="w-4 h-4" />
              Apagar
            </button>
          ) : <span />}
          <button onClick={salvar} disabled={ocupado} className="bg-escola-azul text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel">
            {ocupado ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </div>
    </div>
  )
}
