'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, RotateCcw, ExternalLink, Github, Loader2, Inbox } from 'lucide-react'

/**
 * A fila de revisão do portfólio.
 *
 * O professor precisa ABRIR os links antes de decidir — um projeto cujo
 * endereço não carrega não pode ir para o site da escola. Por isso os dois
 * links ficam em destaque, abrindo em aba nova, e não escondidos num detalhe.
 */

interface ItemFila {
  id: string
  titulo: string
  descricao: string | null
  imagemUrl: string | null
  linkSite: string | null
  linkRepo: string | null
  criadoEm: string | null
  aluno: { id: string; nome: string; serie: string | null; turma: string | null } | null
}

export default function FilaPortfolio({ itens }: { itens: ItemFila[] }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [devolvendo, setDevolvendo] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function decidir(id: string, acao: 'aprovar' | 'devolver') {
    setOcupado(id)
    setErro(null)
    const r = await fetch('/api/portfolio/revisao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao, motivo: acao === 'devolver' ? motivo : undefined }),
    })
    const json = await r.json().catch(() => null)
    setOcupado(null)
    if (!r.ok) {
      setErro(json?.erro ?? 'Não deu para registrar a decisão.')
      return
    }
    setDevolvendo(null)
    setMotivo('')
    router.refresh()
  }

  if (!itens.length) {
    return (
      <div className="panel p-10 text-center">
        <Inbox className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold">Nada para revisar</p>
        <p className="text-gray-600 text-sm mt-1">
          Quando um aluno enviar um projeto, ele aparece aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {erro && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>
      )}

      {itens.map(item => (
        <div key={item.id} className="panel p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {item.imagemUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imagemUrl} alt={`Tela do projeto ${item.titulo}`}
                className="w-full sm:w-40 h-28 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900">{item.titulo}</h3>
              <p className="text-gray-600 text-xs mt-0.5">
                {item.aluno?.nome ?? 'Aluno removido'}
                {item.aluno?.serie && ` · ${item.aluno.serie}`}
                {item.aluno?.turma && ` ${item.aluno.turma}`}
                {item.criadoEm && ` · enviado em ${new Date(item.criadoEm).toLocaleDateString('pt-BR')}`}
              </p>

              {item.descricao && (
                <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{item.descricao}</p>
              )}

              <div className="flex flex-wrap gap-3 mt-3">
                {item.linkSite ? (
                  <a
                    href={item.linkSite} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline font-medium foco-painel rounded"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir o site
                  </a>
                ) : (
                  <span className="text-sm text-amber-700">Sem link do site</span>
                )}
                {item.linkRepo ? (
                  <a
                    href={item.linkRepo} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline font-medium foco-painel rounded"
                  >
                    <Github className="w-4 h-4" /> Abrir o código
                  </a>
                ) : (
                  <span className="text-sm text-amber-700">Sem link do código</span>
                )}
              </div>

              {devolvendo === item.id ? (
                <div className="mt-4">
                  <label htmlFor={`motivo-${item.id}`} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    O que o aluno precisa corrigir
                  </label>
                  <textarea
                    id={`motivo-${item.id}`}
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ex.: o link do site abre uma página em branco — confira se o arquivo se chama index.html."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:border-escola-azul focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => decidir(item.id, 'devolver')}
                      disabled={ocupado === item.id || motivo.trim().length < 5}
                      className="inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 foco-painel"
                    >
                      {ocupado === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Devolver
                    </button>
                    <button
                      onClick={() => { setDevolvendo(null); setMotivo('') }}
                      className="text-sm text-gray-600 hover:text-gray-900 px-2 foco-painel rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => decidir(item.id, 'aprovar')}
                    disabled={ocupado === item.id}
                    className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 foco-painel"
                  >
                    {ocupado === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Aprovar e publicar
                  </button>
                  <button
                    onClick={() => { setDevolvendo(item.id); setMotivo('') }}
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors foco-painel"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Devolver para correção
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
