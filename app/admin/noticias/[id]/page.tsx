import { createClient } from '@/lib/supabase/server'
import { requireMonitorOrAbove } from '@/lib/profile'
import { notFound } from 'next/navigation'
import NoticiaEditor from '@/components/admin/NoticiaEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarNoticiaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { user, profile } = await requireMonitorOrAbove()

  const { data: noticia } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single()

  if (!noticia) notFound()

  // Monitor só pode editar suas próprias notícias
  if (profile.role === 'monitor' && noticia.autor_id !== user.id) notFound()

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Notícia</h1>
      <NoticiaEditor
        noticia={noticia}
        isMonitor={profile.role === 'monitor'}
        autorNome={noticia.autor_nome ?? profile.nome_completo}
      />
    </>
  )
}
