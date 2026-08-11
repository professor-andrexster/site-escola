import { NextResponse } from 'next/server'
import { papelEAprovacao, remover as removerPerfil } from '@/lib/db/perfis'
import { removerConta } from '@/lib/auth/sessao'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'

// Remove a conta por completo (auth.users + profiles). Antes o "Rejeitar" da
// tela de usuários deletava só o profile e deixava a conta órfã no auth,
// travando o email/CPF para sempre.
//
// Professor tambem pode chamar esta rota, mas so para rejeitar um cadastro de
// aluno ainda pendente (a mesma restricao da rota de aprovar). Gestao pode
// remover qualquer conta, aprovada ou nao.
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode remover a própria conta.' }, { status: 400 })
  }

  if (auth.role === 'professor') {
    const alvo = await papelEAprovacao(userId)
    if (!alvo || alvo.role !== 'aluno' || alvo.aprovado) {
      return NextResponse.json({ error: 'Professor só pode rejeitar cadastro de aluno ainda pendente.' }, { status: 403 })
    }
  }

  // identidades cai em cascata com a conta; profiles removemos explicitamente.
  // Conferido no MariaDB: identidades.user_id e profiles.id tem ON DELETE
  // CASCADE para usuarios, entao o comportamento se mantem depois da virada.
  try {
    await removerPerfil(userId)
    await removerConta(userId)
  } catch (erro) {
    console.error('[usuarios/remover] falha', erro)
    return NextResponse.json({ error: 'Erro ao remover o usuário.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
