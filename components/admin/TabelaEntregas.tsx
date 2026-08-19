'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Award, Check, X, Download, ExternalLink, Printer, Layers, BookOpen,
} from 'lucide-react'

export interface Entrega {
  id: string
  aluno: string
  turma: string | null
  tipo: 'curso' | 'modulo'
  origem: string
  origemSlug: string
  nivel: string | null
  carga: number | null
  desafio: string
  status: string
  arquivoUrl: string | null
  linkUrl: string | null
  comentario: string | null
  feedback: string | null
  enviadoEm: string
  avaliadoEm: string | null
  certificado: { codigo: string; carga: number } | null
}

const DATA = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const ROTULO: Record<string, { texto: string; classe: string }> = {
  entregue: { texto: 'Esperando correção', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
  aprovado: { texto: 'Aprovado', classe: 'bg-green-50 text-green-700 border-green-200' },
  recusado: { texto: 'Devolvido', classe: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export default function TabelaEntregas({ entregas: inicial }: { entregas: Entrega[] }) {
  const [entregas, setEntregas] = useState(inicial)
  const [filtro, setFiltro] = useState<'todas' | 'entregue' | 'aprovado'>('entregue')
  const [aberta, setAberta] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const visiveis = entregas.filter(e => filtro === 'todas' || e.status === filtro)

  async function avaliar(entrega: Entrega, aprovado: boolean) {
    // Recusa sem devolutiva deixa o aluno sem saber o que corrigir — a API
    // recusa também, este bloqueio é só para não gastar a ida e volta.
    if (!aprovado && !feedback.trim()) {
      setErro('Escreva o que precisa ser corrigido antes de devolver.')
      return
    }
    setOcupado(entrega.id)
    setErro('')

    const res = await fetch(`/api/cursos/desafio-final/envios/${entrega.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprovado, feedback: feedback.trim() || null }),
    })
    const json = await res.json().catch(() => ({}))
    setOcupado(null)

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao avaliar a entrega.')
      return
    }

    setEntregas(prev =>
      prev.map(e =>
        e.id === entrega.id
          ? {
              ...e,
              status: aprovado ? 'aprovado' : 'recusado',
              feedback: feedback.trim() || null,
              avaliadoEm: new Date().toISOString(),
              certificado: json.certificado
                ? { codigo: json.certificado.codigo, carga: e.carga ?? 0 }
                : e.certificado,
            }
          : e
      )
    )
    setAberta(null)
    setFeedback('')
    router.refresh()
  }

  return (
    <div>
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {erro}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {([
          ['entregue', 'Esperando correção'],
          ['aprovado', 'Aprovadas'],
          ['todas', 'Todas'],
        ] as const).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === valor
                ? 'bg-escola-azul text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-escola-azul'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Nada nesta aba.</p>
      ) : (
        <div className="space-y-3">
          {visiveis.map(e => {
            const rot = ROTULO[e.status] ?? ROTULO.entregue
            const expandida = aberta === e.id

            return (
              <div key={e.id} className="panel p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border ${
                      e.tipo === 'modulo'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}
                  >
                    {e.tipo === 'modulo' ? <Layers className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                    {e.tipo === 'modulo' ? `Módulo${e.nivel ? ` · ${e.nivel}` : ''}` : 'Curso'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{e.aluno}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.turma && <>Turma {e.turma} · </>}
                      {e.origem}
                      {e.carga ? ` · ${e.carga}h` : ''}
                      {' · enviado em '}{DATA(e.enviadoEm)}
                    </p>
                  </div>

                  <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border ${rot.classe}`}>
                    {rot.texto}
                  </span>
                </div>

                {/* o trabalho entregue */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {e.arquivoUrl && (
                    <a
                      href={e.arquivoUrl}
                      className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:border-escola-azul transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar arquivo
                    </a>
                  )}
                  {e.linkUrl && (
                    <a
                      href={e.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:border-escola-azul transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir link
                    </a>
                  )}

                  {e.certificado && (
                    <Link
                      href={`/certificado/${e.certificado.codigo}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors ms-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Certificado {e.certificado.codigo}
                    </Link>
                  )}
                </div>

                {e.comentario && (
                  <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-3">
                    <span className="text-gray-500 text-xs block mb-0.5">Comentário do aluno</span>
                    {e.comentario}
                  </p>
                )}

                {e.feedback && (
                  <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                    <span className="text-amber-700 text-xs block mb-0.5">Sua devolutiva</span>
                    {e.feedback}
                  </p>
                )}

                {/* correção */}
                {e.status === 'entregue' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {!expandida ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => avaliar(e, true)}
                          disabled={ocupado === e.id}
                          className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          {ocupado === e.id ? 'Emitindo...' : 'Aprovar e emitir certificado'}
                        </button>
                        <button
                          onClick={() => { setAberta(e.id); setFeedback(''); setErro('') }}
                          className="inline-flex items-center gap-1.5 text-gray-500 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Devolver para correção
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          O que precisa ser corrigido
                        </label>
                        <textarea
                          value={feedback}
                          onChange={ev => setFeedback(ev.target.value)}
                          rows={3}
                          placeholder="Seja específico: o aluno vai reenviar com base no que você escrever aqui."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => avaliar(e, false)}
                            disabled={ocupado === e.id || !feedback.trim()}
                            className="bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul/90 transition-colors disabled:opacity-40"
                          >
                            {ocupado === e.id ? 'Devolvendo...' : 'Devolver com esta devolutiva'}
                          </button>
                          <button
                            onClick={() => { setAberta(null); setErro('') }}
                            className="text-gray-500 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {e.status === 'aprovado' && !e.certificado && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                    Aprovado, mas sem certificado registrado. Isso acontece se a aprovação foi feita
                    antes de o certificado existir — avise que precisa ser reemitido.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
