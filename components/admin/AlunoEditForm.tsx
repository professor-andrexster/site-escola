'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, AlertCircle } from 'lucide-react'
import { TURMAS } from '@/lib/turmas'
import { formatarCPF, validarCPF } from '@/lib/cpf'
import type { Aluno } from '@/types/database'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarEmail(email: string): boolean {
  return REGEX_EMAIL.test(email)
}

export default function AlunoEditForm({ aluno, somenteLeitura = false }: { aluno: Aluno; somenteLeitura?: boolean }) {
  const [nome, setNome] = useState(aluno.nome)
  const [matricula, setMatricula] = useState(aluno.matricula)
  const [turma, setTurma] = useState(aluno.turma)
  const [nascimento, setNascimento] = useState(aluno.data_nascimento ?? '')
  const [cpf, setCpf] = useState(aluno.cpf ? formatarCPF(aluno.cpf) : '')
  const [telefone, setTelefone] = useState(aluno.telefone ?? '')
  const [email, setEmail] = useState(aluno.email ?? '')
  const [responsavel, setResponsavel] = useState(aluno.responsavel ?? '')
  const [ativo, setAtivo] = useState(aluno.ativo)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSalvar() {
    setErro('')
    setSucesso(false)

    if (!nome.trim() || !matricula.trim() || !turma) {
      setErro('Nome, matrícula e turma são obrigatórios.')
      return
    }
    if (cpf.trim() && !validarCPF(cpf)) {
      setErro('CPF inválido. Confira os números digitados.')
      return
    }
    if (email.trim() && !validarEmail(email)) {
      setErro('E-mail inválido. Insira um e-mail válido (ex: aluno@escola.com).')
      return
    }

    setLoading(true)

    const res = await fetch('/api/alunos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: aluno.id,
        nome,
        matricula,
        turma,
        data_nascimento: nascimento || null,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        responsavel: responsavel || null,
        ativo,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErro(json.error ?? 'Erro ao salvar.')
      setLoading(false)
      return
    }

    setSucesso(true)
    setLoading(false)
    router.refresh()
  }

  async function handleExcluir() {
    if (!confirm(`Remover o aluno "${aluno.nome}" e todos os seus dados (projetos, perfil vocacional)?`)) return
    setLoading(true)
    const res = await fetch('/api/alunos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: aluno.id }),
    })
    if (!res.ok) {
      const json = await res.json()
      setErro(json.error ?? 'Erro ao remover.')
      setLoading(false)
      return
    }
    router.push('/admin/alunos')
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}
      {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Alterações salvas!</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={somenteLeitura}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Matrícula</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            disabled={somenteLeitura}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Turma</label>
          <select
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            disabled={somenteLeitura}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          >
            {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
          <input
            type="date"
            value={nascimento}
            onChange={(e) => setNascimento(e.target.value)}
            disabled={somenteLeitura}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
          <input
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
            placeholder="000.000.000-00"
            disabled={somenteLeitura}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">Necessário para o aluno criar a conta e recuperar a senha.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            disabled={somenteLeitura}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={somenteLeitura}
            placeholder="aluno@escola.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          disabled={somenteLeitura}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} disabled={somenteLeitura} className="w-4 h-4 accent-escola-azul disabled:opacity-50" />
        <span className="text-sm text-gray-700">Aluno ativo</span>
      </label>

      <div className="flex items-center justify-between pt-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !loading && !somenteLeitura && handleSalvar()}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading && !somenteLeitura) handleSalvar() }}
          className={`flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            somenteLeitura ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-escola-azul/90'
          } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </div>

        {!somenteLeitura && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !loading && handleExcluir()}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleExcluir() }}
            className="flex items-center gap-2 text-escola-vermelho px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Remover
          </div>
        )}
      </div>
    </div>
  )
}
