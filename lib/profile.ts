import { usuarioAtual } from '@/lib/auth/sessao'
import { buscarPorId } from '@/lib/db/perfis'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'
import { GESTAO_ROLES, isGestao } from '@/lib/roles'
export { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'

export async function getProfileOrRedirect(): Promise<{ user: { id: string; email?: string }, profile: Profile }> {
  const user = await usuarioAtual()
  if (!user) redirect('/admin')

  const profile = await buscarPorId(user.id)
  if (!profile) redirect('/admin')
  if (!profile.aprovado) redirect('/admin/pendente')

  return { user: { id: user.id, email: user.email ?? undefined }, profile }
}

export async function requireGestao() {
  const result = await getProfileOrRedirect()
  if (!isGestao(result.profile.role)) redirect('/admin/dashboard')
  return result
}

export async function requireProfessorOuGestao() {
  const result = await getProfileOrRedirect()
  if (result.profile.role !== 'professor' && !isGestao(result.profile.role)) redirect('/admin/dashboard')
  return result
}

export async function requireProfessorOrAbove() {
  const result = await getProfileOrRedirect()
  if (!['professor', 'monitor', ...GESTAO_ROLES].includes(result.profile.role)) redirect('/admin/dashboard')
  return result
}

export async function requireMonitorOrAbove() {
  const result = await getProfileOrRedirect()
  if (!['monitor', ...GESTAO_ROLES].includes(result.profile.role)) redirect('/admin/dashboard')
  return result
}

export async function requireBibliotecaStaff() {
  const result = await getProfileOrRedirect()
  if (result.profile.role !== 'bibliotecario' && !isGestao(result.profile.role)) redirect('/admin/dashboard')
  return result
}

