'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, BadgeCheck, CalendarClock, Newspaper, Plus } from 'lucide-react'
import { ROTULO_TIPO, type TipoMateria } from '@/lib/jornal/tipos'
import { BOTAO, CAMPO, chamar, json } from '@/components/admin/podcast/comum'

const ICONE = { materia: Newspaper, checagem: BadgeCheck, memoria: Archive, servico: CalendarClock } as const

/** Começar uma matéria: escolhe o formato, dá um título provisório e segue para a redação. */
export default function NovaMateria() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<TipoMateria>('materia')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  async function criar() {
    setErro('')
    if (titulo.trim().length < 4) { setErro('Dê um título (dá para mudar depois).'); return }
    setOcupado(true)
    const r = await chamar('/api/jornal/materias', json('POST', { titulo, tipo }))
    if (!r.ok) { setOcupado(false); setErro(r.erro); return }
    router.push(`/admin/jornal/materia/${r.dados.id}`)
  }

  return (
    <section className="panel p-6 mb-6">
      <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Começar uma matéria</h2>
      <p className="text-sm text-gray-500 mb-4">Escolha o formato e dê um nome provisório. O resto você preenche na próxima tela.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {(Object.keys(ROTULO_TIPO) as TipoMateria[]).map(t => {
          const Icone = ICONE[t]
          return (
            <button key={t} type="button" onClick={() => setTipo(t)} aria-pressed={tipo === t}
              className={`text-left rounded-xl border p-3 transition-colors ${tipo === t ? 'border-escola-azul bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <Icone className="w-5 h-5 text-escola-azul mb-1" />
              <p className="font-semibold text-sm text-gray-900">{ROTULO_TIPO[t].nome}</p>
              <p className="text-xs text-gray-500">{ROTULO_TIPO[t].desc}</p>
            </button>
          )
        })}
      </div>
      <label className="block max-w-2xl">
        <span className="block text-xs font-semibold text-gray-600 mb-1">Título</span>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} className={CAMPO}
          placeholder={tipo === 'checagem' ? 'Ex.: É verdade que a matrícula de 2027 já fechou?' : 'Ex.: Feira do bairro muda de rua e comerciantes reclamam'} />
      </label>
      <button type="button" onClick={criar} disabled={ocupado} className={`${BOTAO} mt-4`}>
        <Plus className="w-4 h-4" /> {ocupado ? 'Criando…' : 'Criar e continuar'}
      </button>
      {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
    </section>
  )
}
