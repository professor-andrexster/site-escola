import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'E.E. Dr. João Beraldo — Carlos Chagas, MG',
    template: '%s | E.E. Dr. João Beraldo',
  },
  description: 'Site oficial da Escola Estadual Dr. João Beraldo — Ensino Médio em Tempo Integral (EMTI), Carlos Chagas, Minas Gerais. Formando protagonistas desde 1946.',
  keywords: ['E.E. Dr. João Beraldo', 'EMTI', 'Ensino Médio em Tempo Integral', 'Carlos Chagas', 'Minas Gerais', 'escola estadual'],
  metadataBase: new URL('https://escolaestadualdrjoaoberaldo.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'E.E. Dr. João Beraldo',
    url: 'https://escolaestadualdrjoaoberaldo.com',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
