import CadastroForm from '@/components/admin/CadastroForm'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cadastro — E.E. Dr. João Beraldo' }

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Cadastro de Professores</h1>
          <p className="text-white/40 text-sm font-mono mt-1">E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-escola-azul px-6 py-4">
            <p className="text-white/80 text-sm">
              Cadastro para professores e equipe pedagógica. Contas de aluno são criadas pela direção.
              Após o cadastro, a direção aprovará seu acesso.
            </p>
          </div>
          <CadastroForm />
        </div>

        <p className="text-center mt-4">
          <Link href="/admin" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
