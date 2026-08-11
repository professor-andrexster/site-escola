import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { registrarProgresso } from '@/lib/db/cursos'

/**
 * Onde o aluno parou numa aula, e se concluiu.
 *
 * O `user_id` vinha do navegador: mandar o id de outro aluno marcava a aula
 * como concluida no progresso dele — e progresso concluido e o que libera o
 * certificado. Agora sai da sessao, e cada um so escreve o proprio.
 */
export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { aulaId, slideAtual, concluida } = (await request.json()) as {
    aulaId?: string; slideAtual?: number; concluida?: boolean
  }
  if (!aulaId) return NextResponse.json({ error: 'Aula não informada.' }, { status: 400 })

  try {
    await registrarProgresso({
      userId: usuario.id,
      aulaId,
      slideAtual: typeof slideAtual === 'number' ? slideAtual : undefined,
      concluida: concluida === true,
    })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[cursos/progresso] falha', erro)
    return NextResponse.json({ error: 'Erro ao salvar o progresso.' }, { status: 400 })
  }
}
