'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X, GraduationCap, BookOpen, Crown, Star, KeyRound, Copy } from 'lucide-react'
import type { Profile } from '@/types/database'
import { formatarCPF } from '@/lib/cpf'

export type UsuarioLinha = Profile & {
  email: string
  cpf: string | null
  email_alternativo: string | null
  criado_via: string | null
}

const ORIGEM_LABELS: Record<string, string> = {
  auto_aluno: 'Autocadastro (aluno)',
  auto_professor: 'Autocadastro (professor)',
  direcao: 'Criado pela direção',
}

const ROLE_CONFIG: Record<Profile['role'], {
  label: string
  icon: React.ComponentType<{ className?: string }>
  bg: string
  text: string
  border: string
  desc: string
}> = {
  aluno: {
    label: 'Aluno',
    icon: GraduationCap,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    desc: 'Acessa quizzes da turma',
  },
  monitor: {
    label: 'Monitor',
    icon: Star,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    desc: 'Posta matérias + quizzes',
  },
  professor: {
    label: 'Professor',
    icon: BookOpen,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    desc: 'Cria e controla quizzes',
  },
  bibliotecario: {
    label: 'Bibliotecário',
    icon: BookOpen,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    desc: 'Gerencia biblioteca e recursos',
  },
  direcao: {
    label: 'Direção',
    icon: Crown,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    desc: 'Acesso total ao sistema',
  },
}

interface UsuariosTableProps {
  profiles: UsuarioLinha[]
}

export default function UsuariosTable({ profiles: initial }: UsuariosTableProps) {
  const [profiles, setProfiles] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null)
  const [senhaTemp, setSenhaTemp] = useState<{ id: string; senha: string } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function aprovar(id: string) {
    setLoadingId(id)
    setError('')
    const { error: updateError } = await supabase.from('profiles').update({ aprovado: true }).eq('id', id)
    if (updateError) {
      setError('Erro ao aprovar usuário: ' + updateError.message)
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, aprovado: true } : p))
    }
    setLoadingId(null)
  }

  async function rejeitar(id: string) {
    if (!confirm('Rejeitar e remover este cadastro? A conta será apagada por completo.')) return
    setLoadingId(id)
    setError('')
    const res = await fetch('/api/usuarios/remover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Erro ao remover usuário.')
    } else {
      setProfiles(prev => prev.filter(p => p.id !== id))
      router.refresh()
    }
    setLoadingId(null)
  }

  async function redefinirSenha(id: string, nome: string) {
    if (!confirm(`Redefinir a senha de ${nome}? Uma senha temporária será gerada.`)) return
    setLoadingId(id)
    setError('')
    const res = await fetch('/api/usuarios/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erro ao redefinir senha.')
    } else {
      setSenhaTemp({ id, senha: json.senha })
    }
    setLoadingId(null)
  }

  async function mudarRole(id: string, role: Profile['role']) {
    setLoadingId(id)
    setError('')
    const { error: updateError } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (updateError) {
      setError('Erro ao mudar nível de acesso: ' + updateError.message)
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
      setChangingRoleId(null)
    }
    setLoadingId(null)
  }

  const pendentes = profiles.filter(p => !p.aprovado)
  const aprovados = profiles.filter(p => p.aprovado)

  const renderCard = (p: UsuarioLinha) => {
    const cfg = ROLE_CONFIG[p.role]
    const Icon = cfg.icon
    const isLoading = loadingId === p.id
    const isChanging = changingRoleId === p.id

    return (
      <div key={p.id} className={`bg-white border rounded-xl p-4 ${!p.aprovado ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200'}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-escola-azul flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {p.nome_completo.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{p.nome_completo}</p>
            <p className="text-gray-400 text-xs truncate">{p.email}</p>
            {p.cpf && <p className="text-gray-500 text-xs mt-0.5 font-mono">CPF: {formatarCPF(p.cpf)}</p>}
            {p.turma && <p className="text-gray-500 text-xs mt-0.5">Turma: <strong>{p.turma}</strong></p>}
            {p.disciplina && <p className="text-gray-500 text-xs mt-0.5">{p.disciplina}</p>}
            {p.email_alternativo && (
              <p className="text-gray-400 text-xs mt-0.5 truncate">Alternativo: {p.email_alternativo}</p>
            )}
            {p.criado_via && (
              <p className="text-gray-300 text-[11px] mt-0.5">{ORIGEM_LABELS[p.criado_via] ?? p.criado_via}</p>
            )}
          </div>

          {/* Status */}
          {!p.aprovado && (
            <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
              Pendente
            </span>
          )}
        </div>

        {/* Nível de acesso */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-wider">Nível de Acesso</p>

          {p.aprovado ? (
            isChanging ? (
              // Seletor de nível expandido
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(ROLE_CONFIG) as [Profile['role'], typeof ROLE_CONFIG[Profile['role']]][]).map(([role, config]) => {
                  const RoleIcon = config.icon
                  const isActive = p.role === role
                  return (
                    <button
                      key={role}
                      onClick={() => mudarRole(p.id, role)}
                      disabled={isLoading}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                        isActive
                          ? `${config.bg} ${config.text} ${config.border} border-2`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                      } disabled:opacity-50`}
                    >
                      <RoleIcon className="w-4 h-4" />
                      {config.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              // Badge do nível atual + botão para mudar
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{cfg.label}</span>
                  <span className="text-xs opacity-60">— {cfg.desc}</span>
                </div>
                <button
                  onClick={() => setChangingRoleId(p.id)}
                  className="text-xs text-gray-400 hover:text-escola-azul underline flex-shrink-0 transition-colors"
                >
                  Mudar nível
                </button>
              </div>
            )
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border} opacity-60`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{cfg.label}</span>
            </div>
          )}
        </div>

        {/* Senha temporária gerada */}
        {senhaTemp?.id === p.id && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2.5">
            <p className="text-xs text-purple-700 mb-1 font-semibold">Senha temporária gerada — anote e repasse com cuidado:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono font-bold text-purple-900 bg-white px-2 py-1 rounded border border-purple-200">
                {senhaTemp.senha}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(senhaTemp.senha)}
                className="text-purple-500 hover:text-purple-700"
                title="Copiar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setSenhaTemp(null)} className="text-xs text-purple-400 hover:text-purple-600 ml-auto">
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-100">
          {!p.aprovado && (
            <button
              onClick={() => aprovar(p.id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Aprovar Acesso
            </button>
          )}
          {p.aprovado && (
            <button
              onClick={() => redefinirSenha(p.id, p.nome_completo)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-purple-600 bg-purple-50 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Redefinir Senha
            </button>
          )}
          {isChanging && (
            <button
              onClick={() => setChangingRoleId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => rejeitar(p.id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            {p.aprovado ? 'Remover' : 'Rejeitar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Legenda dos níveis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(ROLE_CONFIG) as [Profile['role'], typeof ROLE_CONFIG[Profile['role']]][]).map(([role, config]) => {
          const Icon = config.icon
          return (
            <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}>
              <Icon className={`w-4 h-4 ${config.text}`} />
              <div>
                <p className={`text-xs font-bold ${config.text}`}>{config.label}</p>
                <p className="text-xs text-gray-500">{config.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {pendentes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Aguardando Aprovação ({pendentes.length})
          </h2>
          <div className="space-y-3">{pendentes.map(renderCard)}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aprovados.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  )
}
