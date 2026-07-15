'use client'

import { useEffect, useRef } from 'react'
import { X, Clock, Target } from 'lucide-react'

interface Aula {
  id: string
  titulo: string
  ordem: number
  duracao_estimada_min?: number | null
  totalDesafios?: number
}

interface ModalAulasProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  descricao: string
  categoria?: string | null
  aulas: Aula[]
}

export default function ModalAulas({ isOpen, onClose, titulo, descricao, categoria, aulas }: ModalAulasProps) {
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

  const duracaoTotal = aulas.reduce((s, a) => s + (a.duracao_estimada_min ?? 0), 0)

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl backdrop:bg-escola-preto/60 rounded-xl shadow-2xl"
      onClose={handleClose}
    >
      <div className="bg-escola-creme p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {categoria && (
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-escola-vermelho text-white mb-2">
                {categoria}
              </span>
            )}
            <h2 className="font-playfair text-3xl font-black text-escola-azul mb-2">{titulo}</h2>
            <p className="text-escola-cinza text-sm">{descricao}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-escola-cinza hover:text-escola-vermelho transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Aulas */}
        <div className="bg-white border border-escola-cinza-claro rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-playfair font-bold text-escola-azul">
              Aulas ({aulas.length})
            </h3>
            {duracaoTotal > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-escola-cinza font-mono">
                <Clock className="w-3.5 h-3.5" />
                ~{duracaoTotal} min no total
              </span>
            )}
          </div>

          {aulas.length === 0 ? (
            <p className="text-escola-cinza">Nenhuma aula disponível.</p>
          ) : (
            <ol className="space-y-3">
              {aulas.map((aula, i) => (
                <li key={aula.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-escola-azul text-white text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-escola-preto font-medium text-sm">{aula.titulo}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {!!aula.duracao_estimada_min && (
                        <span className="flex items-center gap-1 text-[11px] text-escola-cinza font-mono">
                          <Clock className="w-3 h-3" />
                          {aula.duracao_estimada_min} min
                        </span>
                      )}
                      {!!aula.totalDesafios && (
                        <span className="flex items-center gap-1 text-[11px] text-escola-vermelho font-mono">
                          <Target className="w-3 h-3" />
                          {aula.totalDesafios} desafio{aula.totalDesafios !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-escola-cinza-claro text-escola-azul hover:bg-white transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              handleClose()
              window.location.href = '/admin/cadastro'
            }}
            className="px-4 py-2 rounded-lg bg-escola-vermelho text-white hover:bg-escola-vermelho/90 transition-colors font-medium"
          >
            Me Inscrever
          </button>
        </div>
      </div>
    </dialog>
  )
}
