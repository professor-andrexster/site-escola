import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-fraunces text-white text-lg font-semibold mb-3">E.E. Dr. João Beraldo</h3>
            <p className="text-sm leading-relaxed">
              Escola Estadual Dr. João Beraldo — Carlos Chagas, MG. Formando protagonistas desde 1946 por meio do Ensino Médio em Tempo Integral.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.instagram.com/escolajoaoberaldo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs">Instagram</a>
              <a href="https://youtube.com/@joaoberaldocarloschagas" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs">YouTube</a>
              <a href="https://www.facebook.com/share/1GrYbrPEvJ/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs">Facebook</a>
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/sobre', label: 'Sobre a Escola' },
                { href: '/emti', label: 'EMTI' },
                { href: '/noticias', label: 'Notícias' },
                { href: '/contato', label: 'Contato' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Contato</h3>
            <address className="text-sm not-italic space-y-1">
              <p>Av. Gabriel Passos, 393 — Centro</p>
              <p>Carlos Chagas — MG, CEP 39864-000</p>
              <p className="mt-2">(33) 99870-1618</p>
              <a href="mailto:escola.146579.secretaria@educacao.mg.gov.br" className="hover:text-white transition-colors break-all">
                escola.146579.secretaria@educacao.mg.gov.br
              </a>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} E.E. Dr. João Beraldo — Carlos Chagas, MG — Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  )
}
