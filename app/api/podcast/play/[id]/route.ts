import { NextResponse } from 'next/server'
import { contarPlay } from '@/lib/podcast/dados'

interface Ctx { params: Promise<{ id: string }> }

/**
 * Conta um play do episódio. Público (o site aberto toca os episódios).
 * Um por IP e episódio a cada 30 min, em memória: é contador de audiência da
 * escola, não métrica de faturamento. Reinício do servidor zera a trava.
 */
const vistos = new Map<string, number>()
const JANELA = 30 * 60_000
const TETO = 20_000
let ultimaLimpeza = 0

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 204 })
  const ip = request.headers.get('x-real-ip') ?? 'sem-ip'
  const chave = `${ip}:${id}`
  const agora = Date.now()
  const ultimo = vistos.get(chave)
  if (ultimo && agora - ultimo <= JANELA) return new NextResponse(null, { status: 204 })
  // So entra na memoria o que e episodio publicado de verdade: id inventado nao ocupa espaco.
  if (await contarPlay(id).catch(() => false)) {
    if (agora - ultimaLimpeza > 60_000) {
      ultimaLimpeza = agora
      vistos.forEach((t, k) => { if (agora - t > JANELA) vistos.delete(k) })
    }
    if (vistos.size >= TETO) vistos.clear()
    vistos.set(chave, agora)
  }
  return new NextResponse(null, { status: 204 })
}
