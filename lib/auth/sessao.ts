import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Costura da sessao.
 *
 * Hoje isto embrulha o Supabase Auth. Na fase 4 da migracao, a autenticacao
 * passa a ser propria (cookie assinado, hash bcrypt) e SO ESTE ARQUIVO muda —
 * as rotas que dependem de "quem esta logado" nao precisam ser tocadas de novo.
 *
 * A costura existe porque a fase 2 (dados) e a fase 4 (autenticacao) andam
 * separadas: sem ela, cada rota teria que ser reescrita duas vezes.
 */

export type UsuarioSessao = {
  id: string
  email: string | null
}

/** Quem esta logado, ou null. */
export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}

/** Encerra a sessao. Usado quando o perfil nao existe mais. */
export async function encerrarSessao(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// ------------------------------------------------------------- contas
// A criacao de conta tambem passa por aqui pelo mesmo motivo: na fase 4 ela
// vira insert em `usuarios` com hash proprio, e as rotas de cadastro nao
// precisam ser reescritas outra vez.

export class EmailJaCadastrado extends Error {}

/** Cria a conta de acesso. Devolve o id. */
export async function criarConta(email: string, senha: string): Promise<string> {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: senha,
    email_confirm: true,
  })
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes('already')) {
      throw new EmailJaCadastrado('Já existe uma conta com esse email.')
    }
    throw new Error(error?.message ?? 'Erro ao criar a conta.')
  }
  return data.user.id
}

/** Apaga a conta. Usado no rollback de cadastro que falhou no meio. */
export async function removerConta(userId: string): Promise<void> {
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(userId)
}

/** Troca a senha de uma conta. */
export async function definirSenha(userId: string, senha: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: senha })
  if (error) throw new Error(error.message)
}

/** E-mail de uma conta, para resolver identificador em login. */
export async function emailDaConta(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  return data.user?.email ?? null
}
