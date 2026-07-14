import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, PlayCircle } from 'lucide-react'
import type { Curso } from '@/types/database'

interface CursoVitrine extends Curso {
  totalAulas: number
}

export default function VitrineCursos({ cursos }: { cursos: CursoVitrine[] }) {
  const categorias = Array.from(new Set(cursos.map(c => c.categoria).filter(Boolean))) as string[]

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-escola-azul text-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">JB2026 · Cursos</p>
          <h1 className="font-playfair text-3xl md:text-4xl font-black mb-3">Cursos da E.E. Dr. João Beraldo</h1>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Trilhas de aprendizagem da grade de Informática do EMTI, por <strong className="text-white/90">Professor André Gomes</strong>.
          </p>
          <p className="font-mono text-xs text-yellow-400 mt-4">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} disponível{cursos.length !== 1 ? 'is' : ''}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
            {categorias.map(cat => (
              <span
                key={cat}
                className="flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {cursos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Nenhum curso publicado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.map(curso => (
              <Link
                key={curso.id}
                href={`/admin/cursos/${curso.slug}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-escola-azul/30 transition-colors flex flex-col"
              >
                <div className="relative h-32 bg-escola-azul/10 flex items-center justify-center overflow-hidden">
                  {curso.capa_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-escola-azul/40" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {curso.categoria && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-escola-azul/10 text-escola-azul">
                        {curso.categoria}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono">{curso.nivel}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{curso.titulo}</h3>
                  <p className="text-[11px] text-gray-400 mb-1.5">por {curso.autor_nome}</p>
                  {curso.descricao && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{curso.descricao}</p>}
                  <div className="flex items-center justify-between text-xs mt-auto">
                    <span className="text-gray-400 font-mono">{curso.totalAulas} aula{curso.totalAulas !== 1 ? 's' : ''}</span>
                    <span className="text-escola-azul font-medium">Ver curso</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          É preciso estar logado para assistir às aulas. Ainda não tem conta?{' '}
          <Link href="/admin/cadastro" className="text-escola-azul font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
