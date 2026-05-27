'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Noticia } from '@/types/database'
import { CATEGORIAS, type CategoriaKey } from '@/lib/categorias'
import TipTapEditor from './TipTapEditor'

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

interface NoticiaEditorProps {
  noticia?: Noticia
}

export default function NoticiaEditor({ noticia }: NoticiaEditorProps) {
  const isEditing = !!noticia
  const [titulo, setTitulo] = useState(noticia?.titulo ?? '')
  const [slug, setSlug] = useState(noticia?.slug ?? '')
  const [resumo, setResumo] = useState(noticia?.resumo ?? '')
  const [conteudo, setConteudo] = useState(noticia?.conteudo ?? '')
  const [imagemUrl, setImagemUrl] = useState(noticia?.imagem_url ?? '')
  const [categoria, setCategoria] = useState<CategoriaKey | ''>(
    (noticia?.categoria as CategoriaKey) ?? ''
  )
  const [publicado, setPublicado] = useState(noticia?.publicado ?? false)
  const [destaqueHome, setDestaqueHome] = useState(noticia?.destaque_home ?? false)
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

  async function uploadImagem(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) {
      setError('Erro ao fazer upload da imagem.')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(data.path)
    setImagemUrl(publicUrl)
    setUploading(false)
  }

  async function handleSave(publish: boolean) {
    setSaving(true)
    setError('')
    const payload = {
      titulo,
      slug,
      resumo: resumo || null,
      conteudo: conteudo || null,
      imagem_url: imagemUrl || null,
      publicado: publish,
      destaque_home: destaqueHome,
      categoria: categoria || null,
    }
    let result
    if (isEditing) {
      result = await supabase.from('noticias').update(payload).eq('id', noticia.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      result = await supabase.from('noticias').insert({
        ...payload,
        autor_id: user?.id ?? null,
        autor_nome: user?.email ?? null,
      })
    }
    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }
    router.push('/admin/noticias')
    router.refresh()
  }

  return (
    <div className="max-w-4xl space-y-6">
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
            placeholder="Título da notícia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">/noticias/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
            placeholder="Breve descrição da notícia (aparece nos cards e como subtítulo)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaKey | '')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul bg-white"
          >
            <option value="">Sem categoria</option>
            {(Object.entries(CATEGORIAS) as [CategoriaKey, typeof CATEGORIAS[CategoriaKey]][]).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
          <TipTapEditor content={conteudo} onChange={setConteudo} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de capa</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && uploadImagem(e.target.files[0])}
            className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-escola-azul-claro file:text-escola-azul hover:file:bg-blue-200 cursor-pointer"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1">Fazendo upload...</p>}
          {imagemUrl && (
            <div className="mt-3">
              <img src={imagemUrl} alt="Preview" className="w-full max-w-sm h-40 object-cover rounded-lg border border-gray-200" />
              <button onClick={() => setImagemUrl('')} className="text-xs text-red-500 hover:underline mt-1">Remover imagem</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-wrap gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setPublicado(!publicado)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${publicado ? 'bg-escola-verde' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${publicado ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Publicado</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setDestaqueHome(!destaqueHome)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${destaqueHome ? 'bg-yellow-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${destaqueHome ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Destaque na Home</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={saving || !titulo}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Salvar Rascunho
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !titulo}
          className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
