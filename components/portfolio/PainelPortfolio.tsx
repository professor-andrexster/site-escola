'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ExternalLink, Github, Pencil, Trash2, Check, Clock, RotateCcw, FileEdit, Send } from 'lucide-react'
import FormularioProjeto from './FormularioProjeto'
import type { ProjetoDoAluno, StatusProjeto } from '@/lib/db/portfolio'

/**
 * O painel do portfólio do aluno: a lista dos projetos dele e o formulário.
 *
 * Cada projeto mostra em que pé está. É o estado que responde a dúvida que
 * traz o aluno aqui — "já mandei? o professor viu? por que voltou?" — e quando
 * volta, o motivo aparece junto, não numa tela separada.
 */

const ESTADO: Record<StatusProjeto, { rotulo: string; classe: string; Icone: typeof Check }> = {
  rascunho: { rotulo: 'Rascunho', classe: 'text-white/70 bg-white/10 border-white/20', Icone: FileEdit },
  pendente: { rotulo: 'Aguardando revisão', classe: 'text-amber-300 bg-amber-400/10 border-amber-400/30', Icone: Clock },
  aprovado: { rotulo: 'Publicado', classe: 'text-green-300 bg-green-400/10 border-green-400/30', Icone: Check },
  recusado: { rotulo: 'Voltou para correção', classe: 'text-rose-300 bg-rose-400/10 border-rose-400/30', Icone: RotateCcw },
}

export default function PainelPortfolio({ projetos }: { projetos: ProjetoDoAluno[] }) {
  const router = useRouter()
  const [editando, setEditando] = useState<ProjetoDoAluno | null | 'novo'>(null)
  const [apagando, setApagando] = useState<string | null>(null)

  async function apagar(p: ProjetoDoAluno) {
    if (!confirm(`Apagar "${p.titulo}"? Isso não volta.`)) return
    setApagando(p.id)
    await fetch(`/api/portfolio?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' })
    setApagando(null)
    router.refresh()
  }

  async function enviarParaRevisao(p: ProjetoDoAluno) {
    await fetch('/api/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: p.id, titulo: p.titulo, descricao: p.descricao ?? '',
        linkSite: p.linkSite ?? '', linkRepo: p.linkRepo ?? '',
        imagemUrl: p.imagemUrl ?? '', enviar: true,
      }),
    })
    router.refresh()
  }

  return (
    <>
      {editando ? (
        <FormularioProjeto
          projeto={editando === 'novo' ? null : editando}
          aoFechar={() => setEditando(null)}
        />
      ) : (
        <button
          onClick={() => setEditando('novo')}
          className="inline-flex items-center gap-2 bg-curso-azul hover:bg-curso-azul-claro text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors mb-6 foco-curso"
        >
          <Plus className="w-4 h-4" />
          Novo projeto
        </button>
      )}

      {projetos.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-2xl p-10 text-center">
          <p className="text-white font-semibold mb-1">Seu portfólio está vazio</p>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Cadastre um projeto que você já colocou no ar. Título, descrição, uma imagem da tela e
            os links do site e do código.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {projetos.map(p => {
            const e = ESTADO[p.status]
            return (
              <li key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {p.imagemUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagemUrl} alt={`Tela do projeto ${p.titulo}`}
                      className="w-full sm:w-44 h-32 sm:h-auto object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${e.classe}`}>
                        <e.Icone className="w-3 h-3" />
                        {e.rotulo}
                      </span>
                    </div>

                    <h3 className="text-white font-bold truncate">{p.titulo}</h3>
                    {p.descricao && (
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{p.descricao}</p>
                    )}

                    {p.status === 'recusado' && p.motivoRecusa && (
                      <p className="text-rose-200 text-sm bg-rose-400/10 border border-rose-400/25 rounded-xl px-3 py-2 mt-3">
                        <strong className="font-semibold">O que corrigir:</strong> {p.motivoRecusa}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                      {p.linkSite && (
                        <a
                          href={p.linkSite} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-curso-ciano hover:underline text-xs foco-curso rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Ver no ar
                        </a>
                      )}
                      {p.linkRepo && (
                        <a
                          href={p.linkRepo} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-curso-ciano hover:underline text-xs foco-curso rounded"
                        >
                          <Github className="w-3.5 h-3.5" /> Ver o código
                        </a>
                      )}

                      <span className="flex-1" />

                      {(p.status === 'rascunho' || p.status === 'recusado') && (
                        <button
                          onClick={() => enviarParaRevisao(p)}
                          className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg font-semibold transition-colors foco-curso"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar para revisão
                        </button>
                      )}
                      <button
                        onClick={() => setEditando(p)}
                        className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors foco-curso rounded px-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => apagar(p)}
                        disabled={apagando === p.id}
                        className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-50 foco-curso rounded px-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Apagar
                      </button>
                    </div>

                    {p.status === 'aprovado' && (
                      <p className="text-white/55 text-xs mt-3">
                        Editar este projeto tira ele do site até o professor revisar de novo.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
