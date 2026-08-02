'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, X, Copy } from 'lucide-react'

export default function ConvidarBibliotecariaForm() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkManual, setLinkManual] = useState('')
  const router = useRouter()

  function reset() {
    setNome(''); setEmail(''); setError(''); setLinkManual('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setLinkManual('')

    const res = await fetch('/api/convites/bibliotecario/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Erro ao criar convite.')
      setLoading(false)
      return
    }

    setLoading(false)
    if (json.emailEnviado === false) {
      setLinkManual(json.link)
      return
    }

    reset()
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Convidar Bibliotecária
      </button>
    )
  }

  return (
    <div className="panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-600" />
          Convidar Bibliotecária
        </h2>
        <button onClick={() => { setOpen(false); reset() }} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {linkManual ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm mb-4 space-y-2">
          <p>O convite foi criado, mas o email não pôde ser enviado. Copie o link e envie manualmente.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white px-2 py-1.5 rounded border border-amber-200 break-all">{linkManual}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(linkManual)}
              className="text-amber-600 hover:text-amber-800 flex-shrink-0"
              title="Copiar"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => { reset(); setOpen(false); router.refresh() }}
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white font-semibold py-3 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Enviando convite...' : 'Enviar Convite'}
          </button>
        </form>
      )}
    </div>
  )
}
