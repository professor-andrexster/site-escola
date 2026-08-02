'use client'

import { Printer } from 'lucide-react'

// A janela de impressão do navegador já oferece "Salvar como PDF":
// um botão resolve impressão e download de uma vez, sem biblioteca de PDF.
export default function BotaoImprimirCertificado() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-escola-azul-medio transition-colors print:hidden"
    >
      <Printer className="w-4 h-4" />
      Imprimir ou Salvar em PDF
    </button>
  )
}
