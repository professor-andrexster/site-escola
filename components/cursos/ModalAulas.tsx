'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Aula {
  id: string
  titulo: string
  ordem: number
}

interface ModalAulasProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  descricao: string
  aulas: Aula[]
}

export default function ModalAulas({ isOpen, onClose, titulo, descricao, aulas }: ModalAulasProps) {
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
      className="w-full max-w-2xl backdrop:bg-black/50 rounded-xl shadow-xl"
      onClose={handleClose}
    >
      <div className="bg-curso-papel p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-curso-azul mb-2">{titulo}</h2>
            <p className="text-curso-texto-suave text-sm">{descricao}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-curso-texto-suave hover:text-curso-azul transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Aulas */}
        <div className="bg-white border border-curso-linha rounded-lg p-6">
          <h3 className="text-lg font-bold text-curso-azul mb-4">
            Aulas ({aulas.length})
          </h3>

          {aulas.length === 0 ? (
            <p className="text-curso-texto-suave">Nenhuma aula disponível.</p>
          ) : (
            <ol className="space-y-2 list-decimal list-inside">
              {aulas.map((aula) => (
                <li key={aula.id} className="text-curso-azul font-medium text-sm">
                  {aula.titulo}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-curso-linha text-curso-azul hover:bg-curso-papel transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              handleClose()
              window.location.href = '/admin/cadastro'
            }}
            className="px-4 py-2 rounded-lg bg-curso-azul text-white hover:bg-curso-azul/90 transition-colors font-medium"
          >
            Me Inscrever
          </button>
        </div>
      </div>
    </dialog>
  )
}
