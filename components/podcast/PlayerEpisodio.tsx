'use client'

import { useRef } from 'react'

/** Player de um episódio. Conta o play uma vez por carregamento da página. */
export default function PlayerEpisodio({ id, src, className, preload = 'none' }: { id: string; src: string; className?: string; preload?: 'none' | 'metadata' }) {
  const contado = useRef(false)
  return (
    <audio
      controls
      preload={preload}
      src={src}
      className={className}
      onPlay={() => {
        if (contado.current) return
        contado.current = true
        fetch(`/api/podcast/play/${id}`, { method: 'POST', keepalive: true }).catch(() => {})
      }}
    />
  )
}
