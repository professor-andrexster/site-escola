import { NextResponse } from 'next/server'
import { papelEAprovacao, aprovar as aprovarPerfil } from '@/lib/db/perfis'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

// Libera o acesso de um cadastro pendente. Professor so pode aprovar aluno,
// nunca outro professor nem a si mesmo; gestao pode aprovar qualquer papel,
// menos a propria conta.
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode aprovar a própria conta.' }, { status: 400 })
  }

  const alvo = await papelEAprovacao(userId)
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  if (auth.role === 'professor' && alvo.role !== 'aluno') {
    return NextResponse.json({ error: 'Professor só pode aprovar cadastro de aluno.' }, { status: 403 })
  }

  try {
    await aprovarPerfil(userId)
  } catch (erro) {
    console.error('[usuarios/aprovar] falha', erro)
    return NextResponse.json({ error: 'Erro ao aprovar o usuário.' }, { status: 400 })
  }

  await registrar({
    acao: auth.role === 'professor' ? 'aluno_aprovado_professor' : 'usuario_aprovado_gestao',
    userId,
    detalhes: { aprovado_por: auth.userId, role: alvo.role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
