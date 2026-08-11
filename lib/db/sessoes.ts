import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

/**
 * Sessoes e tokens de redefinicao de senha.
 *
 * O token que vai no cookie (ou no link do e-mail) e sorteado aqui e guardado
 * so como SHA-256. Quem lesse a tabela `sessoes` com o token em claro poderia
 * se passar por qualquer pessoa logada; com o hash, nao.
 *
 * SHA-256 e nao bcrypt porque o token ja e 256 bits de aleatoriedade — nao ha
 * o que "adivinhar" por forca bruta, e o hash e conferido a cada requisicao.
 */

const DIAS_DE_SESSAO = Number(process.env.AUTH_SESSION_DAYS ?? 7)
const HORAS_DO_TOKEN_DE_SENHA = 2

export function sortearToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashDoToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function duracaoDaSessaoEmSegundos(): number {
  return DIAS_DE_SESSAO * 24 * 60 * 60
}

// ------------------------------------------------------------- sessoes

export async function abrirSessao(dados: {
  usuarioId: string
  token: string
  ip?: string | null
  userAgent?: string | null
}) {
  return prisma.sessoes.create({
    data: {
      usuario_id: dados.usuarioId,
      token_hash: hashDoToken(dados.token),
      expira_em: new Date(Date.now() + duracaoDaSessaoEmSegundos() * 1000),
      ip: dados.ip?.slice(0, 64) ?? null,
      user_agent: dados.userAgent?.slice(0, 255) ?? null,
    },
  })
}

/** Sessao viva pelo token, ou null. Nao renova: expiracao e absoluta. */
export async function sessaoValida(token: string) {
  const s = await prisma.sessoes.findUnique({
    where: { token_hash: hashDoToken(token) },
    select: {
      id: true,
      usuario_id: true,
      expira_em: true,
      revogado_em: true,
      usuarios: { select: { id: true, email: true, banned_until: true } },
    },
  })
  if (!s || s.revogado_em || s.expira_em < new Date()) return null
  // Conta bloqueada derruba a sessao em curso, nao so o proximo login.
  if (s.usuarios.banned_until && s.usuarios.banned_until > new Date()) return null
  return { id: s.id, usuario: s.usuarios }
}

export async function revogarSessao(token: string) {
  return prisma.sessoes.updateMany({
    where: { token_hash: hashDoToken(token), revogado_em: null },
    data: { revogado_em: new Date() },
  })
}

/**
 * Derruba todas as sessoes de uma conta. Usado ao trocar a senha: quem trocou
 * porque desconfiava de invasao precisa que o invasor caia junto.
 */
export async function revogarSessoesDoUsuario(usuarioId: string) {
  return prisma.sessoes.updateMany({
    where: { usuario_id: usuarioId, revogado_em: null },
    data: { revogado_em: new Date() },
  })
}

// ------------------------------------------------- tokens de redefinicao

export async function criarTokenDeSenha(usuarioId: string, token: string) {
  // Um pedido novo invalida os anteriores: o link antigo para de funcionar.
  await prisma.tokens_senha.updateMany({
    where: { usuario_id: usuarioId, usado_em: null },
    data: { usado_em: new Date() },
  })
  return prisma.tokens_senha.create({
    data: {
      usuario_id: usuarioId,
      token_hash: hashDoToken(token),
      expira_em: new Date(Date.now() + HORAS_DO_TOKEN_DE_SENHA * 60 * 60 * 1000),
    },
  })
}

export async function tokenDeSenhaValido(token: string) {
  const t = await prisma.tokens_senha.findUnique({
    where: { token_hash: hashDoToken(token) },
    select: { id: true, usuario_id: true, expira_em: true, usado_em: true },
  })
  if (!t || t.usado_em || t.expira_em < new Date()) return null
  return t
}

export async function consumirTokenDeSenha(id: string) {
  return prisma.tokens_senha.update({ where: { id }, data: { usado_em: new Date() } })
}
