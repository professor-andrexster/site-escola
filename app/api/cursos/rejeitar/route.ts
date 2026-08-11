import { NextResponse } from 'next/server'
import { remover } from '@/lib/db/cursos'
import { exigirGestao } from '@/lib/apiGestao'

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { cursoId } = await request.json() as { cursoId?: string }

  if (!cursoId) {
    return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })
  }

  // Apaga curso, aulas, progresso, desafios e perguntas de prova. No Supabase
  // isso dependia do ON DELETE CASCADE do banco; agora e transacao explicita
  // na camada, o que torna visivel o que esta sendo apagado junto.
  try {
    await remover(cursoId)
  } catch (erro) {
    console.error('[cursos/rejeitar] falha', erro)
    return NextResponse.json({ error: 'Erro ao rejeitar o curso.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
