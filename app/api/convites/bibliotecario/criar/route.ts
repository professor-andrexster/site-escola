import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirGestao } from '@/lib/apiGestao'
import { enviarConviteBibliotecario } from '@/lib/email'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { nome, email } = (await request.json()) as { nome?: string; email?: string }
  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Preencha nome e email.' }, { status: 400 })
  }

  const emailLimpo = email.trim().toLowerCase()
  const admin = createAdminClient()

  const { data: perfilExistente } = await admin.from('profiles').select('id').eq('email', emailLimpo).maybeSingle()
  if (perfilExistente) {
    return NextResponse.json({ error: 'Já existe uma conta com esse email.' }, { status: 400 })
  }

  const { data: conviteAtivo } = await admin
    .from('convites_usuario')
    .select('id')
    .eq('email', emailLimpo)
    .is('aceito_em', null)
    .is('revogado_em', null)
    .gt('expira_em', new Date().toISOString())
    .maybeSingle()
  if (conviteAtivo) {
    return NextResponse.json({ error: 'Já existe um convite ativo para esse email.' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')

  const { error: insertError } = await admin.from('convites_usuario').insert({
    nome: nome.trim(),
    email: emailLimpo,
    papel: 'bibliotecario',
    token,
    criado_por: auth.userId,
  })
  if (insertError) {
    return NextResponse.json({ error: 'Erro ao criar convite: ' + insertError.message }, { status: 400 })
  }

  const origin = request.headers.get('origin') ?? new URL(request.url).origin
  const link = `${origin}/admin/convite?token=${token}`

  await registrarAtividade(admin, {
    acao: 'convite_bibliotecario_criado',
    userId: auth.userId,
    detalhes: { email: emailLimpo },
    ip: ipDoRequest(request),
  })

  try {
    await enviarConviteBibliotecario({ nome: nome.trim(), email: emailLimpo, link })
    return NextResponse.json({ ok: true, emailEnviado: true })
  } catch {
    return NextResponse.json({
      ok: true,
      emailEnviado: false,
      link,
      aviso: 'O convite foi criado, mas o email não pôde ser enviado. Copie o link abaixo e envie manualmente.',
    })
  }
}
