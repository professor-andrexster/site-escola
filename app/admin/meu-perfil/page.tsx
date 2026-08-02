import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import MeuPerfilForm from '@/components/admin/MeuPerfilForm'
import StaffPerfilForm from '@/components/admin/StaffPerfilForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu Perfil, Painel Escolar' }
export const dynamic = 'force-dynamic'

export default async function MeuPerfilPage() {
  const { profile } = await getProfileOrRedirect()

  return (
    <div>
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para dashboard
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <User className="w-6 h-6 text-escola-azul" />
        Meu Perfil
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {profile.role === 'aluno' ? 'Atualize seus dados de contato e responsável' : 'Atualize sua foto e seus dados'}
      </p>

      {profile.role === 'aluno' ? <MeuPerfilForm /> : <StaffPerfilForm profile={profile} />}
    </div>
  )
}
