import { prisma } from '@/lib/db'

/**
 * A tabela de contas — o que era `auth.users` no Supabase.
 *
 * Guarda só o que a autenticação precisa: e-mail, hash da senha e os carimbos
 * de confirmação, último acesso e bloqueio. Nome, papel e aprovação continuam
 * em `profiles`; esta tabela não sabe nada sobre a escola.
 */

export async function buscarConta(id: string) {
  return prisma.usuarios.findUnique({
    where: { id },
    select: { id: true, email: true, encrypted_password: true, banned_until: true },
  })
}

/** Busca pelo e-mail. A collation da coluna é case-insensitive. */
export async function contaPorEmail(email: string) {
  return prisma.usuarios.findFirst({
    where: { email },
    select: { id: true, email: true, encrypted_password: true, banned_until: true },
  })
}

export async function emailDeConta(id: string): Promise<string | null> {
  const u = await prisma.usuarios.findUnique({ where: { id }, select: { email: true } })
  return u?.email ?? null
}

export async function criarConta(email: string, hash: string) {
  return prisma.usuarios.create({
    data: { email, encrypted_password: hash, email_confirmed_at: new Date() },
    select: { id: true },
  })
}

export async function trocarSenha(id: string, hash: string) {
  return prisma.usuarios.update({ where: { id }, data: { encrypted_password: hash } })
}

export async function registrarAcesso(id: string) {
  return prisma.usuarios.update({ where: { id }, data: { last_sign_in_at: new Date() } })
}

/**
 * Apaga a conta. `profiles` e o resto caem por cascata no banco — é o mesmo
 * efeito que `auth.admin.deleteUser` tinha, e é usado no rollback de um
 * cadastro que falhou no meio.
 */
export async function removerConta(id: string) {
  return prisma.usuarios.delete({ where: { id } })
}
