import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { comentarNaIdeia } from '@/lib/db/comunidade'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  const { corpo } = (await request.json()) as { corpo?: string }
  if (!corpo?.trim()) return NextResponse.json({ error: 'Escreva o comentário.' }, { status: 400 })

  try {
    const comentario = await comentarNaIdeia(id, usuario.id, corpo.trim())
    return NextResponse.json({ comentario })
  } catch (erro) {
    console.error('[ideias/:id/comentarios] falha', erro)
    return NextResponse.json({ error: 'Erro ao comentar.' }, { status: 400 })
  }
}
