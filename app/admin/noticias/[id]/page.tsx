import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NoticiaEditor from '@/components/admin/NoticiaEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarNoticiaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: noticia } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single()

  if (!noticia) notFound()

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Notícia</h1>
      <NoticiaEditor noticia={noticia} />
    </>
  )
}
