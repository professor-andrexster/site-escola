'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { Correcao } from '@/lib/jornal/tipos'
import { BOTAO_LEVE, CAMPO, chamar, json } from '@/components/admin/podcast/comum'

/** Erramos: correção pública de matéria que já foi ao ar. Só monitor e direção. */
export default function CorrecoesMateria({ noticiaId, correcoes }: { noticiaId: string; correcoes: Correcao[] }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function publicar() {
    setErro(''); setOcupado(true)
    const r = await chamar(`/api/jornal/materias/${noticiaId}/correcoes`, json('POST', { texto }))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setTexto('')
    router.refresh()
  }

  async function apagar(id: string) {
    if (!window.confirm('Apagar esta correção do site?')) return
    const r = await chamar(`/api/jornal/correcoes/${id}`, { method: 'DELETE' })
    if (!r.ok) { setErro(r.erro); return }
    router.refresh()
  }

  return (
    <section className="panel p-6">
      <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Erramos</h2>
      <p className="text-xs text-gray-500 mb-3">Errou um nome, uma data, um número? Corrija o texto acima e conte aqui o que mudou. A nota aparece na matéria e na página Erramos.</p>
      {correcoes.length > 0 && (
        <ul className="space-y-2 mb-4">
          {correcoes.map(c => (
            <li key={c.id} className="flex items-start gap-2 text-sm text-gray-800 border border-gray-100 rounded-lg p-3">
              <span className="flex-1"><span className="block text-xs text-gray-500">{new Date(c.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>{c.texto}</span>
              <button type="button" onClick={() => apagar(c.id)} aria-label="Apagar correção" className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <textarea value={texto} onChange={e => setTexto(e.target.value)} maxLength={1000} rows={2} className={CAMPO} placeholder="Ex.: A primeira versão dizia que a feira era no sábado. O certo é domingo. O texto foi corrigido." />
      <button type="button" onClick={publicar} disabled={ocupado || texto.trim().length < 15} className={`${BOTAO_LEVE} mt-2`}>{ocupado ? 'Publicando…' : 'Publicar correção'}</button>
      {erro && <p className="text-sm text-red-600 mt-2" role="alert">{erro}</p>}
    </section>
  )
}
