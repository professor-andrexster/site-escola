'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ImageIcon } from 'lucide-react'
import type { Aula } from '@/types/database'

interface AulaManagerProps {
  cursoId: string
  aulas: Aula[]
}

export default function AulaManager({ cursoId, aulas: initial }: AulaManagerProps) {
  const [aulas, setAulas] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const [erro, setErro] = useState('')

  async function togglePublicado(id: string, publicado: boolean) {
    setLoadingId(id)
    setErro('')
    const res = await fetch(`/api/aulas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicado: !publicado }),
    })
    if (res.ok) {
      setAulas((prev) => prev.map((a) => (a.id === id ? { ...a, publicado: !publicado } : a)))
    } else {
      setErro('Não foi possível alterar a publicação da aula.')
    }
    setLoadingId(null)
  }

  async function deleteAula(id: string) {
    if (!confirm('Deletar esta aula e seus slides? Essa ação não pode ser desfeita.')) return
    setLoadingId(id)
    setErro('')
    const res = await fetch(`/api/aulas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAulas((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } else {
      setErro('Não foi possível remover a aula.')
    }
    setLoadingId(null)
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= aulas.length) return
    const a = aulas[index]
    const b = aulas[target]

    setLoadingId(a.id)
    setErro('')
    const res = await fetch('/api/aulas/ordem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaA: a.id, ordemA: b.ordem, aulaB: b.id, ordemB: a.ordem }),
    })
    if (res.ok) {
      setAulas((prev) => {
        const copy = [...prev]
        ;[copy[index], copy[target]] = [{ ...copy[target], ordem: a.ordem }, { ...copy[index], ordem: b.ordem }]
        return copy
      })
    } else {
      setErro('Não foi possível reordenar as aulas.')
    }
    setLoadingId(null)
  }

  if (aulas.length === 0) {
    return (
      <div className="empty-state p-8">
        Nenhuma aula ainda.{' '}
        <Link href={`/admin/cursos/gerenciar/${cursoId}/aulas/nova`} className="text-escola-azul hover:underline">Adicionar primeira aula</Link>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {erro}
        </div>
      )}
      {aulas.map((aula, i) => {
        const isLoading = loadingId === aula.id
        return (
          <div key={aula.id} className="panel p-4 flex items-center gap-3">
            <div className="flex flex-col flex-shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0 || isLoading} className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-20">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === aulas.length - 1 || isLoading} className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-20">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-mono font-bold flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{aula.titulo}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <ImageIcon className="w-3 h-3" />
                {aula.slides_urls?.length ?? 0} slide(s)
              </p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
              aula.publicado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {aula.publicado ? 'Publicada' : 'Rascunho'}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => togglePublicado(aula.id, aula.publicado)}
                disabled={isLoading}
                title={aula.publicado ? 'Despublicar' : 'Publicar'}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {aula.publicado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Link
                href={`/admin/cursos/gerenciar/${cursoId}/aulas/${aula.id}`}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => deleteAula(aula.id)}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
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
