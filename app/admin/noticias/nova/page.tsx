import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import NoticiaEditor from '@/components/admin/NoticiaEditor'

export default async function NovaNoticiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <h1 className="font-fraunces text-3xl font-bold text-gray-900 mb-8">Nova Notícia</h1>
        <NoticiaEditor />
      </main>
    </div>
  )
}
