import { NextResponse } from 'next/server'
import { buscarObra, atualizarObra, substituirAutores } from '@/lib/db/biblioteca'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'

type CorpoObra = {
  titulo?: string
  subtitulo?: string | null
  anoPublicacao?: number | null
  edicao?: string | null
  isbn?: string | null
  idioma?: string
  numeroPaginas?: number | null
  sinopse?: string | null
  palavrasChave?: string[]
  publicoIndicado?: string | null
  areaConhecimento?: string | null
  classificacaoCatalogacao?: string | null
  capaUrl?: string | null
  observacoesInternas?: string | null
  editoraId?: string | null
  categoriaId?: string | null
  autorIds?: string[]
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { id } = await params
  const body = (await request.json()) as CorpoObra
  if (!body.titulo?.trim()) {
    return NextResponse.json({ error: 'Informe o título da obra.' }, { status: 400 })
  }

  const anterior = await buscarObra(id)
  if (!anterior) return NextResponse.json({ error: 'Obra não encontrada.' }, { status: 404 })

  let obra
  try {
    obra = await atualizarObra(id, {
      titulo: body.titulo.trim(),
      subtitulo: body.subtitulo?.trim() || null,
      ano_publicacao: body.anoPublicacao ?? null,
      edicao: body.edicao?.trim() || null,
      isbn: body.isbn?.trim() || null,
      idioma: body.idioma?.trim() || 'Português',
      numero_paginas: body.numeroPaginas ?? null,
      sinopse: body.sinopse?.trim() || null,
      palavrasChave: body.palavrasChave ?? [],
      publico_indicado: body.publicoIndicado?.trim() || null,
      area_conhecimento: body.areaConhecimento?.trim() || null,
      classificacao_catalogacao: body.classificacaoCatalogacao?.trim() || null,
      capa_url: body.capaUrl || null,
      observacoes_internas: body.observacoesInternas?.trim() || null,
      editora_id: body.editoraId || null,
      categoria_id: body.categoriaId || null,
      atualizado_por: auth.userId,
    })
  } catch (erro) {
    console.error('[biblioteca/obras] falha ao salvar', erro)
    return NextResponse.json({ error: 'Erro ao salvar a obra.' }, { status: 400 })
  }

  // Trocar os autores era apagar tudo e reinserir, solto. Falha entre os dois
  // deixava a obra sem autor nenhum. Agora e transacao.
  if (body.autorIds) {
    try {
      await substituirAutores(id, body.autorIds)
    } catch (erro) {
      console.error('[biblioteca/obras] falha ao trocar autores', erro)
    }
  }

  await registrarAuditoriaBiblioteca({
    usuarioId: auth.userId,
    acao: 'obra_editada',
    tabelaAfetada: 'biblioteca_obras',
    registroAfetado: id,
    valorAnterior: anterior,
    valorNovo: obra,
  })

  return NextResponse.json({ obra })
}

// Nenhum registro e apagado de verdade: "excluir" so marca a obra como
// inativa, ela some da consulta publica e da listagem padrao, mas o
// historico de exemplares e emprestimos continua intacto.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { id } = await params
  const anterior = await buscarObra(id)
  if (!anterior) return NextResponse.json({ error: 'Obra não encontrada.' }, { status: 404 })

  try {
    await atualizarObra(id, { situacao: 'inativa', atualizado_por: auth.userId })
  } catch (erro) {
    console.error('[biblioteca/obras] falha ao inativar', erro)
    return NextResponse.json({ error: 'Erro ao inativar a obra.' }, { status: 400 })
  }

  await registrarAuditoriaBiblioteca({
    usuarioId: auth.userId,
    acao: 'obra_inativada',
    tabelaAfetada: 'biblioteca_obras',
    registroAfetado: id,
    valorAnterior: anterior,
    valorNovo: { situacao: 'inativa' },
  })

  return NextResponse.json({ ok: true })
}
