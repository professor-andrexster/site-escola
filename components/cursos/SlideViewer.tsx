'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, X, CircleCheck } from 'lucide-react'

interface SlideViewerProps {
  userId: string
  cursoId: string
  cursoSlug: string
  cursoTitulo: string
  aulaId: string
  aulaTitulo: string
  slidesUrls: string[]
  initialSlideAtual: number
  initialConcluida: boolean
  nextAulaSlug: string | null
}

export default function SlideViewer({
  userId,
  cursoId,
  cursoSlug,
  cursoTitulo,
  aulaId,
  aulaTitulo,
  slidesUrls,
  initialSlideAtual,
  initialConcluida,
  nextAulaSlug,
}: SlideViewerProps) {
  const router = useRouter()
  const supabase = createClient()

  const totalSlides = slidesUrls.length
  const [currentSlide, setCurrentSlide] = useState(() =>
    Math.min(Math.max(initialSlideAtual, 0), totalSlides - 1)
  )
  const [concluida, setConcluida] = useState(initialConcluida)
  const [saving, setSaving] = useState(false)

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)

  function goTo(index: number) {
    if (index < 0 || index >= totalSlides) return
    setCurrentSlide(index)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goTo(currentSlide + 1)
      if (e.key === 'ArrowLeft') goTo(currentSlide - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, totalSlides])

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true)
      await supabase.from('progresso_aulas').upsert(
        { user_id: userId, aula_id: aulaId, curso_id: cursoId, slide_atual: currentSlide },
        { onConflict: 'user_id,aula_id' }
      )
      setSaving(false)
    }, 600)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide])

  async function concluirAula() {
    setSaving(true)
    await supabase.from('progresso_aulas').upsert(
      {
        user_id: userId,
        aula_id: aulaId,
        curso_id: cursoId,
        slide_atual: currentSlide,
        concluida: true,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,aula_id' }
    )
    setConcluida(true)
    setSaving(false)
    if (nextAulaSlug) {
      router.push(`/admin/cursos/${cursoSlug}/${nextAulaSlug}`)
    } else {
      router.push(`/admin/cursos/${cursoSlug}`)
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      if (delta < 0) goTo(currentSlide + 1)
      else goTo(currentSlide - 1)
    }
    touchStartX.current = null
  }

  const isLastSlide = currentSlide === totalSlides - 1

  return (
    <div className="min-h-screen bg-curso-tinta flex flex-col font-geom">
      {/* Top bar */}
      <div className="bg-black/30 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={`/admin/cursos/${cursoSlug}`}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </Link>
        <div className="min-w-0 text-center flex-1">
          <p className="text-curso-ciano text-[10px] uppercase tracking-widest font-jetbrains truncate">{cursoTitulo}</p>
          <p className="text-white text-sm font-semibold truncate">{aulaTitulo}</p>
        </div>
        <span className="text-white/40 text-xs font-jetbrains flex-shrink-0">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 justify-center py-2 px-4 bg-black/10">
        {slidesUrls.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            className={`h-1 rounded-full transition-all ${
              i < currentSlide ? 'bg-curso-ciano w-4' :
              i === currentSlide ? 'bg-white w-6' : 'bg-white/20 w-4'
            }`}
          />
        ))}
      </div>

      {/* Slide */}
      <div
        className="flex-1 flex items-center justify-center p-3 md:p-8 min-h-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg md:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <Image
            key={currentSlide}
            src={slidesUrls[currentSlide]}
            alt={`${aulaTitulo} — slide ${currentSlide + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/30 border-t border-white/10 px-4 py-4 flex items-center justify-between gap-4">
        <button
          onClick={() => goTo(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white/70 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {saving && <span className="text-white/30 text-xs font-jetbrains hidden sm:block">salvando...</span>}

        {isLastSlide ? (
          <button
            onClick={concluirAula}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-curso-azul hover:bg-curso-azul-claro text-white font-bold text-sm transition-colors"
          >
            <CircleCheck className="w-4 h-4" />
            {concluida ? 'Concluída — continuar' : nextAulaSlug ? 'Concluir e ir para próxima' : 'Concluir aula'}
          </button>
        ) : (
          <button
            onClick={() => goTo(currentSlide + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-curso-azul hover:bg-curso-azul-claro text-white font-bold text-sm transition-colors"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
