import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, contarRecentes, ipDoRequest } from '@/lib/log'

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
  if (novaSenha.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }
  const cpfLimpo = limparCPF(cpf)
  if (!validarCPF(cpfLimpo)) {
    return NextResponse.json({ error: 'CPF inválido. Confira os números digitados.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const admin = createAdminClient()
  const mat = matricula.trim()

  // Rate limit rígido: redefinir senha é sensível — 3 falhas/h por matrícula, 10/h por IP
  const [porMatricula, porIp] = await Promise.all([
    contarRecentes(admin, { acao: 'recuperacao_recusada', janelaMin: 60, chave: 'matricula', valor: mat }),
    ip ? contarRecentes(admin, { acao: 'recuperacao_recusada', janelaMin: 60, ip }) : Promise.resolve(0),
  ])
  if (porMatricula >= 3 || porIp >= 10) {
    return NextResponse.json({ error: 'Muitas tentativas. Procure a direção ou tente novamente mais tarde.' }, { status: 429 })
  }

  async function recusar(motivo: string) {
    await registrarAtividade(admin, { acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo }, ip })
    return NextResponse.json({ error: MSG_NAO_CONFERE }, { status: 400 })
  }

  const { data: aluno } = await admin
    .from('alunos')
    .select('id, cpf, data_nascimento, ativo, user_id')
    .eq('matricula', mat)
    .maybeSingle()

  if (!aluno || !aluno.ativo) return recusar('matricula_nao_encontrada_ou_inativa')
  if (!aluno.user_id) {
    await registrarAtividade(admin, { acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo: 'sem_conta' }, ip })
    return NextResponse.json(
      { error: 'Ainda não existe conta para essa matrícula. Crie sua conta primeiro na tela de cadastro.' },
      { status: 400 }
    )
  }
  // Para redefinir senha exigimos os dois dados completos na base (mais rígido que o cadastro)
  if (!aluno.cpf || !aluno.data_nascimento) {
    await registrarAtividade(admin, { acao: 'recuperacao_recusada', detalhes: { matricula: mat, motivo: 'base_incompleta' }, ip })
    return NextResponse.json(
      { error: 'Seus dados na secretaria estão incompletos. Procure a direção para redefinir a senha.' },
      { status: 400 }
    )
  }
  if (limparCPF(aluno.cpf) !== cpfLimpo) return recusar('cpf_nao_confere')
  if (aluno.data_nascimento !== dataNascimento) return recusar('nascimento_nao_confere')

  const { error: updateError } = await admin.auth.admin.updateUserById(aluno.user_id, { password: novaSenha })
  if (updateError) {
    return NextResponse.json({ error: 'Erro ao redefinir a senha. Tente novamente.' }, { status: 500 })
  }

  await registrarAtividade(admin, { acao: 'senha_redefinida_cpf', userId: aluno.user_id, detalhes: { matricula: mat }, ip })

  return NextResponse.json({ ok: true })
}
