'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Code2, Cpu, FileSpreadsheet, MonitorCog } from 'lucide-react'
import HeroCursosSEO from './HeroCursosSEO'
import ModalCategoria from './ModalCategoria'
import { CATEGORIAS_CURSO, DESCRICAO_CATEGORIA, categoriaGrande, type CategoriaCurso } from '@/lib/cursosCategorias'
import type { Curso } from '@/types/database'

interface CursoVitrine extends Curso {
  totalAulas: number
}

const ICONE_CATEGORIA: Record<CategoriaCurso, typeof Code2> = {
  'Programação': Code2,
  'Software': MonitorCog,
  'Hardware': Cpu,
  'Excel e Dados': FileSpreadsheet,
}

export default function VitrineCursos({
  cursos,
  onAbrirModal
}: {
  cursos: CursoVitrine[]
  onAbrirModal?: (curso: CursoVitrine) => void
}) {
  const [categoriaAberta, setCategoriaAberta] = useState<CategoriaCurso | null>(null)

  const cursosPorCategoria = useMemo(() => {
    const grupos = new Map<CategoriaCurso, CursoVitrine[]>()
    for (const cat of CATEGORIAS_CURSO) grupos.set(cat, [])
    for (const c of cursos) {
      const grande = categoriaGrande(c.categoria)
      if (grande) grupos.get(grande)!.push(c)
    }
    return grupos
  }, [cursos])

  const handleSelecionarCurso = (curso: CursoVitrine) => {
    setCategoriaAberta(null)
    onAbrirModal?.(curso)
  }

  return (
    <div className="bg-escola-creme">
      <HeroCursosSEO />

      <div id="cursos" className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-2xl font-black text-escola-azul mb-2">Escolha uma área</h2>
          <p className="text-escola-cinza text-sm">Entre em uma das 4 trilhas para ver os cursos disponíveis.</p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {CATEGORIAS_CURSO.map(categoria => {
            const Icone = ICONE_CATEGORIA[categoria]
            const total = cursosPorCategoria.get(categoria)?.length ?? 0
            return (
              <button
                key={categoria}
                onClick={() => setCategoriaAberta(categoria)}
                className="group min-h-11 text-left bg-white border border-escola-cinza-claro rounded-xl p-6 hover:border-escola-azul hover:shadow-lg transition-all flex flex-col gap-4 cursor-pointer foco-curso"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-escola-azul/10 flex items-center justify-center group-hover:bg-escola-azul/15 transition-colors">
                    <Icone className="w-6 h-6 text-escola-azul" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-escola-cinza-claro group-hover:text-escola-azul group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-escola-azul text-lg mb-1">{categoria}</h3>
                  <p className="text-xs text-escola-cinza mb-2">{DESCRICAO_CATEGORIA[categoria]}</p>
                  <span className="text-[11px] font-mono uppercase tracking-wide text-escola-vermelho font-semibold">
                    {total > 0 ? `${total} curso${total !== 1 ? 's' : ''}` : 'Em breve'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {categoriaAberta && (
          <ModalCategoria
            isOpen={!!categoriaAberta}
            onClose={() => setCategoriaAberta(null)}
            categoria={categoriaAberta}
            descricao={DESCRICAO_CATEGORIA[categoriaAberta]}
            cursos={cursosPorCategoria.get(categoriaAberta) ?? []}
            onSelecionarCurso={handleSelecionarCurso}
          />
        )}

        <p className="text-center text-xs text-escola-cinza mt-12">
          É preciso estar logado para assistir às aulas. Ainda não tem conta?{' '}
          <a href="/admin/cadastro" className="text-escola-azul font-medium hover:underline">Criar conta</a>
        </p>
      </div>
    </div>
  )
}
