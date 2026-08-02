import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ObraForm from '@/components/admin/biblioteca/ObraForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nova Obra, Biblioteca' }
export const dynamic = 'force-dynamic'

export default function NovaObraPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/acervo" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para o acervo
      </Link>
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Nova Obra</h1>
      <ObraForm />
    </div>
  )
}
