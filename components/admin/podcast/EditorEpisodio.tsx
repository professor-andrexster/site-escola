'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Download, ExternalLink, Eye, FileUp, Headphones, ImagePlus, Radio, Save, Send, Trash2, Undo2 } from 'lucide-react'
import { CATEGORIAS } from '@/lib/categorias'
import CapaEpisodio from '@/components/podcast/CapaEpisodio'
import {
  ROTULO_EPISODIO, tamanhoLegivel,
  type Episodio, type PessoaEquipe, type QuadroOpcao,
} from '@/lib/podcast/tipos'
import GravadorAudio from './GravadorAudio'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from './comum'

interface Props {
  inicial: Episodio
  podeEditar: boolean
  moderador: boolean
  equipe: PessoaEquipe[]
  userId: string
  /** Monitor, ou aluno com permissão de áudio. */
  podeAudio: boolean
  /** Quadros ativos (mais o do próprio episódio, se foi desativado). */
  quadros: QuadroOpcao[]
}

type Form = {
  titulo: string; tipo: 'entrevista' | 'materia'; quadro: string; categoria: string; resumo: string; texto: string
  entrevistadoNome: string; entrevistadoDescricao: string; noJbinforma: boolean; participantes: string[]
}

const doEpisodio = (e: Episodio): Form => ({
  titulo: e.titulo, tipo: e.tipo, quadro: e.quadro ?? '', categoria: e.categoria ?? '', resumo: e.resumo ?? '', texto: e.texto ?? '',
  entrevistadoNome: e.entrevistadoNome ?? '', entrevistadoDescricao: e.entrevistadoDescricao ?? '',
  noJbinforma: e.noJbinforma, participantes: e.participantes.map(p => p.userId),
})

const COR_STATUS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700', revisao: 'bg-amber-50 text-amber-800', ajustar: 'bg-red-50 text-red-700',
  publicado: 'bg-green-50 text-green-800', retirado: 'bg-gray-200 text-gray-700',
}

/**
 * Tela do episódio. O que o aluno digita fica guardado no aparelho até o
 * servidor confirmar: se a internet cair no meio, nada se perde.
 */
export default function EditorEpisodio({ inicial, podeEditar, moderador, equipe, userId, podeAudio, quadros }: Props) {
  const router = useRouter()
  // Por usuario: num computador da sala, o rascunho de um aluno nao aparece para o outro.
  const chaveRascunho = `podcast-ep-${inicial.id}-${userId}`
  const [ep, setEp] = useState(inicial)
  const [form, setForm] = useState<Form>(() => doEpisodio(inicial))
  const [sujo, setSujo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [feedback, setFeedback] = useState('')
  const [termo, setTermo] = useState<File | null>(null)
  const [capa, setCapa] = useState<File | null>(null)
  const [confirmarApagar, setConfirmarApagar] = useState(false)
  const [recuperado, setRecuperado] = useState(false)
  // Rascunho local feito sobre uma versão que mudou no servidor. Nunca apagado sem o usuário decidir.
  const [conflito, setConflito] = useState<Form | null>(null)
  // Valores atuais para callbacks que terminam depois (upload longo): o texto digitado no meio não pode ser trocado pelo antigo.
  const formRef = useRef(form)
  const sujoRef = useRef(sujo)
  formRef.current = form
  sujoRef.current = sujo

  // Recupera rascunho não salvo deste aparelho. Só na abertura da tela:
  // depois disso o servidor muda a data a cada upload e isso não pode apagar nada.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(chaveRascunho)
      if (!salvo) return
      const r = JSON.parse(salvo) as { form: Form; base: string }
      if (JSON.stringify(r.form) === JSON.stringify(doEpisodio(inicial))) { localStorage.removeItem(chaveRascunho); return }
      if (r.base === inicial.atualizadoEm) { setForm(r.form); setSujo(true); setRecuperado(true) }
      else setConflito(r.form)
    } catch { /* sem localStorage: segue sem rascunho local */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function guardarLocal(f: Form, base: string) {
    try { localStorage.setItem(chaveRascunho, JSON.stringify({ form: f, base })) } catch { /* ok */ }
  }

  function mudar<K extends keyof Form>(k: K, v: Form[K]) {
    setForm(f => {
      const novo = { ...f, [k]: v }
      guardarLocal(novo, ep.atualizadoEm)
      return novo
    })
    setSujo(true); setAviso('')
  }

  /** O servidor mudou a data (upload de áudio/termo): o rascunho local passa a valer sobre a data nova. */
  function novaBase(atualizadoEm: string) {
    setEp(e => ({ ...e, atualizadoEm }))
    if (sujoRef.current) guardarLocal(formRef.current, atualizadoEm)
  }

  const quadro = useMemo(() => quadros.find(q => q.chave === form.quadro), [quadros, form.quadro])

  async function salvar(acao?: string, extra: Record<string, unknown> = {}): Promise<boolean> {
    setOcupado(true); setErro(''); setAviso('')
    const corpo: Record<string, unknown> = { ...extra }
    if (podeEditar && sujo) Object.assign(corpo, { ...form, quadro: form.quadro || null, categoria: form.categoria || null })
    if (acao) corpo.acao = acao
    const r = await chamar(`/api/podcast/episodios/${ep.id}`, json('PATCH', corpo))
    setOcupado(false)
    if (!r.ok) {
      // 409: o servidor salvou, mas tirou do ar. A tela passa a mostrar o estado real.
      if (r.dados?.episodio) {
        const atual = r.dados.episodio as Episodio
        setEp(atual); setForm(doEpisodio(atual)); setSujo(false)
        try { localStorage.removeItem(chaveRascunho) } catch { /* ok */ }
        setErro(r.erro)
        return false
      }
      setErro(`${r.erro}${sujo ? ' O que você escreveu continua aqui.' : ''}`)
      return false
    }
    const novo = r.dados.episodio as Episodio
    setEp(novo); setForm(doEpisodio(novo)); setSujo(false); setRecuperado(false); setConflito(null); setFeedback('')
    try { localStorage.removeItem(chaveRascunho) } catch { /* ok */ }
    router.refresh()
    return true
  }

  async function enviarAudio(arquivo: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('arquivo', arquivo)
    const r = await chamar(`/api/podcast/episodios/${ep.id}/audio`, { method: 'POST', body: fd })
    if (!r.ok) return r.erro
    setEp(e => ({ ...e, audioUrl: r.dados.audioUrl, audioBytes: r.dados.audioBytes }))
    if (r.dados.atualizadoEm) novaBase(r.dados.atualizadoEm)
    return null
  }

  async function subirCapa() {
    if (!capa) return
    setOcupado(true); setErro(''); setAviso('')
    const fd = new FormData()
    fd.append('arquivo', capa)
    const r = await chamar(`/api/podcast/episodios/${ep.id}/capa`, { method: 'POST', body: fd })
    setOcupado(false)
    if (!r.ok) { setErro(`${r.erro} A imagem continua selecionada.`); return }
    setCapa(null)
    setEp(e => ({ ...e, capaUrl: r.dados.capaUrl }))
    if (r.dados.atualizadoEm) novaBase(r.dados.atualizadoEm)
    setAviso('Capa salva.')
  }

  async function tirarCapa() {
    setOcupado(true); setErro(''); setAviso('')
    const r = await chamar(`/api/podcast/episodios/${ep.id}/capa`, { method: 'DELETE' })
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    setEp(e => ({ ...e, capaUrl: null }))
    if (r.dados.atualizadoEm) novaBase(r.dados.atualizadoEm)
  }

  async function subirTermo() {
    if (!termo) return
    setOcupado(true); setErro('')
    const fd = new FormData()
    fd.append('arquivo', termo)
    const r = await chamar(`/api/podcast/episodios/${ep.id}/termo`, { method: 'POST', body: fd })
    setOcupado(false)
    if (!r.ok) { setErro(`${r.erro} O arquivo continua selecionado.`); return }
    setTermo(null)
    setEp(e => ({ ...e, temTermoEntrevistado: true }))
    if (r.dados.atualizadoEm) novaBase(r.dados.atualizadoEm)
    setAviso('Termo do entrevistado guardado.')
  }

  async function apagar() {
    setOcupado(true)
    const r = await chamar(`/api/podcast/episodios/${ep.id}`, { method: 'DELETE' })
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    try { localStorage.removeItem(chaveRascunho) } catch { /* ok */ }
    router.push('/admin/podcast')
  }

  const bloqueado = !podeEditar
  const ehEntrevista = form.tipo === 'entrevista'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COR_STATUS[ep.status]}`}>{ROTULO_EPISODIO[ep.status]}</span>
        {ep.status === 'publicado' && (
          <a href={`/podcast/${ep.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-escola-azul hover:underline inline-flex items-center gap-1">
            Ver no site <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {(ep.status === 'publicado' || ep.plays > 0) && (
          <span className="text-sm text-gray-500 inline-flex items-center gap-1"><Headphones className="w-4 h-4" /> {ep.plays} play{ep.plays === 1 ? '' : 's'}</span>
        )}
      </div>

      {ep.feedback && (ep.status === 'ajustar' || ep.status === 'retirado') && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Recado do monitor</p>
          <p className="text-sm text-red-900 whitespace-pre-line">{ep.feedback}</p>
        </div>
      )}
      {ep.status === 'revisao' && !moderador && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Enviado. Agora é com o monitor: ele ouve, lê e responde aqui. Enquanto isso, o episódio fica travado para edição.</p>
      )}
      {conflito && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Este episódio mudou desde a última vez que você escreveu aqui.</p>
          <p className="mt-1">O texto que você não chegou a salvar neste aparelho está guardado. Quer usar ele no lugar do que está no servidor?</p>
          <div className="flex gap-3 mt-3">
            <button type="button" className={BOTAO_LEVE} disabled={bloqueado} onClick={() => { setForm(conflito); setSujo(true); guardarLocal(conflito, ep.atualizadoEm); setConflito(null); setRecuperado(true) }}>Usar meu texto</button>
            <button type="button" className="text-sm text-gray-600 hover:underline" onClick={() => { try { localStorage.removeItem(chaveRascunho) } catch { /* ok */ } setConflito(null) }}>Descartar meu texto</button>
          </div>
        </div>
      )}
      {recuperado && (
        <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Recuperei o que você tinha escrito e não chegou a salvar. Confira e clique em Salvar.</p>
      )}

      <section className="panel p-6 space-y-4">
        <h2 className="font-geom text-lg font-bold text-gray-900">O episódio</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Título</span>
            <input value={form.titulo} onChange={e => mudar('titulo', e.target.value)} disabled={bloqueado} maxLength={140} className={CAMPO} />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Formato</span>
            <select value={form.tipo} onChange={e => mudar('tipo', e.target.value as Form['tipo'])} disabled={bloqueado} className={CAMPO}>
              <option value="entrevista" disabled={!podeAudio && ep.tipo !== 'entrevista'}>Entrevista (com áudio)</option>
              <option value="materia">Matéria (texto)</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Quadro</span>
          <select value={form.quadro} onChange={e => mudar('quadro', e.target.value)} disabled={bloqueado} className={CAMPO}>
            <option value="">Sem quadro</option>
            {quadros.map(q => <option key={q.chave} value={q.chave}>{q.nome}</option>)}
          </select>
          {quadro && <span className="block text-xs text-gray-500 mt-1">{quadro.ideia}</span>}
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Resumo (aparece no card e no JBInforma)</span>
          <textarea value={form.resumo} onChange={e => mudar('resumo', e.target.value)} disabled={bloqueado} maxLength={300} rows={2} className={CAMPO}
            placeholder="Uma ou duas frases que deem vontade de ouvir. Ex.: Dona Lúcia conta como é fazer 400 pratos por dia e qual merenda os alunos mais pedem." />
          <span className="block text-right text-[11px] text-gray-400">{form.resumo.length}/300</span>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">{ehEntrevista ? 'Texto de apoio (opcional): os melhores trechos, o contexto' : 'Texto da matéria'}</span>
          <textarea value={form.texto} onChange={e => mudar('texto', e.target.value)} disabled={bloqueado} rows={10} className={CAMPO}
            placeholder={ehEntrevista
              ? 'Quem é a pessoa, por que você quis conversar com ela, e duas ou três frases marcantes da entrevista.'
              : 'Comece pelo mais importante: o que aconteceu, quando, com quem. Depois os detalhes. Deixe uma linha em branco entre os parágrafos.'} />
        </label>

        {ehEntrevista && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1">Quem foi entrevistado</span>
              <input value={form.entrevistadoNome} onChange={e => mudar('entrevistadoNome', e.target.value)} disabled={bloqueado} maxLength={120} className={CAMPO} placeholder="Nome da pessoa" />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1">Quem é essa pessoa</span>
              <input value={form.entrevistadoDescricao} onChange={e => mudar('entrevistadoDescricao', e.target.value)} disabled={bloqueado} maxLength={200} className={CAMPO} placeholder="Ex.: merendeira há 20 anos" />
            </label>
          </div>
        )}

        <fieldset>
          <legend className="block text-xs font-semibold text-gray-600 mb-2">Quem participou (aparece nos créditos)</legend>
          <div className="flex flex-wrap gap-2">
            {equipe.map(m => {
              const marcado = form.participantes.includes(m.userId)
              const autor = m.userId === ep.autorId
              return (
                <label key={m.userId} className={`text-sm rounded-full border px-3 py-1 cursor-pointer ${marcado ? 'border-escola-azul bg-blue-50 text-escola-azul' : 'border-gray-200 text-gray-600'} ${bloqueado ? 'opacity-60 cursor-default' : ''}`}>
                  <input type="checkbox" className="sr-only" checked={marcado} disabled={bloqueado || autor}
                    onChange={() => mudar('participantes', marcado ? form.participantes.filter(x => x !== m.userId) : [...form.participantes, m.userId])} />
                  {m.nome.split(' ')[0]} {m.nome.split(' ').slice(-1)[0] !== m.nome.split(' ')[0] ? m.nome.split(' ').slice(-1)[0] : ''}{autor ? ' (autor)' : ''}
                </label>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">Só aparece quem tem autorização aceita. Se alguém falou no áudio, marque aqui.</p>
        </fieldset>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.noJbinforma} disabled={bloqueado} onChange={e => mudar('noJbinforma', e.target.checked)} />
            Publicar também como notícia no JBInforma
          </label>
          {form.noJbinforma && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-xs font-semibold text-gray-600">Seção do jornal</span>
              <select value={form.categoria} onChange={e => mudar('categoria', e.target.value)} disabled={bloqueado} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                <option value="">Podcast</option>
                {Object.entries(CATEGORIAS).filter(([k]) => k !== 'podcast').map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
              </select>
            </label>
          )}
        </div>

        {podeEditar && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="button" onClick={() => salvar()} disabled={ocupado || !sujo} className={BOTAO_LEVE}><Save className="w-4 h-4" /> {sujo ? 'Salvar' : 'Salvo'}</button>
            {(ep.status === 'rascunho' || ep.status === 'ajustar') && (
              <button type="button" onClick={() => salvar('enviar')} disabled={ocupado} className={BOTAO}><Send className="w-4 h-4" /> Enviar para o monitor</button>
            )}
          </div>
        )}
      </section>

      <section className="panel p-6">
        <h2 className="font-geom text-lg font-bold text-gray-900 flex items-center gap-2 mb-3"><ImagePlus className="w-5 h-5 text-escola-azul" /> Capa</h2>
        <div className="grid gap-5 sm:grid-cols-[11rem_1fr] items-start">
          <CapaEpisodio quadroNome={quadro?.nome ?? ep.quadroNome} tipo={form.tipo} capaUrl={ep.capaUrl} grande />
          <div className="min-w-0 space-y-3">
            <p className="text-sm text-gray-500">
              Sem foto, o episódio usa esta capa desenhada. Com foto, ela vira a capa no podcast e a imagem da notícia no JBInforma.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
              Só use foto de quem marcou <strong>Fotografia</strong> no termo (aluno ou entrevistado). Na dúvida, use foto de objeto ou do lugar, sem rosto.
            </p>
            {podeEditar && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setCapa(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-600 min-w-0 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-escola-azul" />
                <button type="button" onClick={subirCapa} disabled={ocupado || !capa} className={BOTAO_LEVE}><FileUp className="w-4 h-4" /> {ep.capaUrl ? 'Trocar foto' : 'Usar esta foto'}</button>
                {ep.capaUrl && <button type="button" onClick={tirarCapa} disabled={ocupado} className="text-xs text-gray-500 hover:text-red-600 px-2">Tirar a foto</button>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel p-6 space-y-4">
        <h2 className="font-geom text-lg font-bold text-gray-900 flex items-center gap-2"><Radio className="w-5 h-5 text-escola-azul" /> Áudio</h2>
        {ep.audioUrl ? (
          <div>
            <audio controls preload="metadata" src={ep.audioUrl} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">{tamanhoLegivel(ep.audioBytes)} · {podeEditar ? 'Gravar ou subir outro substitui este.' : ''}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{ehEntrevista ? 'Sem áudio ainda. A entrevista só vai ao ar com áudio.' : 'Matéria pode ir sem áudio. Se quiser, grave uma versão falada.'}</p>
        )}
        {podeEditar && !podeAudio && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">Gravação de áudio ainda não liberada para você. Peça ao monitor do podcast.</p>
        )}
        {podeEditar && podeAudio && (
          <>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-semibold text-gray-700">Dicas rápidas antes de gravar</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Lugar quieto: sala vazia, longe do pátio e do ventilador. Celular a um palmo da boca de quem fala.</li>
                <li>Comece se apresentando: “Oi, aqui é a Ana, do {'JB no Ar'}, e hoje a gente conversa com…”.</li>
                <li>Leve 5 perguntas escritas, mas deixe a conversa andar. A melhor resposta vem do “e aí, o que aconteceu?”.</li>
                <li>Peça para a pessoa assinar o termo do entrevistado antes ou logo depois.</li>
                <li>Entre 5 e 15 minutos está ótimo. Ninguém ouve 40 minutos no intervalo.</li>
              </ul>
            </details>
            <GravadorAudio enviar={enviarAudio} desabilitado={ocupado} chave={`${ep.id}-${userId}`} />
          </>
        )}
      </section>

      {ehEntrevista && (
        <section className="panel p-6 space-y-3">
          <h2 className="font-geom text-lg font-bold text-gray-900">Termo de quem deu a entrevista</h2>
          <p className="text-sm text-gray-500">A pessoa entrevistada também precisa autorizar o uso da voz e do nome. Sem isso, o monitor não consegue publicar.</p>
          <div className="flex flex-wrap items-center gap-2">
            <a href={`/api/podcast/termos?modelo=entrevistado&episodio=${ep.id}`} download className={BOTAO_LEVE}><Download className="w-4 h-4" /> Baixar termo {form.entrevistadoNome && !sujo ? `de ${form.entrevistadoNome.split(' ')[0]}` : ''}</a>
            {ep.temTermoEntrevistado
              ? <span className="text-sm text-green-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Termo assinado guardado</span>
              : <span className="text-sm text-amber-700 inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Ainda sem termo assinado</span>}
            {moderador && ep.temTermoEntrevistado && <a href={`/api/podcast/arquivo?episodio=${ep.id}`} target="_blank" rel="noopener noreferrer" className={BOTAO_LEVE}><Eye className="w-4 h-4" /> Ver</a>}
          </div>
          {podeEditar && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input type="file" accept="application/pdf,image/*" capture="environment" onChange={e => setTermo(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-escola-azul" />
              <button type="button" onClick={subirTermo} disabled={ocupado || !termo} className={BOTAO_LEVE}><FileUp className="w-4 h-4" /> Subir termo assinado</button>
            </div>
          )}
        </section>
      )}

      {moderador && (
        <section className="panel p-6 space-y-3 border-2 border-escola-azul/20">
          <h2 className="font-geom text-lg font-bold text-gray-900">Decisão do monitor</h2>
          <div className="flex flex-wrap gap-2">
            {ep.status !== 'publicado' && (
              <button type="button" onClick={() => salvar('publicar')} disabled={ocupado} className={BOTAO}><CheckCircle2 className="w-4 h-4" /> Publicar</button>
            )}
            {ep.status === 'publicado' && (
              <button type="button" onClick={() => salvar('retirar', { motivo: feedback || null })} disabled={ocupado} className={BOTAO_LEVE}><Undo2 className="w-4 h-4" /> Tirar do ar</button>
            )}
          </div>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Recado para a equipe (obrigatório para devolver)</span>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} className={CAMPO}
              placeholder="Seja específico e gentil: o que está bom, o que mudar e onde. Ex.: O começo está ótimo. Do minuto 3 ao 5 tem barulho de pátio; regrave essa parte ou corte." />
          </label>
          <button type="button" onClick={() => salvar('ajustar', { feedback })} disabled={ocupado || !feedback.trim()} className={BOTAO_LEVE}><Send className="w-4 h-4" /> Devolver para ajuste</button>
        </section>
      )}

      {(ep.status === 'rascunho' || ep.status === 'ajustar') && (moderador || podeEditar) && (
        <div className="text-right">
          {confirmarApagar ? (
            <span className="text-sm inline-flex items-center gap-2">
              <span className="text-gray-700">Apagar este rascunho de vez?</span>
              <button type="button" onClick={apagar} disabled={ocupado} className="font-semibold text-red-600 hover:underline">Apagar</button>
              <button type="button" onClick={() => setConfirmarApagar(false)} className="text-gray-500 hover:underline">Cancelar</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmarApagar(true)} className="text-sm text-gray-400 hover:text-red-600 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Apagar rascunho</button>
          )}
        </div>
      )}

      {erro && <p className="sticky bottom-4 rounded-lg bg-red-600 text-white text-sm p-3 shadow-lg" role="alert">{erro}</p>}
      {aviso && <p className="text-sm text-green-700">{aviso}</p>}
    </div>
  )
}
