import { getProfileOrRedirect } from '@/lib/profile'
import CursoForm from '@/components/admin/CursoForm'
import { isGestao } from '@/lib/roles'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Curso' }
export const dynamic = 'force-dynamic'

export default async function NovoCursoPage() {
  const { profile } = await getProfileOrRedirect()
  const isDirecao = isGestao(profile.role)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Curso</h1>
      <CursoForm isDirecao={isDirecao} />
    </div>
  )
}
