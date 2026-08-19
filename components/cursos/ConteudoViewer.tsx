'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CircleCheck, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { proseAula, proseDesafio } from './proseAula'

export interface DesafioAula {
  id: string
  titulo: string
  enunciado: string
  tipo: string
  ordem: number
}

interface ConteudoViewerProps {
  cursoSlug: string
  cursoTitulo: string
  aulaId: string
  aulaTitulo: string
  duracaoMin: number | null
  conteudo: string
  desafios: DesafioAula[]
  initialConcluida: boolean
  nextAulaSlug: string | null
}

const TIPO_LABELS: Record<string, string> = {
  quiz: 'Quiz',
  pratico: 'Desafio prático',
  dissertativo: 'Para escrever',
}


export default function ConteudoViewer({
  cursoSlug,
  cursoTitulo,
  aulaId,
  aulaTitulo,
  duracaoMin,
  conteudo,
  desafios,
  initialConcluida,
  nextAulaSlug,
}: ConteudoViewerProps) {
  const [concluida, setConcluida] = useState(initialConcluida)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function concluirAula() {
    setSaving(true)
    await fetch('/api/cursos/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId, concluida: true }),
    })
    setConcluida(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <div className="sticky top-0 z-10 bg-curso-tinta/95 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/admin/cursos/${cursoSlug}`}
            className="text-white/55 hover:text-white transition-colors flex-shrink-0"
            title="Voltar ao curso"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-white/55 text-[11px] font-jetbrains uppercase tracking-widest truncate">{cursoTitulo}</p>
            <h1 className="text-white font-bold text-sm md:text-base truncate">{aulaTitulo}</h1>
          </div>
          {duracaoMin && (
            <span className="ml-auto flex-shrink-0 inline-flex items-center gap-1.5 text-white/55 text-xs font-jetbrains">
              <Clock className="w-3.5 h-3.5" />
              ~{duracaoMin} min
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo da aula */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className={proseAula} dangerouslySetInnerHTML={{ __html: conteudo }} />

        {/* Desafios da aula */}
        {desafios.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-white font-black text-lg font-geom flex items-center gap-2">
              <Target className="w-5 h-5 text-curso-ciano" />
              Desafio{desafios.length > 1 ? 's' : ''} da aula
            </h2>
            {desafios.map(d => (
              <Link
                key={d.id}
                href={`/admin/cursos/desafios/${d.id}`}
                className="group block bg-white/5 border border-curso-azul/30 rounded-2xl p-5 hover:border-curso-azul/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-jetbrains uppercase tracking-widest text-curso-ciano bg-curso-azul/10 px-2 py-0.5 rounded-full">
                    {TIPO_LABELS[d.tipo] ?? d.tipo}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2 group-hover:text-curso-ciano transition-colors">{d.titulo}</h3>
                <div
                  className={proseDesafio}
                  dangerouslySetInnerHTML={{ __html: d.enunciado }}
                />
                <p className="text-white/50 text-xs mt-3">
                  Faça no caderno, no computador ou no celular e mostre ao professor na próxima aula.
                </p>
                <p className="text-curso-ciano/90 group-hover:text-curso-ciano text-xs mt-2 transition-colors">
                  Abrir desafio →
                </p>
              </Link>
            ))}
          </section>
        )}

        {/* Rodapé: concluir + próxima */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={concluirAula}
            disabled={saving || concluida}
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors',
              concluida
                ? 'bg-green-500/15 text-green-400 cursor-default'
                : 'bg-curso-azul hover:bg-curso-azul-claro text-white disabled:opacity-50'
            )}
          >
            <CircleCheck className="w-4 h-4" />
            {concluida ? 'Aula concluída' : saving ? 'Salvando...' : 'Marcar como concluída'}
          </button>
          {concluida && nextAulaSlug && (
            <Link
              href={`/admin/cursos/${cursoSlug}/${nextAulaSlug}`}
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Próxima aula
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </article>
    </div>
  )
}
