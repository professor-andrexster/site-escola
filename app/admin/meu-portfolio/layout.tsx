import { getProfileOrRedirect } from '@/lib/profile'
import AdminSidebar from '@/components/admin/AdminSidebar'
import RolagemAoTopo from '@/components/admin/RolagemAoTopo'
import MobileAdminHeader from '@/components/admin/MobileAdminHeader'

/**
 * O portfólio usa o tema ESCURO dos cursos, não o claro do painel: ele é a
 * continuação do curso "Do Código ao Ar", e o aluno chega aqui vindo de lá.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getProfileOrRedirect()
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar profile={profile} userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileAdminHeader profile={profile} userEmail={user.email} />
        <main className="flex-1 overflow-auto bg-curso-tinta">
          <RolagemAoTopo />
          {children}
        </main>
      </div>
    </div>
  )
}
