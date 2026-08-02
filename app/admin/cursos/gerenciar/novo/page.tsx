import { createClient } from '@/lib/supabase/server'
import CursoForm from '@/components/admin/CursoForm'
import { isGestao } from '@/lib/roles'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Curso' }
export const dynamic = 'force-dynamic'

export default async function NovoCursoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  const isDirecao = isGestao(profile?.role ?? 'aluno')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Curso</h1>
      <CursoForm isDirecao={isDirecao} />
    </div>
  )
}
