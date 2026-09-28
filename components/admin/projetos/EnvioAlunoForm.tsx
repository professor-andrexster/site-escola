'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink, Github, Send } from 'lucide-react'
import { ROTULO_STATUS, type Avaliacao, type Envio, type StatusEnvio } from '@/lib/projetos-turma-tipos'

interface Props {
  trabalhoId: string
  envioInicial: Envio | null
  historico: Avaliacao[]
}

const CAMPO = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'

const COR: Record<StatusEnvio, string> = {
  enviado: 'bg-amber-50 text-amber-700 border-amber-200',
  em_andamento: 'bg-blue-50 text-blue-700 border-blue-200',
  ajustar: 'bg-red-50 text-red-700 border-red-200',
  concluido: 'bg-green-50 text-green-700 border-green-200',
}

const DATA = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/**
 * O aluno cola o link do site publicado (e o do repositorio) e ve o que o
 * professor devolveu. Pode atualizar o link quantas vezes quiser; cada
 * atualizacao volta para "esperando o professor".
 */
export default function EnvioAlunoForm({ trabalhoId, envioInicial, historico }: Props) {
  const [envio, setEnvio] = useState(envioInicial)
  const [linkUrl, setLinkUrl] = useState(envioInicial?.linkUrl ?? '')
  const [repoUrl, setRepoUrl] = useState(envioInicial?.repoUrl ?? '')
  const [comentario, setComentario] = useState(envioInicial?.comentario ?? '')
  const [editando, setEditando] = useState(!envioInicial)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const router = useRouter()

  async function enviar() {
    if (!linkUrl.trim()) { setErro('Cole o link do site publicado.'); return }
    setOcupado(true)
    setErro('')
    setAviso('')
    try {
      const res = await fetch(`/api/projetos-turma/trabalhos/${trabalhoId}/envios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkUrl, repoUrl, comentario }),
      })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok || !dados.ok) {
        setErro(dados.error ?? 'Não foi possível enviar. Seu link continua aqui, tente de novo.')
        return
      }
      setEnvio(dados.envio)
      setEditando(false)
      setAviso('Link enviado. O professor vai abrir e registrar o andamento aqui.')
      router.refresh()
    } catch {
      setErro('Sem conexão. Seu link continua aqui, tente de novo quando a internet voltar.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Meu envio</h2>
          {envio && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${COR[envio.status]}`}>
              {ROTULO_STATUS[envio.status]}
            </span>
          )}
        </div>

        {envio && !editando ? (
          <div className="space-y-3 text-sm">
            <a href={envio.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-escola-azul hover:underline break-all">
              <ExternalLink className="w-4 h-4 flex-shrink-0" /> {envio.linkUrl}
            </a>
            {envio.repoUrl && (
              <a href={envio.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-600 hover:underline break-all">
                <Github className="w-4 h-4 flex-shrink-0" /> {envio.repoUrl}
              </a>
            )}
            {envio.comentario && <p className="text-gray-600 whitespace-pre-line">{envio.comentario}</p>}
            <p className="text-xs text-gray-400">Enviado em {DATA(envio.enviadoEm)}{envio.atualizadoEm !== envio.enviadoEm ? ` · atualizado em ${DATA(envio.atualizadoEm)}` : ''}</p>
            {aviso && <p className="text-sm text-green-700 inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{aviso}</p>}
            <button onClick={() => { setEditando(true); setAviso('') }} className="text-sm font-semibold text-escola-azul hover:underline foco-painel">
              Atualizar o link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Link do site publicado <span className="text-red-500">*</span></span>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} maxLength={300} className={CAMPO} placeholder="https://seunome.vercel.app" inputMode="url" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Link do repositório no GitHub <span className="text-gray-400 font-normal">(opcional)</span></span>
              <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} maxLength={300} className={CAMPO} placeholder="https://github.com/seunome/portfolio" inputMode="url" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Recado para o professor <span className="text-gray-400 font-normal">(opcional: o que já está pronto, o que travou)</span></span>
              <textarea value={comentario} onChange={e => setComentario(e.target.value)} maxLength={2000} rows={3} className={CAMPO} />
            </label>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <div className="flex items-center gap-3">
              <button onClick={enviar} disabled={ocupado} className="inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel">
                <Send className="w-4 h-4" />
                {ocupado ? 'Enviando...' : envio ? 'Salvar novo link' : 'Enviar link'}
              </button>
              {envio && (
                <button onClick={() => { setEditando(false); setErro('') }} className="text-sm text-gray-500 hover:text-gray-700 foco-painel">Cancelar</button>
              )}
            </div>
          </div>
        )}
      </div>

      {envio && (envio.feedback || envio.nota !== null || historico.length > 0) && (
        <div className="panel p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">O que o professor disse</h2>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-500">O professor ainda não avaliou este envio.</p>
          ) : (
            <ol className="space-y-3">
              {historico.map(a => (
                <li key={a.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className={`font-semibold px-2 py-0.5 rounded-full border ${COR[a.status]}`}>{ROTULO_STATUS[a.status]}</span>
                    {a.nota !== null && <span className="font-semibold text-gray-700">Nota {a.nota.toLocaleString('pt-BR')}</span>}
                    <span>{DATA(a.criadoEm)}</span>
                    {a.avaliador && <span>· {a.avaliador}</span>}
                  </div>
                  {a.feedback && <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{a.feedback}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}
