import { getProfileOrRedirect } from '@/lib/profile'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfileOrRedirect()
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar profile={profile} userEmail={user.email} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
