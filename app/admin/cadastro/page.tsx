import CadastroTabs from '@/components/admin/CadastroTabs'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Criar Conta — E.E. Dr. João Beraldo' }

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
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
