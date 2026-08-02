import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'

// Pre preenche o cadastro de leitor tipo aluno a partir da base academica
// que a secretaria ja mantem, mesma logica do autocadastro em
// app/api/cadastro/aluno/route.ts.
export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const matricula = new URL(request.url).searchParams.get('matricula')?.trim()
  if (!matricula) return NextResponse.json({ error: 'Informe a matrícula.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: aluno } = await admin
    .from('alunos')
    .select('nome, matricula, turma, turno, data_nascimento, telefone, email, responsavel')
    .eq('matricula', matricula)
    .maybeSingle()

  if (!aluno) return NextResponse.json({ error: 'Matrícula não encontrada na base de alunos da escola.' }, { status: 404 })

  return NextResponse.json({ aluno })
}
