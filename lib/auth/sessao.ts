import { createClient } from '@/lib/supabase/server'

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
