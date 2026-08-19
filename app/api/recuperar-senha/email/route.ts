import { NextResponse } from 'next/server'
import { enviarRedefinicaoDeSenha } from '@/lib/auth/sessao'

import { resolverEmail } from '@/lib/identidade'
import { ipDoRequest } from '@/lib/log'
import { registrar, contarRecentes } from '@/lib/db/log'
import { enderecoPublico } from '@/lib/http/endereco-publico'

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
    const origin = enderecoPublico(request)
    const r = await enviarRedefinicaoDeSenha(email, `${origin}/admin/redefinir-senha`)
    const error = r.erro

    // Registra TAMBÉM o sucesso e a conta inexistente. Antes só a falha de
    // envio virava log, então "pedido que não gerou e-mail nenhum" não deixava
    // rastro — e foi assim que o caso de um aluno passou semanas invisível.
    if (r.desfecho === 'enviado') {
      await registrar({
        acao: 'recuperacao_enviada',
        // Só o domínio: basta para diagnosticar caixa que não recebe, sem
        // gravar o endereço inteiro no log de auditoria.
        detalhes: { dominio: (r.destino ?? '').split('@')[1] ?? null },
        ip,
      })
    } else if (r.desfecho === 'conta_inexistente') {
      await registrar({
        acao: 'recuperacao_recusada',
        detalhes: { motivo: 'sem_conta_para_o_email_resolvido' },
        ip,
      })
    }

    // O aluno continua vendo a mensagem genérica — não revelamos se o cadastro
    // existe. Mas o motivo real da falha precisa ficar registrado: sem isto,
    // limite de envio ou SMTP ausente no Supabase somem sem deixar rastro e a
    // rota responde "ok" mesmo sem ter enviado nada.
    if (error) {
      console.error('[recuperar-senha] falha ao enviar', {
        status: error.status,
        mensagem: error.mensagem,
      })
      await registrar({
        acao: 'recuperacao_falhou',
        detalhes: { motivo: 'envio_falhou', erro: error.mensagem, status: error.status ?? null },
        ip,
      })
    }
  } else {
    await registrar({ acao: 'recuperacao_recusada', detalhes: { motivo: 'email_nao_resolvido' }, ip })
  }

  return NextResponse.json({ ok: true, message: MSG_GENERICA })
}
