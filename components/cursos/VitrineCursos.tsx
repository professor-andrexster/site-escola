import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, PlayCircle } from 'lucide-react'
import HeroCursosSEO from './HeroCursosSEO'
import type { Curso } from '@/types/database'

interface CursoVitrine extends Curso {
  totalAulas: number
}

export default function VitrineCursos({
  cursos,
  onAbrirModal
}: {
  cursos: CursoVitrine[]
  onAbrirModal?: (curso: CursoVitrine) => void
}) {
  const categorias = Array.from(new Set(cursos.map(c => c.categoria).filter(Boolean))) as string[]

  return (
    <div className="bg-white">
      {/* Hero SEO */}
      <HeroCursosSEO />

      {/* Seção de Cursos */}
      <div id="cursos"></div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
            {categorias.map(cat => (
              <span
                key={cat}
                className="flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {cursos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum curso publicado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.map(curso => (
              <button
                key={curso.id}
                onClick={() => onAbrirModal?.(curso)}
                className="group text-left bg-curso-papel border border-curso-linha rounded-xl overflow-hidden hover:border-curso-azul hover:shadow-lg transition-all flex flex-col cursor-pointer"
              >
                <div className="relative h-32 bg-escola-azul/10 flex items-center justify-center overflow-hidden">
                  {curso.capa_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-escola-azul/40" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {curso.categoria && (
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-curso-azul text-white">
                        {curso.categoria}
                      </span>
                    )}
                    <span className="text-[10px] text-curso-texto-suave font-mono uppercase tracking-wide">{curso.nivel}</span>
                  </div>
                  <h3 className="font-semibold text-curso-azul text-sm mb-1.5">{curso.titulo}</h3>
                  <p className="text-[11px] text-curso-texto-suave mb-2">por {curso.autor_nome}</p>
                  {curso.descricao && <p className="text-xs text-curso-texto-suave mb-3 line-clamp-2">{curso.descricao}</p>}
                  <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-curso-linha">
                    <span className="text-curso-texto-suave font-mono">{curso.totalAulas} aula{curso.totalAulas !== 1 ? 's' : ''}</span>
                    <span className="text-curso-azul font-semibold">Ver curso →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          É preciso estar logado para assistir às aulas. Ainda não tem conta?{' '}
          <Link href="/admin/cadastro" className="text-escola-azul font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
