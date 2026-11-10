import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { adicionarDocumento, buscarTrabalho, removerDocumento } from '@/lib/db/projetos-turma'
import { gravar } from '@/lib/storage/arquivos'
import { texto } from '@/lib/projetos-turma-validacao'

interface Ctx { params: Promise<{ id: string }> }

const MAX_DOCUMENTOS = 30

/**
 * Professor envia um PDF de instrucoes direto da pagina do projeto.
 * Multipart: `arquivo` (PDF, ate 20 MB, conferido pelos bytes) e `titulo`
 * (opcional; sem titulo, usa o nome do arquivo).
 */
export async function POST(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { id } = await params
  const trabalho = await buscarTrabalho(id)
  if (!trabalho) return NextResponse.json({ ok: false, error: 'Projeto não encontrado.' }, { status: 404 })
  if (trabalho.documentos.length >= MAX_DOCUMENTOS) {
    return NextResponse.json({ ok: false, error: `Este projeto já tem ${MAX_DOCUMENTOS} documentos. Remova algum antes.` }, { status: 400 })
  }

  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  const gravado = await gravar('projeto-turma', arquivo, auth.userId)
  if ('erro' in gravado) return NextResponse.json({ ok: false, error: gravado.erro }, { status: 400 })

  const nomeSemExtensao = arquivo.name.replace(/\.pdf$/i, '')
  const titulo = texto(form?.get('titulo'), 140) ?? (texto(nomeSemExtensao, 140) || 'Documento')

  try {
    const documentos = await adicionarDocumento(id, {
      id: randomBytes(8).toString('hex'),
      titulo,
      url: gravado.url,
      tamanho: gravado.tamanho,
      enviadoEm: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true, documentos })
  } catch (erro) {
    console.error('[projetos-turma/documentos] falha ao gravar', erro)
    return NextResponse.json({ ok: false, error: 'O PDF subiu, mas não consegui ligá-lo ao projeto. Tente de novo.' }, { status: 500 })
  }
}

/** Tira um documento do projeto. Corpo: { docId }. */
export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { id } = await params
  if (!(await buscarTrabalho(id))) return NextResponse.json({ ok: false, error: 'Projeto não encontrado.' }, { status: 404 })

  const b = (await request.json().catch(() => ({}))) as { docId?: unknown }
  if (typeof b.docId !== 'string' || !b.docId) {
    return NextResponse.json({ ok: false, error: 'Documento não informado.' }, { status: 400 })
  }

  try {
    const documentos = await removerDocumento(id, b.docId)
    if (!documentos) return NextResponse.json({ ok: false, error: 'Documento não encontrado.' }, { status: 404 })
    return NextResponse.json({ ok: true, documentos })
  } catch (erro) {
    console.error('[projetos-turma/documentos] falha ao remover', erro)
    return NextResponse.json({ ok: false, error: 'Erro ao remover o documento.' }, { status: 500 })
  }
}
