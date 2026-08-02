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

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CorpoObra
  if (!body.titulo?.trim()) {
    return NextResponse.json({ error: 'Informe o título da obra.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: obra, error } = await admin
    .from('biblioteca_obras')
    .insert({
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
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao salvar a obra: ' + error.message }, { status: 400 })

  let avisoAutores: string | null = null
  if (body.autorIds && body.autorIds.length > 0) {
    const vinculos = body.autorIds.map((autorId) => ({ obra_id: obra.id, autor_id: autorId }))
    const { error: errAutores } = await admin.from('biblioteca_obras_autores').insert(vinculos)
    if (errAutores) avisoAutores = 'A obra foi salva, mas houve erro ao vincular os autores. Edite a obra para tentar de novo.'
  }

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'obra_criada',
    tabelaAfetada: 'biblioteca_obras',
    registroAfetado: obra.id,
    valorNovo: obra,
  })

  return NextResponse.json({ obra, aviso: avisoAutores })
}
