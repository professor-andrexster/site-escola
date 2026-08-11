import { NextResponse } from 'next/server'
import { exigirMonitorOrAbove } from '@/lib/apiGestao'
import { criar } from '@/lib/db/noticias'
import { buscarPorId as buscarPerfil } from '@/lib/db/perfis'
import { lerCorpoDeNoticia } from './corpo'

export async function POST(request: Request) {
  const auth = await exigirMonitorOrAbove()
  if (!auth.ok) return auth.res

  const corpo = lerCorpoDeNoticia(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  const perfil = await buscarPerfil(auth.userId)
  const autor = { id: auth.userId, nome: perfil?.nome_completo ?? '' }

  try {
    const n = await criar(
      corpo.dados,
      autor,
      corpo.dados.publicado ? 'criou e publicou' : 'criou rascunho'
    )
    return NextResponse.json({ id: n.id })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma notícia com esse slug.' }, { status: 409 })
    }
    console.error('[noticias] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar a notícia.' }, { status: 400 })
  }
}
