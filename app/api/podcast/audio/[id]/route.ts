import { NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { usuarioAtual } from '@/lib/auth/sessao'
import { acessoDe, audioDoEpisodio } from '@/lib/podcast/dados'
import { caminhoPrivado, mimeDoAudio } from '@/lib/podcast/arquivos'

interface Ctx { params: Promise<{ id: string }> }

/**
 * Audio do episodio, da pasta privada.
 *
 * Publicado: qualquer pessoa ouve (e o site publico). Fora do ar: so a equipe
 * do episodio e o monitor. Sem cache publico de proposito: revogar a
 * autorizacao ou tirar do ar corta o acesso no proximo play.
 * Aceita Range, que o player usa para avancar e para o iPhone tocar.
 */
export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params
  const ep = await audioDoEpisodio(id)
  if (!ep?.audio_url) return new NextResponse('Não encontrado.', { status: 404 })

  if (ep.status !== 'publicado') {
    const u = await usuarioAtual()
    const a = u ? await acessoDe(u.id) : null
    const daEquipe = a && (a.moderador || ep.autor_id === a.userId || ep.podcast_participantes.some(p => p.user_id === a.userId))
    if (!daEquipe) return new NextResponse('Não encontrado.', { status: 404 })
  }

  const abs = caminhoPrivado(ep.audio_url)
  if (!abs) return new NextResponse('Não encontrado.', { status: 404 })
  let tamanho: number
  try {
    tamanho = (await stat(abs)).size
  } catch {
    return new NextResponse('Não encontrado.', { status: 404 })
  }

  const base = {
    'Content-Type': mimeDoAudio(ep.audio_url),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }

  const range = request.headers.get('range')
  const m = range?.match(/^bytes=(\d*)-(\d*)$/)
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
