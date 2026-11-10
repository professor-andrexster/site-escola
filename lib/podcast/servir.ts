import { NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { usuarioAtual } from '@/lib/auth/sessao'
import { acessoDe, audioDoEpisodio } from '@/lib/podcast/dados'
import { caminhoPrivado, mimeDoAudio, mimeDoDocumento } from '@/lib/podcast/arquivos'

/**
 * Entrega audio ou capa de um episodio, da pasta privada.
 *
 * Publicado: qualquer pessoa abre (e o site publico). Fora do ar: so a equipe
 * do episodio e o monitor. Sem cache publico de proposito: revogar a
 * autorizacao ou tirar do ar corta o acesso no proximo pedido.
 * Aceita Range, que o player usa para avancar e para o iPhone tocar.
 * O id pode vir com extensao ("<uuid>.mp3"): agregadores de podcast gostam.
 */
export async function servirDoEpisodio(request: Request, idBruto: string, qual: 'audio' | 'capa') {
  const nao = () => new NextResponse('Não encontrado.', { status: 404 })
  const id = idBruto.replace(/\.[a-z0-9]{2,5}$/i, '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) return nao()
  const ep = await audioDoEpisodio(id)
  const relativo = qual === 'audio' ? ep?.audio_url : ep?.capa
  if (!ep || !relativo) return nao()

  if (ep.status !== 'publicado') {
    const u = await usuarioAtual()
    const a = u ? await acessoDe(u.id) : null
    const daEquipe = a && (a.moderador || ep.autor_id === a.userId || ep.podcast_participantes.some(p => p.user_id === a.userId))
    if (!daEquipe) return nao()
  }

  const abs = caminhoPrivado(relativo)
  if (!abs) return nao()
  let tamanho: number
  try {
    tamanho = (await stat(abs)).size
  } catch {
    return nao()
  }

  const base = {
    'Content-Type': qual === 'audio' ? mimeDoAudio(relativo) : mimeDoDocumento(relativo),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }

  const m = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/)
  if (m && (m[1] || m[2])) {
    let inicio = m[1] ? Number(m[1]) : tamanho - Number(m[2])
    let fim = m[1] && m[2] ? Number(m[2]) : tamanho - 1
    inicio = Math.max(0, inicio)
    fim = Math.min(fim, tamanho - 1)
    if (inicio > fim || inicio >= tamanho) {
      return new NextResponse(null, { status: 416, headers: { ...base, 'Content-Range': `bytes */${tamanho}` } })
    }
    const stream = Readable.toWeb(createReadStream(abs, { start: inicio, end: fim })) as ReadableStream
    return new NextResponse(stream, {
      status: 206,
      headers: { ...base, 'Content-Range': `bytes ${inicio}-${fim}/${tamanho}`, 'Content-Length': String(fim - inicio + 1) },
    })
  }
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream
  return new NextResponse(stream, { headers: { ...base, 'Content-Length': String(tamanho) } })
}
