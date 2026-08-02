import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const admin = createAdminClient()
  const { data: anterior } = await admin.from('biblioteca_obras').select('*').eq('id', id).maybeSingle()
  if (!anterior) return NextResponse.json({ error: 'Obra não encontrada.' }, { status: 404 })

  const { data: obra, error } = await admin
    .from('biblioteca_obras')
    .update({
      titulo: body.titulo.trim(),
      subtitulo: body.subtitulo?.trim() || null,
      ano_publicacao: body.anoPublicacao ?? null,
      edicao: body.edicao?.trim() || null,
      isbn: body.isbn?.trim() || null,
      idioma: body.idioma?.trim() || 'Português',
      numero_paginas: body.numeroPaginas ?? null,
      sinopse: body.sinopse?.trim() || null,
      palavras_chave: body.palavrasChave ?? [],
      publico_indicado: body.publicoIndicado?.trim() || null,
      area_conhecimento: body.areaConhecimento?.trim() || null,
      classificacao_catalogacao: body.classificacaoCatalogacao?.trim() || null,
      capa_url: body.capaUrl || null,
      observacoes_internas: body.observacoesInternas?.trim() || null,
      editora_id: body.editoraId || null,
      categoria_id: body.categoriaId || null,
      atualizado_por: auth.userId,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao salvar a obra: ' + error.message }, { status: 400 })

  if (body.autorIds) {
    await admin.from('biblioteca_obras_autores').delete().eq('obra_id', id)
    if (body.autorIds.length > 0) {
      const vinculos = body.autorIds.map((autorId) => ({ obra_id: id, autor_id: autorId }))
      await admin.from('biblioteca_obras_autores').insert(vinculos)
    }
  }

  await registrarAuditoriaBiblioteca(admin, {
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
  const admin = createAdminClient()

  const { data: anterior } = await admin.from('biblioteca_obras').select('*').eq('id', id).maybeSingle()
  if (!anterior) return NextResponse.json({ error: 'Obra não encontrada.' }, { status: 404 })

  const { error } = await admin
    .from('biblioteca_obras')
    .update({ situacao: 'inativa', atualizado_por: auth.userId, atualizado_em: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Erro ao inativar a obra: ' + error.message }, { status: 400 })

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'obra_inativada',
    tabelaAfetada: 'biblioteca_obras',
    registroAfetado: id,
    valorAnterior: anterior,
    valorNovo: { situacao: 'inativa' },
  })

  return NextResponse.json({ ok: true })
}
