'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'A Escola' },
  {
    label: 'EMTI',
    children: [
      { href: '/emti', label: 'O Programa EMTI' },
      { href: '/emti/projeto-vida', label: 'Projeto de Vida' },
      { href: '/emti/eletivas', label: 'Eletivas' },
      { href: '/emti/protagonismo', label: 'Protagonismo Juvenil' },
    ],
  },
  { href: '/noticias', label: 'Notícias' },
  { href: '/contato', label: 'Contato' },
]

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [emtiOpen, setEmtiOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled ? 'shadow-lg' : ''
    )}>
      {/* Top bar */}
      <div className="bg-escola-azul text-white/70 text-xs font-mono px-4 py-1.5">
        <div className="container mx-auto flex items-center justify-between">
          <span className="capitalize hidden sm:block">{formatDate()}</span>
          <div className="flex items-center gap-4">
            <span>Carlos Chagas — MG</span>
            <span className="text-white/30">|</span>
            <span>INEP 31146579</span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="bg-escola-creme border-b-2 border-escola-azul">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-escola-azul/20 group-hover:ring-escola-vermelho/40 transition-all duration-300 flex-shrink-0">
              <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-escola-vermelho leading-none mb-0.5">
                Escola Estadual
              </p>
              <h1 className="font-playfair font-black text-escola-azul leading-tight text-lg md:text-2xl group-hover:text-escola-azul/80 transition-colors" style={{ fontVariant: 'small-caps' }}>
                Dr. João Beraldo
              </h1>
              <p className="font-mono text-[9px] text-escola-cinza tracking-widest uppercase hidden sm:block">
                Ensino Médio em Tempo Integral · Est. 1946
              </p>
            </div>
          </Link>

          <div className="hidden lg:block text-right">
            <p className="font-playfair italic text-escola-azul/50 text-sm">
              "Formando protagonistas para o mundo"
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin" className="p-2 rounded text-escola-cinza hover:text-escola-azul transition-colors" title="Área administrativa">
              <Lock className="w-3.5 h-3.5" />
            </Link>
            <button
              className="md:hidden p-2 rounded text-escola-azul hover:bg-escola-azul/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-escola-azul hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key="emti" className="relative group">
                    <button className={cn(
                      'flex items-center gap-1 px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all duration-200',
                      pathname.startsWith('/emti')
                        ? 'text-white bg-escola-vermelho'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}>
                      {item.label}
                      <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute top-full left-0 hidden group-hover:block pt-0 z-50">
                      <div className="bg-white border-t-2 border-escola-vermelho shadow-2xl min-w-[220px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-5 py-3 text-sm font-mono border-b border-escola-creme-escuro transition-colors',
                              pathname === child.href
                                ? 'text-escola-vermelho bg-escola-creme font-medium'
                                : 'text-escola-azul hover:bg-escola-creme hover:text-escola-vermelho'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    'px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all duration-200',
                    pathname === item.href
                      ? 'text-white bg-escola-vermelho'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="ml-auto px-4 py-3 flex items-center gap-2">
              <a href="https://www.instagram.com/escolajoaoberaldo" target="_blank" rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-xs font-mono transition-colors">IG</a>
              <span className="text-white/20">|</span>
              <a href="https://youtube.com/@joaoberaldocarloschagas" target="_blank" rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-xs font-mono transition-colors">YT</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-escola-azul border-t border-white/10">
          {navItems.map((item) => {
            if (item.children) {
              return (
                <div key="emti-mobile">
                  <button
                    onClick={() => setEmtiOpen(!emtiOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-mono uppercase tracking-wider text-white/80 border-b border-white/10 hover:bg-white/10"
                  >
                    {item.label}
                    <ChevronDown className={cn('w-3 h-3 transition-transform', emtiOpen && 'rotate-180')} />
                  </button>
                  {emtiOpen && (
                    <div className="bg-escola-azul/80">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-3 text-sm font-mono text-white/70 border-b border-white/5 hover:bg-white/10 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-5 py-3.5 text-sm font-mono uppercase tracking-wider border-b border-white/10',
                  pathname === item.href
                    ? 'text-white bg-escola-vermelho'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
