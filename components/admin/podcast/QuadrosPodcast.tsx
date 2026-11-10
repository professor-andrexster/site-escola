'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutList, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Quadro } from '@/lib/podcast/tipos'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from './comum'

/**
 * Quadros do podcast: criar, renomear, ordenar, desativar e apagar.
 * Quadro com episódio não se apaga (o histórico perderia o nome): desativa-se,
 * e ele some das opções de quem cria episódio e da página pública.
 */
export default function QuadrosPodcast({ quadros }: { quadros: Quadro[] }) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [ideia, setIdeia] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  async function criar() {
    setErro(''); setAviso('')
    if (nome.trim().length < 3) { setErro('Dê um nome ao quadro (pelo menos 3 letras).'); return }
    setOcupado(true)
    const r = await chamar('/api/podcast/quadros', json('POST', { nome, ideia }))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setAviso(`Quadro "${nome.trim()}" criado. Já aparece para a equipe e na página do podcast.`)
    setNome(''); setIdeia('')
    router.refresh()
  }

  return (
    <>
      <section className="panel p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-5 h-5 text-escola-azul" />
          <h2 className="font-geom text-lg font-bold text-gray-900">Criar um quadro</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Quadro é uma seção fixa do programa. A equipe escolhe o quadro ao começar um episódio, e ele aparece na capa.</p>
        <div className="grid gap-3 md:grid-cols-[16rem_1fr_auto] md:items-end">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Nome do quadro</span>
            <input value={nome} onChange={e => setNome(e.target.value)} maxLength={60} className={CAMPO} placeholder="Ex.: Som da Semana" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">A ideia, em uma frase (aparece para a equipe e no site)</span>
            <input value={ideia} onChange={e => setIdeia(e.target.value)} maxLength={240} className={CAMPO} placeholder="Ex.: Um aluno indica uma música e conta por que ela marcou." />
          </label>
          <button type="button" onClick={criar} disabled={ocupado} className={BOTAO}><Plus className="w-4 h-4" /> {ocupado ? 'Criando…' : 'Criar quadro'}</button>
        </div>
        {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
        {aviso && <p className="text-sm text-green-700 mt-3">{aviso}</p>}
      </section>

      <section className="panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutList className="w-5 h-5 text-escola-azul" />
          <h2 className="font-geom text-lg font-bold text-gray-900">Quadros do programa</h2>
        </div>
        {quadros.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum quadro ainda. Crie o primeiro acima.</p>
        ) : (
          <ul className="space-y-3">
            {quadros.map((q, i) => <LinhaQuadro key={q.id} q={q} primeiro={i === 0} ultimo={i === quadros.length - 1} />)}
          </ul>
        )}
      </section>
    </>
  )
}

function LinhaQuadro({ q, primeiro, ultimo }: { q: Quadro; primeiro: boolean; ultimo: boolean }) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(q.nome)
  const [ideia, setIdeia] = useState(q.ideia ?? '')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmar, setConfirmar] = useState(false)

  async function patch(corpo: Record<string, unknown>, fechar = false) {
    setOcupado(true); setErro('')
    const r = await chamar(`/api/podcast/quadros/${q.id}`, json('PATCH', corpo))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    if (fechar) setEditando(false)
    router.refresh()
  }

  async function apagar() {
    setOcupado(true); setErro('')
    const r = await chamar(`/api/podcast/quadros/${q.id}`, { method: 'DELETE' })
    setOcupado(false)
    setConfirmar(false)
    if (!r.ok) { setErro(r.erro); return }
    router.refresh()
  }

  return (
    <li className={`border rounded-xl p-4 ${q.ativo ? 'border-gray-100' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button type="button" disabled={ocupado || primeiro} onClick={() => patch({ mover: 'cima' })} className="p-1 text-gray-400 hover:text-escola-azul disabled:opacity-30" aria-label={`Subir ${q.nome}`}><ArrowUp className="w-4 h-4" /></button>
          <button type="button" disabled={ocupado || ultimo} onClick={() => patch({ mover: 'baixo' })} className="p-1 text-gray-400 hover:text-escola-azul disabled:opacity-30" aria-label={`Descer ${q.nome}`}><ArrowDown className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 min-w-0">
          {editando ? (
            <div className="grid gap-2">
              <input value={nome} onChange={e => setNome(e.target.value)} maxLength={60} className={CAMPO} aria-label="Nome do quadro" />
              <input value={ideia} onChange={e => setIdeia(e.target.value)} maxLength={240} className={CAMPO} aria-label="Ideia do quadro" placeholder="A ideia, em uma frase" />
              <div className="flex gap-2">
                <button type="button" disabled={ocupado} onClick={() => patch({ nome, ideia }, true)} className={BOTAO_LEVE}>Salvar</button>
                <button type="button" onClick={() => { setEditando(false); setNome(q.nome); setIdeia(q.ideia ?? ''); setErro('') }} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold text-gray-900">
                {q.nome}
                {!q.ativo && <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Desativado</span>}
              </p>
              {q.ideia && <p className="text-sm text-gray-600 mt-0.5">{q.ideia}</p>}
              <p className="text-xs text-gray-400 mt-1">{q.episodios} episódio(s)</p>
            </>
          )}
        </div>
      </div>
      {!editando && (
        <div className="flex flex-wrap items-center gap-1 mt-2 pl-9">
          <button type="button" onClick={() => setEditando(true)} className="text-xs text-gray-500 hover:text-escola-azul inline-flex items-center gap-1 px-2 py-1"><Pencil className="w-3.5 h-3.5" /> Editar</button>
          <button type="button" disabled={ocupado} onClick={() => patch({ ativo: !q.ativo })} className="text-xs text-gray-500 hover:text-escola-azul inline-flex items-center gap-1 px-2 py-1">
            {q.ativo ? <><EyeOff className="w-3.5 h-3.5" /> Desativar</> : <><Eye className="w-3.5 h-3.5" /> Reativar</>}
          </button>
          {q.episodios === 0 && (confirmar ? (
            <span className="text-xs flex items-center gap-2 px-2">
              <span className="text-gray-700">Apagar?</span>
              <button type="button" disabled={ocupado} onClick={apagar} className="font-semibold text-red-600 hover:underline">Sim</button>
              <button type="button" onClick={() => setConfirmar(false)} className="text-gray-500 hover:underline">Não</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmar(true)} className="text-xs text-gray-400 hover:text-red-600 inline-flex items-center gap-1 px-2 py-1"><Trash2 className="w-3.5 h-3.5" /> Apagar</button>
          ))}
        </div>
      )}
      {erro && <p className="text-sm text-red-600 mt-2" role="alert">{erro}</p>}
    </li>
  )
}
