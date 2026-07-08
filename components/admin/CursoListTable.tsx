'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Eye, EyeOff, GraduationCap } from 'lucide-react'
import type { Curso } from '@/types/database'

interface CursoRow extends Curso {
  aulas: { id: string }[]
}

interface CursoListTableProps {
  cursos: CursoRow[]
}

export default function CursoListTable({ cursos: initial }: CursoListTableProps) {
  const [cursos, setCursos] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function togglePublicado(id: string, publicado: boolean) {
    setLoadingId(id)
    await supabase.from('cursos').update({ publicado: !publicado }).eq('id', id)
    setCursos((prev) => prev.map((c) => (c.id === id ? { ...c, publicado: !publicado } : c)))
    setLoadingId(null)
  }

  async function deleteCurso(id: string) {
    if (!confirm('Deletar este curso e todas as suas aulas? Essa ação não pode ser desfeita.')) return
    setLoadingId(id)
    await supabase.from('cursos').delete().eq('id', id)
    setCursos((prev) => prev.filter((c) => c.id !== id))
    setLoadingId(null)
    router.refresh()
  }

  if (cursos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
        Nenhum curso criado ainda.{' '}
        <Link href="/admin/cursos/gerenciar/novo" className="text-escola-azul hover:underline">Criar primeiro curso</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cursos.map((curso) => {
        const isLoading = loadingId === curso.id
        return (
          <div key={curso.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {curso.capa_url ? (
                <img src={curso.capa_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">{curso.titulo}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  curso.publicado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {curso.publicado ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{curso.aulas?.length ?? 0} aula(s) · {curso.categoria ?? 'Sem categoria'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublicado(curso.id, curso.publicado)}
                disabled={isLoading}
                title={curso.publicado ? 'Despublicar' : 'Publicar'}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {curso.publicado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Link
                href={`/admin/cursos/gerenciar/${curso.id}`}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => deleteCurso(curso.id)}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
