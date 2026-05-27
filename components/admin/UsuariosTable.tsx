'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X, Trash2, ChevronDown } from 'lucide-react'
import type { Profile } from '@/types/database'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/profile'

type ProfileComEmail = Profile & { email: string }

interface UsuariosTableProps {
  profiles: ProfileComEmail[]
}

export default function UsuariosTable({ profiles: initial }: UsuariosTableProps) {
  const [profiles, setProfiles] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function aprovar(id: string) {
    setLoadingId(id)
    await supabase.from('profiles').update({ aprovado: true }).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, aprovado: true } : p))
    setLoadingId(null)
  }

  async function rejeitar(id: string) {
    if (!confirm('Rejeitar e remover este cadastro?')) return
    setLoadingId(id)
    await supabase.from('profiles').delete().eq('id', id)
    setProfiles(prev => prev.filter(p => p.id !== id))
    setLoadingId(null)
    router.refresh()
  }

  async function mudarRole(id: string, role: Profile['role']) {
    setLoadingId(id)
    await supabase.from('profiles').update({ role }).eq('id', id)
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
    setLoadingId(null)
  }

  const pendentes = profiles.filter(p => !p.aprovado)
  const aprovados = profiles.filter(p => p.aprovado)

  const renderRow = (p: ProfileComEmail) => (
    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.aprovado ? 'bg-yellow-50/50' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-escola-azul flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {p.nome_completo.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{p.nome_completo}</p>
            <p className="text-gray-400 text-xs">{p.email}</p>
            {p.turma && <p className="text-gray-400 text-xs">Turma: {p.turma}</p>}
            {p.disciplina && <p className="text-gray-400 text-xs">{p.disciplina}</p>}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-center">
        {p.aprovado ? (
          <div className="relative inline-block">
            <select
              value={p.role}
              onChange={e => mudarRole(p.id, e.target.value as Profile['role'])}
              disabled={loadingId === p.id}
              className="appearance-none text-xs font-mono uppercase tracking-wider pl-2 pr-6 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-escola-azul disabled:opacity-50 bg-white"
            >
              {(['aluno', 'professor', 'direcao'] as const).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">{ROLE_LABELS[p.role]}</span>
        )}
      </td>

      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.aprovado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {p.aprovado ? '● Ativo' : '○ Pendente'}
        </span>
      </td>

      <td className="px-4 py-3 text-center text-gray-400 text-xs hidden md:table-cell">
        {new Date(p.created_at).toLocaleDateString('pt-BR')}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          {!p.aprovado && (
            <button
              onClick={() => aprovar(p.id)}
              disabled={loadingId === p.id}
              title="Aprovar"
              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => rejeitar(p.id)}
            disabled={loadingId === p.id}
            title={p.aprovado ? 'Remover usuário' : 'Rejeitar cadastro'}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {p.aprovado ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Aguardando Aprovação ({pendentes.length})
          </h2>
          <div className="bg-white border border-yellow-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-yellow-50 border-b border-yellow-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Usuário</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Tipo</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Cadastro</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">{pendentes.map(renderRow)}</tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Usuários Ativos ({aprovados.length})
        </h2>
        {aprovados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
            Nenhum usuário ativo ainda.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Usuário</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Nível</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Desde</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">{aprovados.map(renderRow)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
