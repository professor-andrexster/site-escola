'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, X, Upload } from 'lucide-react'
import type { Aula } from '@/types/database'

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

interface AulaFormProps {
  cursoId: string
  cursoSlug: string
  proximaOrdem: number
  aula?: Aula
}

export default function AulaForm({ cursoId, cursoSlug, proximaOrdem, aula }: AulaFormProps) {
  const isEditing = !!aula
  const [titulo, setTitulo] = useState(aula?.titulo ?? '')
  const [slug, setSlug] = useState(aula?.slug ?? '')
  const [descricao, setDescricao] = useState(aula?.descricao ?? '')
  const [duracaoMin, setDuracaoMin] = useState(aula?.duracao_estimada_min?.toString() ?? '15')
  const [publicado, setPublicado] = useState(aula?.publicado ?? false)
  const [slidesUrls, setSlidesUrls] = useState<string[]>(aula?.slides_urls ?? [])
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

  async function uploadSlides(files: FileList) {
    setUploading(true)
    const novasUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const fileName = `${cursoSlug}/${slug || 'aula'}/slide-${Date.now()}-${i}.${ext}`
      const { data, error } = await supabase.storage
        .from('cursos-slides')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (error) {
        setError(`Erro ao subir "${file.name}": ${error.message}`)
        continue
      }
      const { data: { publicUrl } } = supabase.storage.from('cursos-slides').getPublicUrl(data.path)
      novasUrls.push(publicUrl)
    }
    setSlidesUrls((prev) => [...prev, ...novasUrls])
    setUploading(false)
  }

  function moveSlide(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= slidesUrls.length) return
    setSlidesUrls((prev) => {
      const copy = [...prev]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
  }

  function removeSlide(index: number) {
    setSlidesUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const payload = {
      curso_id: cursoId,
      titulo,
      slug,
      descricao: descricao || null,
      duracao_estimada_min: duracaoMin ? parseInt(duracaoMin, 10) : null,
      publicado,
      slides_urls: slidesUrls,
    }

    if (isEditing) {
      const { error } = await supabase.from('aulas').update(payload).eq('id', aula.id)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('aulas').insert({ ...payload, ordem: proximaOrdem })
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }

    router.push(`/admin/cursos/gerenciar/${cursoId}`)
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
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
            placeholder="Ex: Fórmulas Básicas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duração estimada (min)</label>
          <input
            type="number"
            value={duracaoMin}
            onChange={(e) => setDuracaoMin(e.target.value)}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Slides (imagens, em ordem)</label>
        <label className="inline-flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-escola-azul hover:text-escola-azul cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? 'Enviando...' : 'Adicionar imagens'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files && uploadSlides(e.target.files)}
          />
        </label>

        {slidesUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {slidesUrls.map((url, i) => (
              <div key={url + i} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                <img src={url} alt={`Slide ${i + 1}`} className="w-full aspect-video object-cover" />
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {i + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 text-white disabled:opacity-30">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeSlide(i)} className="p-1 text-red-400 hover:text-red-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSlide(i, 1)} disabled={i === slidesUrls.length - 1} className="p-1 text-white disabled:opacity-30">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setPublicado(!publicado)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${publicado ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${publicado ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Publicada (visível para alunos e professores)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !titulo || !slug || slidesUrls.length === 0}
          title={slidesUrls.length === 0 ? 'Adicione pelo menos um slide' : undefined}
          className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Aula'}
        </button>
      </div>
    </div>
  )
}
