import { NextResponse } from 'next/server'
import { jaExiste, criar, atualizar, buscarPorId, remover } from '@/lib/db/alunos'
import { papelEAprovacao, sincronizarTurma, revogar } from '@/lib/db/perfis'
import { registrar } from '@/lib/db/log'
import { exigirGestao } from '@/lib/apiGestao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { ipDoRequest } from '@/lib/log'

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

// verificarDuplicatas foi para lib/db/alunos.jaExiste. O ilike que existia
// aqui para pegar matricula em caixa mista virou desnecessario: a collation
// utf8mb4_unicode_ci do MariaDB ja compara sem diferenciar caixa.

function validarCampos(body: CamposAluno, exigirObrigatorios: boolean): { ok: true; dados: Record<string, unknown> } | { ok: false; erro: string } {
  const dados: Record<string, unknown> = {}

  if (exigirObrigatorios && (!body.nome?.trim() || !body.matricula?.trim() || !body.turma)) {
    return { ok: false, erro: 'Preencha nome, matrícula e turma.' }
  }

  if (body.nome !== undefined) dados.nome = body.nome.trim()
  if (body.matricula !== undefined) dados.matricula = normalizarMatricula(body.matricula)
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
    if (await jaExiste('matricula', body.matricula!)) {
      return NextResponse.json({ error: 'Já existe um aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.cpf) {
    if (await jaExiste('cpf', body.cpf!)) {
      return NextResponse.json({ error: 'Já existe um aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.email) {
    if (await jaExiste('email', body.email!)) {
      return NextResponse.json({ error: 'Já existe um aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
  }

  let criado
  try {
    criado = await criar(validacao.dados as never)
  } catch (erro) {
    return erroBanco(erro as { code?: string; message: string }, ['matricula', 'cpf', 'email'])
  }

  return NextResponse.json({ ok: true, id: criado.id })
}

export async function PUT(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const body = (await request.json()) as CamposAluno & { id?: string }
  if (!body.id) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })

  const validacao = validarCampos(body, false)
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })
  validacao.dados.atualizado_em = new Date().toISOString()


  // Se está atualizando matrícula, CPF ou email, verificar duplicatas (excluindo este aluno)
  if (body.matricula) {
    if (await jaExiste('matricula', body.matricula!, body.id)) {
      return NextResponse.json({ error: 'Já existe outro aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.cpf) {
    if (await jaExiste('cpf', body.cpf!, body.id)) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
  }
  if (body.email) {
    if (await jaExiste('email', body.email!, body.id)) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
  }

  try {
    await atualizar(body.id, validacao.dados as never)
  } catch (erro) {
    return erroBanco(erro as { code?: string; message: string }, ['matricula', 'cpf', 'email'])
  }

  // Desativar o cadastro academico tambem derruba o acesso de login, se
  // houver conta vinculada. Reativar depois nao restaura sozinho: alguem da
  // gestao precisa aprovar de novo em /admin/alunos/[id].
  let loginRevogado = false
  const mudouTurma = validacao.dados.turma !== undefined
  if (validacao.dados.ativo === false || mudouTurma) {
    const alunoAtual = await buscarPorId(body.id)

    // A turma mora em dois lugares: alunos.turma (registro academico, editado
    // aqui) e profiles.turma (conta de login, que e o que o quiz e o dashboard
    // consultam para liberar conteudo por turma). Sem espelhar, mudar a turma
    // no painel nao muda nada do lado do aluno.
    // A turma mora em dois lugares: alunos.turma (registro academico, editado
    // aqui) e profiles.turma (conta de login, que e o que o quiz e o dashboard
    // consultam). sincronizarTurma so escreve nos papeis que carregam turma.
    if (mudouTurma && alunoAtual?.user_id) {
      await sincronizarTurma(alunoAtual.user_id, validacao.dados.turma as string)
    }

    if (validacao.dados.ativo === false && alunoAtual?.user_id) {
      const perfilAtual = await papelEAprovacao(alunoAtual.user_id)
      if (perfilAtual?.aprovado) {
        await revogar(alunoAtual.user_id)
        await registrar({
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

  try {
    await remover(id)
  } catch (erro) {
    console.error('[alunos] falha ao remover', erro)
    return NextResponse.json({ error: 'Erro ao remover o aluno.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
