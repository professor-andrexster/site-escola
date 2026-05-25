import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Newspaper, Eye, Star, Plus, Inbox } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalNoticias },
    { count: noticiasPublicadas },
    { count: noticiasDestaque },
    { count: leadsNaoLidos },
  ] = await Promise.all([
    supabase.from('noticias').select('*', { count: 'exact', head: true }),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('publicado', true),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('destaque_home', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lido', false),
  ])

  const stats = [
    { label: 'Total de Notícias', value: totalNoticias ?? 0, icon: Newspaper, color: 'text-escola-azul bg-escola-azul-claro' },
    { label: 'Publicadas', value: noticiasPublicadas ?? 0, icon: Eye, color: 'text-escola-verde bg-escola-verde-claro' },
    { label: 'Em Destaque', value: noticiasDestaque ?? 0, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Leads não lidos', value: leadsNaoLidos ?? 0, icon: Inbox, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-fraunces text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/noticias/nova"
          className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Notícia
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={cn('p-3 rounded-xl', color.split(' ')[1])}>
                <Icon className={cn('w-6 h-6', color.split(' ')[0])} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-fraunces text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/admin/noticias/nova" className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-escola-azul hover:bg-escola-azul-claro transition-colors text-sm font-medium text-gray-600 hover:text-escola-azul text-center">
            + Nova Notícia
          </Link>
          <Link href="/admin/noticias" className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-escola-azul hover:bg-escola-azul-claro transition-colors text-sm font-medium text-gray-600 hover:text-escola-azul text-center">
            Gerenciar Notícias
          </Link>
          <Link href="/admin/leads" className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-escola-azul hover:bg-escola-azul-claro transition-colors text-sm font-medium text-gray-600 hover:text-escola-azul text-center">
            Ver Leads
          </Link>
          <Link href="/admin/paginas" className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-escola-azul hover:bg-escola-azul-claro transition-colors text-sm font-medium text-gray-600 hover:text-escola-azul text-center">
            Editar Páginas
          </Link>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
