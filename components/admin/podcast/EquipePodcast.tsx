'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, Eye, FileUp, Pencil, RotateCcw, Trash2, UserPlus, Users, XCircle } from 'lucide-react'
import { ROTULO_AUTORIZACAO, cpfValido, digitos, formatarCpf, type Membro } from '@/lib/podcast/tipos'
import { BOTAO, BOTAO_LEVE, CAMPO, chamar, json } from './comum'

interface AlunoDisponivel { id: string; nome: string; turma: string; matricula: string; responsavel: string | null }

interface Props {
  alunos: Membro[]
  disponiveis: AlunoDisponivel[]
  anoAtual: number
}

const COR: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-800 border-amber-200',
  enviada: 'bg-blue-50 text-blue-800 border-blue-200',
  aceita: 'bg-green-50 text-green-800 border-green-200',
  revogada: 'bg-red-50 text-red-700 border-red-200',
}

const mascaraDigitando = (v: string) => {
  const d = digitos(v).slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

/**
 * Equipe de alunos do podcast. Adicionar pede o responsável e o CPF, gera o
 * termo preenchido, e o aluno só é liberado quando o termo assinado sobe e o
 * monitor aceita.
 */
export default function EquipePodcast({ alunos, disponiveis, anoAtual }: Props) {
  const router = useRouter()
  const [alunoId, setAlunoId] = useState('')
  const [respNome, setRespNome] = useState('')
  const [respCpf, setRespCpf] = useState('')
  // Nome do responsavel veio do cadastro (e nao digitado): troca junto quando o aluno muda.
  const [respAuto, setRespAuto] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  function escolherAluno(id: string) {
    setAlunoId(id)
    const a = disponiveis.find(x => x.id === id)
    if (!respNome || respAuto) {
      setRespNome(a?.responsavel ?? '')
      setRespAuto(Boolean(a?.responsavel))
    }
  }

  async function adicionar() {
    setErro(''); setAviso('')
    if (!alunoId) { setErro('Escolha o aluno.'); return }
    if (respNome.trim().split(/\s+/).length < 2) { setErro('Escreva o nome completo do responsável.'); return }
    if (!cpfValido(respCpf)) { setErro('Esse CPF não é válido. Confira os números.'); return }
    setOcupado(true)
    const r = await chamar('/api/podcast/membros', json('POST', { alunoId, responsavelNome: respNome, responsavelCpf: respCpf }))
    setOcupado(false)
    if (!r.ok) { setErro(`${r.erro} Os dados continuam no formulário.`); return }
    const nome = disponiveis.find(x => x.id === alunoId)?.nome ?? 'Aluno'
    setAlunoId(''); setRespNome(''); setRespCpf(''); setRespAuto(false)
    setAviso(`${nome} entrou na equipe. Agora baixe o termo preenchido, mande para o responsável assinar e suba a foto ou o PDF assinado.`)
    router.refresh()
  }

  return (
    <section className="panel p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-escola-azul" />
        <h2 className="font-geom text-lg font-bold text-gray-900">Equipe de alunos</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Quem entra aqui só grava depois que a autorização assinada pelo responsável sobe e você confere.
      </p>

      <div className="rounded-xl border border-dashed border-gray-300 p-4 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">Adicionar aluno</p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Aluno</span>
            <select value={alunoId} onChange={e => escolherAluno(e.target.value)} className={CAMPO}>
              <option value="">Escolha…</option>
              {disponiveis.map(a => <option key={a.id} value={a.id}>{a.nome} · {a.turma}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Nome completo do responsável</span>
            <input value={respNome} onChange={e => { setRespNome(e.target.value); setRespAuto(false) }} maxLength={120} className={CAMPO} placeholder="Como está no documento" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">CPF do responsável</span>
            <input value={respCpf} onChange={e => setRespCpf(mascaraDigitando(e.target.value))} inputMode="numeric" className={CAMPO} placeholder="000.000.000-00" />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">O CPF vai só para o termo. Na tela aparece escondido (123.***.***-45) e nunca é publicado.</p>
        {disponiveis.length === 0 && <p className="text-xs text-amber-700 mt-2">Nenhum aluno disponível. Só aparecem alunos ativos que já têm conta no site.</p>}
        <button type="button" onClick={adicionar} disabled={ocupado} className={`${BOTAO} mt-3`}>
          <UserPlus className="w-4 h-4" /> {ocupado ? 'Adicionando…' : 'Adicionar e gerar termo'}
        </button>
        {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
        {aviso && <p className="text-sm text-green-700 mt-3">{aviso}</p>}
      </div>

      {alunos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum aluno na equipe ainda.</p>
      ) : (
        <ul className="space-y-3">
          {alunos.map(m => <LinhaAluno key={m.id} m={m} anoAtual={anoAtual} />)}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <a href="/api/podcast/termos?modelo=responsavel" className={BOTAO_LEVE}><Download className="w-4 h-4" /> Termo do responsável em branco</a>
        <a href="/api/podcast/termos?modelo=entrevistado" className={BOTAO_LEVE}><Download className="w-4 h-4" /> Termo do entrevistado em branco</a>
      </div>
    </section>
  )
}

function LinhaAluno({ m, anoAtual }: { m: Membro; anoAtual: number }) {
  const router = useRouter()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmar, setConfirmar] = useState<'revogar' | 'remover' | null>(null)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(m.responsavelNome ?? '')
  const [cpf, setCpf] = useState('')

  const [aviso, setAviso] = useState('')
  async function acao(corpo: Record<string, unknown>, depois?: (d: any) => void) {
    setOcupado(true); setErro(''); setAviso('')
    const r = await chamar(`/api/podcast/membros/${m.id}`, json('PATCH', corpo))
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    if (r.dados?.retirados > 0) setAviso(`${r.dados.retirados} episódio(s) com ${m.nome.split(' ')[0]} saíram do ar até o termo novo ser aceito.`)
    depois?.(r.dados)
    setConfirmar(null); setEditando(false)
    router.refresh()
  }

  async function subir() {
    if (!arquivo) return
    setOcupado(true); setErro('')
    const fd = new FormData()
    fd.append('arquivo', arquivo)
    const r = await chamar(`/api/podcast/membros/${m.id}/autorizacao`, { method: 'POST', body: fd })
    setOcupado(false)
    if (!r.ok) { setErro(`${r.erro} O arquivo continua selecionado.`); return }
    setArquivo(null)
    if (r.dados?.retirados > 0) setAviso(`${r.dados.retirados} episódio(s) saíram do ar até você conferir o termo novo.`)
    router.refresh()
  }

  async function remover() {
    setOcupado(true); setErro('')
    const r = await chamar(`/api/podcast/membros/${m.id}`, { method: 'DELETE' })
    setOcupado(false)
    if (!r.ok) { setErro(r.erro); return }
    router.refresh()
  }

  const status = m.vencida ? 'pendente' : m.autorizacaoStatus
  return (
    <li className="border border-gray-100 rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{m.nome}</p>
          <p className="text-xs text-gray-500">
            {m.turma ?? 'Sem turma'}{m.matricula ? ` · ${m.matricula}` : ''} · Responsável: {m.responsavelNome ?? '—'} {m.cpfMascarado ? `(${m.cpfMascarado})` : ''}
          </p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${COR[status]}`}>
          {m.vencida ? `Autorização de ${m.anoLetivo}: renovar para ${anoAtual}` : ROTULO_AUTORIZACAO[m.autorizacaoStatus]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {m.vencida ? (
          <button type="button" disabled={ocupado} onClick={() => acao({ acao: 'renovar' })} className={BOTAO_LEVE}><RotateCcw className="w-4 h-4" /> Gerar termo de {anoAtual}</button>
        ) : (
          <a href={`/api/podcast/termos?modelo=responsavel&membro=${m.id}`} className={BOTAO_LEVE}><Download className="w-4 h-4" /> Termo preenchido</a>
        )}
        {m.temArquivo && <a href={`/api/podcast/arquivo?membro=${m.id}`} target="_blank" rel="noopener noreferrer" className={BOTAO_LEVE}><Eye className="w-4 h-4" /> Ver assinado</a>}
        {m.autorizacaoStatus === 'enviada' && (
          <button type="button" disabled={ocupado} onClick={() => acao({ acao: 'aceitar' })} className={BOTAO}><CheckCircle2 className="w-4 h-4" /> Conferi, liberar aluno</button>
        )}
        <button type="button" onClick={() => setEditando(v => !v)} className="text-xs text-gray-500 hover:text-escola-azul inline-flex items-center gap-1 px-2"><Pencil className="w-3.5 h-3.5" /> Corrigir responsável</button>
        {m.autorizacaoStatus === 'aceita' && (
          confirmar === 'revogar' ? (
            <span className="text-xs flex items-center gap-2">
              <span className="text-red-700">Revogar? Os episódios com {m.nome.split(' ')[0]} saem do ar.</span>
              <button type="button" disabled={ocupado} onClick={() => acao({ acao: 'revogar' })} className="font-semibold text-red-600 hover:underline">Revogar</button>
              <button type="button" onClick={() => setConfirmar(null)} className="text-gray-500 hover:underline">Cancelar</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmar('revogar')} className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1 px-2"><XCircle className="w-3.5 h-3.5" /> Revogar</button>
          )
        )}
        {confirmar === 'remover' ? (
          <span className="text-xs flex items-center gap-2">
            <span className="text-gray-700">Tirar da equipe?</span>
            <button type="button" disabled={ocupado} onClick={remover} className="font-semibold text-red-600 hover:underline">Sim</button>
            <button type="button" onClick={() => setConfirmar(null)} className="text-gray-500 hover:underline">Não</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmar('remover')} className="text-xs text-gray-400 hover:text-red-600 inline-flex items-center gap-1 px-2"><Trash2 className="w-3.5 h-3.5" /> Tirar da equipe</button>
        )}
      </div>

      {(m.autorizacaoStatus === 'pendente' || m.autorizacaoStatus === 'enviada' || m.autorizacaoStatus === 'revogada') && !m.vencida && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-600 flex-shrink-0">{m.temArquivo ? 'Trocar o termo assinado:' : 'Termo assinado (foto ou PDF):'}</span>
          <input type="file" accept="application/pdf,image/*" capture="environment" onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            className="text-xs text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-escola-azul" />
          <button type="button" disabled={ocupado || !arquivo} onClick={subir} className={BOTAO_LEVE}><FileUp className="w-4 h-4" /> {ocupado ? 'Enviando…' : 'Subir'}</button>
        </div>
      )}

      {editando && (
        <div className="grid gap-2 sm:grid-cols-[1fr_12rem_auto] mt-3">
          <input value={nome} onChange={e => setNome(e.target.value)} className={CAMPO} placeholder="Nome completo do responsável" />
          <input value={cpf} onChange={e => setCpf(mascaraDigitando(e.target.value))} inputMode="numeric" className={CAMPO} placeholder="CPF" />
          <button type="button" disabled={ocupado} onClick={() => {
            if (!cpfValido(cpf)) { setErro('Esse CPF não é válido.'); return }
            acao({ acao: 'responsavel', responsavelNome: nome, responsavelCpf: formatarCpf(cpf) })
          }} className={BOTAO_LEVE}>Salvar</button>
          <p className="text-xs text-amber-700 sm:col-span-3">Ao corrigir, o termo antigo deixa de valer e o aluno volta a esperar um termo novo assinado.</p>
        </div>
      )}
      {erro && <p className="text-sm text-red-600 mt-2" role="alert">{erro}</p>}
      {aviso && <p className="text-sm text-amber-700 mt-2">{aviso}</p>}
    </li>
  )
}
