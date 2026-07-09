'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Send } from 'lucide-react'
import type { Ideia, IdeiaComentario } from '@/types/database'
import { trilhaBgLight, trilhaText } from '@/lib/trilhaColors'

type PerfilResumo = { nome_completo: string; turma?: string | null; role?: string }
type TrilhaResumo = { nome: string; icone: string | null; cor_tailwind: string | null }
type ComentarioComAutor = IdeiaComentario & { autor: PerfilResumo | PerfilResumo[] | null }

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? v[0] ?? null : v
}

const STATUS_LABEL: Record<Ideia['status'], string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  adotada: 'Adotada',
  arquivada: 'Arquivada',
}
const STATUS_CLASS: Record<Ideia['status'], string> = {
  nova: 'bg-gray-100 text-gray-600',
  em_analise: 'bg-yellow-50 text-yellow-700',
  adotada: 'bg-green-50 text-green-700',
  arquivada: 'bg-red-50 text-red-500',
}

export default function IdeiaDetail({
  ideia, comentariosIniciais, votos, votei, profileId, podeModerar,
}: {
  ideia: Ideia & { autor: PerfilResumo | PerfilResumo[] | null; trilha: TrilhaResumo | TrilhaResumo[] | null }
  comentariosIniciais: ComentarioComAutor[]
  votos: number
  votei: boolean
  profileId: string
  podeModerar: boolean
}) {
  const [status, setStatus] = useState(ideia.status)
  const [votoState, setVotoState] = useState({ votos, votei })
  const [comentarios, setComentarios] = useState(comentariosIniciais)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const supabase = createClient()

  const autor = one(ideia.autor)
  const trilha = one(ideia.trilha)

  async function votar() {
    setVotoState((s) => ({ votos: s.votos + (s.votei ? -1 : 1), votei: !s.votei }))
    if (votoState.votei) {
      await supabase.from('ideia_votos').delete().eq('ideia_id', ideia.id).eq('profile_id', profileId)
    } else {
      await supabase.from('ideia_votos').insert({ ideia_id: ideia.id, profile_id: profileId })
    }
  }

  async function mudarStatus(novo: Ideia['status']) {
    setStatus(novo)
    await supabase.from('ideias').update({ status: novo }).eq('id', ideia.id)
  }

  async function comentar() {
    if (!texto.trim()) return
    setEnviando(true)
    const { data, error } = await supabase
      .from('ideia_comentarios')
      .insert({ ideia_id: ideia.id, autor_id: profileId, corpo: texto.trim() })
      .select('*, autor:profiles(nome_completo, role)')
      .single()
    if (!error && data) {
      setComentarios((prev) => [...prev, data as ComentarioComAutor])
      setTexto('')
    }
    setEnviando(false)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {podeModerar ? (
              <select
                value={status}
                onChange={(e) => mudarStatus(e.target.value as Ideia['status'])}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_CLASS[status]}`}
              >
                {(Object.keys(STATUS_LABEL) as Ideia['status'][]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            ) : (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
            )}
            {trilha && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${trilhaBgLight(trilha.cor_tailwind)} ${trilhaText(trilha.cor_tailwind)}`}>
                {trilha.icone} {trilha.nome}
              </span>
            )}
          </div>
          <button
            onClick={votar}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
              votoState.votei ? 'border-escola-vermelho text-escola-vermelho bg-red-50' : 'border-gray-200 text-gray-500 hover:border-escola-vermelho hover:text-escola-vermelho'
            }`}
          >
            <Heart className={`w-4 h-4 ${votoState.votei ? 'fill-escola-vermelho' : ''}`} />
            {votoState.votos}
          </button>
        </div>

        <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1">{ideia.titulo}</h1>
        <p className="text-xs text-gray-400 mb-5">
          por {autor?.nome_completo ?? 'Aluno'}{autor?.turma ? ` · ${autor.turma}` : ''}
        </p>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Dor</p>
            <p className="text-gray-700">{ideia.dor || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Lacuna</p>
            <p className="text-gray-700">{ideia.lacuna || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Inovação</p>
            <p className="text-gray-700">{ideia.inovacao || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Comentários ({comentarios.length})</h2>
        <div className="space-y-3 mb-4">
          {comentarios.length === 0 && <p className="text-sm text-gray-400">Nenhum comentário ainda.</p>}
          {comentarios.map((c) => {
            const cAutor = one(c.autor)
            return (
              <div key={c.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-gray-700">
                  {cAutor?.nome_completo ?? 'Alguém'}
                  {cAutor?.role && cAutor.role !== 'aluno' && <span className="text-gray-400 font-normal"> · {cAutor.role}</span>}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">{c.corpo}</p>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') comentar() }}
            placeholder="Escreva um comentário..."
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
          <button
            onClick={comentar}
            disabled={enviando || !texto.trim()}
            className="px-3.5 py-2.5 bg-escola-azul text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
