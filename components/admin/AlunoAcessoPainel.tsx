'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldOff, Clock, UserX } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import type { Profile } from '@/types/database'

interface AlunoAcessoPainelProps {
  perfil: Pick<Profile, 'id' | 'role' | 'aprovado'> | null
}

export default function AlunoAcessoPainel({ perfil }: AlunoAcessoPainelProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function aprovar() {
    if (!perfil) return
    setLoading(true)
    setErro('')
    const res = await fetch('/api/usuarios/aprovar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: perfil.id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao aprovar acesso.')
      setLoading(false)
      return
    }
    router.refresh()
  }

  async function revogar() {
    if (!perfil) return
    if (!confirm('Revogar o acesso deste aluno ao painel? Ele não vai conseguir mais entrar até ser aprovado de novo.')) return
    setLoading(true)
    setErro('')
    const res = await fetch('/api/usuarios/revogar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: perfil.id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao revogar acesso.')
      setLoading(false)
      return
    }
    router.refresh()
  }

  return (
    <div className="panel p-5 mb-6">
      <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-escola-azul" />
        Acesso ao Sistema
      </h2>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-3">{erro}</div>}

      {!perfil ? (
        <div className="flex items-start gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
          <UserX className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Este aluno ainda não criou conta de login. Ele pode se cadastrar em /admin/cadastro com a matrícula acima.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${ROLE_COLORS[perfil.role]}`}>
              {ROLE_LABELS[perfil.role]}
            </span>
            {perfil.aprovado ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Acesso liberado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                Aguardando aprovação
              </span>
            )}
          </div>

          {perfil.aprovado ? (
            <button
              onClick={revogar}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Revogar Acesso
            </button>
          ) : (
            <button
              onClick={aprovar}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Aprovar Acesso
            </button>
          )}
        </div>
      )}
    </div>
  )
}
