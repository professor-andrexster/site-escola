import { NextResponse } from 'next/server'
import { exigirProfessorOrAbove } from '@/lib/apiGestao'
import { criarCurso } from '@/lib/db/cursos'
import { isGestao } from '@/lib/roles'
import { lerCorpoDeCurso } from './corpo'

/**
 * Criacao de curso.
 *
 * Duas regras que antes so existiam na aparencia da tela e agora sao do
 * servidor: `publicado` so vale se quem pede for da gestao (o formulario
 * desabilita o botao para professor, mas isso nao impedia um POST direto),
 * e `criado_por` sai da sessao, nunca do corpo.
 */
export async function POST(request: Request) {
  const auth = await exigirProfessorOrAbove()
  if (!auth.ok) return auth.res

  const corpo = lerCorpoDeCurso(await request.json())
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    const curso = await criarCurso({
      ...corpo.dados,
      publicado: isGestao(auth.role) ? corpo.dados.publicado : false,
      criadoPor: auth.userId,
    })
    return NextResponse.json({ id: curso.id })
  } catch (erro) {
    if ((erro as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um curso com esse slug.' }, { status: 409 })
    }
    console.error('[cursos] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar o curso.' }, { status: 400 })
  }
}
