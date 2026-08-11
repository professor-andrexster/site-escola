import { NextResponse } from 'next/server'
import { encerrarSessao, usuarioAtual } from '@/lib/auth/sessao'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

/** Sai da conta: revoga a sessao no banco e limpa o cookie. */
export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  await encerrarSessao()
  if (usuario) {
    await registrar({ acao: 'logout', userId: usuario.id, ip: ipDoRequest(request) })
  }
  return NextResponse.json({ ok: true })
}
