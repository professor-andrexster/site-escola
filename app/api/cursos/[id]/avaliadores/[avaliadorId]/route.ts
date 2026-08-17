import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { autorDoCurso, removerAvaliador } from '@/lib/db/desafio-curso'
import { isGestao } from '@/lib/roles'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; avaliadorId: string }> }
) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id, avaliadorId } = await params
  if (!isGestao(perfil.role) && (await autorDoCurso(id)) !== usuario.id) {
    return NextResponse.json({ error: 'Só o autor do curso remove avaliadores.' }, { status: 403 })
  }

  try {
    await removerAvaliador(avaliadorId)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[cursos/:id/avaliadores/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover.' }, { status: 400 })
  }
}
