import { getProfileOrRedirect } from '@/lib/profile'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RolagemAoTopo from '@/components/admin/RolagemAoTopo'
import MobileAdminHeader from '@/components/admin/MobileAdminHeader'

export default async function CursosCatalogoLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfileOrRedirect()
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar profile={profile} userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileAdminHeader profile={profile} userEmail={user.email} />
        <main className="flex-1 overflow-auto bg-curso-tinta">
        <RolagemAoTopo />{children}</main>
      </div>
    </div>
  )
}
