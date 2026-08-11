import { NextResponse } from 'next/server'
import { entrarComSenha, encerrarSessao } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { resolverEmail, mascararIdentificador } from '@/lib/identidade'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'

const MSG_ERRO = 'Dados de acesso incorretos. Verifique e tente novamente.'

export async function POST(request: Request) {
  const body = await request.json()
  const { identificador, senha } = body as { identificador?: string; senha?: string }

  if (!identificador?.trim() || !senha) {
    return NextResponse.json({ error: 'Informe seus dados de acesso e a senha.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)

  // Rate limit: 10 falhas em 15 min por IP
  if (ip) {
    const falhas = await contarRecentes({ acao: 'login_falha', janelaMin: 15, ip })
    if (falhas >= 10) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
    }
  }

  const email = await resolverEmail(identificador)
  if (!email) {
    await registrar({
      acao: 'login_falha',
      detalhes: { identificador: mascararIdentificador(identificador), motivo: 'nao_encontrado' },
      ip,
    })
    return NextResponse.json({ error: MSG_ERRO }, { status: 401 })
  }

  // A costura grava os cookies de sessão e devolve o erro cru do provedor.
  const resultado = await entrarComSenha(email, senha)

  if ('erro' in resultado) {
    // O rótulo 'senha_incorreta' é enganoso: o Supabase devolve o mesmo
    // "Invalid login credentials" para senha errada E para usuário inexistente.
    // Sem a mensagem crua não dá para distinguir os dois — nem enxergar casos
    // como e-mail não confirmado ou bloqueio por tentativas.
    console.error('[login] recusado pelo Supabase', {
      status: resultado.erro.status,
      mensagem: resultado.erro.mensagem,
    })
    await registrar({
      acao: 'login_falha',
      detalhes: {
        identificador: mascararIdentificador(identificador),
        motivo: 'senha_incorreta',
        erro_provedor: resultado.erro.mensagem,
        // e-mail que o identificador resolveu, mascarado: se não for o que o
        // usuário espera, o problema está na resolução, não na senha
        email_resolvido: email.replace(/^(.{2})[^@]*(@.*)$/, '$1***$2'),
      },
      ip,
    })
    return NextResponse.json({ error: MSG_ERRO }, { status: 401 })
  }

  const profile = await papelEAprovacao(resultado.usuario.id)

  if (!profile) {
    await encerrarSessao()
    return NextResponse.json({ error: 'Perfil não encontrado. Entre em contato com a direção.' }, { status: 403 })
  }

  await registrar({ acao: 'login_ok', userId: resultado.usuario.id, ip })

  return NextResponse.json({ ok: true, destino: profile.aprovado ? '/admin/dashboard' : '/admin/pendente' })
}
