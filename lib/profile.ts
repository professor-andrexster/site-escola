import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'
export { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'

export async function getProfileOrRedirect(): Promise<{ user: { id: string; email?: string }, profile: Profile }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/admin')
  if (!profile.aprovado) redirect('/admin/pendente')

  return { user: { id: user.id, email: user.email }, profile }
}

export async function requireDirecao() {
  const result = await getProfileOrRedirect()
  if (result.profile.role !== 'direcao') redirect('/admin/dashboard')
  return result
}

export async function requireProfessorOrAbove() {
  const result = await getProfileOrRedirect()
  if (!['professor', 'direcao'].includes(result.profile.role)) redirect('/admin/dashboard')
  return result
}

