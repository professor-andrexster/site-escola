'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { trilhaBgLight, trilhaText, trilhaBorder } from '@/lib/trilhaColors'
import { formatDate } from '@/lib/utils'

interface ProjetoComTrilha {
  id: string
  titulo: string
  descricao: string | null
  imagem_url: string | null
  link_externo: string | null
  tags: string[] | null
  destaque: boolean
  criado_em: string
  trilhas: { nome: string; icone: string | null; cor_tailwind: string | null } | { nome: string; icone: string | null; cor_tailwind: string | null }[] | null
}

function getTrilha(p: ProjetoComTrilha) {
  return Array.isArray(p.trilhas) ? p.trilhas[0] : p.trilhas
}

export default function PortfolioProjetos({ projetos }: { projetos: ProjetoComTrilha[] }) {
  const [filtro, setFiltro] = useState<string>('Todos')

  const trilhasPresentes = useMemo(() => {
    const nomes = new Set<string>()
    projetos.forEach(p => {
      const t = getTrilha(p)
      if (t) nomes.add(t.nome)
    })
    return Array.from(nomes)
  }, [projetos])

  const filtrados = useMemo(() => {
    if (filtro === 'Todos') return projetos
    return projetos.filter(p => getTrilha(p)?.nome === filtro)
  }, [projetos, filtro])

  return (
    <div>
      {trilhasPresentes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
          {['Todos', ...trilhasPresentes].map(nome => (
            <button
              key={nome}
              onClick={() => setFiltro(nome)}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                filtro === nome
                  ? 'bg-escola-azul text-white border-escola-azul'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-escola-azul/30'
              }`}
            >
              {nome}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtrados.map(p => {
          const trilha = getTrilha(p)
          return (
            <div key={p.id} className={`bg-white border rounded-xl overflow-hidden ${p.destaque ? trilhaBorder(trilha?.cor_tailwind) : 'border-gray-200'}`}>
              {p.imagem_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagem_url} alt={p.titulo} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{p.titulo}</h3>
                  {trilha && (
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${trilhaBgLight(trilha.cor_tailwind)} ${trilhaText(trilha.cor_tailwind)}`}>
                      {trilha.icone} {trilha.nome}
                    </span>
                  )}
                </div>
                {p.descricao && <p className="text-gray-500 text-xs leading-relaxed mb-3">{p.descricao}</p>}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(p.criado_em)}</span>
                  {p.link_externo && (
                    <a href={p.link_externo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-escola-azul font-medium hover:underline">
                      Ver projeto <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
