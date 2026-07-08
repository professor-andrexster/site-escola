import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, PlayCircle } from 'lucide-react'
import type { Curso } from '@/types/database'

interface CursoCardProps {
  curso: Curso
  totalAulas: number
  aulasConcluidas: number
}

export default function CursoCard({ curso, totalAulas, aulasConcluidas }: CursoCardProps) {
  const progresso = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0
  const iniciado = aulasConcluidas > 0

  return (
    <Link
      href={`/admin/cursos/${curso.slug}`}
      className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-curso-azul/50 hover:bg-white/[0.07] transition-all"
    >
      <div className="relative aspect-video bg-black">
        {curso.capa_url ? (
          <Image
            src={curso.capa_url}
            alt={curso.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <PlayCircle className="w-12 h-12 text-white" />
        </div>
      </div>
      <div className="p-4">
        {curso.categoria && (
          <p className="text-curso-ciano text-[10px] font-jetbrains uppercase tracking-widest mb-1">{curso.categoria}</p>
        )}
        <h3 className="text-white font-bold leading-snug mb-1">{curso.titulo}</h3>
        <p className="text-white/40 text-xs mb-3 line-clamp-2">{curso.descricao}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40 font-jetbrains">{totalAulas} aula{totalAulas !== 1 ? 's' : ''}</span>
          {iniciado ? (
            <span className="text-curso-ciano font-semibold font-jetbrains">
              {aulasConcluidas}/{totalAulas} concluídas
            </span>
          ) : (
            <span className="text-white/30 font-jetbrains">Começar</span>
          )}
        </div>
        {iniciado && (
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-curso-azul rounded-full transition-all" style={{ width: `${progresso}%` }} />
          </div>
        )}
      </div>
    </Link>
  )
}
