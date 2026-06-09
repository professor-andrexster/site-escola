'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LogOut, Globe, GraduationCap,
} from 'lucide-react'
import type { Profile } from '@/types/database'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { navByRole } from '@/lib/adminNav'

interface AdminSidebarProps {
  profile: Profile
  userEmail?: string
}

export default function AdminSidebar({ profile, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const groups = navByRole[profile.role] ?? navByRole.aluno

  const initials = profile.nome_completo
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#0d1f35] flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-escola-vermelho flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-playfair font-bold text-sm leading-tight group-hover:text-white/80 transition-colors">
              Dr. João Beraldo
            </p>
            <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Painel Escolar</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-escola-vermelho flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{profile.nome_completo}</p>
            <p className="text-white/40 text-xs truncate">{userEmail}</p>
          </div>
        </div>
        <div className="mt-2.5">
          <span className={cn('text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded', ROLE_COLORS[profile.role])}>
            {ROLE_LABELS[profile.role]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
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
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        active
                          ? 'bg-escola-vermelho text-white font-semibold'
                          : 'text-white/60 hover:text-white hover:bg-white/8'
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

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/8 transition-all duration-150"
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
