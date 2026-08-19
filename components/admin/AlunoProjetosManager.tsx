'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Star, ExternalLink } from 'lucide-react'
import type { Projeto, Trilha } from '@/types/database'
import { trilhaBgLight, trilhaText } from '@/lib/trilhaColors'
import { enviarArquivo } from '@/lib/enviarArquivo'

type ProjetoComTrilha = Projeto & { trilhas: Trilha | Trilha[] | null }

interface FormState {
  id: string | null
  titulo: string
  trilha_id: string
  descricao: string
  link_externo: string
  tags: string[]
  tagInput: string
  destaque: boolean
  imagem_url: string
}

const FORM_VAZIO: FormState = {
  id: null,
  titulo: '',
  trilha_id: '',
  descricao: '',
  link_externo: '',
  tags: [],
  tagInput: '',
  destaque: false,
  imagem_url: '',
}

function trilhaDe(p: ProjetoComTrilha): Trilha | null {
  return Array.isArray(p.trilhas) ? p.trilhas[0] ?? null : p.trilhas
}

export default function AlunoProjetosManager({
  alunoId, serieAtual, trilhas, projetosIniciais,
}: {
  alunoId: string
  serieAtual: string
  trilhas: Trilha[]
  projetosIniciais: ProjetoComTrilha[]
}) {
  const [projetos, setProjetos] = useState(projetosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VAZIO)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  function abrirNovo() {
    setForm(FORM_VAZIO)
    setErro('')
    setModalAberto(true)
  }

  function abrirEdicao(p: ProjetoComTrilha) {
    setForm({
      id: p.id,
      titulo: p.titulo,
      trilha_id: p.trilha_id ?? '',
      descricao: p.descricao ?? '',
      link_externo: p.link_externo ?? '',
      tags: p.tags ?? [],
      tagInput: '',
      destaque: p.destaque,
      imagem_url: p.imagem_url ?? '',
    })
    setErro('')
    setModalAberto(true)
  }

  function adicionarTag() {
    const tag = form.tagInput.trim()
    if (!tag || form.tags.includes(tag)) return
    setForm(prev => ({ ...prev, tags: [...prev.tags, tag], tagInput: '' }))
  }

  function removerTag(tag: string) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  async function uploadImagem(file: File) {
    setUploading(true)
    const enviado = await enviarArquivo('projeto', file)
    if ('erro' in enviado) {
      setErro(enviado.erro)
      setUploading(false)
      return
    }
    setForm(prev => ({ ...prev, imagem_url: enviado.url }))
    setUploading(false)
  }

  async function salvar() {
    if (!form.titulo.trim()) {
      setErro('Informe o título do projeto.')
      return
    }
    setSaving(true)
    setErro('')

    const payload = {
      alunoId,
      trilha_id: form.trilha_id || null,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      link_externo: form.link_externo.trim() || null,
      tags: form.tags,
      destaque: form.destaque,
      imagem_url: form.imagem_url || null,
      serie_na_epoca: serieAtual,
    }

    const res = await fetch(form.id ? `/api/projetos/${form.id}` : '/api/projetos', {
      method: form.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setErro(json.error ?? 'Erro ao salvar o projeto.'); setSaving(false); return }

    if (form.id) {
      setProjetos(prev => prev.map(p => p.id === form.id ? json.projeto as ProjetoComTrilha : p))
    } else {
      setProjetos(prev => [json.projeto as ProjetoComTrilha, ...prev])
    }

    setSaving(false)
    setModalAberto(false)
  }

  async function excluir(id: string) {
    if (!confirm('Remover este projeto do portfólio?')) return
    const res = await fetch(`/api/projetos/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error ?? 'Erro ao remover o projeto.')
      return
    }
    setProjetos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={abrirNovo}
        onKeyDown={(e) => { if (e.key === 'Enter') abrirNovo() }}
        className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-escola-azul/90 transition-colors mb-5"
      >
        <Plus className="w-4 h-4" />
        Adicionar Projeto
      </div>

      {projetos.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-gray-500 text-sm">Nenhum projeto cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projetos.map(p => {
            const trilha = trilhaDe(p)
            return (
              <div key={p.id} className="panel p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{p.titulo}</p>
                    {p.destaque && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                    {trilha && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${trilhaBgLight(trilha.cor_tailwind)} ${trilhaText(trilha.cor_tailwind)}`}>
                        {trilha.icone} {trilha.nome}
                      </span>
                    )}
                  </div>
                  {p.descricao && <p className="text-xs text-gray-500 mb-1">{p.descricao}</p>}
                  {p.link_externo && (
                    <a href={p.link_externo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-escola-azul hover:underline">
                      {p.link_externo} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div role="button" tabIndex={0} onClick={() => abrirEdicao(p)} onKeyDown={(e) => { if (e.key === 'Enter') abrirEdicao(p) }}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-500">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div role="button" tabIndex={0} onClick={() => excluir(p.id)} onKeyDown={(e) => { if (e.key === 'Enter') excluir(p.id) }}
                    className="p-2 rounded-lg hover:bg-red-50 cursor-pointer text-escola-vermelho">
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-elevation-high max-w-lg w-full max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-lg font-bold text-gray-900">{form.id ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <div role="button" tabIndex={0} onClick={() => setModalAberto(false)} onKeyDown={(e) => { if (e.key === 'Enter') setModalAberto(false) }} className="p-1 cursor-pointer text-gray-500 hover:text-gray-600">
                <X className="w-5 h-5" />
              </div>
            </div>

            {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-3">{erro}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
                <input type="text" value={form.titulo} onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trilha</label>
                <select value={form.trilha_id} onChange={(e) => setForm(prev => ({ ...prev, trilha_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30">
                  <option value="">Sem trilha</option>
                  {trilhas.map(t => <option key={t.id} value={t.id}>{t.icone} {t.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link externo</label>
                <input type="text" value={form.link_externo} onChange={(e) => setForm(prev => ({ ...prev, link_externo: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removerTag(tag)} />
                    </span>
                  ))}
                </div>
                <input type="text" value={form.tagInput}
                  onChange={(e) => setForm(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarTag() } }}
                  placeholder="Digite e pressione Enter"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagem (opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImagem(e.target.files[0])}
                  className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-escola-azul-claro file:text-escola-azul hover:file:bg-blue-200 cursor-pointer" />
                {uploading && <p className="text-xs text-gray-500 mt-1">Fazendo upload...</p>}
                {form.imagem_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imagem_url} alt="Preview" className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200" />
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destaque} onChange={(e) => setForm(prev => ({ ...prev, destaque: e.target.checked }))} className="w-4 h-4 accent-escola-azul" />
                <span className="text-sm text-gray-700">Marcar como destaque (aparece na vitrine)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <div role="button" tabIndex={0} onClick={() => !saving && salvar()} onKeyDown={(e) => { if (e.key === 'Enter' && !saving) salvar() }}
                className={`flex-1 text-center bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-escola-azul/90 transition-colors ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
                {saving ? 'Salvando...' : 'Salvar'}
              </div>
              <div role="button" tabIndex={0} onClick={() => setModalAberto(false)} onKeyDown={(e) => { if (e.key === 'Enter') setModalAberto(false) }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
