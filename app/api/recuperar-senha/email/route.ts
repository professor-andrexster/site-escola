import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { resolverEmail } from '@/lib/identidade'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'

// Resposta sempre genérica para não revelar se o email/matrícula/CPF existe
const MSG_GENERICA = 'Se encontrarmos seu cadastro, um link de redefinição será enviado para o email da conta.'

export async function POST(request: Request) {
  const body = await request.json()
  const { identificador } = body as { identificador?: string }

  if (!identificador?.trim()) {
    return NextResponse.json({ error: 'Informe seu email, matrícula ou CPF.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)

  if (ip) {
    const recentes = await contarRecentes({ acao: 'recuperacao_recusada', janelaMin: 60, ip })
    if (recentes >= 10) {
      return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
    }
  }

  const email = await resolverEmail(identificador)

  if (email) {
    const origin = request.headers.get('origin') ?? new URL(request.url).origin
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/admin/redefinir-senha`,
    })

    // O aluno continua vendo a mensagem genérica — não revelamos se o cadastro
    // existe. Mas o motivo real da falha precisa ficar registrado: sem isto,
    // limite de envio ou SMTP ausente no Supabase somem sem deixar rastro e a
    // rota responde "ok" mesmo sem ter enviado nada.
    if (error) {
      console.error('[recuperar-senha] falha ao enviar', {
        status: error.status,
        mensagem: error.message,
      })
      await registrar({
        acao: 'recuperacao_falhou',
        detalhes: { motivo: 'envio_falhou', erro: error.message, status: error.status ?? null },
        ip,
      })
    }
  } else {
    await registrar({ acao: 'recuperacao_recusada', detalhes: { motivo: 'email_nao_resolvido' }, ip })
  }

  return NextResponse.json({ ok: true, message: MSG_GENERICA })
}
