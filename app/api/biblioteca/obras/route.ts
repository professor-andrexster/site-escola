import { NextResponse } from 'next/server'
import { criarObra, vincularAutores } from '@/lib/db/biblioteca'
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

  let obra
  try {
    obra = await criarObra({
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

  // O vinculo de autores continua sendo passo separado, e nao parte de uma
  // transacao com o create: o comportamento antigo salva a obra mesmo se os
  // autores falharem, e avisa para editar depois. Torna-lo atomico seria
  // melhor, mas e mudanca de comportamento — fica para depois da virada.
  let avisoAutores: string | null = null
  if (body.autorIds && body.autorIds.length > 0) {
    try {
      await vincularAutores(obra.id, body.autorIds)
    } catch (erro) {
      console.error('[biblioteca/obras] falha ao vincular autores', erro)
      avisoAutores = 'A obra foi salva, mas houve erro ao vincular os autores. Edite a obra para tentar de novo.'
    }
  }

  await registrarAuditoriaBiblioteca({
    usuarioId: auth.userId,
    acao: 'obra_criada',
    tabelaAfetada: 'biblioteca_obras',
    registroAfetado: obra.id,
    valorNovo: obra,
  })

  return NextResponse.json({ obra, aviso: avisoAutores })
}
