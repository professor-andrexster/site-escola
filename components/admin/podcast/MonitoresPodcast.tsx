'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import type { Membro } from '@/lib/podcast/tipos'
import { BOTAO, CAMPO, chamar, json } from './comum'

interface Props {
  monitores: Membro[]
  professores: { id: string; nome_completo: string; disciplina: string | null }[]
}

/** Direção escolhe quais professores cuidam do podcast. */
export default function MonitoresPodcast({ monitores, professores }: Props) {
  const [escolhido, setEscolhido] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const router = useRouter()

  async function adicionar() {
    if (!escolhido) return
    setOcupado(true); setErro('')
    const r = await chamar('/api/podcast/monitores', json('POST', { userId: escolhido }))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setEscolhido('')
    router.refresh()
  }

  async function remover(id: string) {
    setOcupado(true); setErro('')
    const r = await chamar(`/api/podcast/membros/${id}`, { method: 'DELETE' })
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setConfirmando(null)
    router.refresh()
  }

  return (
    <section className="panel p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-escola-azul" />
        <h2 className="font-geom text-lg font-bold text-gray-900">Monitores do podcast</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Professores que montam a equipe, conferem as autorizações e aprovam o que vai ao ar.</p>

      {monitores.length > 0 ? (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg mb-4">
          {monitores.map(m => (
            <li key={m.id} className="flex items-center gap-3 p-3">
              <span className="flex-1 text-sm font-semibold text-gray-900">{m.nome}</span>
              {confirmando === m.id ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Tirar da monitoria?</span>
                  <button type="button" disabled={ocupado} onClick={() => remover(m.id)} className="font-semibold text-red-600 hover:underline">Sim</button>
                  <button type="button" onClick={() => setConfirmando(null)} className="text-gray-500 hover:underline">Não</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmando(m.id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label={`Tirar ${m.nome}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">Nenhum monitor ainda. Escolha pelo menos um professor para o podcast começar.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select value={escolhido} onChange={e => setEscolhido(e.target.value)} className={CAMPO}>
          <option value="">Escolha um professor…</option>
          {professores.map(p => (
            <option key={p.id} value={p.id}>{p.nome_completo}{p.disciplina ? ` · ${p.disciplina}` : ''}</option>
          ))}
        </select>
        <button type="button" onClick={adicionar} disabled={ocupado || !escolhido} className={`${BOTAO} flex-shrink-0`}>
          <UserPlus className="w-4 h-4" /> Tornar monitor
        </button>
      </div>
      {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
    </section>
  )
}
