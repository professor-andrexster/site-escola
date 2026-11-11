'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Hand, Plus, Trash2, X } from 'lucide-react'
import { ROTULO_COLUNA, VINCULOS, type ColunaPauta, type Pauta } from '@/lib/jornal/tipos'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from '@/components/admin/podcast/comum'

const COR: Record<ColunaPauta, string> = {
  nova: 'bg-amber-50 text-amber-800', sugerida: 'bg-blue-50 text-escola-azul', apurando: 'bg-purple-50 text-purple-800',
  revisao: 'bg-amber-50 text-amber-800', publicada: 'bg-green-50 text-green-800', recusada: 'bg-gray-100 text-gray-600',
}

/** Pautas na redação: o monitor aceita ou recusa o que chega; o repórter pega uma da fila. */
export default function PautasRedacao({ pautas, moderador, podeEscrever }: { pautas: Pauta[]; moderador: boolean; podeEscrever: boolean }) {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const [respostas, setRespostas] = useState<Record<string, string>>({})

  async function agir(id: string, init: RequestInit, url = `/api/jornal/pautas/${id}`) {
    setErro(''); setOcupado(id)
    const r = await chamar(url, init)
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return null }
    router.refresh()
    return r.dados
  }

  async function sugerir() {
    setErro(''); setOcupado('nova')
    const r = await chamar('/api/jornal/pautas', json('POST', { titulo, descricao, origem: 'equipe' }))
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return }
    setTitulo(''); setDescricao('')
    router.refresh()
  }

  async function pegar(p: Pauta) {
    setErro(''); setOcupado(p.id)
    const r = await chamar('/api/jornal/materias', json('POST', { pautaId: p.id, tipo: 'materia' }))
    if (!r.ok) { setOcupado(''); setErro(r.erro); router.refresh(); return }
    router.push(`/admin/jornal/materia/${r.dados.id}`)
  }

  const ordem: ColunaPauta[] = moderador ? ['nova', 'sugerida', 'apurando', 'revisao', 'publicada', 'recusada'] : ['sugerida', 'apurando', 'revisao', 'publicada']

  return (
    <div className="space-y-6">
      {podeEscrever && (
        <section className="panel p-6">
          <h2 className="font-geom text-lg font-bold text-gray-900 mb-1">Sugerir uma pauta</h2>
          <p className="text-sm text-gray-500 mb-3">Viu algo que merece matéria e não vai escrever agora? Deixe na fila para alguém da equipe pegar.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} className={CAMPO} placeholder="O assunto em uma frase" aria-label="Assunto da pauta" />
            <input value={descricao} onChange={e => setDescricao(e.target.value)} maxLength={600} className={CAMPO} placeholder="Com quem falar, onde, quando (opcional)" aria-label="Detalhes da pauta" />
          </div>
          <button type="button" onClick={sugerir} disabled={ocupado === 'nova' || titulo.trim().length < 8} className={`${BOTAO} mt-3`}><Plus className="w-4 h-4" /> Colocar na fila</button>
        </section>
      )}
      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

      {ordem.map(col => {
        const lista = pautas.filter(p => p.coluna === col)
        if (lista.length === 0 && col !== 'nova' && col !== 'sugerida') return null
        return (
          <section key={col}>
            <h2 className="font-geom text-lg font-bold text-gray-900 mb-2">{ROTULO_COLUNA[col]} <span className="text-sm font-normal text-gray-500">({lista.length})</span></h2>
            {lista.length === 0 ? (
              <p className="text-sm text-gray-500">{col === 'nova' ? 'Nenhuma sugestão nova do público.' : 'Fila vazia. Sugira uma pauta ou comece uma matéria direto.'}</p>
            ) : (
              <ul className="space-y-3">
                {lista.map(p => (
                  <li key={p.id} className="panel p-4">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="flex-1 min-w-[14rem]">
                        <p className="font-semibold text-gray-900">{p.titulo}</p>
                        {p.descricao && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{p.descricao}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {p.origem === 'equipe' ? 'Sugestão da equipe' : `Do público${p.nome ? `: ${p.nome}` : ''}${p.vinculo ? ` (${VINCULOS[p.vinculo]})` : ''}`}
                          {' · '}{new Date(p.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          {p.responsavelNome ? ` · com ${p.responsavelNome}` : ''}
                        </p>
                        {p.resposta && <p className="text-sm text-gray-700 mt-2 border-l-2 border-escola-azul pl-2">Resposta da redação: {p.resposta}</p>}
                      </div>
                      <span className={`rounded-full text-xs font-semibold px-2.5 py-1 ${COR[p.coluna]}`}>{ROTULO_COLUNA[p.coluna]}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {p.noticiaId && (moderador || p.coluna === 'publicada') && (
                        p.noticiaSlug
                          ? <Link href={`/noticias/${p.noticiaSlug}`} target="_blank" className="text-sm text-escola-azul hover:underline">Ver matéria no site</Link>
                          : <Link href={`/admin/jornal/materia/${p.noticiaId}`} className="text-sm text-escola-azul hover:underline">Abrir a matéria</Link>
                      )}
                      {podeEscrever && p.coluna === 'sugerida' && (
                        <button type="button" onClick={() => pegar(p)} disabled={ocupado === p.id} className={BOTAO_LEVE}><Hand className="w-4 h-4" /> Pegar esta pauta</button>
                      )}
                      {moderador && !p.noticiaId && p.status !== 'sugerida' && (
                        <button type="button" onClick={() => agir(p.id, json('PATCH', { acao: 'aceitar' }))} disabled={ocupado === p.id} className={BOTAO_LEVE}><Check className="w-4 h-4" /> Aceitar na fila</button>
                      )}
                      {moderador && !p.noticiaId && p.status !== 'recusada' && (
                        <button type="button" onClick={() => agir(p.id, json('PATCH', { acao: 'recusar' }))} disabled={ocupado === p.id} className={BOTAO_LEVE}><X className="w-4 h-4" /> Não vai virar matéria</button>
                      )}
                      {moderador && !p.noticiaId && (
                        <button type="button" onClick={() => window.confirm('Apagar esta pauta?') && agir(p.id, { method: 'DELETE' })} disabled={ocupado === p.id} aria-label="Apagar pauta" className="p-2 text-gray-500 hover:text-red-600 ml-auto"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                    {moderador && p.status === 'sugerida' && (
                      <div className="flex gap-2 mt-3">
                        <input value={respostas[p.id] ?? p.resposta ?? ''} onChange={e => setRespostas(a => ({ ...a, [p.id]: e.target.value }))} maxLength={300} className={CAMPO} placeholder="Recado público para quem sugeriu (opcional)" aria-label="Resposta pública" />
                        <button type="button" onClick={() => agir(p.id, json('PATCH', { resposta: respostas[p.id] ?? '' }))} disabled={ocupado === p.id || respostas[p.id] === undefined} className={BOTAO_LEVE}>Salvar</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
