'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Curso } from '@/types/database'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface CursoFormProps {
  curso?: Curso
  isDirecao?: boolean
}

export default function CursoForm({ curso, isDirecao = false }: CursoFormProps) {
  const isEditing = !!curso
  const [titulo, setTitulo] = useState(curso?.titulo ?? '')
  const [slug, setSlug] = useState(curso?.slug ?? '')
  const [descricao, setDescricao] = useState(curso?.descricao ?? '')
  const [categoria, setCategoria] = useState(curso?.categoria ?? '')
  const [nivel, setNivel] = useState(curso?.nivel ?? 'Iniciante')
  const [capaUrl, setCapaUrl] = useState(curso?.capa_url ?? '')
  const [publicado, setPublicado] = useState(curso?.publicado ?? false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function handleTituloChange(value: string) {
    setTitulo(value)
    if (!isEditing || slug === slugify(titulo)) {
      setSlug(slugify(value))
    }
  }

  async function uploadCapa(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${slug || 'curso'}/capa-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('cursos-slides')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) {
      setError('Erro ao fazer upload da capa.')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('cursos-slides').getPublicUrl(data.path)
    setCapaUrl(publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const payload = {
      titulo,
      slug,
      descricao: descricao || null,
      categoria: categoria || null,
      nivel,
      capa_url: capaUrl || null,
      publicado,
    }

    if (isEditing) {
      const { error } = await supabase.from('cursos').update(payload).eq('id', curso.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      router.push(`/admin/cursos/gerenciar/${curso.id}`)
      router.refresh()
    } else {
      const { data, error } = await supabase.from('cursos').insert(payload).select('id').single()
      if (error || !data) {
        setError(error?.message ?? 'Erro ao criar curso.')
        setSaving(false)
        return
      }
      router.push(`/admin/cursos/gerenciar/${data.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
            placeholder="Ex: Excel do Zero ao PROCV"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">/admin/cursos/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
            />
          </div>
        </div>

        {!isDirecao && !publicado && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
            <p className="font-semibold">📋 Rascunho - Aguardando Aprovação</p>
            <p className="text-xs mt-1">Este curso será publicado após aprovação da direção em &quot;Cursos Pendentes&quot;.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
            placeholder="Do que trata o curso"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
              placeholder="Ex: Tecnologia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul bg-white"
            >
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de capa</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && uploadCapa(e.target.files[0])}
            className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-escola-azul-claro file:text-escola-azul hover:file:bg-blue-200 cursor-pointer"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1">Fazendo upload...</p>}
          {capaUrl && (
            <div className="mt-3">
              <img src={capaUrl} alt="Preview" className="w-full max-w-sm h-40 object-cover rounded-lg border border-gray-200" />
              <button onClick={() => setCapaUrl('')} className="text-xs text-red-500 hover:underline mt-1">Remover imagem</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className={`flex items-center gap-3 ${isDirecao ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
          <div
            onClick={() => isDirecao && setPublicado(!publicado)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isDirecao ? 'cursor-pointer' : 'cursor-not-allowed'} ${publicado ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${publicado ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Publicado (visível para alunos e professores)</span>
            {!isDirecao && (
              <p className="text-xs text-amber-600 mt-1">Apenas direção pode publicar cursos</p>
            )}
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !titulo || !slug}
          className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Curso'}
        </button>
      </div>
    </div>
  )
}
