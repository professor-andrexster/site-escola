import { NextResponse } from 'next/server'
import { papelEAprovacao, alterarPapel } from '@/lib/db/perfis'
import { exigirGestao } from '@/lib/apiGestao'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'
import type { Profile } from '@/types/database'

const ROLES_VALIDOS: Profile['role'][] = ['aluno', 'monitor', 'professor', 'bibliotecario', 'diretora', 'vice_diretora', 'admin']

// Troca o nivel de acesso de um usuario. So gestao pode fazer isso.
export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { userId, role } = (await request.json()) as { userId?: string; role?: Profile['role'] }
  if (!userId || !role) return NextResponse.json({ error: 'Preencha os dados necessários.' }, { status: 400 })
  if (!ROLES_VALIDOS.includes(role)) return NextResponse.json({ error: 'Nível de acesso inválido.' }, { status: 400 })

  const alvo = await papelEAprovacao(userId)
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  try {
    await alterarPapel(userId, role)
  } catch (erro) {
    console.error('[usuarios/papel] falha', erro)
    return NextResponse.json({ error: 'Erro ao alterar o papel.' }, { status: 400 })
  }

  await registrar({
    acao: 'papel_alterado',
    userId,
    detalhes: { alterado_por: auth.userId, de: alvo.role, para: role },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ ok: true })
}
