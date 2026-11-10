'use client'

import { useEffect, useRef, useState } from 'react'
import { ListMusic, Pause, Play, Radio, SkipBack, SkipForward } from 'lucide-react'

interface Faixa { id: string; titulo: string; quadroNome: string | null; audioUrl: string }

/**
 * Modo rádio: toca todos os episódios em sequência e recomeça no fim.
 * Feito para deixar rodando na rádio da escola no intervalo.
 */
export default function RadioPodcast({ faixas }: { faixas: Faixa[] }) {
  const [i, setI] = useState(0)
  const [tocando, setTocando] = useState(false)
  const [ligado, setLigado] = useState(false)
  const [listaAberta, setListaAberta] = useState(false)
  const [erro, setErro] = useState('')
  const audio = useRef<HTMLAudioElement>(null)
  const contados = useRef(new Set<string>())
  const atual = faixas[i]

  // Trocou de faixa com a rádio ligada: toca.
  useEffect(() => {
    if (!ligado || !audio.current) return
    audio.current.play().catch(() => setErro('O navegador bloqueou o som. Toque em Tocar de novo.'))
  }, [i, ligado])

  if (faixas.length === 0) return null

  const ir = (n: number) => { setErro(''); setI((n + faixas.length) % faixas.length) }

  function alternar() {
    setErro('')
    if (!ligado) { setLigado(true); return }
    if (!audio.current) return
    if (audio.current.paused) audio.current.play().catch(() => setErro('O navegador bloqueou o som. Toque em Tocar de novo.'))
    else audio.current.pause()
  }

  return (
    <section className="bg-escola-marinho text-white rounded-2xl p-5 md:p-6 mb-12" aria-label="Modo rádio">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Radio className={`w-8 h-8 flex-shrink-0 ${tocando ? 'text-escola-vermelho-claro animate-pulse' : 'text-white/70'}`} />
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Modo rádio · {faixas.length} episódio{faixas.length > 1 ? 's' : ''} em sequência</p>
            <p className="font-playfair font-bold text-lg truncate">{ligado ? atual.titulo : 'Toque e deixe rodando'}</p>
            {ligado && <p className="text-xs text-white/60 truncate">{[atual.quadroNome, `${i + 1} de ${faixas.length}`].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => ir(i - 1)} disabled={!ligado || faixas.length < 2} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30" aria-label="Episódio anterior"><SkipBack className="w-4 h-4" /></button>
          <button type="button" onClick={alternar} className="inline-flex items-center gap-2 bg-escola-vermelho hover:bg-escola-vermelho-escuro px-5 py-2.5 rounded-full font-semibold text-sm">
            {tocando ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> {ligado ? 'Tocar' : 'Ligar a rádio'}</>}
          </button>
          <button type="button" onClick={() => ir(i + 1)} disabled={!ligado || faixas.length < 2} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30" aria-label="Próximo episódio"><SkipForward className="w-4 h-4" /></button>
          <button type="button" onClick={() => setListaAberta(v => !v)} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20" aria-label="Ver a fila" aria-expanded={listaAberta}><ListMusic className="w-4 h-4" /></button>
        </div>
      </div>

      {ligado && (
        <audio
          ref={audio}
          src={atual.audioUrl}
          controls
          preload="auto"
          className="w-full mt-4"
          onPlay={() => {
            setTocando(true)
            if (!contados.current.has(atual.id)) {
              contados.current.add(atual.id)
              fetch(`/api/podcast/play/${atual.id}`, { method: 'POST', keepalive: true }).catch(() => {})
            }
          }}
          onPause={() => setTocando(false)}
          onEnded={() => ir(i + 1)}
          onError={() => { setErro('Este episódio não carregou. Pulando para o próximo.'); if (faixas.length > 1) setTimeout(() => ir(i + 1), 1500) }}
        />
      )}
      {erro && <p className="text-sm text-amber-200 mt-2" role="alert">{erro}</p>}

      {listaAberta && (
        <ol className="mt-4 border-t border-white/10 pt-3 space-y-1 max-h-64 overflow-y-auto">
          {faixas.map((f, n) => (
            <li key={f.id}>
              <button type="button" onClick={() => { setLigado(true); ir(n) }} className={`w-full text-left text-sm px-3 py-2 rounded-lg flex gap-3 ${n === i && ligado ? 'bg-white/15' : 'hover:bg-white/10'}`}>
                <span className="font-mono text-white/50 w-5 flex-shrink-0">{n + 1}</span>
                <span className="truncate">{f.titulo}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
