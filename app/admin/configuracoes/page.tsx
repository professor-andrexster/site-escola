'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  useEffect(() => {
    supabase.from('configuracoes_site').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((item) => { map[item.chave] = item.valor ?? '' })
        setValores(map)
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const updates = CAMPOS.map(({ chave }) => ({
      chave,
      valor: valores[chave] ?? '',
    }))
    await supabase.from('configuracoes_site').upsert(updates, { onConflict: 'chave' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-gray-900 mb-8">Configurações</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl space-y-5">
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
            className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          {saved && <span className="text-sm text-escola-verde font-medium">Configurações salvas!</span>}
        </div>
      </div>
    </div>
  )
}
