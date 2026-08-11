import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { buscarPorEmail } from '@/lib/db/perfis'
import { conviteAtivoDoEmail, criarConvite } from '@/lib/db/convites'
import { exigirGestao } from '@/lib/apiGestao'
import { enviarConviteBibliotecario } from '@/lib/email'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

export async function POST(request: Request) {
  const auth = await exigirGestao()
  if (!auth.ok) return auth.res

  const { nome, email } = (await request.json()) as { nome?: string; email?: string }
  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Preencha nome e email.' }, { status: 400 })
  }

  const emailLimpo = email.trim().toLowerCase()
  const perfilExistente = await buscarPorEmail(emailLimpo)
  if (perfilExistente) {
    return NextResponse.json({ error: 'Já existe uma conta com esse email.' }, { status: 400 })
  }

  const conviteAtivo = await conviteAtivoDoEmail(emailLimpo)
  if (conviteAtivo) {
    return NextResponse.json({ error: 'Já existe um convite ativo para esse email.' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')

  try {
    await criarConvite({
      nome: nome.trim(),
      email: emailLimpo,
      papel: 'bibliotecario',
      token,
      criadoPor: auth.userId,
    })
  } catch (erro) {
    console.error('[convites/criar] falha', erro)
    return NextResponse.json({ error: 'Erro ao criar o convite.' }, { status: 400 })
  }

  const origin = request.headers.get('origin') ?? new URL(request.url).origin
  const link = `${origin}/admin/convite?token=${token}`

  await registrar({
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
