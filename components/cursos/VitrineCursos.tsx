'use client'

import { useMemo, useState } from 'react'
import { GraduationCap, PlayCircle, Search } from 'lucide-react'
import HeroCursosSEO from './HeroCursosSEO'
import { gradeDoCurso, ORDEM_GRADE, type Grade } from '@/lib/cursosGrade'
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
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)

  const categorias = Array.from(new Set(cursos.map(c => c.categoria).filter(Boolean))) as string[]

  const cursosFiltrados = useMemo(() => {
    return cursos.filter(c => {
      const bateBusca = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase()) || c.descricao?.toLowerCase().includes(busca.toLowerCase())
      const bateCategoria = !categoriaAtiva || c.categoria === categoriaAtiva
      return bateBusca && bateCategoria
    })
  }, [cursos, busca, categoriaAtiva])

  const porGrade = useMemo(() => {
    const grupos = new Map<Grade, CursoVitrine[]>()
    for (const grade of ORDEM_GRADE) grupos.set(grade, [])
    for (const c of cursosFiltrados) {
      const grade = gradeDoCurso(c.slug)
      grupos.get(grade)!.push(c)
    }
    return grupos
  }, [cursosFiltrados])

  return (
    <div className="bg-escola-creme">
      <HeroCursosSEO />

      <div id="cursos" className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Busca e filtro */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-escola-cinza" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar curso por nome..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-escola-cinza-claro bg-white text-sm text-escola-preto placeholder:text-escola-cinza focus:outline-none focus:ring-2 focus:ring-escola-azul"
            />
          </div>
        </div>

        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-8 -mx-1 px-1">
            <button
              onClick={() => setCategoriaAtiva(null)}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                !categoriaAtiva ? 'bg-escola-azul text-white border-escola-azul' : 'border-escola-cinza-claro bg-white text-escola-cinza hover:border-escola-azul'
              }`}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat === categoriaAtiva ? null : cat)}
                className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  categoriaAtiva === cat ? 'bg-escola-azul text-white border-escola-azul' : 'border-escola-cinza-claro bg-white text-escola-cinza hover:border-escola-azul'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {cursosFiltrados.length === 0 ? (
          <div className="bg-white border border-escola-cinza-claro rounded-xl p-12 text-center">
            <GraduationCap className="w-10 h-10 text-escola-cinza-claro mx-auto mb-3" />
            <p className="text-escola-cinza text-sm">Nenhum curso encontrado.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {ORDEM_GRADE.map(grade => {
              const lista = porGrade.get(grade) ?? []
              if (lista.length === 0) return null
              return (
                <section key={grade}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-playfair text-xl font-black text-escola-azul">{grade}</h2>
                    <div className="flex-1 h-px bg-escola-cinza-claro" />
                    <span className="text-xs font-mono text-escola-cinza">{lista.length} curso{lista.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lista.map(curso => (
                      <button
                        key={curso.id}
                        onClick={() => onAbrirModal?.(curso)}
                        className="group text-left bg-white border border-escola-cinza-claro rounded-xl overflow-hidden hover:border-escola-azul hover:shadow-lg transition-all flex flex-col cursor-pointer"
                      >
                        <div className="relative h-32 bg-escola-azul/10 flex items-center justify-center overflow-hidden">
                          {curso.capa_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <GraduationCap className="w-8 h-8 text-escola-azul/40" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-escola-preto/40">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            {curso.categoria && (
                              <span className="text-[10px] font-mono font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-escola-vermelho text-white">
                                {curso.categoria}
                              </span>
                            )}
                            <span className="text-[10px] text-escola-cinza font-mono uppercase tracking-wide">{curso.nivel}</span>
                          </div>
                          <h3 className="font-playfair font-bold text-escola-azul text-base mb-1.5">{curso.titulo}</h3>
                          <p className="text-[11px] text-escola-cinza mb-2">por {curso.autor_nome}</p>
                          {curso.descricao && <p className="text-xs text-escola-cinza mb-3 line-clamp-2">{curso.descricao}</p>}
                          <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-escola-cinza-claro">
                            <span className="text-escola-cinza font-mono">{curso.totalAulas} aula{curso.totalAulas !== 1 ? 's' : ''}</span>
                            <span className="text-escola-vermelho font-semibold">Ver curso →</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-escola-cinza mt-12">
          É preciso estar logado para assistir às aulas. Ainda não tem conta?{' '}
          <a href="/admin/cadastro" className="text-escola-azul font-medium hover:underline">Criar conta</a>
        </p>
      </div>
    </div>
  )
}
