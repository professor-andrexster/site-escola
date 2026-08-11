import { NextResponse } from 'next/server'
import { buscarPorMatricula } from '@/lib/db/alunos'
import { definirSenha } from '@/lib/auth/sessao'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'
import { senhaFraca } from '@/lib/auth/senha'

const MSG_NAO_CONFERE = 'Os dados informados não conferem com a base da escola. Se o problema continuar, procure a direção.'

export async function POST(request: Request) {
  const body = await request.json()
  const { matricula, cpf, dataNascimento, novaSenha } = body as {
    matricula?: string
    cpf?: string
    dataNascimento?: string
    novaSenha?: string
  }

  if (!matricula?.trim() || !cpf || !dataNascimento || !novaSenha) {
    return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
  }
  const fraca = senhaFraca(novaSenha)
  if (fraca) {
    return NextResponse.json({ error: fraca }, { status: 400 })
  }

  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const mat = normalizarMatricula(matricula)

  // Rate limit rígido: redefinir senha é sensível — 3 falhas/h por matrícula, 10/h por IP
  const [porMatricula, porIp] = await Promise.all([
    contarRecentes({ acao: 'recuperacao_recusada', janelaMin: 60, chave: 'matricula', valor: mat }),
    ip ? contarRecentes({ acao: 'recuperacao_recusada', janelaMin: 60, ip }) : Promise.resolve(0),
  ])
  if (porMatricula >= 3 || porIp >= 10) {
    return NextResponse.json({ error: 'Muitas tentativas. Procure a direção ou tente novamente mais tarde.' }, { status: 429 })
  }

  async function recusar(motivo: string) {
    await registrar({ acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo }, ip })
    return NextResponse.json({ error: MSG_NAO_CONFERE }, { status: 400 })
  }

  const aluno = await buscarPorMatricula(mat)

  if (!aluno || !aluno.ativo) return recusar('matricula_nao_encontrada_ou_inativa')
  if (!aluno.user_id) {
    await registrar({ acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo: 'sem_conta' }, ip })
    return NextResponse.json(
      { error: 'Ainda não existe conta para essa matrícula. Crie sua conta primeiro na tela de cadastro.' },
      { status: 400 }
    )
  }
  // Para redefinir senha exigimos os dois dados completos na base (mais rígido que o cadastro)
  if (!aluno.cpf || !aluno.data_nascimento) {
    await registrar({ acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo: 'base_incompleta' }, ip })
    return NextResponse.json(
      { error: 'Seus dados na secretaria estão incompletos. Procure a direção para redefinir a senha.' },
      { status: 400 }
    )
  }
  if (limparCPF(aluno.cpf) !== cpfLimpo) return recusar('cpf_nao_confere')
  if (aluno.data_nascimento !== dataNascimento) return recusar('nascimento_nao_confere')

  try {
    await definirSenha(aluno.user_id, novaSenha)
  } catch (erro) {
    console.error('[recuperar-senha/cpf] falha ao definir senha', erro)
    return NextResponse.json({ error: 'Erro ao redefinir a senha. Tente novamente.' }, { status: 500 })
  }

  await registrar({ acao: 'senha_redefinida_cpf', userId: aluno.user_id, detalhes: { matricula: mat }, ip })

  return NextResponse.json({ ok: true })
}
