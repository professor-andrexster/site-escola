import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'E.E. Dr. João Beraldo — Carlos Chagas, MG',
    template: '%s | E.E. Dr. João Beraldo',
  },
  description: 'Site oficial da Escola Estadual Dr. João Beraldo — Ensino Médio em Tempo Integral (EMTI), Carlos Chagas, Minas Gerais. Formando protagonistas desde 1946.',
  keywords: ['E.E. Dr. João Beraldo', 'EMTI', 'Ensino Médio em Tempo Integral', 'Carlos Chagas', 'Minas Gerais', 'escola estadual'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'E.E. Dr. João Beraldo',
    images: [{ url: '/fachada.jpg', width: 1200, height: 630, alt: 'E.E. Dr. João Beraldo — Carlos Chagas, MG' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
