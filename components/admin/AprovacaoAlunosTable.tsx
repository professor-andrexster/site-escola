'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, UserCheck } from 'lucide-react'
import type { Profile } from '@/types/database'
import Avatar from '@/components/admin/ui/Avatar'

export type AlunoPendente = Profile & { matricula: string | null }

interface AprovacaoAlunosTableProps {
  pendentes: AlunoPendente[]
}

export default function AprovacaoAlunosTable({ pendentes: initial }: AprovacaoAlunosTableProps) {
  const [pendentes, setPendentes] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function aprovar(id: string) {
    setLoadingId(id)
    setError('')
    const res = await fetch('/api/usuarios/aprovar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erro ao aprovar aluno.')
      setLoadingId(null)
      return
    }
    setPendentes(prev => prev.filter(p => p.id !== id))
    setLoadingId(null)
    router.refresh()
  }

  async function rejeitar(id: string, nome: string) {
    if (!confirm(`Rejeitar o cadastro de ${nome}? A conta será apagada por completo.`)) return
    setLoadingId(id)
    setError('')
    const res = await fetch('/api/usuarios/remover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erro ao rejeitar cadastro.')
      setLoadingId(null)
      return
    }
    setPendentes(prev => prev.filter(p => p.id !== id))
    setLoadingId(null)
    router.refresh()
  }

  if (pendentes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Nenhum cadastro de aluno aguardando aprovação no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {pendentes.map(p => {
        const isLoading = loadingId === p.id
        return (
          <div key={p.id} className="bg-white border border-yellow-200 bg-yellow-50/30 rounded-xl p-4 shadow-elevation-low flex items-center gap-3">
            <Avatar nome={p.nome_completo} avatarUrl={p.avatar_url} role={p.role} tamanho="md" />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{p.nome_completo}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {p.turma && <span>Turma: <strong>{p.turma}</strong></span>}
                {p.matricula && <span className="ms-2">Matrícula: {p.matricula}</span>}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{p.email}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => aprovar(p.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Aprovar
              </button>
              <button
                onClick={() => rejeitar(p.id, p.nome_completo)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Rejeitar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
