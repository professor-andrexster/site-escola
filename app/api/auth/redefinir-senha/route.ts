import { NextResponse } from 'next/server'
import { definirSenha } from '@/lib/auth/sessao'
import { senhaFraca } from '@/lib/auth/senha'
import { consumirTokenDeSenha, tokenDeSenhaValido } from '@/lib/db/sessoes'
import { ipDoRequest } from '@/lib/log'
import { contarRecentes, registrar } from '@/lib/db/log'

const MSG_TOKEN = 'Este link não vale mais. Peça uma nova redefinição de senha.'

/**
 * Troca a senha usando o token do e-mail.
 *
 * O token vale duas horas, serve uma vez so, e trocar a senha derruba as
 * sessoes abertas daquela conta — quem redefine porque desconfia de invasao
 * precisa que o invasor caia junto.
 */
export async function POST(request: Request) {
  const ip = ipDoRequest(request)

  // Sem limite, da para varrer tokens: sao 256 bits, mas o custo de tentar
  // deve ser alto de qualquer forma.
  if (ip && (await contarRecentes({ acao: 'redefinicao_falhou', janelaMin: 15, ip })) >= 10) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 })
  }

  const { token, senha } = (await request.json()) as { token?: string; senha?: string }
  if (!token || !senha) {
    return NextResponse.json({ error: 'Informe a nova senha.' }, { status: 400 })
  }

  const fraca = senhaFraca(senha)
  if (fraca) return NextResponse.json({ error: fraca }, { status: 400 })

  const registro = await tokenDeSenhaValido(token)
  if (!registro) {
    await registrar({ acao: 'redefinicao_falhou', detalhes: { motivo: 'token_invalido' }, ip })
    return NextResponse.json({ error: MSG_TOKEN }, { status: 400 })
  }

  try {
    await definirSenha(registro.usuario_id, senha)
    await consumirTokenDeSenha(registro.id)
    await registrar({ acao: 'senha_redefinida', userId: registro.usuario_id, ip })
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[redefinir-senha] falha', erro)
    return NextResponse.json({ error: 'Erro ao redefinir a senha.' }, { status: 400 })
  }
}
