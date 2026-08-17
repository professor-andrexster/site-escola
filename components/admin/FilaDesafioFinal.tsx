'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, CheckCircle2, Clock, Download, ExternalLink, Trash2, UserPlus, XCircle } from 'lucide-react'

type Envio = {
  id: string
  status: string
  arquivoUrl: string | null
  linkUrl: string | null
  comentario: string | null
  feedback: string | null
  enviadoEm: string
  desafioTitulo: string
  aluno: { nome_completo: string; turma: string | null; email: string | null } | null
}

type Pessoa = { id: string; nome_completo: string; email: string | null; role: string }
type Avaliador = { id: string; userId: string; perfil: Pessoa | null }

const ROTULO: Record<string, string> = {
  entregue: 'Aguardando correção',
  aprovado: 'Aprovado',
  recusado: 'Devolvido para correção',
}

/**
 * Fila de correção do desafio final, e quem pode corrigir.
 *
 * A recusa exige devolutiva escrita — o botão fica desabilitado sem ela. Um
 * "devolvido" sem explicação faz o aluno reenviar a mesma coisa, e a fila
 * anda para trás.
 */
export default function FilaDesafioFinal({
  cursoSlug,
  cursoId,
  podeGerenciarAvaliadores,
}: {
  cursoSlug: string
  cursoId: string
  podeGerenciarAvaliadores: boolean
}) {
  const [envios, setEnvios] = useState<Envio[]>([])
  const [avaliadores, setAvaliadores] = useState<Avaliador[]>([])
  const [candidatos, setCandidatos] = useState<Pessoa[]>([])
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const router = useRouter()

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/cursos/desafio-final/envios?curso=${encodeURIComponent(cursoSlug)}`)
    if (res.ok) setEnvios((await res.json()).envios)
    if (podeGerenciarAvaliadores) {
      const r = await fetch(`/api/cursos/${cursoId}/avaliadores`)
      if (r.ok) {
        const j = await r.json()
        setAvaliadores(j.avaliadores)
        setCandidatos(j.candidatos)
      }
    }
  }, [cursoSlug, cursoId, podeGerenciarAvaliadores])

  useEffect(() => { void carregar() }, [carregar])

  async function avaliar(envio: Envio, aprovado: boolean) {
    const texto = (feedback[envio.id] ?? '').trim()
    if (!aprovado && !texto) {
      setErro('Escreva o que precisa ser corrigido antes de devolver.')
      return
    }
    setOcupado(envio.id)
    setErro('')
    setAviso('')
    const res = await fetch(`/api/cursos/desafio-final/envios/${envio.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprovado, feedback: texto || null }),
    })
    const json = await res.json().catch(() => ({}))
    setOcupado(null)
    if (!res.ok) { setErro(json.error ?? 'Erro ao avaliar.'); return }

    setAviso(
      aprovado && json.certificado
        ? `Aprovado. Certificado ${json.certificado.codigo} emitido para ${envio.aluno?.nome_completo ?? 'o aluno'}.`
        : aprovado
          ? 'Aprovado.'
          : 'Devolvido para correção. O aluno vê a sua devolutiva e pode reenviar.'
    )
    await carregar()
    router.refresh()
  }

  async function convidar(userId: string) {
    setErro('')
    const res = await fetch(`/api/cursos/${cursoId}/avaliadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) setErro((await res.json().catch(() => ({}))).error ?? 'Erro ao convidar.')
    await carregar()
  }

  async function desconvidar(id: string) {
    setErro('')
    const res = await fetch(`/api/cursos/${cursoId}/avaliadores/${id}`, { method: 'DELETE' })
    if (!res.ok) setErro((await res.json().catch(() => ({}))).error ?? 'Erro ao remover.')
    await carregar()
  }

  const pendentes = envios.filter(e => e.status === 'entregue')
  const resolvidos = envios.filter(e => e.status !== 'entregue')

  return (
    <div className="space-y-6">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{erro}</div>}
      {aviso && <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">{aviso}</div>}

      {podeGerenciarAvaliadores && (
        <section className="panel p-5">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-escola-azul" />
            Quem pode corrigir este curso
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Você corrige sempre. Convide outro professor para dividir a correção — ele corrige,
            mas não convida mais ninguém.
          </p>

          {avaliadores.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {avaliadores.map(a => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-700">
                    {a.perfil?.nome_completo ?? 'Professor removido'}
                    <span className="text-gray-400 text-xs ml-2">{a.perfil?.email}</span>
                  </span>
                  <button
                    onClick={() => void desconvidar(a.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remover avaliador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {candidatos.length > 0 ? (
            <select
              defaultValue=""
              onChange={e => { if (e.target.value) { void convidar(e.target.value); e.target.value = '' } }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Convidar professor…</option>
              {candidatos.map(c => (
                <option key={c.id} value={c.id}>{c.nome_completo} — {c.role}</option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-gray-400">Não há outros professores para convidar.</p>
          )}
        </section>
      )}

      <section>
        <h3 className="font-semibold text-gray-900 text-sm mb-3">
          Aguardando correção {pendentes.length > 0 && <span className="text-escola-azul">({pendentes.length})</span>}
        </h3>

        {pendentes.length === 0 ? (
          <div className="empty-state p-8 text-sm text-gray-400">Nenhum envio esperando correção.</div>
        ) : (
          <div className="space-y-3">
            {pendentes.map(e => (
              <article key={e.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{e.aluno?.nome_completo ?? 'Aluno'}</p>
                    <p className="text-xs text-gray-400">
                      {e.aluno?.turma ?? 'sem turma'} · enviado em{' '}
                      {new Date(e.enviadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" /> {ROTULO[e.status]}
                  </span>
                </div>

                {e.comentario && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 whitespace-pre-line">{e.comentario}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {e.arquivoUrl && (
                    <a href={e.arquivoUrl} className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline">
                      <Download className="w-3.5 h-3.5" /> Baixar o arquivo
                    </a>
                  )}
                  {e.linkUrl && (
                    <a href={e.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-escola-azul hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir o link publicado
                    </a>
                  )}
                </div>

                <textarea
                  value={feedback[e.id] ?? ''}
                  onChange={ev => setFeedback(f => ({ ...f, [e.id]: ev.target.value }))}
                  rows={2}
                  placeholder="Devolutiva para o aluno — obrigatória se for devolver para correção"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none mb-3"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void avaliar(e, true)}
                    disabled={ocupado === e.id}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    Aprovar e emitir certificado
                  </button>
                  <button
                    onClick={() => void avaliar(e, false)}
                    disabled={ocupado === e.id || !(feedback[e.id] ?? '').trim()}
                    title={!(feedback[e.id] ?? '').trim() ? 'Escreva a devolutiva primeiro' : undefined}
                    className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <XCircle className="w-4 h-4" />
                    Devolver para correção
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {resolvidos.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Já avaliados</h3>
          <div className="space-y-2">
            {resolvidos.map(e => (
              <div key={e.id} className="panel px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{e.aluno?.nome_completo ?? 'Aluno'}</p>
                  {e.feedback && <p className="text-xs text-gray-400 truncate">{e.feedback}</p>}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${
                  e.status === 'aprovado' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {e.status === 'aprovado' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {ROTULO[e.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
