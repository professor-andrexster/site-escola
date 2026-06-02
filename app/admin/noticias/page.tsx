import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import NoticiasTable from '@/components/admin/NoticiasTable'
import { Plus, Clock, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AdminNoticiasPage() {
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  const isMonitor = profile.role === 'monitor'
  const isDirecao = profile.role === 'direcao'

  let query = supabase.from('noticias').select('*').order('created_at', { ascending: false })
  if (isMonitor) {
    query = query.eq('autor_id', user.id)
  }
  const { data: noticias } = await query

  // Log de atividades — só para direção
  const { data: logs } = isDirecao
    ? await supabase
        .from('noticias_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
    : { data: null }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-fraunces text-3xl font-bold text-gray-900">
            {isMonitor ? 'Minhas Notícias' : 'Notícias'}
          </h1>
          {isMonitor && (
            <p className="text-sm text-gray-400 mt-1">Você pode publicar suas próprias matérias no site.</p>
          )}
        </div>
        <Link
          href="/admin/noticias/nova"
          className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Notícia
        </Link>
      </div>

      <NoticiasTable
        noticias={noticias ?? []}
        canSetDestaque={!isMonitor}
        role={profile.role}
        autorNome={profile.nome_completo}
      />

      {/* Log de atividades — visível só para direção */}
      {isDirecao && logs && logs.length > 0 && (
        <div className="mt-10">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Log de Atividades
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ação</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Notícia</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Responsável</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: {
                  id: string
                  acao: string
                  noticia_titulo: string | null
                  noticia_id: string | null
                  autor_nome: string | null
                  created_at: string
                }) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        log.acao.includes('deletou') ? 'bg-red-50 text-red-700' :
                        log.acao.includes('publicou') || log.acao.includes('criou e publicou') ? 'bg-green-50 text-green-700' :
                        log.acao.includes('tirou') ? 'bg-orange-50 text-orange-700' :
                        log.acao.includes('destaque') ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {log.noticia_id ? (
                        <Link href={`/admin/noticias/${log.noticia_id}`} className="hover:text-escola-azul hover:underline flex items-center gap-1">
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          {log.noticia_titulo ?? '—'}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{log.noticia_titulo ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{log.autor_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
