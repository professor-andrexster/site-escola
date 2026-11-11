'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { VINCULOS } from '@/lib/jornal/tipos'

const CAMPO = 'w-full border border-escola-cinza-claro bg-white px-3 py-2.5 text-base text-escola-preto focus:outline-none focus:ring-2 focus:ring-escola-azul/40'

/**
 * Sugestão de pauta, sem login. O que a pessoa digitou só some da tela depois
 * que o servidor confirma que guardou.
 */
export default function FormularioPauta() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [nome, setNome] = useState('')
  const [vinculo, setVinculo] = useState('')
  const [site, setSite] = useState('')
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'enviado'>('parado')
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (titulo.trim().length < 8) { setErro('Conte o assunto em uma frase (pelo menos 8 letras).'); return }
    setEstado('enviando')
    try {
      const res = await fetch('/api/jornal/pautas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, descricao, nome, vinculo, site }) })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok || dados?.ok === false) { setEstado('parado'); setErro(dados?.error ?? 'Não deu para enviar. Seu texto continua aqui: tente de novo.'); return }
    } catch {
      setEstado('parado'); setErro('Sem conexão. Seu texto continua aqui: tente de novo quando a internet voltar.'); return
    }
    setTitulo(''); setDescricao(''); setNome(''); setVinculo('')
    setEstado('enviado')
  }

  if (estado === 'enviado') {
    return (
      <div className="border-l-4 border-green-700 bg-white p-6" role="status">
        <p className="font-playfair text-xl font-bold text-escola-azul">Recebemos. Obrigado!</p>
        <p className="text-escola-cinza mt-2">A redação lê toda sugestão. Se virar pauta, ela aparece no quadro desta página e você acompanha até a matéria sair.</p>
        <button type="button" onClick={() => setEstado('parado')} className="font-mono text-xs uppercase tracking-widest text-escola-vermelho mt-4 hover:text-escola-azul">Mandar outra</button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="bg-white border border-escola-cinza-claro p-6 space-y-4" noValidate>
      <label className="block">
        <span className="block font-semibold text-escola-preto mb-1">O que o jornal deveria investigar ou contar?</span>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} required className={CAMPO} placeholder="Ex.: Por que a rua da escola fica sem luz à noite?" />
      </label>
      <label className="block">
        <span className="block font-semibold text-escola-preto mb-1">Conte mais <span className="font-normal text-escola-cinza">(opcional)</span></span>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} maxLength={1500} rows={4} className={CAMPO} placeholder="Onde é, desde quando, com quem a equipe pode conversar. Não escreva telefone nem endereço de ninguém." />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block font-semibold text-escola-preto mb-1">Seu primeiro nome <span className="font-normal text-escola-cinza">(opcional)</span></span>
          <input value={nome} onChange={e => setNome(e.target.value)} maxLength={40} autoComplete="given-name" className={CAMPO} />
        </label>
        <label className="block">
          <span className="block font-semibold text-escola-preto mb-1">Você é <span className="font-normal text-escola-cinza">(opcional)</span></span>
          <select value={vinculo} onChange={e => setVinculo(e.target.value)} className={CAMPO}>
            <option value="">Prefiro não dizer</option>
            {Object.entries(VINCULOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      {/* Campo-isca para robô: fora da tela e fora da navegação por teclado. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>Site<input tabIndex={-1} autoComplete="off" value={site} onChange={e => setSite(e.target.value)} /></label>
      </div>
      <p className="text-sm text-escola-cinza">Não pedimos telefone nem e-mail. A sugestão só aparece no quadro depois que a redação ler.</p>
      <button type="submit" disabled={estado === 'enviando'} className="inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors disabled:opacity-60">
        <Send className="w-4 h-4" /> {estado === 'enviando' ? 'Enviando…' : 'Enviar sugestão'}
      </button>
      {erro && <p className="text-red-700 text-sm" role="alert">{erro}</p>}
    </form>
  )
}
