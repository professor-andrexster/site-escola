import { getProfileOrRedirect } from '@/lib/profile'
import EmprestimoConsole from '@/components/admin/biblioteca/EmprestimoConsole'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Empréstimo, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function EmprestimoPage() {
  const { profile } = await getProfileOrRedirect()
  return <EmprestimoConsole role={profile.role} />
}
