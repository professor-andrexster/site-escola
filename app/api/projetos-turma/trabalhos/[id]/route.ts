import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { atualizarTrabalho, buscarTrabalho, removerTrabalho } from '@/lib/db/projetos-turma'
import { criterios, cronograma, link, texto } from '@/lib/projetos-turma-validacao'
import { prisma } from '@/lib/db'

interface Ctx { params: Promise<{ id: string }> }

/** Edita titulo, resumo, briefing, arquivo, cronograma, criterios ou publicacao. Professor ou gestao. */
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { id } = await params
  if (!(await buscarTrabalho(id))) return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const campos: Parameters<typeof atualizarTrabalho>[1] = {}

  if (b.titulo !== undefined) {
    const titulo = texto(b.titulo, 140)
    if (!titulo) return NextResponse.json({ error: 'O projeto precisa de um título.' }, { status: 400 })
    campos.titulo = titulo
  }
  if (b.resumo !== undefined) campos.resumo = texto(b.resumo, 300)
  if (b.briefing !== undefined) {
    campos.briefing = typeof b.briefing === 'string' && b.briefing.trim() ? b.briefing : null
  }
  if (b.arquivoUrl !== undefined) {
    const arquivoUrl = link(b.arquivoUrl)
    if (arquivoUrl === false) {
      return NextResponse.json({ error: 'O link do arquivo precisa começar com http:// ou https://.' }, { status: 400 })
    }
    campos.arquivoUrl = arquivoUrl
  }
  if (b.cronograma !== undefined) campos.cronograma = cronograma(b.cronograma)
  if (b.criterios !== undefined) campos.criterios = criterios(b.criterios)
  if (b.pedeLinkGrupo !== undefined) campos.pedeLinkGrupo = b.pedeLinkGrupo === true
  if (b.publicado !== undefined) campos.publicado = b.publicado === true

  try {
    const trabalho = await atualizarTrabalho(id, campos)
    return NextResponse.json({ ok: true, trabalho })
  } catch (erro) {
    console.error('[projetos-turma/trabalhos] falha ao editar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 400 })
  }
}

/**
 * Apaga o projeto. Recusa se ja houver envio de aluno: apagar levaria junto
 * os links e as avaliacoes (cascata). Nesse caso, despublique.
 */
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { id } = await params
  if (!(await buscarTrabalho(id))) return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })

  const envios = await prisma.projeto_envios.count({ where: { trabalho_id: id } })
  if (envios > 0) {
    return NextResponse.json(
      { error: `Este projeto já tem ${envios} envio(s) de alunos. Despublique em vez de apagar.` },
      { status: 409 }
    )
  }

  try {
    await removerTrabalho(id)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[projetos-turma/trabalhos] falha ao apagar', erro)
    return NextResponse.json({ error: 'Erro ao apagar o projeto.' }, { status: 400 })
  }
}
