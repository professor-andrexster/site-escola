import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ROLE_COLORS } from '@/lib/roles'
import type { Profile } from '@/types/database'

const TAMANHOS = {
  sm: { caixa: 'w-7 h-7', texto: 'text-[10px]', px: 28 },
  md: { caixa: 'w-9 h-9', texto: 'text-xs', px: 36 },
  lg: { caixa: 'w-16 h-16', texto: 'text-lg', px: 64 },
  xl: { caixa: 'w-24 h-24', texto: 'text-2xl', px: 96 },
} as const

interface AvatarProps {
  nome: string
  avatarUrl?: string | null
  role?: Profile['role']
  tamanho?: keyof typeof TAMANHOS
  className?: string
}

/** Foto da pessoa quando existe; senao, iniciais sobre a cor do papel dela.
 * Componente atomico (Brad Frost): usado em toda parte que hoje mostraria
 * "a pessoa logada", do menu lateral a ficha de usuario. */
export default function Avatar({ nome, avatarUrl, role, tamanho = 'md', className }: AvatarProps) {
  const { caixa, texto, px } = TAMANHOS[tamanho]
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const corFundo = role ? ROLE_COLORS[role] : 'bg-escola-azul text-white'

  if (avatarUrl) {
    return (
      <div className={cn('relative rounded-full overflow-hidden ring-1 ring-black/5 flex-shrink-0', caixa, className)}>
        <Image src={avatarUrl} alt={nome} fill sizes={`${px}px`} className="object-cover" />
      </div>
    )
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center flex-shrink-0 font-semibold', caixa, texto, corFundo, className)}>
      {iniciais || '?'}
    </div>
  )
}
