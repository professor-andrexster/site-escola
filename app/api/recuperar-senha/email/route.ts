import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolverEmail } from '@/lib/identidade'
import { ipDoRequest, contarRecentes, registrarAtividade } from '@/lib/log'

// Resposta sempre genérica para não revelar se o email/matrícula/CPF existe
const MSG_GENERICA = 'Se encontrarmos seu cadastro, um link de redefinição será enviado para o email da conta.'

export async function POST(request: Request) {
  const body = await request.json()
  const { identificador } = body as { identificador?: string }

  if (!identificador?.trim()) {
    return NextResponse.json({ error: 'Informe seu email, matrícula ou CPF.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const admin = createAdminClient()

  if (ip) {
    const recentes = await contarRecentes(admin, { acao: 'recuperacao_recusada', janelaMin: 60, ip })
    if (recentes >= 10) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
    }
  }

  const email = await resolverEmail(admin, identificador)

  if (email) {
    const origin = request.headers.get('origin') ?? new URL(request.url).origin
    const supabase = await createClient()
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/redefinir-senha` })
  } else {
    await registrarAtividade(admin, { acao: 'recuperacao_recusada', detalhes: { motivo: 'email_nao_resolvido' }, ip })
  }

  return NextResponse.json({ ok: true, message: MSG_GENERICA })
}
