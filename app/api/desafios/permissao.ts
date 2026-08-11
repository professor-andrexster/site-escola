import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { professorDoDesafio } from '@/lib/db/desafios'
import { isGestao } from '@/lib/roles'
import type { Profile } from '@/types/database'

export type Autor = { id: string; role: Profile['role'] }

/** Sessao aprovada, ou null. Base de tudo neste modulo. */
export async function autorAprovado(): Promise<Autor | null> {
  const usuario = await usuarioAtual()
  if (!usuario) return null
  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return null
  return { id: usuario.id, role: perfil.role }
}

/**
 * Quem avalia um desafio: a gestao, ou o professor dono daquele desafio.
 * E a mesma conta que a pagina faz para decidir se mostra o formulario de
 * nota — a diferenca e que agora o servidor tambem faz.
 */
export async function podeAvaliar(desafioId: string, autor: Autor): Promise<boolean> {
  if (isGestao(autor.role)) return true
  if (autor.role !== 'professor') return false
  return (await professorDoDesafio(desafioId)) === autor.id
}
