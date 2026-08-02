import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'

export default function PendentePage() {
  return (
    <div className="min-h-screen bg-escola-marinho flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-block w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20 shadow-elevation-low mb-6">
          <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="56px" className="object-cover" priority />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-elevation-high">
          <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-yellow-500" />
          </div>
          <h1 className="font-playfair text-gray-900 font-black text-2xl mb-2">Cadastro em Análise</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Seu cadastro foi recebido e está aguardando aprovação de um professor ou da direção da escola.
            Você receberá acesso assim que for aprovado.
          </p>
          <Link
            href="/admin"
            className="block w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-escola-azul-medio transition-colors text-sm"
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
