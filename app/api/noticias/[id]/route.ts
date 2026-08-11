import { NextResponse } from 'next/server'
import { exigirMonitorOrAbove } from '@/lib/apiGestao'
import {
  alternarPublicado,
  atualizar,
  autorDaNoticia,
  definirDestaque,
  registrarLog,
  remover,
} from '@/lib/db/noticias'
import { buscarPorId as buscarPerfil } from '@/lib/db/perfis'
import { isGestao } from '@/lib/roles'
import { lerCorpoDeNoticia } from '../corpo'

type Ctx = { params: Promise<{ id: string }> }

/**
 * Monitor so mexe no que escreveu — no Supabase era policy de RLS, aqui e esta
 * checagem. Sem ela, o monitor teria acesso a toda a redacao pela API mesmo
 * com a tela dele listando so as proprias materias.
 */
async function permitido(id: string, userId: string, role: string) {
  const noticia = await autorDaNoticia(id)
  if (!noticia) return { erro: 'Notícia não encontrada.', status: 404 as const }
  if (role === 'monitor' && noticia.autor_id !== userId) {
    return { erro: 'Você só pode alterar as suas notícias.', status: 403 as const }
  }
  return { noticia }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirMonitorOrAbove()
  if (!auth.ok) return auth.res
  const { id } = await params

  const dono = await permitido(id, auth.userId, auth.role)
  if ('erro' in dono) return NextResponse.json({ error: dono.erro }, { status: dono.status })

  const body = (await request.json()) as Record<string, unknown>
  const perfil = await buscarPerfil(auth.userId)
  const autor = { id: auth.userId, nome: perfil?.nome_completo ?? '' }

  // Os dois atalhos da listagem: publicar e destacar, um campo cada.
  if (Object.keys(body).length === 1 && typeof body.publicado === 'boolean') {
    await alternarPublicado(id, body.publicado)
    await registrarLog({
      noticiaId: id, titulo: dono.noticia.titulo, autor,
      acao: body.publicado ? 'publicou' : 'tirou do ar',
    })
    return NextResponse.json({ ok: true })
  }

  if (Object.keys(body).length === 1 && typeof body.destaque_home === 'boolean') {
    if (!isGestao(auth.role)) {
      return NextResponse.json({ error: 'Apenas a direção define o destaque.' }, { status: 403 })
    }
    await definirDestaque(id, body.destaque_home)
    await registrarLog({
      noticiaId: id, titulo: dono.noticia.titulo, autor,
      acao: body.destaque_home ? 'colocou em destaque' : 'removeu destaque',
    })
    return NextResponse.json({ ok: true })
  }

  const corpo = lerCorpoDeNoticia(body)
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })
  // Destacar continua sendo da direcao, tambem quando vem junto do formulario.
  const dados = isGestao(auth.role) ? corpo.dados : { ...corpo.dados, destaque_home: false }

  try {
    await atualizar(id, dados, autor, dados.publicado ? 'publicou' : 'editou')
    return NextResponse.json({ ok: true })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma notícia com esse slug.' }, { status: 409 })
    }
    console.error('[noticias/:id] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao salvar a notícia.' }, { status: 400 })
  }
}

/** Apagar e da gestao — a tela ja escondia o botao, agora o servidor recusa. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirMonitorOrAbove()
  if (!auth.ok) return auth.res
  if (!isGestao(auth.role)) {
    return NextResponse.json({ error: 'Apenas a direção remove notícias.' }, { status: 403 })
  }
  const { id } = await params

  const noticia = await autorDaNoticia(id)
  if (!noticia) return NextResponse.json({ error: 'Notícia não encontrada.' }, { status: 404 })

  const perfil = await buscarPerfil(auth.userId)
  try {
    // O log fica: a FK e ON DELETE SET NULL, entao a linha sobrevive a noticia
    // com o titulo preservado.
    await registrarLog({
      noticiaId: id, titulo: noticia.titulo,
      autor: { id: auth.userId, nome: perfil?.nome_completo ?? '' },
      acao: 'deletou',
    })
    await remover(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[noticias/:id] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover a notícia.' }, { status: 400 })
  }
}
