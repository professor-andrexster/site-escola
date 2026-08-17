import nodemailer from 'nodemailer'

/**
 * Envio de e-mail pelo servidor de e-mail da própria escola.
 *
 * Saiu do Resend por um motivo prático: o plano gratuito permite UM domínio
 * verificado, e essa vaga já está ocupada por outro cliente
 * (`oliveiraejesusadvogados.com.br`). Verificar o domínio da escola custaria
 * US$ 20/mês.
 *
 * A escola já tem caixas de e-mail na Hostinger — os MX do domínio apontam
 * para lá. Enviar por elas não custa nada a mais, e tem uma vantagem que um
 * serviço novo não teria: o SPF do domínio já autoriza a Hostinger
 * (`include:_spf.mail.hostinger.com`), então a mensagem nasce autenticada e
 * cai menos em spam. Numa redefinição de senha isso importa — e-mail no spam
 * vira chamado na secretaria.
 */

const SERVIDOR = process.env.SMTP_HOST || 'smtp.hostinger.com'
const PORTA = Number(process.env.SMTP_PORT || 465)
const USUARIO = process.env.SMTP_USER
const SENHA = process.env.SMTP_PASS

// O remetente é a própria caixa autenticada: servidor de e-mail recusa enviar
// em nome de endereço diferente do que fez login.
const REMETENTE = process.env.SMTP_FROM || USUARIO || ''
const NOME_REMETENTE = 'E.E. Dr. João Beraldo'

class EmailNaoConfigurado extends Error {}

function transporte() {
  if (!USUARIO || !SENHA) {
    throw new EmailNaoConfigurado(
      'SMTP_USER e SMTP_PASS não estão definidos. Crie a caixa no painel da ' +
      'hospedagem e preencha o .env — sem isso nenhum e-mail sai.'
    )
  }
  return nodemailer.createTransport({
    host: SERVIDOR,
    port: PORTA,
    // 465 fala TLS desde o primeiro byte; 587 começa em claro e sobe com
    // STARTTLS. Errar isso trava a conexão sem mensagem clara.
    secure: PORTA === 465,
    auth: { user: USUARIO, pass: SENHA },
  })
}

async function enviar(para: string, assunto: string, html: string) {
  const info = await transporte().sendMail({
    from: `${NOME_REMETENTE} <${REMETENTE}>`,
    to: para,
    subject: assunto,
    html,
  })
  return info.messageId
}

/** Moldura comum das duas mensagens, para não repetir o HTML. */
function moldura(titulo: string, corpo: string, botao: { texto: string; link: string }, rodape: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="font-size: 20px;">${titulo}</h1>
      <p style="font-size: 14px; line-height: 1.6;">${corpo}</p>
      <p style="margin: 24px 0;">
        <a href="${botao.link}" style="background: #1a3a5c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          ${botao.texto}
        </a>
      </p>
      <p style="font-size: 12px; color: #666; line-height: 1.6;">${rodape}</p>
    </div>
  `
}

export async function enviarConviteBibliotecario(params: { nome: string; email: string; link: string }) {
  const { nome, email, link } = params
  await enviar(
    email,
    'Convite de acesso à biblioteca escolar',
    moldura(
      `Olá, ${nome}.`,
      'A direção da E.E. Dr. João Beraldo criou um convite de acesso ao sistema de ' +
        'gestão da biblioteca escolar para você. Use o botão abaixo para criar sua senha ' +
        'e ativar sua conta.',
      { link, texto: 'Ativar minha conta' },
      'Este convite expira em sete dias. Se você não esperava este email, pode ignorar ' +
        'esta mensagem com segurança.'
    )
  )
}

export async function enviarRedefinicaoDeSenhaPorEmail(params: { email: string; link: string }) {
  const { email, link } = params
  await enviar(
    email,
    'Redefinição de senha',
    moldura(
      'Redefinir sua senha',
      'Alguém pediu a redefinição da senha desta conta no sistema da E.E. Dr. João ' +
        'Beraldo. Se foi você, use o botão abaixo para escolher uma senha nova.',
      { link, texto: 'Escolher nova senha' },
      'O link vale por duas horas e só pode ser usado uma vez. Se você não pediu isso, ' +
        'ignore esta mensagem — sua senha atual continua valendo.'
    )
  )
}
