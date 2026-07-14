'use client'

import { useState } from 'react'
import { Key, AlertCircle } from 'lucide-react'

interface ResetarSenhaFormProps {
  alunoId: string
  alunoNome: string
  userId?: string
}

export default function ResetarSenhaForm({ alunoId, alunoNome, userId }: ResetarSenhaFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleResetarSenha() {
    if (!userId) {
      setErro('Este aluno não tem conta no sistema ainda.')
      return
    }

    if (!confirm(`Resetar senha de "${alunoNome}"?\n\nUma senha temporária será gerada.`)) return

    setLoading(true)
    setErro('')
    setSucesso('')

    const res = await fetch('/api/usuarios/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErro(json.error || 'Erro ao resetar senha')
      setLoading(false)
      return
    }

    const json = await res.json()
    setSucesso(`Senha temporária gerada: ${json.senha || '(enviada por email)'}`)
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={!userId}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={!userId ? 'Aluno não tem conta no sistema' : 'Resetar senha'}
      >
        <Key className="w-4 h-4" />
        Resetar Senha
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <Key className="w-4 h-4 text-amber-600" />
        Resetar Senha de {alunoNome}
      </h3>

      {erro && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4">
          <Key className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Senha resetada com sucesso!</p>
            <p className="mt-1">{sucesso}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Uma senha temporária será gerada. O aluno deverá fazer login e alterar a senha.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleResetarSenha}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar Nova Senha'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
