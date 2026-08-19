'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, CircleCheck, BookOpen, Target, Clock } from 'lucide-react'
import { proseAula, proseDesafio } from './proseAula'

export interface DesafioDaAula {
  id: string
  titulo: string
  enunciado: string
  tipo: string
  ordem: number
}

interface SlideViewerProps {
  cursoSlug: string
  cursoTitulo: string
  aulaId: string
  aulaTitulo: string
  slidesUrls: string[]
  initialSlideAtual: number
  initialConcluida: boolean
  nextAulaSlug: string | null
  /**
   * Texto da aula e desafios. Ficavam de fora: a aula com slides so exibia as
   * imagens, e o material escrito — 696 mil caracteres em 148 aulas, mais 168
   * desafios — nunca chegava ao aluno.
   */
  conteudo: string | null
  duracaoMin: number | null
  desafios: DesafioDaAula[]
}

export default function SlideViewer({
  cursoSlug,
  cursoTitulo,
  aulaId,
  aulaTitulo,
  slidesUrls,
  initialSlideAtual,
  initialConcluida,
  nextAulaSlug,
  conteudo,
  duracaoMin,
  desafios,
}: SlideViewerProps) {
  const router = useRouter()

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

  /**
   * Salva o slide atual e, ao chegar no ultimo, marca a aula como concluida.
   *
   * A conclusao era so pelo botao, que aparecia unicamente no ultimo slide.
   * Quem parava no meio ficava com a aula em aberto sem perceber, e depois nao
   * entendia por que o desafio final nao liberava — foi exatamente o que houve
   * com duas aulas do HTML, paradas nos slides 2 e 4 de 5.
   *
   * Chegar ao ultimo slide de uma apresentacao E o sinal de conclusao. O botao
   * continua ali para levar a proxima aula.
   */
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    const ultimo = currentSlide === totalSlides - 1
    const marcarAgora = ultimo && !concluida

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true)
      await fetch('/api/cursos/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aulaId,
          slideAtual: currentSlide,
          ...(marcarAgora ? { concluida: true } : {}),
        }),
      })
      if (marcarAgora) {
        setConcluida(true)
        // A lista de aulas e a barra de progresso do curso sao renderizadas no
        // servidor: sem isto, voltar para o curso mostraria a aula ainda aberta.
        router.refresh()
      }
      setSaving(false)
    }, 600)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, concluida, totalSlides])

  async function concluirAula() {
    setSaving(true)
    await fetch('/api/cursos/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId, slideAtual: currentSlide, concluida: true }),
    })
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
        <span className="text-white/55 text-xs font-jetbrains flex-shrink-0">
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

        {saving && <span className="text-white/50 text-xs font-jetbrains hidden sm:block">salvando...</span>}

        {isLastSlide ? (
          <button
            onClick={concluirAula}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-curso-azul hover:bg-curso-azul-claro text-white font-bold text-sm transition-colors foco-curso"
          >
            <CircleCheck className="w-4 h-4" />
            {concluida
              ? nextAulaSlug ? 'Concluída — próxima aula' : 'Concluída — voltar ao curso'
              : nextAulaSlug ? 'Concluir e ir para próxima' : 'Concluir aula'}
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

      {/* ------------------------------------------------ material da aula
          Fica abaixo dos slides, não no lugar deles: o slide é o apoio da
          explicação e o texto é o que a pessoa relê depois. Antes o texto
          simplesmente não existia nesta tela. */}
      {(conteudo || desafios.length > 0) && (
        <div className="bg-curso-tinta border-t border-white/10">
          <article className="max-w-3xl mx-auto px-4 py-8">
            {conteudo && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-curso-ciano flex-shrink-0" />
                  <h2 className="text-white font-black text-lg font-geom">Material da aula</h2>
                  {duracaoMin ? (
                    <span className="ms-auto inline-flex items-center gap-1 text-white/55 text-xs font-jetbrains">
                      <Clock className="w-3.5 h-3.5" />
                      ~{duracaoMin} min
                    </span>
                  ) : null}
                </div>
                <div className={proseAula} dangerouslySetInnerHTML={{ __html: conteudo }} />
              </>
            )}

            {desafios.length > 0 && (
              <section className="mt-10 space-y-4">
                <h2 className="text-white font-black text-lg font-geom flex items-center gap-2">
                  <Target className="w-5 h-5 text-curso-ciano" />
                  Desafio{desafios.length > 1 ? 's' : ''} da aula
                </h2>
                {desafios.map(d => (
                  <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-bold">{d.titulo}</h3>
                      <span className="flex-shrink-0 text-[10px] font-jetbrains uppercase tracking-widest text-curso-ciano bg-curso-azul/10 px-2 py-0.5 rounded-full">
                        {d.tipo}
                      </span>
                    </div>
                    <div className={proseDesafio} dangerouslySetInnerHTML={{ __html: d.enunciado }} />
                  </div>
                ))}
              </section>
            )}
          </article>
        </div>
      )}
    </div>
  )
}
