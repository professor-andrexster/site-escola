'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Captions, Eye, EyeOff, RefreshCw, Save, Sparkles } from 'lucide-react'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from './comum'

interface Props {
  episodioId: string
  publicado: boolean
  temAudio: boolean
  status: 'gerando' | 'pronta' | 'erro' | null
  erroIa: string | null
  texto: string | null
  publica: boolean
}

/**
 * Transcrição do áudio (só monitor). A automática roda em segundo plano e só
 * em episódio publicado; o texto fica escondido até o monitor revisar e ligar
 * "mostrar no site". Também dá para escrever ou colar à mão.
 */
export default function TranscricaoEpisodio({ episodioId, publicado, temAudio, status, erroIa, texto, publica }: Props) {
  const router = useRouter()
  const [valor, setValor] = useState(texto ?? '')
  const [sujo, setSujo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  // Texto novo do servidor (a IA terminou): entra, a não ser que o monitor esteja no meio de uma edição.
  useEffect(() => { if (!sujo) setValor(texto ?? '') }, [texto, sujo])

  // Enquanto gera, confere a cada 6 s.
  useEffect(() => {
    if (status !== 'gerando') return
    const t = setInterval(() => router.refresh(), 6000)
    return () => clearInterval(t)
  }, [status, router])

  const url = `/api/podcast/episodios/${episodioId}/transcricao`

  async function gerar() {
    setOcupado(true); setErro(''); setAviso('')
    const r = await chamar(url, { method: 'POST' })
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setAviso('Pedido enviado. Leva de 1 a 3 minutos; esta tela atualiza sozinha.')
    router.refresh()
  }

  async function salvar(extra: { publica?: boolean } = {}) {
    setOcupado(true); setErro(''); setAviso('')
    const r = await chamar(url, json('PUT', { ...(sujo ? { texto: valor } : {}), ...extra }))
    setOcupado(false)
    if (!r.ok) { setErro(`${r.erro}${sujo ? ' O texto continua aqui.' : ''}`); return }
    setSujo(false)
    setAviso(extra.publica === true ? 'A transcrição agora aparece na página do episódio.' : extra.publica === false ? 'A transcrição saiu do site.' : 'Transcrição salva.')
    router.refresh()
  }

  return (
    <section className="panel p-6 space-y-3">
      <h2 className="font-geom text-lg font-bold text-gray-900 flex items-center gap-2"><Captions className="w-5 h-5 text-escola-azul" /> Transcrição</h2>
      <p className="text-sm text-gray-500">Texto do que foi dito no áudio, para quem não pode ouvir. Só aparece no site depois que você revisar e ligar.</p>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={gerar} disabled={ocupado || status === 'gerando' || !publicado || !temAudio} className={BOTAO_LEVE}>
          {status === 'gerando' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Gerando…</> : <><Sparkles className="w-4 h-4" /> {texto ? 'Gerar de novo com IA' : 'Gerar com IA'}</>}
        </button>
        {!publicado && <span className="text-xs text-gray-500">A IA só transcreve episódio já publicado. Antes disso, escreva ou cole à mão.</span>}
        {publicado && !temAudio && <span className="text-xs text-gray-500">Sem áudio para transcrever.</span>}
        {publica
          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-800">Aparece no site</span>
          : texto ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Escondida</span> : null}
      </div>
      {status === 'erro' && erroIa && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{erroIa}</p>}

      <textarea value={valor} onChange={e => { setValor(e.target.value); setSujo(true); setAviso('') }} rows={10} className={CAMPO}
        placeholder="A transcrição aparece aqui. Leia ouvindo o áudio e corrija nomes e trechos errados antes de mostrar no site." />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => salvar()} disabled={ocupado || !sujo} className={BOTAO_LEVE}><Save className="w-4 h-4" /> {sujo ? 'Salvar texto' : 'Salvo'}</button>
        {publica ? (
          <button type="button" onClick={() => salvar({ publica: false })} disabled={ocupado} className={BOTAO_LEVE}><EyeOff className="w-4 h-4" /> Esconder do site</button>
        ) : (
          <button type="button" onClick={() => salvar({ publica: true })} disabled={ocupado || !valor.trim()} className={BOTAO}><Eye className="w-4 h-4" /> Revisei, mostrar no site</button>
        )}
      </div>
      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}
      {aviso && <p className="text-sm text-green-700">{aviso}</p>}
    </section>
  )
}
