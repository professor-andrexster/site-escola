import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import LeitoresTable from '@/components/admin/biblioteca/LeitoresTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leitores, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function LeitoresPage() {
  const admin = createAdminClient()
  const { data: leitores } = await admin.from('biblioteca_leitores').select('*').order('nome_completo')

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-escola-azul" />
            Leitores
          </h1>
          <p className="text-sm text-gray-400 mt-1">{leitores?.length ?? 0} leitor(es) cadastrado(s).</p>
        </div>
        <Link
          href="/admin/biblioteca/leitores/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-escola-azul text-white rounded-xl text-sm font-semibold hover:bg-escola-azul/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Leitor
        </Link>
      </div>

      <LeitoresTable leitores={leitores ?? []} />
    </div>
  )
}
