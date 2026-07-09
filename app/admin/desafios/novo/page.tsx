import { requireProfessorOrAbove } from '@/lib/profile'
import DesafioForm from '@/components/admin/DesafioForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Desafio' }

export default async function NovoDesafioPage() {
  const { profile } = await requireProfessorOrAbove()
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Desafio</h1>
      <DesafioForm professorId={profile.id} />
    </div>
  )
}
