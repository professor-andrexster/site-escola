'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, ExternalLink, ImagePlus, Plus, Send, Trash2 } from 'lucide-react'
import { CATEGORIAS } from '@/lib/categorias'
import {
  CHECKLIST, COMO_OUVIU, EDITORIAS, ROTULO_STATUS, ROTULO_TIPO, TEMAS, VEREDITOS, pendencias,
  type ComoOuviu, type Editoria, type Fonte, type Materia, type Tema, type Veredito,
} from '@/lib/jornal/tipos'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from '@/components/admin/podcast/comum'

type Campos = Pick<Materia, 'titulo' | 'resumo' | 'texto' | 'editoria' | 'categoria' | 'fontes' | 'checklist' | 'boato' | 'veredito' | 'tema' | 'comoChecamos' | 'memoriaAno' | 'validoAte'>

const camposDe = (m: Materia): Campos => ({
  titulo: m.titulo, resumo: m.resumo, texto: m.texto, editoria: m.editoria, categoria: m.categoria, fontes: m.fontes, checklist: m.checklist,
  boato: m.boato, veredito: m.veredito, tema: m.tema, comoChecamos: m.comoChecamos, memoriaAno: m.memoriaAno, validoAte: m.validoAte,
})

const COR_STATUS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700', revisao: 'bg-amber-50 text-amber-800', ajustar: 'bg-red-50 text-red-700',
  publicado: 'bg-green-50 text-green-800', retirado: 'bg-gray-200 text-gray-700',
}

const Rotulo = ({ children, dica }: { children: React.ReactNode; dica?: string }) => (
  <span className="block mb-1"><span className="text-xs font-semibold text-gray-600">{children}</span>{dica && <span className="block text-xs text-gray-500">{dica}</span>}</span>
)

/**
 * Redação da matéria. O texto é puro (sem HTML); a cópia local guarda o que foi
 * digitado até o servidor confirmar, para queda de internet não levar o trabalho.
 */
export default function EditorMateria({ inicial, podeEditar, moderador, souAutor }: { inicial: Materia; podeEditar: boolean; moderador: boolean; souAutor: boolean }) {
  const router = useRouter()
  const [m, setM] = useState(inicial)
  const [c, setC] = useState<Campos>(() => camposDe(inicial))
  const [sujo, setSujo] = useState(false)
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [recado, setRecado] = useState('')
  const [recuperavel, setRecuperavel] = useState<Campos | null>(null)
  const arquivo = useRef<HTMLInputElement>(null)
  const chave = `jb-jornal-${inicial.id}`
  const tipo = m.tipo

  // Cópia local: lê uma vez ao abrir; se for diferente do que o servidor tem, oferece de volta.
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(chave)
      if (!bruto) return
      const g = JSON.parse(bruto) as { em: string; campos: Campos }
      if (podeEditar && g.em > inicial.atualizadoEm && JSON.stringify(g.campos) !== JSON.stringify(camposDe(inicial))) setRecuperavel(g.campos)
      else localStorage.removeItem(chave)
    } catch { /* cópia ilegível: ignora */ }
  }, [chave, inicial, podeEditar])

  useEffect(() => {
    if (!sujo) return
    try { localStorage.setItem(chave, JSON.stringify({ em: new Date().toISOString(), campos: c })) } catch { /* sem espaço: segue */ }
  }, [c, sujo, chave])

  useEffect(() => {
    if (!sujo) return
    const sair = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', sair)
    return () => window.removeEventListener('beforeunload', sair)
  }, [sujo])

  const mudar = (p: Partial<Campos>) => { setC(a => ({ ...a, ...p })); setSujo(true); setAviso('') }
  const falta = useMemo(() => pendencias({ ...c, tipo }), [c, tipo])

  /** Salva e, se pedido, age. Só limpa a cópia local quando o servidor confirma que gravou. */
  async function enviar(acao?: string, extra: Record<string, unknown> = {}): Promise<boolean> {
    setErro(''); setAviso('')
    setOcupado(acao ?? 'salvar')
    const corpo = { ...(podeEditar ? { campos: c } : {}), ...(acao ? { acao } : {}), ...extra }
    const r = await chamar(`/api/jornal/materias/${m.id}`, json('PATCH', corpo))
    setOcupado('')
    const devolvida = r.dados?.materia as Materia | undefined
    if (devolvida) {
      // O servidor gravou os campos (mesmo que tenha recusado a ação).
      setM(devolvida)
      setSujo(false)
      try { localStorage.removeItem(chave) } catch { /* nada */ }
    }
    if (!r.ok) { setErro(r.erro); return false }
    setAviso(acao === 'enviar' ? 'Enviada! O monitor foi avisado.' : acao === 'publicar' ? 'Publicada. Já está no site.' : acao ? 'Feito.' : 'Salvo.')
    router.refresh()
    return true
  }

  async function trocarFoto(f: File) {
    setErro(''); setOcupado('foto')
    const form = new FormData()
    form.append('arquivo', f)
    const r = await chamar(`/api/jornal/materias/${m.id}/imagem`, { method: 'POST', body: form })
    setOcupado('')
    if (arquivo.current) arquivo.current.value = ''
    if (!r.ok) { setErro(`${r.erro} A foto continua no seu aparelho.`); return }
    setM(a => ({ ...a, imagemUrl: r.dados.url }))
  }

  async function tirarFoto() {
    setOcupado('foto')
    const r = await chamar(`/api/jornal/materias/${m.id}/imagem`, { method: 'DELETE' })
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return }
    setM(a => ({ ...a, imagemUrl: null }))
  }

  async function apagar() {
    if (!window.confirm('Apagar este rascunho? Não dá para desfazer.')) return
    setOcupado('apagar')
    const r = await chamar(`/api/jornal/materias/${m.id}`, { method: 'DELETE' })
    if (!r.ok) { setOcupado(''); setErro(r.erro); return }
    try { localStorage.removeItem(chave) } catch { /* nada */ }
    router.push('/admin/jornal')
    router.refresh()
  }

  const fonte = (i: number, p: Partial<Fonte>) => mudar({ fontes: c.fontes.map((f, j) => (j === i ? { ...f, ...p } : f)) })
  const passo = (i: number, v: string) => mudar({ comoChecamos: c.comoChecamos.map((x, j) => (j === i ? v : x)) })
  const travado = !podeEditar

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 text-escola-azul text-xs font-semibold px-2.5 py-1">{ROTULO_TIPO[tipo].nome}</span>
        <span className={`rounded-full text-xs font-semibold px-2.5 py-1 ${COR_STATUS[m.status]}`}>{ROTULO_STATUS[m.status]}</span>
        {moderador && !souAutor && <span className="text-xs text-gray-500">por {m.autorNome}</span>}
        {m.status === 'publicado' && (
          <a href={`/noticias/${m.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-escola-azul hover:underline ml-auto">Ver no site <ExternalLink className="w-3.5 h-3.5" /></a>
        )}
      </div>

      {m.feedback && (m.status === 'ajustar' || m.status === 'retirado') && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="status">
          <strong className="font-semibold">{m.status === 'ajustar' ? 'Recado do monitor:' : 'Motivo:'}</strong> {m.feedback}
        </div>
      )}
      {recuperavel && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex flex-wrap items-center gap-3" role="status">
          <span className="flex-1 min-w-[14rem]">Achei neste aparelho um texto seu que não chegou a ser salvo no servidor.</span>
          <button type="button" className={BOTAO_LEVE} onClick={() => { setC(recuperavel); setSujo(true); setRecuperavel(null) }}>Recuperar</button>
          <button type="button" className="text-xs underline" onClick={() => { try { localStorage.removeItem(chave) } catch { /* nada */ } setRecuperavel(null) }}>Descartar</button>
        </div>
      )}
      {travado && m.status === 'revisao' && !moderador && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">A matéria está com o monitor. Quando ele responder, você recebe um e-mail e ela volta a abrir aqui.</p>
      )}

      <fieldset disabled={travado} className="space-y-6 min-w-0">
        <section className="panel p-6 space-y-4">
          <label className="block"><Rotulo>Título</Rotulo>
            <input value={c.titulo} onChange={e => mudar({ titulo: e.target.value })} maxLength={140} className={`${CAMPO} text-base font-semibold`} /></label>
          <label className="block"><Rotulo dica="Uma ou duas frases. É o que aparece no card e no papel.">Resumo</Rotulo>
            <textarea value={c.resumo ?? ''} onChange={e => mudar({ resumo: e.target.value })} maxLength={300} rows={2} className={CAMPO} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            {tipo !== 'memoria' && (
              <div>
                <Rotulo dica="De onde é o assunto.">Editoria</Rotulo>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(EDITORIAS) as Editoria[]).map(k => (
                    <button key={k} type="button" onClick={() => mudar({ editoria: k })} aria-pressed={c.editoria === k} title={EDITORIAS[k].desc}
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${c.editoria === k ? 'border-escola-azul bg-blue-50 text-escola-azul' : 'border-gray-200 bg-white text-gray-700'}`}>{EDITORIAS[k].nome}</button>
                  ))}
                </div>
              </div>
            )}
            <label className="block"><Rotulo dica="Opcional.">Assunto</Rotulo>
              <select value={c.categoria ?? ''} onChange={e => mudar({ categoria: e.target.value || null })} className={CAMPO}>
                <option value="">Sem assunto</option>
                {Object.entries(CATEGORIAS).filter(([k]) => k !== 'podcast').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></label>
            {tipo === 'memoria' && (
              <label className="block"><Rotulo dica="De 1946 para cá.">Ano da história</Rotulo>
                <input type="number" min={1946} max={new Date().getFullYear()} value={c.memoriaAno ?? ''} onChange={e => mudar({ memoriaAno: e.target.value ? Number(e.target.value) : null })} className={CAMPO} /></label>
            )}
            {tipo === 'servico' && (
              <label className="block"><Rotulo dica="Depois deste dia o aviso sai do mural sozinho.">Vale até</Rotulo>
                <input type="date" value={c.validoAte ?? ''} onChange={e => mudar({ validoAte: e.target.value || null })} className={CAMPO} /></label>
            )}
          </div>
        </section>

        {tipo === 'checagem' && (
          <section className="panel p-6 space-y-4">
            <h2 className="font-geom text-lg font-bold text-gray-900">A checagem</h2>
            <label className="block"><Rotulo dica="Do jeito que chegou no grupo, sem aumentar. Não diga quem repassou.">O que estão dizendo</Rotulo>
              <textarea value={c.boato ?? ''} onChange={e => mudar({ boato: e.target.value })} maxLength={600} rows={2} className={CAMPO} /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block"><Rotulo dica="O jornal não checa político, partido nem eleição.">Tema</Rotulo>
                <select value={c.tema ?? ''} onChange={e => mudar({ tema: (e.target.value || null) as Tema | null })} className={CAMPO}>
                  <option value="">Escolha</option>
                  {Object.entries(TEMAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></label>
              <div>
                <Rotulo>Selo</Rotulo>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(VEREDITOS) as Veredito[]).map(k => (
                    <button key={k} type="button" onClick={() => mudar({ veredito: k })} aria-pressed={c.veredito === k} title={VEREDITOS[k].frase}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold border ${c.veredito === k ? `${VEREDITOS[k].cor} border-transparent` : 'border-gray-200 bg-white text-gray-700'}`}>{VEREDITOS[k].nome}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Rotulo dica="Um passo por linha, na ordem. O leitor tem que conseguir refazer.">Como a gente checou</Rotulo>
              <ol className="space-y-2">
                {c.comoChecamos.map((p, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="mt-2 text-xs font-bold text-gray-500 w-5">{i + 1}.</span>
                    <input value={p} onChange={e => passo(i, e.target.value)} maxLength={300} className={CAMPO} placeholder={i === 0 ? 'Ex.: Liguei para a secretaria da escola e perguntei a data.' : 'Próximo passo'} />
                    <button type="button" onClick={() => mudar({ comoChecamos: c.comoChecamos.filter((_, j) => j !== i) })} aria-label={`Tirar passo ${i + 1}`} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ol>
              {c.comoChecamos.length < 12 && <button type="button" onClick={() => mudar({ comoChecamos: [...c.comoChecamos, ''] })} className={`${BOTAO_LEVE} mt-2`}><Plus className="w-4 h-4" /> Passo</button>}
            </div>
          </section>
        )}

        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Texto</h2>
          <p className="text-xs text-gray-500 mb-3">Escreva normal, pulando uma linha entre parágrafos. Para um subtítulo comece a linha com <code>## </code>; para a fala de alguém, com <code>&gt; </code>; para lista, com <code>- </code>.</p>
          <textarea value={c.texto ?? ''} onChange={e => mudar({ texto: e.target.value })} maxLength={20000} rows={16} className={`${CAMPO} font-serif text-base leading-relaxed`}
            placeholder="Comece pelo mais importante: o que aconteceu, com quem, onde e quando." />
          <p className="text-xs text-gray-500 mt-1">{(c.texto ?? '').trim().length} letras</p>
        </section>

        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">{tipo === 'checagem' || tipo === 'servico' ? 'De onde veio a informação' : 'Quem a gente ouviu'}</h2>
          <p className="text-xs text-gray-500 mb-3">Aparece no fim da matéria. De menor de idade, só o primeiro nome. Nunca telefone nem endereço.</p>
          <ul className="space-y-3">
            {c.fontes.map((f, i) => (
              <li key={i} className="grid gap-2 md:grid-cols-[1fr_1.3fr_auto_auto] items-start">
                <input value={f.nome} onChange={e => fonte(i, { nome: e.target.value })} maxLength={80} className={CAMPO} placeholder="Nome" aria-label={`Nome da fonte ${i + 1}`} />
                <input value={f.papel} onChange={e => fonte(i, { papel: e.target.value })} maxLength={120} className={CAMPO} placeholder="Quem é (merendeira, moradora da rua, site da Prefeitura)" aria-label={`Quem é a fonte ${i + 1}`} />
                <select value={f.como} onChange={e => fonte(i, { como: e.target.value as ComoOuviu })} className={CAMPO} aria-label={`Como ouviu a fonte ${i + 1}`}>
                  {Object.entries(COMO_OUVIU).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button type="button" onClick={() => mudar({ fontes: c.fontes.filter((_, j) => j !== i) })} aria-label={`Tirar fonte ${i + 1}`} className="p-2 text-gray-500 hover:text-red-600 justify-self-start"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
          {c.fontes.length < 12 && <button type="button" onClick={() => mudar({ fontes: [...c.fontes, { nome: '', papel: '', como: 'pessoalmente' }] })} className={`${BOTAO_LEVE} mt-3`}><Plus className="w-4 h-4" /> Fonte</button>}
        </section>

        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Foto</h2>
          <p className="text-xs text-gray-500 mb-3">Opcional. A localização gravada pelo celular é apagada antes de guardar.</p>
          {m.imagemUrl && <img src={m.imagemUrl} alt="Foto da matéria" className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 mb-3" />}
          <input ref={arquivo} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="foto-materia" onChange={e => e.target.files?.[0] && trocarFoto(e.target.files[0])} />
          <div className="flex flex-wrap gap-2">
            <label htmlFor="foto-materia" className={`${BOTAO_LEVE} cursor-pointer ${travado ? 'opacity-50 pointer-events-none' : ''}`}><ImagePlus className="w-4 h-4" /> {ocupado === 'foto' ? 'Enviando…' : m.imagemUrl ? 'Trocar foto' : 'Escolher foto'}</label>
            {m.imagemUrl && <button type="button" onClick={tirarFoto} className={BOTAO_LEVE}>Tirar foto</button>}
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Conferência antes de enviar</h2>
          <p className="text-xs text-gray-500 mb-3">Marque só o que você fez de verdade. O monitor confere de novo.</p>
          <ul className="space-y-2">
            {CHECKLIST[tipo].map(i => (
              <li key={i.chave}>
                <label className="flex items-start gap-3 text-sm text-gray-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4" checked={c.checklist.includes(i.chave)}
                    onChange={e => mudar({ checklist: e.target.checked ? [...c.checklist, i.chave] : c.checklist.filter(k => k !== i.chave) })} />
                  <span>{i.texto}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </fieldset>

      {m.status !== 'publicado' && (
        <section className={`rounded-xl border p-4 text-sm ${falta.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'}`} aria-live="polite">
          {falta.length ? (
            <>
              <p className="font-semibold flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Falta para poder enviar</p>
              <ul className="list-disc pl-5 space-y-0.5">{falta.map(f => <li key={f}>{f}</li>)}</ul>
            </>
          ) : <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Tudo conferido. Pode enviar.</p>}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {podeEditar && <button type="button" onClick={() => enviar()} disabled={!!ocupado} className={BOTAO_LEVE}>{ocupado === 'salvar' ? 'Salvando…' : sujo ? 'Salvar' : 'Salvo'}</button>}
        {podeEditar && (m.status === 'rascunho' || m.status === 'ajustar') && (souAutor || moderador) && (
          <button type="button" onClick={() => enviar('enviar')} disabled={!!ocupado || falta.length > 0} className={BOTAO}><Send className="w-4 h-4" /> {ocupado === 'enviar' ? 'Enviando…' : 'Enviar para o monitor'}</button>
        )}
        {moderador && m.status !== 'publicado' && (
          <button type="button" onClick={() => enviar('publicar')} disabled={!!ocupado || falta.length > 0} className={`${BOTAO} !bg-green-700 hover:!bg-green-800`}>{ocupado === 'publicar' ? 'Publicando…' : 'Publicar no site'}</button>
        )}
        {!m.publicadoEm && (m.status === 'rascunho' || m.status === 'ajustar' || moderador) && (souAutor || moderador) && (
          <button type="button" onClick={apagar} disabled={!!ocupado} className="ml-auto inline-flex items-center gap-1.5 text-sm text-red-700 hover:underline"><Trash2 className="w-4 h-4" /> Apagar rascunho</button>
        )}
      </div>

      {moderador && (m.status === 'revisao' || m.status === 'publicado') && (
        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">{m.status === 'revisao' ? 'Devolver para ajuste' : 'Tirar do ar'}</h2>
          <textarea value={recado} onChange={e => setRecado(e.target.value)} maxLength={600} rows={2} className={CAMPO}
            placeholder={m.status === 'revisao' ? 'Diga o que precisa mudar. O repórter recebe este recado.' : 'Motivo (opcional). O repórter é avisado.'} />
          <button type="button" disabled={!!ocupado || (m.status === 'revisao' && !recado.trim())} className={`${BOTAO_LEVE} mt-2`}
            onClick={async () => { if (await enviar(m.status === 'revisao' ? 'ajustar' : 'retirar', m.status === 'revisao' ? { feedback: recado } : { motivo: recado })) setRecado('') }}>
            {m.status === 'revisao' ? 'Devolver ao repórter' : 'Tirar do ar'}
          </button>
        </section>
      )}
      {moderador && m.status === 'retirado' && (
        <button type="button" onClick={() => enviar('rascunho')} disabled={!!ocupado} className={BOTAO_LEVE}>Voltar para rascunho</button>
      )}

      <div aria-live="polite">
        {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}
        {aviso && <p className="text-sm text-green-700">{aviso}</p>}
      </div>
    </div>
  )
}
