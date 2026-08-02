'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Save, Lock, Unlock } from 'lucide-react'
import { TURMAS } from '@/lib/turmas'
import { precisaDeResponsavel } from '@/lib/biblioteca/leitores'
import type { BibliotecaLeitor } from '@/types/database'

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function LeitorForm({ leitor }: { leitor?: BibliotecaLeitor }) {
  const router = useRouter()

  const [tipoLeitor, setTipoLeitor] = useState(leitor?.tipo_leitor ?? 'aluno')
  const [nomeCompleto, setNomeCompleto] = useState(leitor?.nome_completo ?? '')
  const [nomeSocial, setNomeSocial] = useState(leitor?.nome_social ?? '')
  const [matricula, setMatricula] = useState(leitor?.matricula ?? '')
  const [dataNascimento, setDataNascimento] = useState(leitor?.data_nascimento ?? '')
  const [turma, setTurma] = useState(leitor?.turma ?? '')
  const [turno, setTurno] = useState(leitor?.turno ?? '')
  const [anoEscolar, setAnoEscolar] = useState(leitor?.ano_escolar ?? '')
  const [telefone, setTelefone] = useState(leitor?.telefone ?? '')
  const [email, setEmail] = useState(leitor?.email ?? '')
  const [nomeResponsavel, setNomeResponsavel] = useState(leitor?.nome_responsavel ?? '')
  const [telefoneResponsavel, setTelefoneResponsavel] = useState(leitor?.telefone_responsavel ?? '')
  const [observacoes, setObservacoes] = useState(leitor?.observacoes ?? '')

  const [buscandoMatricula, setBuscandoMatricula] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const exigeResponsavel = precisaDeResponsavel(tipoLeitor, dataNascimento || null)

  async function buscarPorMatricula() {
    if (!matricula.trim()) return
    setBuscandoMatricula(true)
    setErro('')
    const res = await fetch(`/api/biblioteca/leitores/buscar-aluno?matricula=${encodeURIComponent(matricula.trim())}`)
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Matrícula não encontrada.')
      setBuscandoMatricula(false)
      return
    }
    const aluno = json.aluno
    setNomeCompleto(aluno.nome)
    setTurma(aluno.turma ?? '')
    setTurno(aluno.turno ?? '')
    if (aluno.data_nascimento) setDataNascimento(aluno.data_nascimento)
    if (aluno.telefone) setTelefone(aluno.telefone)
    if (aluno.email) setEmail(aluno.email)
    if (aluno.responsavel) setNomeResponsavel(aluno.responsavel)
    setBuscandoMatricula(false)
  }

  async function handleSalvar() {
    if (!nomeCompleto.trim()) { setErro('Informe o nome completo.'); return }
    if (exigeResponsavel && (!nomeResponsavel.trim() || !telefoneResponsavel.trim())) {
      setErro('Aluno menor de idade precisa do nome e do telefone do responsável.')
      return
    }

    setSalvando(true)
    setErro('')

    const corpo = {
      nomeCompleto,
      nomeSocial: nomeSocial || null,
      tipoLeitor,
      matricula: matricula || null,
      dataNascimento: dataNascimento || null,
      turma: turma || null,
      turno: turno || null,
      anoEscolar: anoEscolar || null,
      telefone: telefone || null,
      email: email || null,
      nomeResponsavel: nomeResponsavel || null,
      telefoneResponsavel: telefoneResponsavel || null,
      observacoes: observacoes || null,
    }

    const res = await fetch(leitor ? `/api/biblioteca/leitores/${leitor.id}` : '/api/biblioteca/leitores', {
      method: leitor ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao salvar o leitor.')
      setSalvando(false)
      return
    }

    if (leitor) {
      router.refresh()
    } else {
      router.push(`/admin/biblioteca/leitores/${json.leitor.id}`)
    }
    setSalvando(false)
  }

  async function alternarBloqueio() {
    if (!leitor) return
    const bloqueando = leitor.situacao !== 'bloqueado'
    let motivoBloqueio: string | undefined
    if (bloqueando) {
      const motivo = window.prompt('Motivo do bloqueio:')
      if (!motivo?.trim()) return
      motivoBloqueio = motivo
    } else if (!window.confirm(`Desbloquear ${leitor.nome_completo}?`)) {
      return
    }

    setSalvando(true)
    setErro('')
    const res = await fetch(`/api/biblioteca/leitores/${leitor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeCompleto, nomeSocial: nomeSocial || null, tipoLeitor, matricula: matricula || null,
        dataNascimento: dataNascimento || null, turma: turma || null, turno: turno || null,
        anoEscolar: anoEscolar || null, telefone: telefone || null, email: email || null,
        nomeResponsavel: nomeResponsavel || null, telefoneResponsavel: telefoneResponsavel || null,
        observacoes: observacoes || null,
        situacao: bloqueando ? 'bloqueado' : 'ativo',
        motivoBloqueio,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao mudar a situação do leitor.')
      setSalvando(false)
      return
    }
    router.refresh()
    setSalvando(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}

      {leitor && (
        <div className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-3 ${leitor.situacao === 'bloqueado' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {leitor.situacao === 'bloqueado' ? 'Leitor bloqueado' : leitor.situacao === 'ativo' ? 'Leitor ativo' : 'Leitor inativo'}
            </p>
            {leitor.situacao === 'bloqueado' && leitor.motivo_bloqueio && (
              <p className="text-xs text-red-600 mt-0.5">Motivo: {leitor.motivo_bloqueio}</p>
            )}
          </div>
          <button
            type="button"
            onClick={alternarBloqueio}
            disabled={salvando}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              leitor.situacao === 'bloqueado' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {leitor.situacao === 'bloqueado' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {leitor.situacao === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
          </button>
        </div>
      )}

      <div>
        <label className={labelClass}>Tipo de leitor</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['aluno', 'professor', 'funcionario', 'comunidade'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoLeitor(t)}
              className={`py-2 rounded-lg border-2 text-xs font-semibold transition-all capitalize ${
                tipoLeitor === t ? 'border-escola-azul bg-escola-azul text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tipoLeitor === 'aluno' && (
        <div>
          <label className={labelClass}>Matrícula</label>
          <div className="flex gap-2">
            <input value={matricula} onChange={e => setMatricula(e.target.value)} className={inputClass} />
            <button
              type="button"
              onClick={buscarPorMatricula}
              disabled={buscandoMatricula}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              {buscandoMatricula ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Busca na base de alunos da secretaria e preenche os dados abaixo.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome completo *</label>
          <input value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nome social</label>
          <input value={nomeSocial} onChange={e => setNomeSocial(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Data de nascimento</label>
          <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className={inputClass} />
        </div>
        {tipoLeitor === 'aluno' ? (
          <div>
            <label className={labelClass}>Turma</label>
            <select value={turma} onChange={e => setTurma(e.target.value)} className={inputClass}>
              <option value="">Selecione</option>
              {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Turma / setor</label>
            <input value={turma} onChange={e => setTurma(e.target.value)} className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass}>Turno</label>
          <input value={turno} onChange={e => setTurno(e.target.value)} className={inputClass} />
        </div>
      </div>

      {tipoLeitor === 'aluno' && (
        <div>
          <label className={labelClass}>Ano escolar</label>
          <input value={anoEscolar} onChange={e => setAnoEscolar(e.target.value)} placeholder="Ex: 2º ano" className={inputClass} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Telefone</label>
          <input value={telefone} onChange={e => setTelefone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      {exigeResponsavel && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-700">Aluno menor de idade: responsável obrigatório.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome do responsável *</label>
              <input value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone do responsável *</label>
              <input value={telefoneResponsavel} onChange={e => setTelefoneResponsavel(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {!exigeResponsavel && tipoLeitor === 'aluno' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome do responsável</label>
            <input value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone do responsável</label>
            <input value={telefoneResponsavel} onChange={e => setTelefoneResponsavel(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Observações</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} className={inputClass} />
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !salvando && handleSalvar()}
        onKeyDown={e => { if (e.key === 'Enter' && !salvando) handleSalvar() }}
        className={`inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer hover:bg-escola-azul/90 ${salvando ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <Save className="w-4 h-4" />
        {salvando ? 'Salvando...' : 'Salvar Leitor'}
      </div>
    </div>
  )
}
