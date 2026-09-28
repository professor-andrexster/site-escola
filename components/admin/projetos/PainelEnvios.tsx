'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Github, Inbox, Users } from 'lucide-react'
import { ROTULO_STATUS, type EnvioDaTurma, type StatusEnvio } from '@/lib/projetos-turma-tipos'

interface Props {
  trabalhoId: string
  enviosIniciais: EnvioDaTurma[]
  semEnvio: { nome: string; turma: string }[]
}

const COR: Record<StatusEnvio, string> = {
  enviado: 'bg-amber-50 text-amber-700 border-amber-200',
  em_andamento: 'bg-blue-50 text-blue-700 border-blue-200',
  ajustar: 'bg-red-50 text-red-700 border-red-200',
  concluido: 'bg-green-50 text-green-700 border-green-200',
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
 * de andamento em cada linha. Abrir o link e registrar o que viu e o fluxo
 * inteiro do professor; nao precisa sair desta pagina.
 */
export default function PainelEnvios({ trabalhoId: _trabalhoId, enviosIniciais, semEnvio }: Props) {
  const [envios, setEnvios] = useState(enviosIniciais)
  const [filtro, setFiltro] = useState<'todos' | StatusEnvio>('todos')
  const [aberto, setAberto] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusEnvio>('em_andamento')
  const [nota, setNota] = useState('')
  const [feedback, setFeedback] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const visiveis = envios.filter(e => filtro === 'todos' || e.status === filtro)
  const contagem = (s: StatusEnvio) => envios.filter(e => e.status === s).length

  function abrir(e: EnvioDaTurma) {
    setAberto(e.id)
    setStatus(e.status === 'enviado' ? 'em_andamento' : e.status)
    setNota(e.nota === null ? '' : String(e.nota))
    setFeedback('')
    setErro('')
  }

  async function avaliar(envioId: string) {
    setOcupado(true)
    setErro('')
    try {
      const res = await fetch(`/api/projetos-turma/envios/${envioId}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, nota: nota === '' ? null : nota, feedback }),
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
            {visiveis.map(e => (
              <li key={e.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {e.aluno.nome}
                      {e.aluno.turma && <span className="text-gray-400 font-normal text-sm"> · {e.aluno.turma}</span>}
                    </p>
                    <a href={e.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline break-all mt-1">
                      <ExternalLink className="w-4 h-4 flex-shrink-0" /> {e.linkUrl}
                    </a>
                    {e.repoUrl && (
                      <a href={e.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:underline break-all ml-3">
                        <Github className="w-4 h-4 flex-shrink-0" /> repositório
                      </a>
                    )}
                    {e.comentario && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{e.comentario}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Enviado {DATA(e.enviadoEm)}
                      {e.atualizadoEm !== e.enviadoEm && ` · atualizado ${DATA(e.atualizadoEm)}`}
                      {e.avaliadoEm && ` · avaliado ${DATA(e.avaliadoEm)}`}
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
                  <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex gap-1.5">
                        {OPCOES.map(o => (
                          <button
                            key={o.valor}
                            onClick={() => setStatus(o.valor)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors foco-painel ${status === o.valor ? COR[o.valor] + ' ring-1 ring-current' : 'bg-white text-gray-600 border-gray-200'}`}
                          >
                            {o.rotulo}
                          </button>
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        Nota
                        <input type="number" min="0" max="10" step="0.5" value={nota} onChange={ev => setNota(ev.target.value)} placeholder="0-10"
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
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
            ))}
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
