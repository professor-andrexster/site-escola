import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Escola EMTI',
    template: '%s | Escola EMTI',
  },
  description: 'Site oficial da Escola de Ensino Médio em Tempo Integral',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
