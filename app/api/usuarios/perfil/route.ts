import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao, buscarPorId, atualizarPerfil } from '@/lib/db/perfis'
import { isGestao } from '@/lib/roles'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

type CorpoPerfil = {
  userId?: string
  nomeCompleto?: string
  avatarUrl?: string | null
  disciplina?: string | null
  turma?: string | null
}

// Qualquer pessoa aprovada edita o proprio nome, foto, disciplina ou turma.
// Editar o perfil de outra pessoa (userId diferente do proprio) e so gestao.
export async function POST(request: Request) {
  const user = await usuarioAtual()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfilChamador = await papelEAprovacao(user.id)
  if (!perfilChamador?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const body = (await request.json()) as CorpoPerfil
  const alvoId = body.userId || user.id

  if (alvoId !== user.id && !isGestao(perfilChamador.role)) {
    return NextResponse.json({ error: 'Você só pode editar o próprio perfil.' }, { status: 403 })
  }

  if (body.nomeCompleto !== undefined && !body.nomeCompleto.trim()) {
    return NextResponse.json({ error: 'O nome não pode ficar vazio.' }, { status: 400 })
  }

  const anterior = await buscarPorId(alvoId)
  if (!anterior) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const dados: Parameters<typeof atualizarPerfil>[1] = {}
  if (body.nomeCompleto !== undefined) dados.nome_completo = body.nomeCompleto.trim()
  if (body.avatarUrl !== undefined) dados.avatar_url = body.avatarUrl || null
  if (body.disciplina !== undefined) dados.disciplina = body.disciplina?.trim() || null
  if (body.turma !== undefined) dados.turma = body.turma?.trim() || null

  let perfil
  try {
    perfil = await atualizarPerfil(alvoId, dados)
  } catch (erro) {
    console.error('[usuarios/perfil] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o perfil.' }, { status: 400 })
  }

  await registrar({
    acao: 'perfil_atualizado',
    userId: alvoId,
    detalhes: { editado_por: user.id, proprio: alvoId === user.id },
    ip: ipDoRequest(request),
  })

  return NextResponse.json({ perfil })
}
