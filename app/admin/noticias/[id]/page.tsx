import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import NoticiaEditor from '@/components/admin/NoticiaEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarNoticiaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const { data: noticia } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single()

  if (!noticia) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <h1 className="font-fraunces text-3xl font-bold text-gray-900 mb-8">Editar Notícia</h1>
        <NoticiaEditor noticia={noticia} />
      </main>
    </div>
  )
}
