'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import TipTapEditor from '@/components/admin/TipTapEditor'
import type { Trabalho } from '@/lib/projetos-turma-tipos'

interface Props {
  pastas: { id: string; serie: string }[]
  pastaInicial: string
  trabalho?: Trabalho
}

const CAMPO = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'

/**
 * Cria ou edita um projeto da pasta. A pasta so se escolhe na criacao: mover
 * um projeto de serie levaria os envios dos alunos junto.
 */
export default function TrabalhoForm({ pastas, pastaInicial, trabalho }: Props) {
  const [pastaId, setPastaId] = useState(pastaInicial)
  const [titulo, setTitulo] = useState(trabalho?.titulo ?? '')
  const [resumo, setResumo] = useState(trabalho?.resumo ?? '')
  const [arquivoUrl, setArquivoUrl] = useState(trabalho?.arquivoUrl ?? '')
  const [briefing, setBriefing] = useState(trabalho?.briefing ?? '')
  const [publicado, setPublicado] = useState(trabalho?.publicado ?? false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const editando = Boolean(trabalho)

  async function salvar() {
    if (!titulo.trim()) { setErro('Dê um título ao projeto.'); return }
    if (!editando && !pastaId) { setErro('Escolha a pasta.'); return }
    setOcupado(true)
    setErro('')
    try {
      const corpo = { titulo, resumo, arquivoUrl, briefing, publicado, ...(editando ? {} : { pastaId }) }
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
  )
}
