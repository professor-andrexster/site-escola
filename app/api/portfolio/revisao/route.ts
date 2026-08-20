import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { isGestao } from '@/lib/roles'

/**
 * Aprovar ou devolver um projeto do portfólio.
 *
 * Aprovar publica no site aberto, com o nome da escola e o do aluno — por isso
 * só professor e gestão. Devolver não apaga nada: volta para o aluno com o
 * motivo escrito, e ele corrige e reenvia.
 */
export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  const podeRevisar =
    !!perfil?.aprovado && (perfil.role === 'professor' || isGestao(perfil.role))
  if (!podeRevisar) {
    return NextResponse.json({ erro: 'Sem permissão para revisar.' }, { status: 403 })
  }

  const corpo = await request.json().catch(() => null)
  const id = corpo?.id ? String(corpo.id) : null
  const acao = corpo?.acao === 'devolver' ? 'devolver' : corpo?.acao === 'aprovar' ? 'aprovar' : null
  if (!id || !acao) return NextResponse.json({ erro: 'Projeto ou ação não informados.' }, { status: 400 })

  const motivo = String(corpo?.motivo ?? '').trim()
  // Devolver sem dizer o porquê deixa o aluno adivinhando qual é o problema —
  // e ele reenvia igual, o que gasta o tempo dos dois.
  if (acao === 'devolver' && motivo.length < 5) {
    return NextResponse.json({ erro: 'Escreva o que precisa ser corrigido.' }, { status: 400 })
  }

  const alvo = await prisma.projetos.findUnique({ where: { id }, select: { id: true } })
  if (!alvo) return NextResponse.json({ erro: 'Projeto não encontrado.' }, { status: 404 })

  await prisma.projetos.update({
    where: { id: alvo.id },
    data: {
      status: acao === 'aprovar' ? 'aprovado' : 'recusado',
      motivo_recusa: acao === 'devolver' ? motivo.slice(0, 1000) : null,
      revisado_por: usuario.id,
      revisado_em: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
