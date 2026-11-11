import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Acesso } from '@/lib/podcast/dados'
import { alunoLiberado } from '@/lib/podcast/api'
import type { Materia } from '@/lib/jornal/tipos'

export { erro, exigirAcesso, exigirModerador, texto } from '@/lib/podcast/api'

/** Reporter: aluno da equipe com termo aceito do ano e permissao de postar. Monitor e direcao tambem escrevem. */
export const podeEscrever = (a: Acesso) => a.moderador || alunoLiberado(a)

/** Quem pode mexer no texto agora: monitor sempre; o autor so enquanto a materia esta com ele. */
export function podeEditarMateria(m: Materia, a: Acesso): boolean {
  if (a.moderador) return true
  return alunoLiberado(a) && m.autorId === a.userId && (m.status === 'rascunho' || m.status === 'ajustar')
}

/** Quem pode abrir a materia no painel. */
export const podeVerMateria = (m: Materia, a: Acesso) => a.moderador || m.autorId === a.userId

export async function ipDoPedido(): Promise<string | null> {
  const h = await headers()
  return (h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',').pop()?.trim() ?? null)?.slice(0, 64) ?? null
}

/** O jornal aparece na home, no cabecalho e em varias paginas: limpa tudo de uma vez. */
export const limparCache = () => revalidatePath('/', 'layout')
