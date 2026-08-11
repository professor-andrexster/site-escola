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
  // O './' é resolvido contra o pathname da página atual, então cada rota sai
  // com o seu próprio canônico sem precisar declarar um por página. Isso é o
  // que diz ao buscador que o endereço oficial é o domínio sem www.
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'E.E. Dr. João Beraldo',
    url: 'https://escolaestadualdrjoaoberaldo.com',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
