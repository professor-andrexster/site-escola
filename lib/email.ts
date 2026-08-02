import { Resend } from 'resend'

function client() {
  return new Resend(process.env.RESEND_API_KEY)
}

const REMETENTE = process.env.RESEND_FROM_EMAIL || 'biblioteca@escolaestadualdrjoaoberaldo.com'

export async function enviarConviteBibliotecario(params: { nome: string; email: string; link: string }) {
  const { nome, email, link } = params

  const { error } = await client().emails.send({
    from: `E.E. Dr. João Beraldo <${REMETENTE}>`,
    to: email,
    subject: 'Convite de acesso à biblioteca escolar',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 20px;">Olá, ${nome}.</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          A direção da E.E. Dr. João Beraldo criou um convite de acesso ao sistema de
          gestão da biblioteca escolar para você. Use o botão abaixo para criar sua senha
          e ativar sua conta.
        </p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="background: #1a3a5c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Ativar minha conta
          </a>
        </p>
        <p style="font-size: 12px; color: #666; line-height: 1.6;">
          Este convite expira em sete dias. Se você não esperava este email, pode ignorar
          esta mensagem com segurança.
        </p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
