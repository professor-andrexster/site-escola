'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react'
import type { Trilha } from '@/types/database'
import { trilhaBg, trilhaBgLight, trilhaText } from '@/lib/trilhaColors'

interface ProjetoVitrine {
  id: string
  titulo: string
  descricao: string | null
  imagem_url: string | null
  link_externo: string | null
  tags: string[] | null
  destaque: boolean
  criado_em: string
  trilhas: { nome: string; icone: string | null; cor_tailwind: string | null } | { nome: string; icone: string | null; cor_tailwind: string | null }[] | null
  alunos: { nome: string; matricula: string; serie: string; turma: string; ativo: boolean } | { nome: string; matricula: string; serie: string; turma: string; ativo: boolean }[] | null
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? v[0] ?? null : v
}

const POR_PAGINA = 12

export default function VitrineProjetos({ projetos, trilhas }: { projetos: ProjetoVitrine[]; trilhas: Trilha[] }) {
  const [filtro, setFiltro] = useState('Todos')
  const [pagina, setPagina] = useState(0)
  const [destaqueIdx, setDestaqueIdx] = useState(0)

  const destaques = useMemo(() => projetos.filter(p => p.destaque), [projetos])

  const filtrados = useMemo(() => {
    if (filtro === 'Todos') return projetos
    return projetos.filter(p => one(p.trilhas)?.nome === filtro)
  }, [projetos, filtro])

  useEffect(() => { setPagina(0) }, [filtro])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const visiveis = filtrados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)

  const destaqueAtual = destaques[destaqueIdx]
  const alunoDestaque = destaqueAtual ? one(destaqueAtual.alunos) : null
  const trilhaDestaque = destaqueAtual ? one(destaqueAtual.trilhas) : null

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-escola-azul text-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3">JB2026 · Vitrine</p>
          <h1 className="font-playfair text-3xl md:text-4xl font-black mb-3">Projetos dos Alunos JB2026</h1>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Trabalhos reais criados pelos alunos do EMTI em Excel & Dados, Hardware, Software, Design Digital e Programação.
          </p>
          <p className="font-mono text-xs text-yellow-400 mt-4">{projetos.length} projeto{projetos.length !== 1 ? 's' : ''} publicado{projetos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Destaques */}
        {destaqueAtual && (
          <section className="mb-10">
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" /> Destaques
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
              <div className={`w-full md:w-64 h-40 md:h-auto flex-shrink-0 flex items-center justify-center ${trilhaBg(trilhaDestaque?.cor_tailwind)}`}>
                {destaqueAtual.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={destaqueAtual.imagem_url} alt={destaqueAtual.titulo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{trilhaDestaque?.icone}</span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-playfair text-lg font-bold text-gray-900">{destaqueAtual.titulo}</h3>
                  {trilhaDestaque && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${trilhaBgLight(trilhaDestaque.cor_tailwind)} ${trilhaText(trilhaDestaque.cor_tailwind)}`}>
                      {trilhaDestaque.icone} {trilhaDestaque.nome}
                    </span>
                  )}
                </div>
                {destaqueAtual.descricao && <p className="text-sm text-gray-500 mb-3 flex-1">{destaqueAtual.descricao}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{alunoDestaque?.nome.split(' ')[0]} · {alunoDestaque?.serie}</span>
                  {alunoDestaque && (
                    <Link href={`/portfolio/${alunoDestaque.matricula}`} className="inline-flex items-center gap-1 text-escola-azul font-medium hover:underline">
                      Ver projeto completo <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
              {destaques.length > 1 && (
                <div className="flex md:flex-col items-center justify-center gap-2 p-3 border-t md:border-t-0 md:border-l border-gray-100">
                  <button onClick={() => setDestaqueIdx((destaqueIdx - 1 + destaques.length) % destaques.length)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 font-mono">{destaqueIdx + 1}/{destaques.length}</span>
                  <button onClick={() => setDestaqueIdx((destaqueIdx + 1) % destaques.length)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Filtro por trilha */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
          {['Todos', ...trilhas.map(t => t.nome)].map(nome => (
            <button
              key={nome}
              onClick={() => setFiltro(nome)}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                filtro === nome
                  ? 'bg-escola-azul text-white border-escola-azul'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-escola-azul/30'
              }`}
            >
              {nome === 'Todos' ? 'Todos' : `${trilhas.find(t => t.nome === nome)?.icone ?? ''} ${nome}`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visiveis.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-400 text-sm">Nenhum projeto encontrado nessa trilha ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visiveis.map(p => {
              const trilha = one(p.trilhas)
              const aluno = one(p.alunos)
              return (
                <Link
                  key={p.id}
                  href={aluno ? `/portfolio/${aluno.matricula}` : '#'}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-escola-azul/30 transition-colors flex flex-col"
                >
                  <div className={`h-32 flex items-center justify-center ${trilhaBg(trilha?.cor_tailwind)}`}>
                    {p.imagem_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{trilha?.icone}</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{p.titulo}</h3>
                      {trilha && (
                        <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${trilhaBgLight(trilha.cor_tailwind)} ${trilhaText(trilha.cor_tailwind)}`}>
                          {trilha.icone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{aluno?.nome.split(' ')[0]} · {aluno?.serie}</p>
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-escola-azul font-medium mt-auto inline-flex items-center gap-1">
                      Ver projeto completo <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:border-escola-azul/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500 font-mono">{pagina + 1} / {totalPaginas}</span>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:border-escola-azul/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
