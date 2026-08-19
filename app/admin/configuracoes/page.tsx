'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

const CAMPOS = [
  { chave: 'nome_escola', label: 'Nome da Escola', placeholder: 'Escola EMTI' },
  { chave: 'descricao_escola', label: 'Descrição', placeholder: 'Escola de Ensino Médio em Tempo Integral' },
  { chave: 'cor_primaria', label: 'Cor Primária (hex)', placeholder: '#1e40af' },
  { chave: 'cor_secundaria', label: 'Cor Secundária (hex)', placeholder: '#16a34a' },
]

export default function ConfiguracoesPage() {
  const [valores, setValores] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/api/configuracoes')
      .then(res => (res.ok ? res.json() : null))
      .then(json => { if (json?.valores) setValores(json.valores) })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    setErro('')
    const res = await fetch('/api/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valores: Object.fromEntries(CAMPOS.map(({ chave }) => [chave, valores[chave] ?? ''])),
      }),
    })
    setSaving(false)
    if (!res.ok) {
      setErro((await res.json().catch(() => ({}))).error ?? 'Não foi possível salvar.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">Configurações</h1>
      <div className="panel p-6 max-w-xl space-y-5">
        {CAMPOS.map(({ chave, label, placeholder }) => (
          <div key={chave}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              value={valores[chave] ?? ''}
              onChange={(e) => setValores((prev) => ({ ...prev, [chave]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
            />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          {saved && <span className="text-sm text-escola-verde font-medium">Configurações salvas!</span>}
          {erro && <span className="text-sm text-red-600">{erro}</span>}
        </div>
      </div>
    </div>
  )
}
