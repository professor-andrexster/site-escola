'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Save, X } from 'lucide-react'
import type { ProjetoDoAluno } from '@/lib/db/portfolio'

/**
 * O formulário de um projeto do portfólio.
 *
 * Dois botões, de propósito: guardar rascunho e enviar para revisão. O aluno
 * monta o projeto em mais de uma sessão, e obrigá-lo a enviar para poder salvar
 * encheria a fila do professor de coisa pela metade.
 */

interface Props {
  projeto?: ProjetoDoAluno | null
  aoFechar: () => void
}

export default function FormularioProjeto({ projeto, aoFechar }: Props) {
  const router = useRouter()
  const [titulo, setTitulo] = useState(projeto?.titulo ?? '')
  const [descricao, setDescricao] = useState(projeto?.descricao ?? '')
  const [linkSite, setLinkSite] = useState(projeto?.linkSite ?? '')
  const [linkRepo, setLinkRepo] = useState(projeto?.linkRepo ?? '')
  const [imagemUrl, setImagemUrl] = useState(projeto?.imagemUrl ?? '')
  const [enviando, setEnviando] = useState<'rascunho' | 'revisao' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [subindo, setSubindo] = useState(false)

  async function enviarImagem(arquivo: File) {
    setSubindo(true)
    setErro(null)
    const dados = new FormData()
    dados.append('arquivo', arquivo)
    dados.append('finalidade', 'projeto')
    const r = await fetch('/api/arquivos', { method: 'POST', body: dados })
    const json = await r.json().catch(() => null)
    setSubindo(false)
    if (!r.ok) {
      // A rota de arquivos responde em `error`; a do portfólio, em `erro`.
      setErro(json?.error ?? 'Não deu para enviar a imagem.')
      return
    }
    setImagemUrl(json.url)
  }

  async function salvar(modo: 'rascunho' | 'revisao') {
    setEnviando(modo)
    setErro(null)

    const corpo = {
      id: projeto?.id,
      titulo, descricao, linkSite, linkRepo, imagemUrl,
      enviar: modo === 'revisao',
    }
    const r = await fetch('/api/portfolio', {
      method: projeto ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    const json = await r.json().catch(() => null)
    setEnviando(null)

    if (!r.ok) {
      setErro(json?.erro ?? 'Não deu para salvar.')
      return
    }
    aoFechar()
    router.refresh()
  }

  const campo = 'w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-white/55 text-sm focus:border-curso-azul focus:outline-none transition-colors'
  const rotulo = 'block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5'

  return (
    <div className="bg-white/5 border border-white/15 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold font-geom">
          {projeto ? 'Editar projeto' : 'Novo projeto'}
        </h2>
        <button
          onClick={aoFechar}
          className="text-white/60 hover:text-white transition-colors foco-curso rounded p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="p-titulo" className={rotulo}>Título</label>
          <input
            id="p-titulo" value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Página da Pizzaria do Bairro" maxLength={120} className={campo}
          />
        </div>

        <div>
          <label htmlFor="p-desc" className={rotulo}>Descrição</label>
          <textarea
            id="p-desc" value={descricao} onChange={e => setDescricao(e.target.value)}
            rows={4} maxLength={2000} className={campo}
            placeholder="Comece pelo que o projeto é e para que serve. A tecnologia vem no fim."
          />
          <p className="text-white/55 text-xs mt-1">{descricao.length}/2000</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-site" className={rotulo}>Link do site no ar</label>
            <input
              id="p-site" type="url" value={linkSite} onChange={e => setLinkSite(e.target.value)}
              placeholder="https://seu-projeto.vercel.app" className={campo}
            />
          </div>
          <div>
            <label htmlFor="p-repo" className={rotulo}>Link do código</label>
            <input
              id="p-repo" type="url" value={linkRepo} onChange={e => setLinkRepo(e.target.value)}
              placeholder="https://github.com/voce/projeto" className={campo}
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-img" className={rotulo}>Imagem do projeto</label>
          <input
            id="p-img" type="file" accept="image/*"
            onChange={e => { const f = e.target.files?.[0]; if (f) enviarImagem(f) }}
            className="block w-full text-sm text-white/70 file:me-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
          />
          <p className="text-white/55 text-xs mt-1">
            Uma captura da tela do projeto funcionando, com conteúdo de verdade.
          </p>
          {subindo && (
            <p className="text-curso-ciano text-xs mt-2 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> enviando…
            </p>
          )}
          {imagemUrl && !subindo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt="Prévia do projeto" className="mt-3 rounded-lg max-h-40 border border-white/10" />
          )}
        </div>

        {erro && (
          <p className="text-rose-300 text-sm bg-rose-400/10 border border-rose-400/30 rounded-xl px-3 py-2">
            {erro}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => salvar('revisao')}
            disabled={!!enviando || subindo}
            className="inline-flex items-center gap-2 bg-curso-azul hover:bg-curso-azul-claro text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 foco-curso"
          >
            {enviando === 'revisao' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar para revisão
          </button>
          <button
            onClick={() => salvar('rascunho')}
            disabled={!!enviando || subindo}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 foco-curso"
          >
            {enviando === 'rascunho' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar rascunho
          </button>
        </div>
      </div>
    </div>
  )
}
