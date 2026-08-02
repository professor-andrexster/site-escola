import CadastroTabs from '@/components/admin/CadastroTabs'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Criar Conta — E.E. Dr. João Beraldo' }

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-block w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20 shadow-elevation-low mb-4">
            <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="56px" className="object-cover" priority />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Criar Conta</h1>
          <p className="text-white/40 text-sm font-mono mt-1">E.E. Dr. João Beraldo</p>
        </div>

        <CadastroTabs />

        <p className="text-center mt-4">
          <Link href="/admin" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
