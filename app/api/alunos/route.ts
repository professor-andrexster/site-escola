import { NextResponse } from 'next/server'
import { jaExiste, criar, atualizar, buscarPorId, remover, proximaMatricula } from '@/lib/db/alunos'
import { papelEAprovacao, sincronizarTurma, sincronizarFoto, revogar } from '@/lib/db/perfis'
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

  // Matricula saiu dos obrigatorios: a tela de cadastro nao pede mais, e o
  // POST gera uma. Quem tiver o numero da secretaria preenche depois, na tela
  // de edicao do aluno.
  if (exigirObrigatorios && (!body.nome?.trim() || !body.turma)) {
    return { ok: false, erro: 'Preencha nome e turma.' }
  }

  if (body.nome !== undefined) dados.nome = body.nome.trim()
  if (body.matricula !== undefined) dados.matricula = normalizarMatricula(body.matricula)
  if (body.turma !== undefined) {
    dados.turma = body.turma
    dados.serie = body.turma // padrão existente: serie espelha a turma
  }

  // A coluna e DateTime (@db.Date) e o formulario manda "2010-02-07". Repassar
  // a string crua fazia o Prisma recusar com "premature end of input. Expected
  // ISO-8601 DateTime" — e como o campo e opcional, o cadastro so quebrava
  // para quem preenchia a data. Era este o "nao da para criar novos alunos".
  //
  // Data pura e lida como UTC, que e o certo para uma coluna DATE: construir
  // com fuso local jogaria o dia para tras a oeste de Greenwich.
  if (body.data_nascimento !== undefined) {
    if (body.data_nascimento) {
      const data = new Date(`${body.data_nascimento}T00:00:00Z`)
      if (Number.isNaN(data.getTime())) {
        return { ok: false, erro: 'Data de nascimento inválida.' }
      }
      dados.data_nascimento = data
    } else {
      dados.data_nascimento = null
    }
  }
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

/**
 * Traduz erro do banco em mensagem de tela.
 *
 * Procurava o codigo '23505', que e do Postgres — sobra do Supabase. No
 * MariaDB o Prisma usa 'P2002' e diz no `meta.target` qual unique estourou,
 * entao nenhuma das mensagens abaixo chegava a aparecer: tudo caia no ramo
 * final e a tela mostrava o dump cru do Prisma, com a chamada inteira e os
 * dados do aluno (CPF incluso) na mensagem de erro.
 */
function erroBanco(error: { code?: string; message: string; meta?: { target?: string[] | string } }): NextResponse {
  if (error.code === 'P2002') {
    const alvo = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : String(error.meta?.target ?? '')
    if (alvo.includes('matricula')) {
      return NextResponse.json({ error: 'Já existe um aluno com essa matrícula. Verifique o cadastro.' }, { status: 400 })
    }
    if (alvo.includes('cpf')) {
      return NextResponse.json({ error: 'Já existe um aluno com esse CPF. Verifique o cadastro.' }, { status: 400 })
    }
    if (alvo.includes('email')) {
      return NextResponse.json({ error: 'Já existe um aluno com esse e-mail. Verifique o cadastro.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Dados duplicados no cadastro. Verifique matrícula, CPF e e-mail.' }, { status: 400 })
  }

  // O `message` do Prisma traz a chamada inteira e os valores enviados. Vai
  // para o log do servidor, nao para a tela do usuario.
  console.error('[alunos] falha ao salvar', error)
  return NextResponse.json(
    { error: 'Não foi possível salvar o cadastro. Confira os dados e tente novamente.' },
    { status: 400 }
  )
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

  // `alunos.matricula` e NOT NULL UNIQUE, entao alguem tem que preencher. Como
  // a tela deixou de pedir, o servidor gera — e a gestao troca depois pelo
  // numero real da secretaria, na tela de edicao do aluno.
  //
  // Duas secretarias cadastrando ao mesmo tempo pegariam o mesmo numero; o
  // unique recusa a segunda e aqui ela tenta o proximo.
  let criado
  let tentativa = 0
  for (;;) {
    try {
      const dados = validacao.dados.matricula
        ? validacao.dados
        : { ...validacao.dados, matricula: await proximaMatricula() }
      criado = await criar(dados as never)
      break
    } catch (erro) {
      const e = erro as { code?: string; meta?: { target?: string[] | string } }
      const alvo = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target ?? '')
      const colidiuMatriculaGerada =
        e.code === 'P2002' && alvo.includes('matricula') && !validacao.dados.matricula
      if (colidiuMatriculaGerada && tentativa++ < 5) continue
      return erroBanco(erro as Parameters<typeof erroBanco>[0])
    }
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
  // `atualizar()` ja carimba atualizado_em com um Date; atribuir a string
  // aqui era redundante e repetia a armadilha que quebrou data_nascimento.


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

    // A foto tem dois lares: alunos.foto_url (portfólio público) e
    // profiles.avatar_url (o avatar dentro do sistema). Quando a gestão troca a
    // foto de um aluno, o avatar dele tem que acompanhar — senão a listagem
    // mostra uma foto e a sidebar dele mostra outra.
    if (validacao.dados.foto_url !== undefined) {
      const ficha = await buscarPorId(body.id)
      if (ficha?.user_id) {
        await sincronizarFoto(ficha.user_id, (validacao.dados.foto_url as string | null) || null)
      }
    }
  } catch (erro) {
    return erroBanco(erro as Parameters<typeof erroBanco>[0])
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
