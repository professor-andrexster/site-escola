import Link from 'next/link'
import { Clock, GraduationCap } from 'lucide-react'

export default function PendentePage() {
  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-6">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="font-playfair text-gray-900 font-black text-2xl mb-2">Cadastro em Análise</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Seu cadastro foi recebido e está aguardando aprovação da direção da escola.
            Você receberá acesso assim que for aprovado.
          </p>
          <Link
            href="/admin"
            className="block w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Voltar ao Login
          </Link>
          <Link
            href="/"
            className="block mt-3 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Ver o site da escola →
          </Link>
        </div>
      </div>
    </div>
  )
}
