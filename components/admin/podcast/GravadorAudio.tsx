'use client'

import { useEffect, useRef, useState } from 'react'
import { Circle, Download, Pause, Play, Square, Upload } from 'lucide-react'
import { BOTAO, BOTAO_LEVE } from './comum'

interface Props {
  /** Envia o arquivo. Devolve mensagem de erro, ou null quando deu certo. */
  enviar: (arquivo: File) => Promise<string | null>
  desabilitado?: boolean
}

const LIMITE = 25 * 1024 * 1024
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function tipoSuportado(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

/**
 * Grava no navegador (celular ou computador) ou recebe um arquivo pronto.
 *
 * A gravação fica guardada aqui até o servidor confirmar o envio. Se falhar,
 * o botão "Tentar de novo" reenvia a mesma gravação, e "Baixar gravação"
 * salva no aparelho para não perder a entrevista de jeito nenhum.
 */
export default function GravadorAudio({ enviar, desabilitado }: Props) {
  const [estado, setEstado] = useState<'parado' | 'gravando' | 'pausado'>('parado')
  const [segundos, setSegundos] = useState(0)
  const [gravacao, setGravacao] = useState<File | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const rec = useRef<MediaRecorder | null>(null)
  const partes = useRef<Blob[]>([])
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null)
  const podeGravar = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!tipoSuportado()

  useEffect(() => () => { if (relogio.current) clearInterval(relogio.current); rec.current?.stream.getTracks().forEach(t => t.stop()) }, [])
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa) }, [previa])

  // Avisa antes de fechar a aba com gravação não enviada.
  useEffect(() => {
    if (!gravacao && estado === 'parado') return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [gravacao, estado])

  function tic() { relogio.current = setInterval(() => setSegundos(s => s + 1), 1000) }

  async function comecar() {
    setErro(''); setAviso('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      const mime = tipoSuportado()
      const r = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 96000 })
      partes.current = []
      r.ondataavailable = e => { if (e.data.size) partes.current.push(e.data) }
      r.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(partes.current, { type: mime.split(';')[0] })
        const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm'
        const f = new File([blob], `gravacao-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.${ext}`, { type: blob.type })
        setGravacao(f)
        setPrevia(URL.createObjectURL(blob))
        if (f.size > LIMITE) setErro('A gravação passou de 25 MB. Baixe e corte num app de áudio, ou grave em partes menores.')
      }
      r.start(1000)
      rec.current = r
      setSegundos(0)
      setEstado('gravando')
      tic()
    } catch {
      setErro('Não consegui usar o microfone. Libere o acesso ao microfone no navegador e tente de novo.')
    }
  }

  function pausar() { rec.current?.pause(); setEstado('pausado'); if (relogio.current) clearInterval(relogio.current) }
  function continuar() { rec.current?.resume(); setEstado('gravando'); tic() }
  function parar() { rec.current?.stop(); setEstado('parado'); if (relogio.current) clearInterval(relogio.current) }

  async function mandar(f: File) {
    if (f.size > LIMITE) { setErro('O arquivo passa de 25 MB.'); return }
    setEnviando(true); setErro(''); setAviso('')
    const e = await enviar(f)
    setEnviando(false)
    if (e) { setErro(`${e} A gravação continua aqui: tente de novo ou baixe para guardar.`); return }
    setAviso('Áudio salvo no episódio.')
    setGravacao(null)
    setPrevia(null)
  }

  function baixar() {
    if (!gravacao || !previa) return
    const a = document.createElement('a')
    a.href = previa
    a.download = gravacao.name
    a.click()
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      {podeGravar && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {estado === 'parado' && (
            <button type="button" onClick={comecar} disabled={desabilitado || enviando} className={`${BOTAO} bg-red-600 hover:bg-red-700`}>
              <Circle className="w-4 h-4 fill-current" /> {gravacao ? 'Gravar de novo' : 'Gravar agora'}
            </button>
          )}
          {estado === 'gravando' && <button type="button" onClick={pausar} className={BOTAO_LEVE}><Pause className="w-4 h-4" /> Pausar</button>}
          {estado === 'pausado' && <button type="button" onClick={continuar} className={BOTAO_LEVE}><Play className="w-4 h-4" /> Continuar</button>}
          {estado !== 'parado' && <button type="button" onClick={parar} className={BOTAO}><Square className="w-4 h-4" /> Terminar</button>}
          {estado !== 'parado' && (
            <span className="font-mono text-sm text-gray-700 flex items-center gap-2">
              {estado === 'gravando' && <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />}
              {mmss(segundos)}
            </span>
          )}
        </div>
      )}

      {gravacao && previa && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2">Escuta antes de salvar. Se ficou bom, salva no episódio.</p>
          <audio controls src={previa} className="w-full mb-2" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => mandar(gravacao)} disabled={enviando} className={BOTAO}>
              <Upload className="w-4 h-4" /> {enviando ? 'Enviando…' : erro ? 'Tentar de novo' : 'Salvar no episódio'}
            </button>
            <button type="button" onClick={baixar} className={BOTAO_LEVE}><Download className="w-4 h-4" /> Baixar gravação</button>
          </div>
        </div>
      )}

      <label className="block">
        <span className="block text-xs font-semibold text-gray-600 mb-1">
          {podeGravar ? 'Ou suba um arquivo gravado em outro app' : 'Suba o arquivo de áudio'} (MP3, M4A, WEBM, OGG ou WAV, até 25 MB)
        </span>
        <input type="file" accept="audio/*" disabled={desabilitado || enviando}
          onChange={e => { const f = e.target.files?.[0]; if (f) { setGravacao(f); setPrevia(URL.createObjectURL(f)); setErro('') } }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-escola-azul" />
      </label>

      {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
      {aviso && <p className="text-sm text-green-700 mt-3">{aviso}</p>}
    </div>
  )
}
