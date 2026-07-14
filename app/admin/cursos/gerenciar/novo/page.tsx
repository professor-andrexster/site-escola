import { createClient } from '@/lib/supabase/server'
import CursoForm from '@/components/admin/CursoForm'
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

  const isDirecao = profile?.role === 'direcao'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Novo Curso</h1>
      <CursoForm isDirecao={isDirecao} />
    </div>
  )
}
