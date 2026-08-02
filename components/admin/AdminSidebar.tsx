'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut, Globe } from 'lucide-react'
import type { Profile } from '@/types/database'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { navByRole } from '@/lib/adminNav'
import Avatar from '@/components/admin/ui/Avatar'

interface AdminSidebarProps {
  profile: Profile
  userEmail?: string
}

export default function AdminSidebar({ profile, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const groups = navByRole[profile.role] ?? navByRole.aluno

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#0d1f35] flex-col min-h-screen">
      {/* Logo */}
      <div className="px-fluid-xs py-fluid-xs border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white ring-1 ring-white/20 flex-shrink-0 shadow-elevation-low">
            <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="36px" className="object-cover" />
          </div>
          <div>
            <p className="text-white font-playfair font-bold text-sm leading-tight group-hover:text-white/80 transition-colors">
              Dr. João Beraldo
            </p>
            <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Painel Escolar</p>
          </div>
        </Link>
      </div>

      {/* Foto de quem esta logado, em destaque logo abaixo da logo da escola */}
      <Link
        href="/admin/meu-perfil"
        className="flex flex-col items-center text-center px-fluid-xs pt-fluid-s pb-fluid-xs border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
      >
        <Avatar
          nome={profile.nome_completo}
          avatarUrl={profile.avatar_url}
          role={profile.role}
          tamanho="xl"
          className="shadow-elevation-medium ring-2 ring-white/10 group-hover:ring-white/25 transition-all"
        />
        <p className="text-white text-sm font-semibold mt-3 leading-tight truncate max-w-full">{profile.nome_completo}</p>
        <p className="text-white/40 text-xs truncate max-w-full">{userEmail}</p>
        <span className={cn('mt-2 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded', ROLE_COLORS[profile.role])}>
          {ROLE_LABELS[profile.role]}
        </span>
        <span className="mt-1.5 text-[10px] text-white/0 group-hover:text-white/40 transition-colors">Editar perfil →</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-fluid-2xs space-y-fluid-2xs overflow-y-auto">
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
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ease-out',
                        active
                          ? 'bg-escola-vermelho text-white font-semibold shadow-elevation-low'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5'
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1 -start-3 w-1 rounded-full bg-white/70" aria-hidden />
                      )}
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

      {/* Footer */}
      <div className="px-3 py-fluid-2xs border-t border-white/5 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          Ver Site Público
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sair da Conta
        </button>
      </div>
    </aside>
  )
}
