'use client'

import { useState } from 'react'
import TrilhaCard from './TrilhaCard'
import ModalTrilha, { type ProgressoDoCurso } from './ModalTrilha'
import type { Trilha } from '@/lib/db/trilhas'

/**
 * As trilhas do catálogo, cada uma abrindo os próprios cursos num modal.
 *
 * Um modal por trilha PUBLICADA, e não quatro fixos: hoje são quatro porque
 * `trilhasPublicadas()` descarta trilha sem curso, e a quinta (Design Digital)
 * aparece sozinha no dia em que ganhar o primeiro curso. Fixar o número aqui
 * daria uma tela que precisa de deploy para acompanhar o banco.
 *
 * O estado é só qual trilha está aberta. Fica neste componente, e não em cada
 * cartão, porque duas trilhas abertas ao mesmo tempo não faz sentido — e é o
 * que aconteceria com um estado por cartão.
 */
export default function TrilhasComModal({
  trilhas,
  progressoPorCurso,
  concluidosPorTrilha,
}: {
  trilhas: Trilha[]
  progressoPorCurso: Record<string, ProgressoDoCurso>
  concluidosPorTrilha: Record<string, number>
}) {
  const [abertaId, setAbertaId] = useState<string | null>(null)
  const aberta = trilhas.find(t => t.id === abertaId) ?? null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trilhas.map(t => (
          <TrilhaCard
            key={t.id}
            trilha={t}
            concluidos={concluidosPorTrilha[t.id] ?? 0}
            onAbrir={() => setAbertaId(t.id)}
          />
        ))}
      </div>

      {/* Montado só quando há trilha aberta, e desmontado ao fechar: assim o
          `<dialog>` sempre entra em cena limpo, sem estado de rolagem ou de
          foco sobrando da vez anterior. */}
      {aberta && (
        <ModalTrilha
          trilha={aberta}
          progressoPorCurso={progressoPorCurso}
          onFechar={() => setAbertaId(null)}
        />
      )}
    </>
  )
}
