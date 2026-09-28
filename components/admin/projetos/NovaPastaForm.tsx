'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus } from 'lucide-react'

/** Cria a pasta de uma serie que ainda nao tem. Some quando todas ja existem. */
export default function NovaPastaForm({ series }: { series: string[] }) {
  const [serie, setSerie] = useState(series[0] ?? '')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function criar() {
    if (!serie) return
    setOcupado(true)
    setErro('')
    try {
      const res = await fetch('/api/projetos-turma/pastas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serie }),
      })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(dados.error ?? 'Não foi possível criar a pasta.')
        return
      }
      router.push(`/admin/projetos/pasta/${dados.slug}`)
      router.refresh()
    } catch {
      setErro('Sem conexão. Tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <div className="flex items-center gap-2">
        <select
          value={serie}
          onChange={e => setSerie(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          aria-label="Série da nova pasta"
        >
          {series.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={criar}
          disabled={ocupado}
          className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel"
        >
          <FolderPlus className="w-4 h-4" />
          {ocupado ? 'Criando...' : 'Nova pasta'}
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}
