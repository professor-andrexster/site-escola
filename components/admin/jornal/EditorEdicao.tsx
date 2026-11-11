'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ExternalLink, FileDown, Plus, X } from 'lucide-react'
import type { Edicao } from '@/lib/jornal/tipos'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from '@/components/admin/podcast/comum'

type Candidata = { id: string; titulo: string; tipo: string; data: string }

/** Monta a edição da semana: escolhe e ordena as matérias, escreve o recado e liga o Giro JB. */
export default function EditorEdicao({ inicial, candidatas, episodios }: { inicial: Edicao; candidatas: Candidata[]; episodios: { id: string; titulo: string }[] }) {
  const router = useRouter()
  const [e, setE] = useState(inicial)
  const [sujo, setSujo] = useState(false)
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const mudar = (p: Partial<Edicao>) => { setE(a => ({ ...a, ...p })); setSujo(true); setAviso('') }
  const titulo = (id: string) => candidatas.find(c => c.id === id)?.titulo ?? '(matéria fora do ar)'
  const mover = (i: number, d: -1 | 1) => {
    const l = [...e.materias]
    const j = i + d
    if (j < 0 || j >= l.length) return
    ;[l[i], l[j]] = [l[j], l[i]]
    mudar({ materias: l })
  }

  async function enviar(acao?: 'publicar' | 'recolher') {
    setErro(''); setAviso(''); setOcupado(acao ?? 'salvar')
    const campos = { titulo: e.titulo, inicio: e.inicio, fim: e.fim, carta: e.carta, materias: e.materias, episodioId: e.episodioId }
    const r = await chamar(`/api/jornal/edicoes/${e.id}`, json('PATCH', { campos, ...(acao ? { acao } : {}) }))
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return }
    setSujo(false)
    if (acao) setE(a => ({ ...a, status: acao === 'publicar' ? 'publicada' : 'rascunho' }))
    setAviso(acao === 'publicar' ? 'Edição publicada. O PDF já pode ser impresso.' : acao === 'recolher' ? 'Edição recolhida.' : 'Salvo.')
    router.refresh()
  }

  async function apagar() {
    if (!window.confirm('Apagar esta edição em rascunho?')) return
    const r = await chamar(`/api/jornal/edicoes/${e.id}`, { method: 'DELETE' })
    if (!r.ok) { setErro(r.erro); return }
    router.push('/admin/jornal?aba=edicoes')
    router.refresh()
  }

  const fora = candidatas.filter(c => !e.materias.includes(c.id))

  return (
    <div className="space-y-6">
      <section className="panel p-6 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2"><span className="block text-xs font-semibold text-gray-600 mb-1">Título da edição</span>
          <input value={e.titulo} onChange={x => mudar({ titulo: x.target.value })} maxLength={140} className={CAMPO} /></label>
        <label className="block"><span className="block text-xs font-semibold text-gray-600 mb-1">Semana: de</span>
          <input type="date" value={e.inicio} onChange={x => mudar({ inicio: x.target.value })} className={CAMPO} /></label>
        <label className="block"><span className="block text-xs font-semibold text-gray-600 mb-1">até</span>
          <input type="date" value={e.fim} onChange={x => mudar({ fim: x.target.value })} className={CAMPO} /></label>
        <label className="block md:col-span-2"><span className="block text-xs font-semibold text-gray-600 mb-1">Recado da redação (opcional)</span>
          <textarea value={e.carta ?? ''} onChange={x => mudar({ carta: x.target.value })} maxLength={1200} rows={3} className={CAMPO} placeholder="Duas ou três frases: o que marcou a semana, o que vem na próxima." /></label>
        <label className="block md:col-span-2"><span className="block text-xs font-semibold text-gray-600 mb-1">Giro JB em áudio (opcional)</span>
          <select value={e.episodioId ?? ''} onChange={x => mudar({ episodioId: x.target.value || null })} className={CAMPO}>
            <option value="">Sem áudio nesta edição</option>
            {episodios.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
          <span className="block text-xs text-gray-500 mt-1">Escolha o episódio do podcast que resume a semana. Ele aparece com o botão de ouvir na página da edição.</span></label>
      </section>

      <section className="panel p-6">
        <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Matérias da edição</h2>
        <p className="text-xs text-gray-500 mb-3">A primeira é a manchete. Mínimo de 3 para publicar, máximo de 12. No papel cabem bem até 7.</p>
        {e.materias.length === 0 ? <p className="text-sm text-gray-500">Nenhuma matéria escolhida ainda.</p> : (
          <ol className="space-y-2">
            {e.materias.map((id, i) => (
              <li key={id} className="flex items-center gap-2 border border-gray-100 rounded-lg p-2">
                <span className="w-6 text-center text-xs font-bold text-gray-500">{i + 1}</span>
                <span className="flex-1 min-w-0 text-sm text-gray-900 truncate">{titulo(id)}{i === 0 && <span className="ml-2 text-xs font-semibold text-escola-vermelho">manchete</span>}</span>
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === e.materias.length - 1} aria-label="Descer" className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => mudar({ materias: e.materias.filter(x => x !== id) })} aria-label="Tirar da edição" className="p-1.5 text-gray-500 hover:text-red-600"><X className="w-4 h-4" /></button>
              </li>
            ))}
          </ol>
        )}
        {fora.length > 0 && e.materias.length < 12 && (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-2">No ar e fora desta edição</h3>
            <ul className="space-y-1.5">
              {fora.slice(0, 30).map(c => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <button type="button" onClick={() => mudar({ materias: [...e.materias, c.id] })} aria-label={`Incluir ${c.titulo}`} className="p-1.5 rounded border border-gray-200 text-escola-azul hover:border-escola-azul"><Plus className="w-4 h-4" /></button>
                  <span className="flex-1 min-w-0 truncate text-gray-800">{c.titulo}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{new Date(c.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => enviar()} disabled={!!ocupado} className={BOTAO_LEVE}>{ocupado === 'salvar' ? 'Salvando…' : sujo ? 'Salvar' : 'Salvo'}</button>
        {e.status === 'rascunho'
          ? <button type="button" onClick={() => enviar('publicar')} disabled={!!ocupado || e.materias.length < 3} className={`${BOTAO} !bg-green-700 hover:!bg-green-800`}>{ocupado === 'publicar' ? 'Publicando…' : 'Publicar edição'}</button>
          : <button type="button" onClick={() => enviar('recolher')} disabled={!!ocupado} className={BOTAO_LEVE}>Recolher edição</button>}
        {e.status === 'publicada' && !sujo && (
          <>
            <a href={`/noticias/edicao/${e.numero}/pdf`} target="_blank" rel="noreferrer" className={BOTAO}><FileDown className="w-4 h-4" /> PDF para imprimir</a>
            <a href={`/noticias/edicao/${e.numero}`} target="_blank" rel="noreferrer" className={BOTAO_LEVE}>Ver no site <ExternalLink className="w-4 h-4" /></a>
          </>
        )}
        {e.status === 'rascunho' && <button type="button" onClick={apagar} className="ml-auto text-sm text-red-700 hover:underline">Apagar edição</button>}
      </div>
      <div aria-live="polite">
        {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}
        {aviso && <p className="text-sm text-green-700">{aviso}</p>}
      </div>
    </div>
  )
}
