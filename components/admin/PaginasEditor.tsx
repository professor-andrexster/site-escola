'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PaginaConteudo } from '@/types/database'
import TipTapEditor from './TipTapEditor'
import { ChevronDown, ChevronUp, Save } from 'lucide-react'

interface PaginasEditorProps {
  pagina: string
  label: string
  initialData?: PaginaConteudo
}

export default function PaginasEditor({ pagina, label, initialData }: PaginasEditorProps) {
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState(initialData?.titulo ?? label)
  const [conteudo, setConteudo] = useState(initialData?.conteudo ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('paginas_conteudo')
      .upsert({ pagina, titulo, conteudo }, { onConflict: 'pagina' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Página</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <TipTapEditor content={conteudo} onChange={setConteudo} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            {saved && <span className="text-sm text-escola-verde font-medium">Salvo!</span>}
          </div>
        </div>
      )}
    </div>
  )
}
