'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'Sobre a Escola' },
  {
    label: 'EMTI',
    children: [
      { href: '/emti', label: 'O que é o EMTI' },
      { href: '/emti/projeto-vida', label: 'Projeto de Vida' },
      { href: '/emti/eletivas', label: 'Eletivas' },
      { href: '/emti/protagonismo', label: 'Protagonismo Juvenil' },
    ],
  },
  { href: '/noticias', label: 'Notícias' },
  { href: '/contato', label: 'Contato' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [emtiOpen, setEmtiOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-fraunces text-xl font-bold text-escola-azul">
            E.E. Dr. João Beraldo
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key="emti" className="relative group">
                    <button
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-escola-azul hover:bg-escola-azul-claro',
                        pathname.startsWith('/emti') ? 'text-escola-azul bg-escola-azul-claro' : 'text-gray-700'
                      )}
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full left-0 pt-1 hidden group-hover:block">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2 text-sm hover:bg-gray-50 hover:text-escola-azul transition-colors',
                              pathname === child.href ? 'text-escola-azul font-medium' : 'text-gray-700'
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
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-escola-azul hover:bg-escola-azul-claro',
                    pathname === item.href ? 'text-escola-azul bg-escola-azul-claro' : 'text-gray-700'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Admin lock + Mobile hamburger */}
          <div className="flex items-center gap-1">
            <Link
              href="/admin"
              className="p-2 rounded-lg text-gray-400 hover:text-escola-azul hover:bg-escola-azul-claro transition-colors"
              aria-label="Área administrativa"
              title="Área administrativa"
            >
              <Lock className="w-4 h-4" />
            </Link>
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-0.5">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key="emti-mobile">
                    <button
                      onClick={() => setEmtiOpen(!emtiOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {item.label}
                      <ChevronDown className={cn('w-3 h-3 transition-transform', emtiOpen && 'rotate-180')} />
                    </button>
                    {emtiOpen && (
                      <div className="pl-4 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-escola-azul"
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
                    'block px-3 py-2 rounded-lg text-sm font-medium',
                    pathname === item.href ? 'text-escola-azul bg-escola-azul-claro' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
