'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { TURMAS } from '@/lib/turmas'
import { formatarCPF, validarCPF } from '@/lib/cpf'

interface FormState {
  nome: string
  matricula: string
  turma: string
  data_nascimento: string
  cpf: string
  responsavel: string
  telefone: string
  email: string
}

const INITIAL: FormState = {
  nome: '',
  matricula: '',
  turma: '',
  data_nascimento: '',
  cpf: '',
  responsavel: '',
  telefone: '',
  email: '',
}

export default function NovoAlunoPage() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [erros, setErros] = useState<Partial<Record<keyof FormState, string>>>({})
  const [erroGeral, setErroGeral] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function setField(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErros(prev => ({ ...prev, [field]: undefined }))
  }

  function validar(): boolean {
    const novosErros: Partial<Record<keyof FormState, string>> = {}

    if (!form.nome.trim()) novosErros.nome = 'Informe o nome do aluno.'
    if (!form.matricula.trim()) novosErros.matricula = 'Informe a matrícula.'
    if (!form.turma) novosErros.turma = 'Selecione a turma.'

    if (form.cpf.trim() && !validarCPF(form.cpf)) {
      novosErros.cpf = 'CPF inválido. Confira os números digitados.'
    }

    if (form.telefone.trim()) {
      const digitos = form.telefone.replace(/\D/g, '')
      if (digitos.length < 10 || digitos.length > 11) {
        novosErros.telefone = 'Telefone inválido. Use DDD + número.'
      }
    }

    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      novosErros.email = 'E-mail inválido.'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function handleSalvar() {
    setErroGeral('')
    if (!validar()) return

    setLoading(true)

    const res = await fetch('/api/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        matricula: form.matricula,
        turma: form.turma,
        data_nascimento: form.data_nascimento || null,
        cpf: form.cpf || null,
        responsavel: form.responsavel || null,
        telefone: form.telefone || null,
        email: form.email || null,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setErroGeral(json.error ?? 'Erro ao cadastrar aluno.')
      setLoading(false)
      return
    }

    router.push('/admin/alunos?criado=1')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/alunos" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para listagem
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-1">Novo Aluno</h1>
      <p className="text-sm text-gray-400 mb-6">Preencha os dados do aluno para incluí-lo na base.</p>

      {erroGeral && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {erroGeral}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome completo <span className="text-escola-vermelho">*</span>
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setField('nome', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.nome ? 'border-red-400' : 'border-gray-200'}`}
          />
          {erros.nome && <p className="text-xs text-red-500 mt-1">{erros.nome}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Matrícula <span className="text-escola-vermelho">*</span>
            </label>
            <input
              type="text"
              value={form.matricula}
              onChange={(e) => setField('matricula', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.matricula ? 'border-red-400' : 'border-gray-200'}`}
            />
            {erros.matricula && <p className="text-xs text-red-500 mt-1">{erros.matricula}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Turma <span className="text-escola-vermelho">*</span>
            </label>
            <select
              value={form.turma}
              onChange={(e) => setField('turma', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.turma ? 'border-red-400' : 'border-gray-200'}`}
            >
              <option value="">Selecione...</option>
              {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {erros.turma && <p className="text-xs text-red-500 mt-1">{erros.turma}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Turno</label>
          <input type="text" value="Integral" disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
            <input
              type="date"
              value={form.data_nascimento}
              onChange={(e) => setField('data_nascimento', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
            />
            <p className="text-xs text-gray-400 mt-1">Usado pelo aluno para criar a conta e recuperar a senha.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.cpf}
              onChange={(e) => setField('cpf', formatarCPF(e.target.value))}
              placeholder="000.000.000-00"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.cpf ? 'border-red-400' : 'border-gray-200'}`}
            />
            {erros.cpf && <p className="text-xs text-red-500 mt-1">{erros.cpf}</p>}
            <p className="text-xs text-gray-400 mt-1">Sem o CPF o aluno não consegue criar a própria conta.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={(e) => setField('responsavel', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => setField('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.telefone ? 'border-red-400' : 'border-gray-200'}`}
            />
            {erros.telefone && <p className="text-xs text-red-500 mt-1">{erros.telefone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 ${erros.email ? 'border-red-400' : 'border-gray-200'}`}
            />
            {erros.email && <p className="text-xs text-red-500 mt-1">{erros.email}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => !loading && handleSalvar()}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleSalvar() }}
            className={`flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-escola-azul/90 transition-colors ${loading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar Aluno'}
          </div>
          <Link
            href="/admin/alunos"
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}
