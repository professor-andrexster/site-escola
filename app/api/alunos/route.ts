import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { exigirGestao } from '@/lib/apiGestao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

// Escrita na tabela alunos é só via service role (RLS fechada na migration 016).
// Estas rotas são o único caminho, restritas à direção (CREATE/DELETE) ou próprio aluno (UPDATE self).

type CamposAluno = {
  nome?: string
  matricula?: string
  turma?: string
  data_nascimento?: string | null
  cpf?: string | null
  responsavel?: string | null
  telefone?: string | null
  email?: string | null
  foto_url?: string | null
  ativo?: boolean
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarEmail(email: string): boolean {
  return REGEX_EMAIL.test(email)
}

async function verificarDuplicatas(
  campo: 'matricula' | 'cpf' | 'email',
  valor: string | null | undefined,
  alunoIdExcluindo?: string
): Promise<{ existe: boolean; alunoNome?: string }> {
  if (!valor) return { existe: false }

  const admin = createAdminClient()
  const query = admin.from('alunos').select('id, nome').eq(campo, valor)

  if (alunoIdExcluindo) {
    query.neq('id', alunoIdExcluindo)
  }

  const { data } = await query.limit(1).maybeSingle()
  return { existe: !!data, alunoNome: data?.nome }
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
  if (body.ativo !== undefined) dados.ativo = body.ativo

  if (body.email !== undefined) {
    const emailTrimmed = body.email?.trim() || null
    if (emailTrimmed && !validarEmail(emailTrimmed)) {
      return { ok: false, erro: 'E-mail inválido. Insira um e-mail válido (ex: aluno@escola.com).' }
    }
    dados.email = emailTrimmed
  }

  if (body.cpf !== undefined) {
    if (body.cpf) {
      const cpfLimpo = limparCPF(body.cpf)
      if (!validarCPF(cpfLimpo)) return { ok: false, erro: 'CPF inválido. Confira os números digitados.' }
      dados.cpf = cpfLimpo
    } else {
      dados.cpf = null
    }
  }

  if (body.foto_url !== undefined) dados.foto_url = body.foto_url || null

  return { ok: true, dados }
}

function erroBanco(error: { code?: string; message: string }, camposDuplicados?: string[]): NextResponse {
  if (error.code === '23505') {
    // Constraint violation - diferenciar qual campo duplicou
    if (camposDuplicados?.includes('matricula')) {
      return NextResponse.json({ error: 'Já existe um aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
    if (camposDuplicados?.includes('cpf')) {
      return NextResponse.json({ error: 'Já existe um aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
    if (camposDuplicados?.includes('email')) {
      return NextResponse.json({ error: 'Já existe um aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Dados duplicados no cadastro. Verifique matrícula, CPF e e-mail.' }, { status: 400 })
  }
  return NextResponse.json({ error: 'Erro ao salvar: ' + error.message }, { status: 400 })
}

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CamposAluno
  const validacao = validarCampos(body, true)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })

  // Verificar duplicatas antes de inserir
  if (body.matricula) {
    const dup = await verificarDuplicatas('matricula', body.matricula)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe um aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.cpf) {
    const dup = await verificarDuplicatas('cpf', body.cpf)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe um aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.email) {
    const dup = await verificarDuplicatas('email', body.email)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe um aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('alunos').insert(validacao.dados).select('id').single()
  if (error) return erroBanco(error, ['matricula', 'cpf', 'email'])

  return NextResponse.json({ ok: true, id: data.id })
}

export async function PUT(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CamposAluno & { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const validacao = validarCampos(body, false)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })
  validacao.dados.atualizado_em = new Date().toISOString()

  const admin = createAdminClient()

  // Se está atualizando matrícula, CPF ou email, verificar duplicatas (excluindo este aluno)
  if (body.matricula) {
    const dup = await verificarDuplicatas('matricula', body.matricula, body.id)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe outro aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.cpf) {
    const dup = await verificarDuplicatas('cpf', body.cpf, body.id)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.email) {
    const dup = await verificarDuplicatas('email', body.email, body.id)
    if (dup.existe) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
  }

  const { error } = await admin.from('alunos').update(validacao.dados).eq('id', body.id)
  if (error) return erroBanco(error, ['matricula', 'cpf', 'email'])

  // Desativar o cadastro academico tambem derruba o acesso de login, se
  // houver conta vinculada. Reativar depois nao restaura sozinho: alguem da
  // gestao precisa aprovar de novo em /admin/alunos/[id].
  let loginRevogado = false
  if (validacao.dados.ativo === false) {
    const { data: alunoAtual } = await admin.from('alunos').select('user_id').eq('id', body.id).maybeSingle()
    if (alunoAtual?.user_id) {
      const { data: perfilAtual } = await admin.from('profiles').select('aprovado').eq('id', alunoAtual.user_id).maybeSingle()
      if (perfilAtual?.aprovado) {
        await admin.from('profiles').update({ aprovado: false }).eq('id', alunoAtual.user_id)
        await registrarAtividade(admin, {
          acao: 'aluno_bloqueado_por_inatividade',
          userId: alunoAtual.user_id,
          detalhes: { aluno_id: body.id, bloqueado_por: auth.userId },
          ip: ipDoRequest(request),
        })
        loginRevogado = true
      }
    }
  }

  return NextResponse.json({ ok: true, loginRevogado })
}

export async function DELETE(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { id } = (await request.json()) as { id?: string }
  if (!id) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('alunos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Erro ao remover: ' + error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
