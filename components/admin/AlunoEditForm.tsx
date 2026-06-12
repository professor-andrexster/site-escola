'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TURMAS } from '@/lib/turmas'
import type { Aluno } from '@/types/database'

export default function AlunoEditForm({ aluno }: { aluno: Aluno }) {
  const [nome, setNome] = useState(aluno.nome)
  const [matricula, setMatricula] = useState(aluno.matricula)
  const [turma, setTurma] = useState(aluno.turma)
  const [telefone, setTelefone] = useState(aluno.telefone ?? '')
  const [email, setEmail] = useState(aluno.email ?? '')
  const [responsavel, setResponsavel] = useState(aluno.responsavel ?? '')
  const [ativo, setAtivo] = useState(aluno.ativo)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSalvar() {
    setErro('')
    setSucesso(false)

    if (!nome.trim() || !matricula.trim() || !turma) {
      setErro('Nome, matrícula e turma são obrigatórios.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('alunos').update({
      nome: nome.trim(),
      matricula: matricula.trim(),
      turma,
      serie: turma,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      responsavel: responsavel.trim() || null,
      ativo,
      atualizado_em: new Date().toISOString(),
    }).eq('id', aluno.id)

    if (error) {
      setErro(error.code === '23505' ? 'Matrícula já cadastrada para outro aluno.' : 'Erro ao salvar: ' + error.message)
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
    const { error } = await supabase.from('alunos').delete().eq('id', aluno.id)
    if (error) {
      setErro('Erro ao remover: ' + error.message)
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
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Matrícula</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Turma</label>
          <select
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          >
            {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="w-4 h-4 accent-escola-azul" />
        <span className="text-sm text-gray-700">Aluno ativo</span>
      </label>

      <div className="flex items-center justify-between pt-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !loading && handleSalvar()}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleSalvar() }}
          className={`flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-escola-azul/90 transition-colors ${loading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </div>

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
      </div>
    </div>
  )
}
