import { requireMonitorOrAbove } from '@/lib/profile'
import NoticiaEditor from '@/components/admin/NoticiaEditor'

export default async function NovaNoticiaPage() {
  const { profile } = await requireMonitorOrAbove()
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nova Notícia</h1>
      <NoticiaEditor
        isMonitor={profile.role === 'monitor'}
        autorNome={profile.nome_completo}
      />
    </>
  )
}
