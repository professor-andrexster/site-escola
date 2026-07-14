'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Curso } from '@/types/database'

interface CursoPendenteFormProps {
  curso: Curso & { profiles?: { nome_completo: string } }
  autorNome: string
}

export default function CursoPendenteForm({ curso, autorNome }: CursoPendenteFormProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleAprovar() {
    if (!confirm(`Aprovar curso "${curso.titulo}"? Ele será publicado no site.`)) return

    setLoading(true)
    setErro('')

    const res = await fetch('/api/cursos/aprovar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursoId: curso.id }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErro(json.error || 'Erro ao aprovar curso')
      setLoading(false)
      return
    }

    router.refresh()
  }

  async function handleRejeitar() {
    if (!confirm(`Rejeitar curso "${curso.titulo}"? Ele será permanentemente deletado.`)) return

    setLoading(true)
    setErro('')

    const res = await fetch('/api/cursos/rejeitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursoId: curso.id }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErro(json.error || 'Erro ao rejeitar curso')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {erro && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{erro}</p>
        </div>
      )}

      <div className="flex gap-4">
        {curso.capa_url && (
          <div className="flex-shrink-0">
            <img
              src={curso.capa_url}
              alt={curso.titulo}
              className="w-24 h-24 rounded-lg object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{curso.titulo}</h3>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Autor:</span> {autorNome}
          </p>
          {curso.descricao && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{curso.descricao}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Criado em {new Date(curso.criado_em || '').toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleAprovar}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprovar
          </button>
          <button
            onClick={handleRejeitar}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  )
}
