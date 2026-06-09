import { requireDirecao } from '@/lib/profile'
import AdminSidebar from '@/components/admin/AdminSidebar'
import MobileAdminHeader from '@/components/admin/MobileAdminHeader'

export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireDirecao()
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar profile={profile} userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileAdminHeader profile={profile} userEmail={user.email} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
