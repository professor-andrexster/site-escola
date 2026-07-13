import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirDirecao } from '@/lib/apiDirecao'
import { limparCPF, validarCPF } from '@/lib/cpf'

// Escrita na tabela alunos é só via service role (RLS fechada na migration 016).
// Estas rotas são o único caminho, restritas à direção.

type CamposAluno = {
  nome?: string
  matricula?: string
  turma?: string
  data_nascimento?: string | null
  cpf?: string | null
  responsavel?: string | null
  telefone?: string | null
  email?: string | null
  ativo?: boolean
}

function validarCampos(body: CamposAluno, exigirObrigatorios: boolean): { ok: true; dados: Record<string, unknown> } | { ok: false; erro: string } {
  const dados: Record<string, unknown> = {}

  if (exigirObrigatorios && (!body.nome?.trim() || !body.matricula?.trim() || !body.turma)) {
    return { ok: false, erro: 'Preencha nome, matrícula e turma.' }
  }

  if (body.nome !== undefined) dados.nome = body.nome.trim()
  if (body.matricula !== undefined) dados.matricula = body.matricula.trim()
  if (body.turma !== undefined) {
    dados.turma = body.turma
    dados.serie = body.turma // padrão existente: serie espelha a turma
  }
  if (body.data_nascimento !== undefined) dados.data_nascimento = body.data_nascimento || null
  if (body.responsavel !== undefined) dados.responsavel = body.responsavel?.trim() || null
  if (body.telefone !== undefined) dados.telefone = body.telefone?.trim() || null
  if (body.email !== undefined) dados.email = body.email?.trim() || null
  if (body.ativo !== undefined) dados.ativo = body.ativo

  if (body.cpf !== undefined) {
    if (body.cpf) {
      const cpfLimpo = limparCPF(body.cpf)
      if (!validarCPF(cpfLimpo)) return { ok: false, erro: 'CPF inválido. Confira os números digitados.' }
      dados.cpf = cpfLimpo
    } else {
      dados.cpf = null
    }
  }

  return { ok: true, dados }
}

function erroBanco(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return NextResponse.json({ error: 'Já existe um aluno com essa matrícula ou CPF.' }, { status: 400 })
  }
  return NextResponse.json({ error: 'Erro ao salvar: ' + error.message }, { status: 400 })
}

export async function POST(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CamposAluno
  const validacao = validarCampos(body, true)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('alunos').insert(validacao.dados).select('id').single()
  if (error) return erroBanco(error)

  return NextResponse.json({ ok: true, id: data.id })
}

export async function PUT(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CamposAluno & { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const validacao = validarCampos(body, false)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })
  validacao.dados.atualizado_em = new Date().toISOString()

  const admin = createAdminClient()
  const { error } = await admin.from('alunos').update(validacao.dados).eq('id', body.id)
  if (error) return erroBanco(error)

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const { id } = (await request.json()) as { id?: string }
  if (!id) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('alunos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Erro ao remover: ' + error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
