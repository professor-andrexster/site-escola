'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Heart, MessageCircle } from 'lucide-react'
import type { Ideia, Trilha } from '@/types/database'
import { trilhaBgLight, trilhaText } from '@/lib/trilhaColors'

type PerfilResumo = { nome_completo: string; turma: string | null }
type TrilhaResumo = { nome: string; icone: string | null; cor_tailwind: string | null }

export type IdeiaComExtras = Ideia & {
  autor: PerfilResumo | PerfilResumo[] | null
  trilha: TrilhaResumo | TrilhaResumo[] | null
  votos: number
  votei: boolean
}

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

const FORM_VAZIO = { titulo: '', dor: '', lacuna: '', inovacao: '', trilha_id: '' }

export default function IdeiasBoard({
  ideiasIniciais, trilhas, profileId, podeModerar,
}: {
  ideiasIniciais: IdeiaComExtras[]
  trilhas: Trilha[]
  profileId: string
  podeModerar: boolean
}) {
  const [ideias, setIdeias] = useState(ideiasIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [filtro, setFiltro] = useState<'todas' | Ideia['status']>('todas')
  const supabase = createClient()

  const ideiasFiltradas = filtro === 'todas' ? ideias : ideias.filter((i) => i.status === filtro)

  async function criar() {
    if (!form.titulo.trim()) {
      setErro('Dê um título pra ideia.')
      return
    }
    setSaving(true)
    setErro('')
    const payload = {
      autor_id: profileId,
      titulo: form.titulo.trim(),
      dor: form.dor.trim() || null,
      lacuna: form.lacuna.trim() || null,
      inovacao: form.inovacao.trim() || null,
      trilha_id: form.trilha_id || null,
    }
    const { data, error } = await supabase
      .from('ideias')
      .insert(payload)
      .select('*, autor:profiles(nome_completo, turma), trilha:trilhas(nome, icone, cor_tailwind)')
      .single()

    if (error || !data) {
      setErro('Erro ao publicar: ' + error?.message)
      setSaving(false)
      return
    }
    setIdeias((prev) => [{ ...(data as Ideia & { autor: PerfilResumo | null; trilha: TrilhaResumo | null }), votos: 0, votei: false }, ...prev])
    setSaving(false)
    setModalAberto(false)
    setForm(FORM_VAZIO)
  }

  async function votar(ideiaId: string, votei: boolean) {
    setIdeias((prev) => prev.map((i) => i.id === ideiaId ? { ...i, votei: !votei, votos: i.votos + (votei ? -1 : 1) } : i))
    if (votei) {
      await supabase.from('ideia_votos').delete().eq('ideia_id', ideiaId).eq('profile_id', profileId)
    } else {
      await supabase.from('ideia_votos').insert({ ideia_id: ideiaId, profile_id: profileId })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {(['todas', 'nova', 'em_analise', 'adotada', 'arquivada'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filtro === s ? 'bg-escola-azul text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'todas' ? 'Todas' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(FORM_VAZIO); setErro(''); setModalAberto(true) }}
          className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Ideia
        </button>
      </div>

      {ideiasFiltradas.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">Nenhuma ideia por aqui ainda. Que tal ser o primeiro?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideiasFiltradas.map((ideia) => {
            const trilha = one(ideia.trilha)
            const autor = one(ideia.autor)
            return (
              <div key={ideia.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASS[ideia.status]}`}>
                    {STATUS_LABEL[ideia.status]}
                  </span>
                  {trilha && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${trilhaBgLight(trilha.cor_tailwind)} ${trilhaText(trilha.cor_tailwind)}`}>
                      {trilha.icone} {trilha.nome}
                    </span>
                  )}
                </div>

                <Link href={`/admin/ideias/${ideia.id}`} className="font-semibold text-gray-900 text-sm hover:text-escola-azul transition-colors">
                  {ideia.titulo}
                </Link>
                {ideia.dor && <p className="text-xs text-gray-400 line-clamp-2">{ideia.dor}</p>}

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">
                    {autor?.nome_completo ?? 'Aluno'}{autor?.turma ? ` · ${autor.turma}` : ''}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/ideias/${ideia.id}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-escola-azul text-xs">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => votar(ideia.id, ideia.votei)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${ideia.votei ? 'text-escola-vermelho' : 'text-gray-400 hover:text-escola-vermelho'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${ideia.votei ? 'fill-escola-vermelho' : ''}`} />
                      {ideia.votos}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-lg font-bold text-gray-900">Nova Ideia</h2>
              <div role="button" tabIndex={0} onClick={() => setModalAberto(false)} onKeyDown={(e) => { if (e.key === 'Enter') setModalAberto(false) }} className="p-1 cursor-pointer text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </div>
            </div>

            {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-3">{erro}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
                <input type="text" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Em poucas palavras, qual é a ideia?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dor</label>
                <textarea value={form.dor} onChange={(e) => setForm((p) => ({ ...p, dor: e.target.value }))} rows={2}
                  placeholder="Qual problema real incomoda antes de qualquer solução existir?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lacuna</label>
                <textarea value={form.lacuna} onChange={(e) => setForm((p) => ({ ...p, lacuna: e.target.value }))} rows={2}
                  placeholder="O que falta hoje, ou o que existe mas é ruim/caro demais?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Inovação</label>
                <textarea value={form.inovacao} onChange={(e) => setForm((p) => ({ ...p, inovacao: e.target.value }))} rows={2}
                  placeholder="O que você faria diferente de qualquer coisa que já existe?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trilha (opcional)</label>
                <select value={form.trilha_id} onChange={(e) => setForm((p) => ({ ...p, trilha_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30">
                  <option value="">Sem trilha</option>
                  {trilhas.map((t) => <option key={t.id} value={t.id}>{t.icone} {t.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <div role="button" tabIndex={0} onClick={() => !saving && criar()} onKeyDown={(e) => { if (e.key === 'Enter' && !saving) criar() }}
                className={`flex-1 text-center bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-escola-azul/90 transition-colors ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
                {saving ? 'Publicando...' : 'Publicar Ideia'}
              </div>
              <div role="button" tabIndex={0} onClick={() => setModalAberto(false)} onKeyDown={(e) => { if (e.key === 'Enter') setModalAberto(false) }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </div>
            </div>
          </div>
        </div>
      )}

      {podeModerar && <p className="text-[11px] text-gray-400 mt-4">Como professor(a)/direção, mude o status de uma ideia abrindo os detalhes dela.</p>}
    </div>
  )
}
