'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Menu, X, LogOut, Globe } from 'lucide-react'
import type { Profile } from '@/types/database'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { navByRole } from '@/lib/adminNav'
import Avatar from '@/components/admin/ui/Avatar'

interface Props {
  profile: Profile
  userEmail?: string
}

export default function MobileAdminHeader({ profile, userEmail }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const groups = navByRole[profile.role] ?? navByRole.aluno

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <>
      {/* Barra superior — só no mobile */}
      <header className="md:hidden bg-escola-marinho flex items-center justify-between px-fluid-2xs py-3 sticky top-0 z-40 shadow-elevation-medium">
        <button
          onClick={() => setOpen(true)}
          className="text-white/70 hover:text-white p-1 -ms-1"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white flex-shrink-0">
            <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="28px" className="object-cover" />
          </div>
          <span className="text-white font-playfair font-bold text-sm">João Beraldo</span>
        </Link>

        <Link href="/admin/meu-perfil" aria-label="Meu perfil">
          <Avatar nome={profile.nome_completo} avatarUrl={profile.avatar_url} role={profile.role} tamanho="sm" />
        </Link>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Painel lateral */}
          <aside className="relative w-72 max-w-[85vw] bg-escola-marinho flex flex-col h-full overflow-y-auto shadow-elevation-high">
            {/* Topo */}
            <div className="px-fluid-xs py-fluid-xs border-b border-white/5 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white flex-shrink-0">
                  <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="36px" className="object-cover" />
                </div>
                <div>
                  <p className="text-white font-playfair font-bold text-sm leading-tight">Dr. João Beraldo</p>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Painel Escolar</p>
                </div>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white p-1"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Usuário, em destaque logo abaixo da logo da escola */}
            <Link
              href="/admin/meu-perfil"
              onClick={() => setOpen(false)}
              className="flex flex-col items-center text-center px-fluid-xs pt-fluid-s pb-fluid-xs border-b border-white/5 active:bg-white/[0.03] transition-colors"
            >
              <Avatar
                nome={profile.nome_completo}
                avatarUrl={profile.avatar_url}
                role={profile.role}
                tamanho="xl"
                className="shadow-elevation-medium ring-2 ring-white/10"
              />
              <p className="text-white text-sm font-semibold mt-3 leading-tight truncate max-w-full">{profile.nome_completo}</p>
              <p className="text-white/40 text-xs truncate max-w-full">{userEmail}</p>
              <span className={cn('mt-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded', ROLE_COLORS[profile.role])}>
                {ROLE_LABELS[profile.role]}
              </span>
            </Link>

            {/* Navegação */}
            <nav className="flex-1 px-3 py-fluid-2xs space-y-fluid-2xs">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-white/25 text-[10px] font-mono uppercase tracking-[0.15em] px-2 mb-1.5">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map(({ href, label, icon: Icon }) => {
                      const active = href === '/admin/dashboard'
                        ? pathname === href
                        : pathname.startsWith(href)
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                              active
                                ? 'bg-escola-vermelho text-white font-semibold shadow-elevation-low'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Rodapé */}
            <div className="px-3 py-fluid-2xs border-t border-white/5 space-y-1">
              <Link
                href="/"
                target="_blank"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                Ver Site Público
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sair da Conta
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
