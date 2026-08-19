import { getProfileOrRedirect } from '@/lib/profile'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RolagemAoTopo from '@/components/admin/RolagemAoTopo'
import MobileAdminHeader from '@/components/admin/MobileAdminHeader'

/**
 * Enquadramento padrão do painel.
 *
 * Esta rota não tinha layout próprio e caía no app/admin/layout.tsx, que é só
 * `<>{children}</>` — então a página abria sem barra lateral, sem cabeçalho e
 * sem margem, colada na borda da tela. De dentro dela não havia como navegar
 * para lugar nenhum.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfileOrRedirect()
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar profile={profile} userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileAdminHeader profile={profile} userEmail={user.email} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <RolagemAoTopo />
          {children}
        </main>
      </div>
    </div>
  )
}
