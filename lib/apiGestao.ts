import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { isGestao } from '@/lib/roles'
import type { Profile } from '@/types/database'

/**
 * Guardas de autorizacao das rotas de API. Vinte e seis rotas passam por aqui,
 * o que faz deste o ponto de maior alavanca da migracao: trocar a consulta de
 * perfil aqui migra a autorizacao de todas elas de uma vez.
 *
 * A identidade vem de lib/auth/sessao (que na fase 4 deixa de ser Supabase) e
 * o papel vem de lib/db/perfis (que ja e MariaDB). As tres funcoes seguem o
 * mesmo formato: nega sem sessao, nega sem aprovacao, nega sem o papel certo.
 *
 * Importante: com o fim do RLS, estas checagens deixam de ter rede embaixo.
 * No Supabase, uma rota que esquecesse de chamar o guarda ainda esbarrava na
 * policy. Aqui, esquecer o guarda significa rota aberta.
 */

const SEM_SESSAO = () =>
  NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
const SEM_PERMISSAO = () =>
  NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

type Resultado =
  | { ok: true; userId: string; role: Profile['role'] }
  | { ok: false; res: NextResponse }

/** Base comum: exige sessao e perfil aprovado, e devolve o papel. */
async function exigirAprovado(
  permitido: (role: Profile['role']) => boolean
): Promise<Resultado> {
  const usuario = await usuarioAtual()
  if (!usuario) return { ok: false, res: SEM_SESSAO() }

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado || !permitido(perfil.role)) {
    return { ok: false, res: SEM_PERMISSAO() }
  }

  return { ok: true, userId: usuario.id, role: perfil.role }
}

/** Diretora, vice-diretora ou admin. */
export async function exigirGestao(): Promise<
  { ok: true; userId: string } | { ok: false; res: NextResponse }
> {
  const r = await exigirAprovado(isGestao)
  return r.ok ? { ok: true, userId: r.userId } : r
}

/** Professor tambem pode agir — aprovacao de cadastro de aluno, por exemplo. */
export async function exigirProfessorOuGestao(): Promise<Resultado> {
  return exigirAprovado(role => role === 'professor' || isGestao(role))
}

/** Quem conduz um quiz ao vivo: professor, monitor ou gestao. */
export async function exigirQuizStaff(): Promise<Resultado> {
  return exigirAprovado(role => role === 'professor' || role === 'monitor' || isGestao(role))
}

/** Escrita do modulo de biblioteca: acervo, exemplares, leitores. */
export async function exigirBibliotecaStaff(): Promise<Resultado> {
  return exigirAprovado(role => role === 'bibliotecario' || isGestao(role))
}
