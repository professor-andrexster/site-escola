import type { MetadataRoute } from 'next'

const BASE = 'https://escolaestadualdrjoaoberaldo.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', // painel interno, já protegido pelo middleware
        '/api/',
        '/quiz/', // URLs de sessão do quiz (/quiz/[codigo]/...); a página /quiz continua liberada
        '/portfolio/', // páginas pessoais de alunos, fora da busca (ver noindex em portfolio/[matricula])
        '/certificado/', // certificado nominal por código; acessível por link, fora da busca
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
