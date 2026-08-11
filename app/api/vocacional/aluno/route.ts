import { NextResponse } from 'next/server'
import { alunoPelaMatricula } from '@/lib/db/comunidade'

/**
 * Confere a matricula na entrada do teste. Publica, como sempre foi: o teste
 * roda sem login, na feira de profissoes e nas aulas de projeto de vida.
 *
 * Devolve so id e nome — o mesmo que a tela ja lia direto do PostgREST.
 */
export async function POST(request: Request) {
  const { matricula } = (await request.json()) as { matricula?: string }
  if (!matricula?.trim()) {
    return NextResponse.json({ error: 'Informe sua matrícula.' }, { status: 400 })
  }

  const aluno = await alunoPelaMatricula(matricula.trim().toUpperCase())
  if (!aluno) {
    return NextResponse.json(
      { error: 'Matrícula não encontrada. Verifique com a coordenação.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ id: aluno.id, nome: aluno.nome })
}
