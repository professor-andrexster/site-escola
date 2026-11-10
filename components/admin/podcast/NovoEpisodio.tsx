'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Newspaper, Plus } from 'lucide-react'
import { QUADROS } from '@/lib/podcast/tipos'
import { BOTAO, CAMPO, chamar, json } from './comum'

/** Começar um episódio: título, se é entrevista ou matéria, e o quadro. */
export default function NovoEpisodio({ podeAudio = true }: { podeAudio?: boolean }) {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<'entrevista' | 'materia'>(podeAudio ? 'entrevista' : 'materia')
  const [quadro, setQuadro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const ideia = QUADROS.find(q => q.chave === quadro)?.ideia

  async function criar() {
    setErro('')
    if (titulo.trim().length < 4) { setErro('Dê um título (dá para mudar depois).'); return }
    setOcupado(true)
    const r = await chamar('/api/podcast/episodios', json('POST', { titulo, tipo, quadro: quadro || null }))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    router.push(`/admin/podcast/episodio/${r.dados.id}`)
  }

  return (
    <section className="panel p-6 mb-6">
      <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Começar um episódio</h2>
      <p className="text-sm text-gray-500 mb-4">Escolhe o formato, dá um nome provisório e pronto. O resto você preenche na próxima tela.</p>
      <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
        {([
          ['entrevista', 'Entrevista', 'Tem áudio. Você conversa com alguém.', Mic],
          ['materia', 'Matéria', 'Texto para o JBInforma. Áudio é opcional.', Newspaper],
        ] as const).filter(([valor]) => podeAudio || valor === 'materia').map(([valor, rotulo, desc, Icone]) => (
          <button key={valor} type="button" onClick={() => setTipo(valor)}
            className={`text-left rounded-xl border p-3 transition-colors ${tipo === valor ? 'border-escola-azul bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <Icone className="w-5 h-5 text-escola-azul mb-1" />
            <p className="font-semibold text-sm text-gray-900">{rotulo}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Título</span>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} className={CAMPO} placeholder="Ex.: A merendeira que cozinha há 20 anos para a escola" />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Quadro (opcional)</span>
          <select value={quadro} onChange={e => setQuadro(e.target.value)} className={CAMPO}>
            <option value="">Sem quadro</option>
            {QUADROS.map(q => <option key={q.chave} value={q.chave}>{q.nome}</option>)}
          </select>
        </label>
      </div>
      {ideia && <p className="text-xs text-gray-500 mt-2">{ideia}</p>}
      {!podeAudio && <p className="text-xs text-gray-500 mt-2">Gravação de áudio ainda não liberada para você: por enquanto, matéria escrita.</p>}
      <button type="button" onClick={criar} disabled={ocupado} className={`${BOTAO} mt-4`}>
        <Plus className="w-4 h-4" /> {ocupado ? 'Criando…' : 'Criar e continuar'}
      </button>
      {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
    </section>
  )
}
