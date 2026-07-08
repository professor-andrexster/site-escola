import CursoForm from '@/components/admin/CursoForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Curso' }

export default function NovoCursoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Curso</h1>
      <CursoForm />
    </div>
  )
}
