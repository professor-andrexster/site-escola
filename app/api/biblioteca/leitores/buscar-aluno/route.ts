import { NextResponse } from 'next/server'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { normalizarMatricula } from '@/lib/matricula'
import { buscarPorMatricula } from '@/lib/db/alunos'

// Pre preenche o cadastro de leitor tipo aluno a partir da base academica
// que a secretaria ja mantem, mesma logica do autocadastro em
// app/api/cadastro/aluno/route.ts.
export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const bruto = new URL(request.url).searchParams.get('matricula')?.trim()
  if (!bruto) return NextResponse.json({ error: 'Informe a matrícula.' }, { status: 400 })

  const aluno = await buscarPorMatricula(normalizarMatricula(bruto))
  if (!aluno) {
    return NextResponse.json(
      { error: 'Matrícula não encontrada na base de alunos da escola.' },
      { status: 404 }
    )
  }

  // So o que o formulario de leitor preenche. A ficha carrega CPF e outros
  // dados sensiveis que esta tela nao usa.
  return NextResponse.json({
    aluno: {
      nome: aluno.nome,
      matricula: aluno.matricula,
      turma: aluno.turma,
      turno: aluno.turno,
      data_nascimento: aluno.data_nascimento,
      telefone: aluno.telefone,
      email: aluno.email,
      responsavel: aluno.responsavel,
    },
  })
}
