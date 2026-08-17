import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import {
  autorDoCurso,
  avaliadoresConvidados,
  candidatosAAvaliador,
  convidarAvaliador,
} from '@/lib/db/desafio-curso'
import { isGestao } from '@/lib/roles'
import type { Profile } from '@/types/database'

/**
 * Convidar quem avalia o desafio final.
 *
 * Convidar e desconvidar e do AUTOR do curso (e da gestao). Um avaliador
 * convidado corrige, mas nao convida outros — senao a lista cresce sem o dono
 * do curso saber quem esta avaliando o trabalho dos alunos dele.
 */
async function podeGerenciar(cursoId: string, userId: string, role: Profile['role']) {
  return isGestao(role) || (await autorDoCurso(cursoId)) === userId
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  if (!(await podeGerenciar(id, usuario.id, perfil.role))) {
    return NextResponse.json({ error: 'Só o autor do curso gerencia os avaliadores.' }, { status: 403 })
  }

  return NextResponse.json({
    avaliadores: await avaliadoresConvidados(id),
    candidatos: await candidatosAAvaliador(id),
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  if (!(await podeGerenciar(id, usuario.id, perfil.role))) {
    return NextResponse.json({ error: 'Só o autor do curso convida avaliadores.' }, { status: 403 })
  }

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Professor não informado.' }, { status: 400 })

  try {
    await convidarAvaliador(id, userId, usuario.id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Essa pessoa já avalia este curso.' }, { status: 409 })
    }
    console.error('[cursos/:id/avaliadores] falha', erro)
    return NextResponse.json({ error: 'Erro ao convidar.' }, { status: 400 })
  }
}
