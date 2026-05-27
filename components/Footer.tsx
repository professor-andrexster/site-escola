import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-escola-azul text-white/70 mt-auto">
      {/* Top accent */}
      <div className="h-1 bg-escola-vermelho" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                <Image src="/logo.jpg" alt="Logo" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-escola-vermelho uppercase tracking-widest">Escola Estadual</p>
                <h3 className="font-playfair font-black text-white text-lg leading-tight" style={{ fontVariant: 'small-caps' }}>
                  Dr. João Beraldo
                </h3>
              </div>
            </div>
            <p className="font-serif text-sm leading-relaxed mb-4">
              Escola Estadual Dr. João Beraldo — Carlos Chagas, MG.
              Fundada em 1946, formando protagonistas por meio do
              Ensino Médio em Tempo Integral (EMTI).
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/escolajoaoberaldo" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">Instagram</a>
              <a href="https://youtube.com/@joaoberaldocarloschagas" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">YouTube</a>
              <a href="https://www.facebook.com/share/1GrYbrPEvJ/" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">Facebook</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Início' },
                { href: '/sobre', label: 'A Escola' },
                { href: '/emti', label: 'Programa EMTI' },
                { href: '/noticias', label: 'JBInforma' },
                { href: '/contato', label: 'Contato' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="font-serif text-sm hover:text-white transition-colors hover:pl-1 inline-block duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">Contato</h4>
            <address className="font-serif text-sm not-italic space-y-2.5">
              <p className="leading-relaxed">
                Av. Gabriel Passos, 393<br />
                Centro — Carlos Chagas, MG<br />
                CEP 39864-000
              </p>
              <p>
                <a href="tel:+5533998701618" className="hover:text-white transition-colors">(33) 99870-1618</a>
              </p>
              <p>
                <a href="https://wa.me/5533998701618" target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">WhatsApp</a>
              </p>
              <p>
                <a href="mailto:escola.146579.secretaria@educacao.mg.gov.br"
                  className="hover:text-white transition-colors text-xs break-all leading-relaxed">
                  escola.146579.secretaria@<br />educacao.mg.gov.br
                </a>
              </p>
              <p className="text-xs text-white/40 pt-1">
                Seg–Sex: 7h às 22h
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-white/30 text-center sm:text-left">
            © {year} E.E. Dr. João Beraldo — Todos os direitos reservados
          </p>
          <p className="font-mono text-xs text-white/20">
            SRE Teófilo Otoni · INEP 31146579
          </p>
        </div>
      </div>
    </footer>
  )
}
