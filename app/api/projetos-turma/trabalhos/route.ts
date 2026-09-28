import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { criarTrabalho } from '@/lib/db/projetos-turma'
import { link, texto } from '@/lib/projetos-turma-validacao'
import { prisma } from '@/lib/db'

/** Cria um trabalho dentro de uma pasta. Professor ou gestao. */
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const pastaId = typeof b.pastaId === 'string' ? b.pastaId : ''
  const titulo = texto(b.titulo, 140)
  if (!pastaId || !titulo) {
    return NextResponse.json({ error: 'Escolha a pasta e dê um título ao projeto.' }, { status: 400 })
  }
  const pasta = await prisma.projeto_pastas.findUnique({ where: { id: pastaId }, select: { id: true } })
  if (!pasta) return NextResponse.json({ error: 'Pasta não encontrada.' }, { status: 404 })

  const arquivoUrl = link(b.arquivoUrl)
  if (arquivoUrl === false) {
    return NextResponse.json({ error: 'O link do arquivo precisa começar com http:// ou https://.' }, { status: 400 })
  }

  try {
    const trabalho = await criarTrabalho(pastaId, {
      titulo,
      resumo: texto(b.resumo, 300),
      briefing: typeof b.briefing === 'string' && b.briefing.trim() ? b.briefing : null,
      arquivoUrl,
      publicado: b.publicado === true,
    }, auth.userId)
    return NextResponse.json({ ok: true, trabalho })
  } catch (erro) {
    console.error('[projetos-turma/trabalhos] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 400 })
  }
}
