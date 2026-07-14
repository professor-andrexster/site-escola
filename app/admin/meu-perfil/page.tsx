import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import MeuPerfilForm from '@/components/admin/MeuPerfilForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu Perfil — Área do Aluno' }
export const dynamic = 'force-dynamic'

export default async function MeuPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
        Você precisa estar autenticado para acessar esta página.
      </div>
    )
  }

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
      <p className="text-sm text-gray-400 mb-6">Atualize seus dados de contato e responsável</p>

      <MeuPerfilForm />
    </div>
  )
}
