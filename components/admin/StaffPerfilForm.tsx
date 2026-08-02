'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Upload, X, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/admin/ui/Avatar'
import { ROLE_LABELS } from '@/lib/roles'
import type { Profile } from '@/types/database'

export default function StaffPerfilForm({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()

  const [nomeCompleto, setNomeCompleto] = useState(profile.nome_completo)
  const [disciplina, setDisciplina] = useState(profile.disciplina ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploadando, setUploadando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleUploadFoto(file: File) {
    setUploadando(true)
    setErro('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `avatars/${profile.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('imagens').upload(fileName, file, { upsert: true })
      if (uploadError) { setErro('Erro ao enviar a foto.'); setUploadando(false); return }
      const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(fileName)
      setAvatarUrl(publicUrl)
    } catch {
      setErro('Erro ao enviar a foto.')
    }
    setUploadando(false)
  }

  async function handleSalvar() {
    if (!nomeCompleto.trim()) { setErro('O nome não pode ficar vazio.'); return }
    setSalvando(true)
    setErro('')
    setSucesso(false)

    const res = await fetch('/api/usuarios/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeCompleto,
        avatarUrl: avatarUrl || null,
        disciplina: profile.role === 'professor' ? disciplina : undefined,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error ?? 'Erro ao salvar.'); setSalvando(false); return }

    setSucesso(true)
    setSalvando(false)
    router.refresh()
    setTimeout(() => setSucesso(false), 3000)
  }

  return (
    <div className="flow bg-white rounded-xl shadow-elevation-low border border-gray-100 p-fluid-s max-w-2xl">
      {erro && (
        <div className="flex items-start gap-3 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{erro}</p>
        </div>
      )}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Perfil atualizado com sucesso!
        </div>
      )}

      <div className="flex items-center gap-5">
        <Avatar nome={nomeCompleto || profile.nome_completo} avatarUrl={avatarUrl} role={profile.role} tamanho="xl" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sua foto</p>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-escola-azul hover:text-escola-azul transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploadando ? 'Enviando...' : 'Enviar foto'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadando} onChange={e => e.target.files?.[0] && handleUploadFoto(e.target.files[0])} />
            </label>
            {avatarUrl && (
              <button type="button" onClick={() => setAvatarUrl('')} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
        <input
          value={nomeCompleto}
          onChange={e => setNomeCompleto(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus-visible:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-fluid-xs">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Papel</label>
          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {ROLE_LABELS[profile.role]}
          </div>
        </div>
        {profile.role === 'professor' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Disciplina</label>
            <input
              value={disciplina}
              onChange={e => setDisciplina(e.target.value)}
              placeholder="Ex: Matemática, Português, TI"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus-visible:outline-none"
            />
          </div>
        )}
        {profile.turma && profile.role !== 'professor' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Turma</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {profile.turma}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSalvar}
        disabled={salvando}
        className="flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-escola-azul/90 disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {salvando ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  )
}
