import { NextResponse } from 'next/server'
import { criarConta, removerConta, EmailJaCadastrado } from '@/lib/auth/sessao'
import { buscarPorMatricula } from '@/lib/db/alunos'
import { vincularCadastroDeAluno, CpfJaVinculado } from '@/lib/db/cadastro'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'

const MSG_NAO_CONFERE = 'Os dados informados não conferem com a base da escola. Confira com a secretaria se seu cadastro está completo.'

export async function POST(request: Request) {
  const body = await request.json()
  const { matricula, cpf, dataNascimento, email, senha, emailAlternativo } = body as {
    matricula?: string
    cpf?: string
    dataNascimento?: string
    email?: string
    senha?: string
    emailAlternativo?: string
  }

  const ip = ipDoRequest(request)

  if (!matricula?.trim() || !cpf || !dataNascimento || !email?.trim() || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }
  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  const mat = normalizarMatricula(matricula)

  // Rate limit: 5 tentativas recusadas em 15 min (por matrícula ou por IP)
  const [porMatricula, porIp] = await Promise.all([
    contarRecentes({ acao: 'cadastro_recusado', janelaMin: 15, chave: 'matricula', valor: mat }),
    ip ? contarRecentes({ acao: 'cadastro_recusado', janelaMin: 15, ip }) : Promise.resolve(0),
  ])
  if (porMatricula >= 5 || porIp >= 8) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos ou procure a secretaria.' }, { status: 429 })
  }

  async function recusar(motivo: string) {
    await registrar({ acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo }, ip })
    return NextResponse.json({ error: MSG_NAO_CONFERE }, { status: 400 })
  }

  const aluno = await buscarPorMatricula(mat)

  if (!aluno || !aluno.ativo) return recusar('matricula_nao_encontrada_ou_inativa')
  if (aluno.user_id) {
    await registrar({ acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo: 'ja_reivindicada' }, ip })
    return NextResponse.json(
      { error: 'Já existe uma conta criada para essa matrícula. Use "Esqueci minha senha" ou procure a direção.' },
      { status: 400 }
    )
  }
  if (!aluno.cpf) {
    await registrar({ acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo: 'cpf_ausente_na_base' }, ip })
    return NextResponse.json(
      { error: 'Seu cadastro na secretaria ainda está incompleto (falta o CPF). Procure a direção para completar.' },
      { status: 400 }
    )
  }
  if (limparCPF(aluno.cpf) !== cpfLimpo) return recusar('cpf_nao_confere')
  if (aluno.data_nascimento && aluno.data_nascimento !== dataNascimento) return recusar('nascimento_nao_confere')

  // Cria a conta
  // A conta de acesso e externa ao banco, entao vem primeiro e sozinha.
  let userId: string
  try {
    userId = await criarConta(email, senha)
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof EmailJaCadastrado
            ? 'Já existe uma conta com esse email. Use "Esqueci minha senha".'
            : 'Erro ao criar a conta. Tente novamente.',
      },
      { status: 400 }
    )
  }

  // As tres tabelas entram juntas ou nao entram. Se a transacao falhar, a
  // unica coisa a desfazer e a conta de acesso.
  try {
    await vincularCadastroDeAluno({
      userId,
      alunoId: aluno.id,
      nome: aluno.nome,
      turma: aluno.turma,
      email: email.trim().toLowerCase(),
      cpf: cpfLimpo,
      dataNascimento: new Date(dataNascimento),
      emailAlternativo: emailAlternativo?.trim() || null,
      aprovado: false,
    })
  } catch (erro) {
    console.error('[cadastro/aluno] falha ao vincular cadastro', erro)
    await removerConta(userId)
    return NextResponse.json(
      {
        error:
          erro instanceof CpfJaVinculado
            ? erro.message
            : 'Erro ao salvar seus dados. Tente novamente.',
      },
      { status: 400 }
    )
  }
  await registrar({ acao: 'cadastro_aluno', userId, detalhes: { matricula: mat, turma: aluno.turma }, ip })

  return NextResponse.json({ ok: true })
}
