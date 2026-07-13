import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolverEmail, mascararIdentificador } from '@/lib/identidade'
import { registrarAtividade, contarRecentes, ipDoRequest } from '@/lib/log'

const MSG_ERRO = 'Dados de acesso incorretos. Verifique e tente novamente.'

export async function POST(request: Request) {
  const body = await request.json()
  const { identificador, senha } = body as { identificador?: string; senha?: string }

  if (!identificador?.trim() || !senha) {
    return NextResponse.json({ error: 'Informe seus dados de acesso e a senha.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const admin = createAdminClient()

  // Rate limit: 10 falhas em 15 min por IP
  if (ip) {
    const falhas = await contarRecentes(admin, { acao: 'login_falha', janelaMin: 15, ip })
    if (falhas >= 10) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
    }
  }

  const email = await resolverEmail(admin, identificador)
  if (!email) {
    await registrarAtividade(admin, {
      acao: 'login_falha',
      detalhes: { identificador: mascararIdentificador(identificador), motivo: 'nao_encontrado' },
      ip,
    })
    return NextResponse.json({ error: MSG_ERRO }, { status: 401 })
  }

  // Login server-side: o client de lib/supabase/server grava os cookies de sessão
  const supabase = await createClient()
  const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (authError || !data.user) {
    await registrarAtividade(admin, {
      acao: 'login_falha',
      detalhes: { identificador: mascararIdentificador(identificador), motivo: 'senha_incorreta' },
      ip,
    })
    return NextResponse.json({ error: MSG_ERRO }, { status: 401 })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('aprovado')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'Perfil não encontrado. Entre em contato com a direção.' }, { status: 403 })
  }

  await registrarAtividade(admin, { acao: 'login_ok', userId: data.user.id, ip })

  return NextResponse.json({ ok: true, destino: profile.aprovado ? '/admin/dashboard' : '/admin/pendente' })
}
