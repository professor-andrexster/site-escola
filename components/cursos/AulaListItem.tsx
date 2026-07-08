import Link from 'next/link'
import { CircleCheck, PlayCircle, Circle, Clock } from 'lucide-react'
import type { Aula } from '@/types/database'

export type AulaStatus = 'nao_iniciada' | 'em_andamento' | 'concluida'

interface AulaListItemProps {
  aula: Aula
  numero: number
  status: AulaStatus
  href: string
}

const STATUS_ICON: Record<AulaStatus, React.ReactNode> = {
  nao_iniciada: <Circle className="w-5 h-5 text-white/20" />,
  em_andamento: <PlayCircle className="w-5 h-5 text-curso-azul-claro" />,
  concluida: <CircleCheck className="w-5 h-5 text-curso-ciano" />,
}

const STATUS_LABEL: Record<AulaStatus, string> = {
  nao_iniciada: 'Não iniciada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
}

export default function AulaListItem({ aula, numero, status, href }: AulaListItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-curso-azul/50 hover:bg-white/[0.07] transition-all"
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-white/40 text-xs font-jetbrains font-bold">
        {String(numero).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{aula.titulo}</p>
        {aula.descricao && <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{aula.descricao}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {aula.duracao_estimada_min && (
          <span className="hidden sm:flex items-center gap-1 text-white/30 text-xs font-jetbrains">
            <Clock className="w-3 h-3" />
            {aula.duracao_estimada_min} min
          </span>
        )}
        <span className="hidden md:inline text-xs font-jetbrains text-white/30">{STATUS_LABEL[status]}</span>
        {STATUS_ICON[status]}
      </div>
    </Link>
  )
}
