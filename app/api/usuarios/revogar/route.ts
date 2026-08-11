import { NextResponse } from 'next/server'
import { papelEAprovacao, revogar as revogarPerfil } from '@/lib/db/perfis'
import { exigirGestao } from '@/lib/apiGestao'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

// Tira o acesso de alguem que ja estava aprovado, sem apagar a conta. So
// gestao pode fazer isso, diferente de aprovar, que professor tambem pode
// fazer quando o alvo e aluno.
export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode revogar o próprio acesso.' }, { status: 400 })
  }

  const alvo = await papelEAprovacao(userId)
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  try {
    await revogarPerfil(userId)
  } catch (erro) {
    console.error('[usuarios/revogar] falha', erro)
    return NextResponse.json({ error: 'Erro ao revogar o acesso.' }, { status: 400 })
  }

  await registrar({
    acao: 'usuario_revogado_gestao',
    userId,
    detalhes: { revogado_por: auth.userId, role: alvo.role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
