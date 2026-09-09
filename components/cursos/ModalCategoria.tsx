'use client'

import { useEffect, useRef } from 'react'
import { ChevronRight, GraduationCap, X } from 'lucide-react'
import type { Curso } from '@/types/database'
import type { CategoriaCurso } from '@/lib/cursosCategorias'

interface CursoVitrine extends Curso {
  totalAulas: number
}

interface ModalCategoriaProps {
  isOpen: boolean
  onClose: () => void
  categoria: CategoriaCurso
  descricao: string
  cursos: CursoVitrine[]
  onSelecionarCurso: (curso: CursoVitrine) => void
}

export default function ModalCategoria({ isOpen, onClose, categoria, descricao, cursos, onSelecionarCurso }: ModalCategoriaProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialogRef.current?.close()
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl backdrop:bg-escola-preto/60 rounded-xl shadow-2xl"
      onClose={handleClose}
    >
      <div className="bg-escola-creme p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <span className="inline-block text-[10px] font-mono uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-escola-vermelho text-white mb-2">
              {categoria}
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-escola-azul mb-2">{categoria}</h2>
            <p className="text-escola-cinza text-sm">{descricao}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 min-w-11 min-h-11 flex items-center justify-center text-escola-cinza hover:text-escola-vermelho transition-colors foco-curso"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {cursos.length === 0 ? (
          <div className="bg-white border border-escola-cinza-claro rounded-lg p-10 text-center">
            <GraduationCap className="w-9 h-9 text-escola-cinza-claro mx-auto mb-3" />
            <p className="text-escola-preto font-medium text-sm mb-1">Nenhum curso publicado em {categoria} ainda.</p>
            <p className="text-escola-cinza text-xs">Volte em breve, novas trilhas estão sendo preparadas pelos professores.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cursos.map(curso => (
              <li key={curso.id}>
                <button
                  onClick={() => onSelecionarCurso(curso)}
                  className="group w-full min-h-11 flex items-center gap-4 bg-white border border-escola-cinza-claro rounded-lg p-4 text-left hover:border-escola-azul hover:shadow-md transition-all foco-curso"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-escola-azul/10 flex items-center justify-center overflow-hidden">
                    {curso.capa_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-escola-azul/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair font-bold text-escola-azul text-sm truncate">{curso.titulo}</p>
                    <p className="text-[11px] text-escola-cinza font-mono uppercase tracking-wide">
                      {curso.nivel} · {curso.totalAulas} aula{curso.totalAulas !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="flex-shrink-0 w-5 h-5 text-escola-cinza-claro group-hover:text-escola-azul transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 min-h-11 rounded-lg border border-escola-cinza-claro text-escola-azul hover:bg-white transition-colors foco-curso"
          >
            Fechar
          </button>
        </div>
      </div>
    </dialog>
  )
}
