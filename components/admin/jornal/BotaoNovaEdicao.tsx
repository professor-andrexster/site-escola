'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { BOTAO, chamar } from '@/components/admin/podcast/comum'

export default function BotaoNovaEdicao() {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  async function abrir() {
    setErro(''); setOcupado(true)
    const r = await chamar('/api/jornal/edicoes', { method: 'POST' })
    if (!r.ok) { setOcupado(false); setErro(r.erro); return }
    router.push(`/admin/jornal/edicao/${r.dados.id}`)
  }
  return (
    <div>
      <button type="button" onClick={abrir} disabled={ocupado} className={BOTAO}><Plus className="w-4 h-4" /> {ocupado ? 'Abrindo…' : 'Abrir edição desta semana'}</button>
      {erro && <p className="text-sm text-red-600 mt-2" role="alert">{erro}</p>}
    </div>
  )
}
