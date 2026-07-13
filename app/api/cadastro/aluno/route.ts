import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { limparCPF, validarCPF } from '@/lib/cpf'
import { registrarAtividade, contarRecentes, ipDoRequest } from '@/lib/log'

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
  const admin = createAdminClient()

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

  const mat = matricula.trim()

  // Rate limit: 5 tentativas recusadas em 15 min (por matrícula ou por IP)
  const [porMatricula, porIp] = await Promise.all([
    contarRecentes(admin, { acao: 'cadastro_recusado', janelaMin: 15, chave: 'matricula', valor: mat }),
    ip ? contarRecentes(admin, { acao: 'cadastro_recusado', janelaMin: 15, ip }) : Promise.resolve(0),
  ])
  if (porMatricula >= 5 || porIp >= 8) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos ou procure a secretaria.' }, { status: 429 })
  }

  async function recusar(motivo: string) {
    await registrarAtividade(admin, { acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo }, ip })
    return NextResponse.json({ error: MSG_NAO_CONFERE }, { status: 400 })
  }

  const { data: aluno } = await admin
    .from('alunos')
    .select('id, nome, turma, cpf, data_nascimento, ativo, user_id')
    .eq('matricula', mat)
    .maybeSingle()

  if (!aluno || !aluno.ativo) return recusar('matricula_nao_encontrada_ou_inativa')
  if (aluno.user_id) {
    await registrarAtividade(admin, { acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo: 'ja_reivindicada' }, ip })
    return NextResponse.json(
      { error: 'Já existe uma conta criada para essa matrícula. Use "Esqueci minha senha" ou procure a direção.' },
      { status: 400 }
    )
  }
  if (!aluno.cpf) {
    await registrarAtividade(admin, { acao: 'cadastro_recusado', detalhes: { matricula: mat, motivo: 'cpf_ausente_na_base' }, ip })
    return NextResponse.json(
      { error: 'Seu cadastro na secretaria ainda está incompleto (falta o CPF). Procure a direção para completar.' },
      { status: 400 }
    )
  }
  if (limparCPF(aluno.cpf) !== cpfLimpo) return recusar('cpf_nao_confere')
  if (aluno.data_nascimento && aluno.data_nascimento !== dataNascimento) return recusar('nascimento_nao_confere')

  // Cria a conta
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: senha,
    email_confirm: true,
  })
  if (createError || !created.user) {
    const duplicado = createError?.message?.toLowerCase().includes('already')
    return NextResponse.json(
      { error: duplicado ? 'Já existe uma conta com esse email. Use "Esqueci minha senha".' : 'Erro ao criar a conta. Tente novamente.' },
      { status: 400 }
    )
  }

  const userId = created.user.id
  async function desfazer(mensagem: string) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: mensagem }, { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    nome_completo: aluno.nome,
    role: 'aluno',
    turma: aluno.turma,
    disciplina: null,
    aprovado: true,
    email: email.trim().toLowerCase(),
  })
  if (profileError) return desfazer('Erro ao salvar o perfil. Tente novamente.')

  const { error: identError } = await admin.from('identidades').insert({
    user_id: userId,
    cpf: cpfLimpo,
    data_nascimento: dataNascimento,
    email_alternativo: emailAlternativo?.trim() || null,
    criado_via: 'auto_aluno',
  })
  if (identError) {
    await admin.from('profiles').delete().eq('id', userId)
    if (identError.code === '23505') {
      return desfazer('Esse CPF já está vinculado a outra conta. Procure a direção.')
    }
    return desfazer('Erro ao salvar seus dados. Tente novamente.')
  }

  await admin.from('alunos').update({ user_id: userId }).eq('id', aluno.id)
  await registrarAtividade(admin, { acao: 'cadastro_aluno', userId, detalhes: { matricula: mat, turma: aluno.turma }, ip })

  return NextResponse.json({ ok: true })
}
