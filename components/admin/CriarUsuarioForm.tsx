'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'
import { TURMAS } from '@/lib/turmas'
import { ROLE_LABELS } from '@/lib/roles'
import type { Profile } from '@/types/database'

const ROLES: Profile['role'][] = ['aluno', 'monitor', 'professor', 'direcao']

export default function CriarUsuarioForm() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Profile['role']>('aluno')
  const [turma, setTurma] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function reset() {
    setNome(''); setEmail(''); setPassword(''); setRole('aluno'); setTurma(''); setDisciplina(''); setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/usuarios/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password, role, turma, disciplina }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Erro ao criar usuário.')
      setLoading(false)
      return
    }

    reset()
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-escola-azul text-white rounded-xl text-sm font-semibold hover:bg-escola-azul/90 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Novo Usuário
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-escola-azul" />
          Criar Novo Usuário
        </h2>
        <button onClick={() => { setOpen(false); reset() }} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nível de Acesso</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  role === r
                    ? 'border-escola-azul bg-escola-azul text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha *</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
            />
          </div>

          {(role === 'aluno' || role === 'monitor') && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Turma *</label>
              <select
                value={turma}
                onChange={e => setTurma(e.target.value)}
                required={role === 'aluno'}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors bg-white"
              >
                <option value="">Selecione a turma</option>
                {TURMAS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'professor' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina</label>
              <input
                type="text"
                value={disciplina}
                onChange={e => setDisciplina(e.target.value)}
                placeholder="Ex: Matemática, Português, TI"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Criando...' : 'Criar Usuário'}
        </button>
      </form>
    </div>
  )
}
