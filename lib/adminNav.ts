import {
  LayoutDashboard, FileText, Settings,
  Inbox, Gamepad2, Users, Trophy, GraduationCap, BookOpen, Library, Lightbulb, Rocket, User, Briefcase,
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
      label: 'Gestão Escolar',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/alunos', label: 'Alunos', icon: GraduationCap },
        { href: '/admin/funcionarios', label: 'Funcionários', icon: Briefcase },
        { href: '/admin/usuarios', label: 'Administradores', icon: Users },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { href: '/admin/quiz', label: 'JBQuiz', icon: Gamepad2 },
        { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/admin/cursos/gerenciar', label: 'Gerenciar Cursos', icon: Library },
      ],
    },
    {
      label: 'Protagonismo',
      items: [
        { href: '/admin/ideias', label: 'Fábrica de Ideias', icon: Lightbulb },
        { href: '/admin/desafios', label: 'Desafios', icon: Rocket },
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
        { href: '/admin/funcionarios', label: 'Equipe', icon: Briefcase },
      ],
    },
    {
      label: 'JBQuiz',
      items: [
        { href: '/admin/quiz', label: 'Meus Quizzes', icon: Gamepad2 },
      ],
    },
    {
      label: 'Cursos',
      items: [
        { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/admin/cursos/gerenciar', label: 'Gerenciar Cursos', icon: Library },
      ],
    },
    {
      label: 'Protagonismo',
      items: [
        { href: '/admin/ideias', label: 'Fábrica de Ideias', icon: Lightbulb },
        { href: '/admin/desafios', label: 'Desafios', icon: Rocket },
      ],
    },
  ],
  monitor: [
    {
      label: 'Minha Área',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/meu-perfil', label: 'Meu Perfil', icon: User },
        { href: '/admin/meus-quizzes', label: 'Meus Quizzes', icon: Gamepad2 },
        { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/admin/ideias', label: 'Fábrica de Ideias', icon: Lightbulb },
        { href: '/admin/desafios', label: 'Desafios', icon: Rocket },
        { href: '/ranking', label: 'Ranking', icon: Trophy },
      ],
    },
  ],
  aluno: [
    {
      label: 'Minha Área',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/meu-perfil', label: 'Meu Perfil', icon: User },
        { href: '/admin/meus-quizzes', label: 'Meus Quizzes', icon: Gamepad2 },
        { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { href: '/admin/ideias', label: 'Fábrica de Ideias', icon: Lightbulb },
        { href: '/admin/desafios', label: 'Desafios', icon: Rocket },
        { href: '/ranking', label: 'Ranking', icon: Trophy },
      ],
    },
  ],
}
