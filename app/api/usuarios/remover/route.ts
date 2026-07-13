import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirDirecao } from '@/lib/apiDirecao'

// Remove a conta por completo (auth.users + profiles). Antes o "Rejeitar" da
// tela de usuários deletava só o profile e deixava a conta órfã no auth,
// travando o email/CPF para sempre.
export async function POST(request: Request) {
  const auth = await exigirDirecao()
  if (!auth.ok) return auth.res

  const { userId } = (await request.json()) as { userId?: string }
  if (!userId) return NextResponse.json({ error: 'Usuário não informado.' }, { status: 400 })
  if (userId === auth.userId) {
    return NextResponse.json({ error: 'Você não pode remover a própria conta.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // identidades cai em cascata com o auth user; profiles removemos explicitamente
  await admin.from('profiles').delete().eq('id', userId)
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    return NextResponse.json({ error: 'Erro ao remover: ' + error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
