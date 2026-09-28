'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Github, Inbox, Users } from 'lucide-react'
import {
  notaSugerida, ROTULO_MARCA, ROTULO_STATUS,
  type Criterio, type EnvioDaTurma, type Etapa, type Marca, type Marcas, type StatusEnvio,
} from '@/lib/projetos-turma-tipos'

interface Props {
  cronograma: Etapa[]
  criterios: Criterio[]
  enviosIniciais: EnvioDaTurma[]
  semEnvio: { nome: string; turma: string }[]
}

const COR: Record<StatusEnvio, string> = {
  enviado: 'bg-amber-50 text-amber-700 border-amber-200',
  em_andamento: 'bg-blue-50 text-blue-700 border-blue-200',
  ajustar: 'bg-red-50 text-red-700 border-red-200',
  concluido: 'bg-green-50 text-green-700 border-green-200',
}
const COR_MARCA: Record<Marca, string> = {
  0: 'bg-red-50 text-red-700 border-red-300',
  1: 'bg-amber-50 text-amber-700 border-amber-300',
  2: 'bg-green-50 text-green-700 border-green-300',
}

const OPCOES: { valor: StatusEnvio; rotulo: string }[] = [
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'ajustar', rotulo: 'Precisa ajustar' },
  { valor: 'concluido', rotulo: 'Concluído' },
]

const DATA = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/**
 * A turma inteira num lugar: quem enviou, o link para abrir, e o formulario
 * de andamento em cada linha. O professor abre o site do aluno em outra
 * aba, volta, marca cada criterio (OK / Parcial / Falta), diz em que etapa
 * do cronograma o aluno esta, e a nota sugerida sai sozinha dos pesos —
 * mas pode ser trocada. Tudo fica no historico do envio.
 */
export default function PainelEnvios({ cronograma, criterios, enviosIniciais, semEnvio }: Props) {
  const [envios, setEnvios] = useState(enviosIniciais)
  const [filtro, setFiltro] = useState<'todos' | StatusEnvio>('todos')
  const [aberto, setAberto] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusEnvio>('em_andamento')
  const [etapa, setEtapa] = useState<string>('')
  const [marcas, setMarcas] = useState<Marcas>({})
  const [nota, setNota] = useState('')
  const [notaManual, setNotaManual] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const visiveis = envios.filter(e => filtro === 'todos' || e.status === filtro)
  const contagem = (s: StatusEnvio) => envios.filter(e => e.status === s).length
  const contagemMarcas = (m: Marcas | null) => {
    if (!m) return null
    const valores = Object.values(m)
    return { ok: valores.filter(v => v === 2).length, total: valores.length }
  }

  function abrir(e: EnvioDaTurma) {
    setAberto(e.id)
    setStatus(e.status === 'enviado' ? 'em_andamento' : e.status)
    setEtapa(e.etapa == null ? '' : String(e.etapa))
    setMarcas(e.marcas ?? {})
    setNota(e.nota === null ? '' : String(e.nota))
    setNotaManual(e.nota !== null)
    setFeedback('')
    setErro('')
  }

  function marcar(i: number, m: Marca) {
    const novas = { ...marcas, [String(i)]: m }
    setMarcas(novas)
    if (!notaManual) {
      const s = notaSugerida(criterios, novas)
      setNota(s === null ? '' : String(s))
    }
  }

  async function avaliar(envioId: string) {
    setOcupado(true)
    setErro('')
    try {
      const res = await fetch(`/api/projetos-turma/envios/${envioId}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          nota: nota === '' ? null : nota,
          feedback,
          etapa: etapa === '' ? null : Number(etapa),
          marcas: Object.keys(marcas).length ? marcas : null,
        }),
      })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok || !dados.ok) {
        setErro(dados.error ?? 'Não foi possível salvar. O texto continua aqui.')
        return
      }
      setEnvios(prev => prev.map(e => e.id === envioId ? { ...e, ...dados.envio, aluno: e.aluno } : e))
      setAberto(null)
      router.refresh()
    } catch {
      setErro('Sem conexão. O texto continua aqui, tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  const sugestao = notaSugerida(criterios, marcas)

  return (
    <section className="space-y-6">
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
            <Inbox className="w-5 h-5 text-escola-azul" /> Envios da turma
            <span className="text-sm font-normal text-gray-500">({envios.length})</span>
          </h2>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['todos', 'enviado', 'em_andamento', 'ajustar', 'concluido'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-2.5 py-1 rounded-full border font-semibold transition-colors foco-painel ${filtro === f ? 'bg-escola-azul text-white border-escola-azul' : 'bg-white text-gray-600 border-gray-200 hover:border-escola-azul'}`}
              >
                {f === 'todos' ? 'Todos' : ROTULO_STATUS[f].replace(', esperando o professor', '')}
                {f !== 'todos' && contagem(f) > 0 && <span className="ml-1 opacity-70">{contagem(f)}</span>}
              </button>
            ))}
          </div>
        </div>

        {visiveis.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">
            {envios.length === 0 ? 'Nenhum aluno enviou o link ainda.' : 'Nenhum envio com esse filtro.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visiveis.map(e => {
              const resumoMarcas = contagemMarcas(e.marcas)
              const etapaDoAluno = e.etapa != null ? cronograma[e.etapa] : null
              return (
                <li key={e.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {e.aluno.nome}
                        {e.aluno.turma && <span className="text-gray-400 font-normal text-sm"> · {e.aluno.turma}</span>}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <a href={e.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline break-all">
                          <ExternalLink className="w-4 h-4 flex-shrink-0" /> {e.linkUrl}
                        </a>
                        {e.repoUrl && (
                          <a href={e.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:underline">
                            <Github className="w-4 h-4 flex-shrink-0" /> repositório
                          </a>
                        )}
                        {e.linkGrupo && (
                          <a href={e.linkGrupo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:underline">
                            <Users className="w-4 h-4 flex-shrink-0" /> site do grupo
                          </a>
                        )}
                      </div>
                      {e.comentario && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{e.comentario}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Enviado {DATA(e.enviadoEm)}
                        {e.atualizadoEm !== e.enviadoEm && ` · atualizado ${DATA(e.atualizadoEm)}`}
                        {e.avaliadoEm && ` · avaliado ${DATA(e.avaliadoEm)}`}
                        {etapaDoAluno && ` · está em: ${etapaDoAluno.titulo}`}
                        {resumoMarcas && ` · ${resumoMarcas.ok}/${resumoMarcas.total} critérios OK`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${COR[e.status]}`}>
                        {ROTULO_STATUS[e.status]}{e.nota !== null && ` · ${e.nota.toLocaleString('pt-BR')}`}
                      </span>
                      {aberto !== e.id && (
                        <button onClick={() => abrir(e)} className="text-sm font-semibold text-escola-azul hover:underline foco-painel">
                          Avaliar andamento
                        </button>
                      )}
                    </div>
                  </div>

                  {e.feedback && aberto !== e.id && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                      <span className="font-semibold text-gray-700">Última devolutiva: </span>{e.feedback}
                    </p>
                  )}

                  {aberto === e.id && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                      {criterios.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Critérios</p>
                          <ul className="space-y-1.5">
                            {criterios.map((c, i) => {
                              const m = marcas[String(i)]
                              return (
                                <li key={i} className="flex flex-wrap items-center justify-between gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{c.titulo}</p>
                                    {c.descricao && <p className="text-xs text-gray-500">{c.descricao}</p>}
                                  </div>
                                  <div className="flex gap-1">
                                    {([2, 1, 0] as Marca[]).map(v => (
                                      <button key={v} type="button" onClick={() => marcar(i, v)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors foco-painel ${m === v ? COR_MARCA[v] + ' ring-1 ring-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                                        {ROTULO_MARCA[v]}
                                      </button>
                                    ))}
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex gap-1.5">
                          {OPCOES.map(o => (
                            <button
                              key={o.valor}
                              type="button"
                              onClick={() => setStatus(o.valor)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors foco-painel ${status === o.valor ? COR[o.valor] + ' ring-1 ring-current' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                              {o.rotulo}
                            </button>
                          ))}
                        </div>
                        {cronograma.length > 0 && (
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            Está em
                            <select value={etapa} onChange={ev => setEtapa(ev.target.value)}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30 max-w-[16rem]">
                              <option value="">(etapa não marcada)</option>
                              {cronograma.map((et, i) => <option key={i} value={String(i)}>{et.titulo}</option>)}
                            </select>
                          </label>
                        )}
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          Nota
                          <input type="number" min="0" max="10" step="0.5" value={nota}
                            onChange={ev => { setNota(ev.target.value); setNotaManual(true) }}
                            placeholder={sugestao === null ? '0-10' : String(sugestao)}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
                          {sugestao !== null && notaManual && Number(nota) !== sugestao && (
                            <button type="button" onClick={() => { setNota(String(sugestao)); setNotaManual(false) }} className="text-xs text-escola-azul hover:underline foco-painel">
                              usar sugerida {sugestao.toLocaleString('pt-BR')}
                            </button>
                          )}
                        </label>
                      </div>

                      <textarea
                        value={feedback}
                        onChange={ev => setFeedback(ev.target.value)}
                        rows={3}
                        maxLength={4000}
                        placeholder={status === 'ajustar' ? 'O que precisa ajustar (obrigatório)' : 'Comentário para o aluno (opcional)'}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
                      />
                      {erro && <p className="text-sm text-red-600">{erro}</p>}
                      <div className="flex items-center gap-3">
                        <button onClick={() => avaliar(e.id)} disabled={ocupado} className="bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel">
                          {ocupado ? 'Salvando...' : 'Salvar avaliação'}
                        </button>
                        <button onClick={() => setAberto(null)} className="text-sm text-gray-500 hover:text-gray-700 foco-painel">Cancelar</button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-bold text-gray-900 inline-flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-400" /> Ainda não enviaram <span className="font-normal text-gray-500">({semEnvio.length})</span>
        </h3>
        {semEnvio.length === 0 ? (
          <p className="text-sm text-gray-500">Toda a série já enviou.</p>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">
            {semEnvio.map(a => a.nome).join(' · ')}
          </p>
        )}
      </div>
    </section>
  )
}
