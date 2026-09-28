import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { avaliarEnvio, buscarEnvio, STATUS_ENVIO, type StatusEnvio } from '@/lib/db/projetos-turma'
import { nota as validarNota, texto } from '@/lib/projetos-turma-validacao'

interface Ctx { params: Promise<{ id: string }> }

/**
 * Professor registra como esta o andamento de um envio. Cada chamada e uma
 * linha nova no historico; o envio passa a mostrar a ultima.
 *
 * "Precisa ajustar" sem comentario deixa o aluno sem saber o que corrigir,
 * por isso o feedback e obrigatorio nesse status.
 */
export async function POST(request: Request, { params }: Ctx) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const { id } = await params
  const envio = await buscarEnvio(id)
  if (!envio) return NextResponse.json({ error: 'Envio não encontrado.' }, { status: 404 })

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const status = typeof b.status === 'string' ? b.status : ''
  if (!(STATUS_ENVIO as readonly string[]).includes(status) || status === 'enviado') {
    return NextResponse.json({ error: 'Escolha o andamento: em andamento, precisa ajustar ou concluído.' }, { status: 400 })
  }
  const nota = validarNota(b.nota)
  if (nota === false) return NextResponse.json({ error: 'A nota vai de 0 a 10.' }, { status: 400 })
  const feedback = texto(b.feedback, 4000)
  if (status === 'ajustar' && !feedback) {
    return NextResponse.json({ error: 'Escreva o que o aluno precisa ajustar.' }, { status: 400 })
  }

  try {
    const atualizado = await avaliarEnvio({
      envioId: id,
      avaliadorId: auth.userId,
      status: status as StatusEnvio,
      nota,
      feedback,
    })
    return NextResponse.json({ ok: true, envio: atualizado })
  } catch (erro) {
    console.error('[projetos-turma/avaliacoes] falha', erro)
    return NextResponse.json({ error: 'Erro ao salvar a avaliação. O texto continua no formulário.' }, { status: 400 })
  }
}
