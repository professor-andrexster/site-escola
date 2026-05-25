import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NoticiasTable from '@/components/admin/NoticiasTable'
import { Plus } from 'lucide-react'

export default async function AdminNoticiasPage() {
  const supabase = await createClient()
  const { data: noticias } = await supabase
    .from('noticias')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-fraunces text-3xl font-bold text-gray-900">Notícias</h1>
        <Link
          href="/admin/noticias/nova"
          className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Notícia
        </Link>
      </div>
      <NoticiasTable noticias={noticias ?? []} />
    </div>
  )
}
