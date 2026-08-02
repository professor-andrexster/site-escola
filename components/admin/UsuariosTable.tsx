'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, GraduationCap, BookOpen, Crown, ShieldCheck, Cog, Star, KeyRound, Copy, Pencil, Upload } from 'lucide-react'
import type { Profile } from '@/types/database'
import { formatarCPF } from '@/lib/cpf'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/admin/ui/Avatar'

export type UsuarioLinha = Profile & {
  email: string
  cpf: string | null
  email_alternativo: string | null
  criado_via: string | null
}

const ORIGEM_LABELS: Record<string, string> = {
  auto_aluno: 'Autocadastro (aluno)',
  auto_professor: 'Autocadastro (professor)',
  direcao: 'Criado pela gestão',
  gestao: 'Criado pela gestão',
  convite_bibliotecario: 'Convite aceito (bibliotecária)',
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
  diretora: {
    label: 'Diretora',
    icon: Crown,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    desc: 'Acesso total ao sistema',
  },
  vice_diretora: {
    label: 'Vice Diretora',
    icon: ShieldCheck,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    desc: 'Acesso total ao sistema',
  },
  admin: {
    label: 'Administrador do Sistema',
    icon: Cog,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    desc: 'Acesso técnico total ao sistema',
  },
}

interface UsuariosTableProps {
  profiles: UsuarioLinha[]
}

export default function UsuariosTable({ profiles: initial }: UsuariosTableProps) {
  const [profiles, setProfiles] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [uploadandoAvatar, setUploadandoAvatar] = useState(false)
  const [senhaTemp, setSenhaTemp] = useState<{ id: string; senha: string } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function abrirEdicao(p: UsuarioLinha) {
    setEditandoId(p.id)
    setEditNome(p.nome_completo)
    setEditAvatarUrl(p.avatar_url ?? '')
  }

  async function uploadAvatarEdicao(id: string, file: File) {
    setUploadandoAvatar(true)
    setError('')
    const ext = file.name.split('.').pop()
    const fileName = `avatars/${id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('imagens').upload(fileName, file, { upsert: true })
    if (uploadError) {
      setError('Erro ao enviar a foto.')
      setUploadandoAvatar(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(fileName)
    setEditAvatarUrl(publicUrl)
    setUploadandoAvatar(false)
  }

  async function salvarEdicao(id: string) {
    if (!editNome.trim()) { setError('O nome não pode ficar vazio.'); return }
    setLoadingId(id)
    setError('')
    const res = await fetch('/api/usuarios/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, nomeCompleto: editNome, avatarUrl: editAvatarUrl || null }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erro ao salvar perfil.')
    } else {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, nome_completo: editNome, avatar_url: editAvatarUrl || null } : p))
      setEditandoId(null)
    }
    setLoadingId(null)
  }

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
      setError(json.error ?? 'Erro ao aprovar usuário.')
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
    const res = await fetch('/api/usuarios/papel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, role }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Erro ao mudar nível de acesso.')
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

    const estaEditando = editandoId === p.id

    return (
      <div
        key={p.id}
        className={`bg-white border rounded-xl p-4 shadow-elevation-low transition-shadow hover:shadow-elevation-medium ${!p.aprovado ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200'}`}
      >
        <div className="flex items-start gap-3">
          <Avatar nome={p.nome_completo} avatarUrl={p.avatar_url} role={p.role} tamanho="md" />

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

        {estaEditando && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-4">
              <Avatar nome={editNome || p.nome_completo} avatarUrl={editAvatarUrl} role={p.role} tamanho="lg" />
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-escola-azul hover:text-escola-azul transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploadandoAvatar ? 'Enviando...' : 'Trocar foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadandoAvatar}
                  onChange={e => e.target.files?.[0] && uploadAvatarEdicao(p.id, e.target.files[0])}
                />
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome completo</label>
              <input
                value={editNome}
                onChange={e => setEditNome(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus-visible:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => salvarEdicao(p.id)}
                disabled={loadingId === p.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-escola-azul text-white rounded-lg text-xs font-semibold hover:bg-escola-azul/90 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar
              </button>
              <button
                onClick={() => setEditandoId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

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
                  <span className="text-xs opacity-60">· {cfg.desc}</span>
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
            <p className="text-xs text-purple-700 mb-1 font-semibold">Senha temporária gerada, anote e repasse com cuidado:</p>
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
          {!estaEditando && (
            <button
              onClick={() => abrirEdicao(p)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-escola-azul bg-escola-azul/10 rounded-lg text-xs font-semibold hover:bg-escola-azul/20 transition-colors disabled:opacity-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
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
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400 text-sm">
            Nenhum usuário ativo ainda.
          </div>
        ) : (
          <div className="@container">
            <div className="grid grid-cols-1 @lg:grid-cols-2 gap-3">
              {aprovados.map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
