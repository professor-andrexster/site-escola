import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { alternarVoto } from '@/lib/db/comunidade'

/** Vota ou tira o voto. Quem vota e a sessao, nao o id que a tela mandar. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  try {
    const votei = await alternarVoto(id, usuario.id)
    return NextResponse.json({ votei })
  } catch (erro) {
    console.error('[ideias/:id/votos] falha', erro)
    return NextResponse.json({ error: 'Erro ao registrar o voto.' }, { status: 400 })
  }
}
