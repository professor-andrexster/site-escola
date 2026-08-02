import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LeitorForm from '@/components/admin/biblioteca/LeitorForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo Leitor, Biblioteca' }
export const dynamic = 'force-dynamic'

export default function NovoLeitorPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/leitores" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para leitores
      </Link>
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Novo Leitor</h1>
      <LeitorForm />
    </div>
  )
}
