import { cookies, headers } from 'next/headers'
import { conferir, gastarTempoDeHash, gerarHash } from '@/lib/auth/senha'
import {
  abrirSessao,
  criarTokenDeSenha,
  duracaoDaSessaoEmSegundos,
  revogarSessao,
  revogarSessoesDoUsuario,
  sessaoValida,
  sortearToken,
} from '@/lib/db/sessoes'
import * as contas from '@/lib/db/usuarios'
import { enviarRedefinicaoDeSenhaPorEmail } from '@/lib/email'

/**
 * Costura da sessao.
 *
 * Ate a fase 3 isto embrulhava o Supabase Auth. Agora a autenticacao e nossa:
 * cookie com token opaco, sessao em `sessoes`, senha em bcrypt na coluna
 * `usuarios.encrypted_password`.
 *
 * As assinaturas exportadas sao as mesmas de antes, de proposito — foi para
 * isso que a costura existiu durante a fase 2. Nenhuma rota precisou mudar
 * por causa da troca de provedor.
 *
 * O token vai no cookie em claro e no banco como SHA-256. O cookie e httpOnly,
 * sameSite lax e secure em producao: JavaScript da pagina nao le, e ele nao
 * viaja para outro site.
 */

export const COOKIE_DE_SESSAO = 'jb_sessao'

export type UsuarioSessao = {
  id: string
  email: string | null
}

function opcoesDoCookie(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

/** Quem esta logado, ou null. */
export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const token = (await cookies()).get(COOKIE_DE_SESSAO)?.value
  if (!token) return null

  const sessao = await sessaoValida(token)
  if (!sessao) return null

  return { id: sessao.usuario.id, email: sessao.usuario.email }
}

/** Encerra a sessao. Usado quando o perfil nao existe mais, e no logout. */
export async function encerrarSessao(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(COOKIE_DE_SESSAO)?.value
  if (token) await revogarSessao(token)
  jar.set(COOKIE_DE_SESSAO, '', opcoesDoCookie(0))
}

/**
 * Autentica e abre a sessao (grava o cookie). Devolve o usuario ou o motivo da
 * recusa — a rota precisa do motivo para registrar o que de fato aconteceu,
 * que era o que faltava quando dois alunos ficaram travados em agosto.
 *
 * Ao contrario do Supabase, aqui os motivos sao distinguiveis: conta
 * inexistente, senha errada, conta sem senha (migrada sem hash) e conta
 * bloqueada dizem coisas diferentes no log. Para quem esta na tela, a rota
 * continua respondendo a mesma frase generica.
 */
export async function entrarComSenha(
  email: string,
  senha: string
): Promise<{ usuario: UsuarioSessao } | { erro: { mensagem: string; status?: number } }> {
  const conta = await contas.contaPorEmail(email)

  if (!conta) {
    // Gasta o tempo de um bcrypt mesmo sem conta: senao da para descobrir
    // quais e-mails existem so cronometrando a resposta.
    await gastarTempoDeHash()
    return { erro: { mensagem: 'conta não encontrada', status: 401 } }
  }
  if (!conta.encrypted_password) {
    await gastarTempoDeHash()
    return { erro: { mensagem: 'conta sem senha definida', status: 401 } }
  }
  if (conta.banned_until && conta.banned_until > new Date()) {
    await gastarTempoDeHash()
    return { erro: { mensagem: 'conta bloqueada', status: 403 } }
  }
  if (!(await conferir(senha, conta.encrypted_password))) {
    return { erro: { mensagem: 'senha incorreta', status: 401 } }
  }

  const cabecalhos = await headers()
  const token = sortearToken()
  await abrirSessao({
    usuarioId: conta.id,
    token,
    ip: cabecalhos.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: cabecalhos.get('user-agent'),
  })
  await contas.registrarAcesso(conta.id)
  ;(await cookies()).set(COOKIE_DE_SESSAO, token, opcoesDoCookie(duracaoDaSessaoEmSegundos()))

  return { usuario: { id: conta.id, email: conta.email } }
}

/**
 * Dispara o e-mail de redefinicao. `redirectTo` e a pagina que recebe o token.
 *
 * Nao diz se o e-mail existe: quem chama ja responde a mesma frase generica
 * nos dois casos, e aqui a ausencia da conta tambem nao vira erro.
 */
/**
 * Dispara a redefinicao de senha.
 *
 * O retorno distingue os tres desfechos porque os dois primeiros eram
 * indistinguiveis no log: quando nao havia conta, a funcao devolvia `{}`
 * exatamente como no envio bem-sucedido, e a rota nao registrava nada.
 *
 * Isso escondeu um problema por semanas. Um aluno pedia a redefinicao pelo
 * e-mail institucional, que nao era o e-mail da conta dele; nenhuma conta era
 * encontrada, nenhum token nascia, nenhum e-mail saia — e nao ficava registro
 * nenhum de que ele havia tentado. Do lado dele, "o link nunca chega".
 */
export async function enviarRedefinicaoDeSenha(
  email: string,
  redirectTo: string
): Promise<{
  desfecho: 'enviado' | 'conta_inexistente' | 'falha_no_envio'
  destino?: string
  erro?: { mensagem: string; status?: number }
}> {
  const conta = await contas.contaPorEmail(email)
  if (!conta) return { desfecho: 'conta_inexistente' }

  const token = sortearToken()
  await criarTokenDeSenha(conta.id, token)

  try {
    await enviarRedefinicaoDeSenhaPorEmail({
      email: conta.email,
      link: `${redirectTo}?token=${token}`,
    })
    return { desfecho: 'enviado', destino: conta.email }
  } catch (erro) {
    return { desfecho: 'falha_no_envio', erro: { mensagem: (erro as Error).message } }
  }
}

// ------------------------------------------------------------- contas

export class EmailJaCadastrado extends Error {}

/** Cria a conta de acesso. Devolve o id. */
export async function criarConta(email: string, senha: string): Promise<string> {
  const normalizado = email.trim().toLowerCase()
  if (await contas.contaPorEmail(normalizado)) {
    throw new EmailJaCadastrado('Já existe uma conta com esse email.')
  }

  try {
    const conta = await contas.criarConta(normalizado, await gerarHash(senha))
    return conta.id
  } catch (erro) {
    // Corrida entre duas criacoes com o mesmo e-mail: a unique decide.
    if ((erro as { code?: string })?.code === 'P2002') {
      throw new EmailJaCadastrado('Já existe uma conta com esse email.')
    }
    throw erro
  }
}

/** Apaga a conta. Usado no rollback de cadastro que falhou no meio. */
export async function removerConta(userId: string): Promise<void> {
  await contas.removerConta(userId)
}

/**
 * Troca a senha de uma conta e derruba as sessoes abertas dela.
 *
 * Quem troca a senha porque desconfia de invasao precisa que o invasor caia
 * junto — no Supabase, a sessao dele continuava valendo.
 */
export async function definirSenha(userId: string, senha: string): Promise<void> {
  await contas.trocarSenha(userId, await gerarHash(senha))
  await revogarSessoesDoUsuario(userId)
}

/** E-mail de uma conta, para resolver identificador em login. */
export async function emailDaConta(userId: string): Promise<string | null> {
  return contas.emailDeConta(userId)
}
