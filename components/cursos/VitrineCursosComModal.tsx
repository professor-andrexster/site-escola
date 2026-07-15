'use client'

import { useState } from 'react'
import VitrineCursos from './VitrineCursos'
import ModalAulas from './ModalAulas'
import type { Curso } from '@/types/database'

interface CursoVitrine extends Curso {
  totalAulas: number
}

interface VitrineCursosComModalProps {
  cursos: CursoVitrine[]
  aulasPorCurso: { [cursoId: string]: any[] }
}

export default function VitrineCursosComModal({ cursos, aulasPorCurso }: VitrineCursosComModalProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState<CursoVitrine | null>(null)

  const handleAbrirModal = (curso: CursoVitrine) => {
    setCursoSelecionado(curso)
    setModalAberto(true)
  }

  const handleFecharModal = () => {
    setModalAberto(false)
    setCursoSelecionado(null)
  }

  return (
    <>
      <VitrineCursos cursos={cursos} onAbrirModal={handleAbrirModal} />
      {cursoSelecionado && (
        <ModalAulas
          isOpen={modalAberto}
          onClose={handleFecharModal}
          titulo={cursoSelecionado.titulo}
          descricao={cursoSelecionado.descricao || ''}
          aulas={aulasPorCurso[cursoSelecionado.id] || []}
        />
      )}
    </>
  )
}
