import {
  LayoutDashboard, Newspaper, FileText, Settings,
  Inbox, Gamepad2, Users, Trophy, GraduationCap,
} from 'lucide-react'
import type { Profile } from '@/types/database'

export interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navByRole: Record<Profile['role'], NavGroup[]> = {
  direcao: [
    {
      label: 'Gestão',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/usuarios', label: 'Usuários', icon: Users },
        { href: '/admin/alunos', label: 'Alunos', icon: GraduationCap },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { href: '/admin/noticias', label: 'Notícias', icon: Newspaper },
        { href: '/admin/quiz', label: 'JBQuiz', icon: Gamepad2 },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { href: '/admin/leads', label: 'Leads', icon: Inbox },
        { href: '/admin/paginas', label: 'Páginas', icon: FileText },
        { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
      ],
    },
  ],
  professor: [
    {
      label: 'Geral',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { href: '/admin/noticias', label: 'Notícias', icon: Newspaper },
      ],
    },
    {
      label: 'JBQuiz',
      items: [
        { href: '/admin/quiz', label: 'Meus Quizzes', icon: Gamepad2 },
      ],
    },
  ],
  monitor: [
    {
      label: 'Minha Área',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/noticias', label: 'Minhas Notícias', icon: Newspaper },
        { href: '/admin/meus-quizzes', label: 'Meus Quizzes', icon: Gamepad2 },
        { href: '/ranking', label: 'Ranking', icon: Trophy },
      ],
    },
  ],
  aluno: [
    {
      label: 'Minha Área',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/meus-quizzes', label: 'Meus Quizzes', icon: Gamepad2 },
        { href: '/ranking', label: 'Ranking', icon: Trophy },
      ],
    },
  ],
}
