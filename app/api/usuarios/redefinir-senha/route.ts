import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirDirecao } from '@/lib/apiDirecao'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

// Senha temporária fácil de ditar e digitar (sem caracteres ambíguos como 0/O, 1/l)
function gerarSenhaTemporaria(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let senha = 'jb'
  for (let i = 0; i < 6; i++) senha += chars[Math.floor(Math.random() * chars.length)]
  return senha
}

export async function POST(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const body = await request.json()
  const { userId } = body as { userId?: string }
  if (!userId) {
    return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const senha = gerarSenhaTemporaria()

  const { error } = await admin.auth.admin.updateUserById(userId, { password: senha })
  if (error) {
    return NextResponse.json({ error: 'Erro ao redefinir a senha: ' + error.message }, { status: 400 })
  }

  await registrarAtividade(admin, {
    acao: 'senha_redefinida_admin',
    userId,
    detalhes: { redefinida_por: auth.userId },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true, senha })
}
