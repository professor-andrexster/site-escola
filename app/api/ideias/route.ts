import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { criarIdeia } from '@/lib/db/comunidade'

/**
 * Publica uma ideia no mural. Aberto a qualquer conta aprovada — o mural e da
 * escola inteira — mas o autor sai da sessao: a tela mandava `autor_id`, e
 * mandar o de outra pessoa publicava no nome dela.
 */
export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const b = (await request.json()) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  if (!titulo) return NextResponse.json({ error: 'Dê um título pra ideia.' }, { status: 400 })

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

  try {
    const ideia = await criarIdeia({
      autorId: usuario.id,
      titulo,
      dor: texto(b.dor),
      lacuna: texto(b.lacuna),
      inovacao: texto(b.inovacao),
      trilhaId: typeof b.trilha_id === 'string' && b.trilha_id ? b.trilha_id : null,
    })
    return NextResponse.json({ ideia })
  } catch (erro) {
    console.error('[ideias] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao publicar a ideia.' }, { status: 400 })
  }
}
