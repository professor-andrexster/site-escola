import { NextResponse } from 'next/server'
import { definirSenha } from '@/lib/auth/sessao'
import { exigirGestao } from '@/lib/apiGestao'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

// Senha temporária fácil de ditar e digitar (sem caracteres ambíguos como 0/O, 1/l)
function gerarSenhaTemporaria(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let senha = 'jb'
  for (let i = 0; i < 6; i++) senha += chars[Math.floor(Math.random() * chars.length)]
  return senha
}

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = await request.json()
  const { userId } = body as { userId?: string }
  if (!userId) {
    return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  }

  const senha = gerarSenhaTemporaria()
  try {
    await definirSenha(userId, senha)
  } catch (erro) {
    console.error('[usuarios/redefinir-senha] falha', erro)
    return NextResponse.json({ error: 'Erro ao redefinir a senha.' }, { status: 400 })
  }

  await registrar({
    acao: 'senha_redefinida_admin',
    userId,
    detalhes: { redefinida_por: auth.userId },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true, senha })
}
