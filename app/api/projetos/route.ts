import { NextResponse } from 'next/server'
import { exigirGestao } from '@/lib/apiGestao'
import { criarProjeto } from '@/lib/db/comunidade'
import { lerCorpoDeProjeto } from './corpo'

/**
 * Portfolio publico de um aluno. A tela vive em /admin/alunos, cujo layout ja
 * exige gestao — aqui a rota cobra o mesmo, porque o layout nao protege a API.
 */
export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as Record<string, unknown>
  const alunoId = typeof body.alunoId === 'string' ? body.alunoId : ''
  if (!alunoId) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const corpo = lerCorpoDeProjeto(body)
  if ('erro' in corpo) return NextResponse.json({ error: corpo.erro }, { status: 400 })

  try {
    const projeto = await criarProjeto(alunoId, corpo.dados)
    return NextResponse.json({ projeto })
  } catch (erro) {
    console.error('[projetos] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o projeto.' }, { status: 400 })
  }
}
