'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, CircleCheck, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DesafioAula {
  id: string
  titulo: string
  enunciado: string
  tipo: string
  ordem: number
}

interface ConteudoViewerProps {
  userId: string
  cursoId: string
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

// Estilo do HTML da aula (tema escuro do player) via seletores arbitrários
const proseClasses = [
  '[&_h2]:text-white [&_h2]:font-black [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-geom',
  '[&_h3]:text-white [&_h3]:font-bold [&_h3]:text-base md:[&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:text-white/70 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[15px]',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
  '[&_li]:text-white/70 [&_li]:mb-1.5 [&_li]:text-[15px]',
  '[&_strong]:text-white [&_em]:text-white/80',
  '[&_code]:font-jetbrains [&_code]:text-curso-ciano [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]',
  '[&_pre]:bg-black/50 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/80',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-curso-azul [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-white/60 [&_blockquote]:italic',
].join(' ')

export default function ConteudoViewer({
  userId,
  cursoId,
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
  const supabase = createClient()

  async function concluirAula() {
    setSaving(true)
    await supabase.from('progresso_aulas').upsert(
      {
        user_id: userId,
        aula_id: aulaId,
        curso_id: cursoId,
        concluida: true,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,aula_id' }
    )
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
            className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            title="Voltar ao curso"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-white/40 text-[11px] font-jetbrains uppercase tracking-widest truncate">{cursoTitulo}</p>
            <h1 className="text-white font-bold text-sm md:text-base truncate">{aulaTitulo}</h1>
          </div>
          {duracaoMin && (
            <span className="ml-auto flex-shrink-0 inline-flex items-center gap-1.5 text-white/40 text-xs font-jetbrains">
              <Clock className="w-3.5 h-3.5" />
              ~{duracaoMin} min
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo da aula */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <div className={proseClasses} dangerouslySetInnerHTML={{ __html: conteudo }} />

        {/* Desafios da aula */}
        {desafios.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-white font-black text-lg font-geom flex items-center gap-2">
              <Target className="w-5 h-5 text-curso-ciano" />
              Desafio{desafios.length > 1 ? 's' : ''} da aula
            </h2>
            {desafios.map(d => (
              <div key={d.id} className="bg-white/5 border border-curso-azul/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-jetbrains uppercase tracking-widest text-curso-ciano bg-curso-azul/10 px-2 py-0.5 rounded-full">
                    {TIPO_LABELS[d.tipo] ?? d.tipo}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">{d.titulo}</h3>
                <div
                  className="[&_p]:text-white/70 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-white/70 [&_li]:text-sm [&_code]:font-jetbrains [&_code]:text-curso-ciano [&_pre]:bg-black/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:text-white/80 text-white/70 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: d.enunciado }}
                />
                <p className="text-white/30 text-xs mt-3">
                  Faça no caderno, no computador ou no celular e mostre ao professor na próxima aula.
                </p>
              </div>
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
