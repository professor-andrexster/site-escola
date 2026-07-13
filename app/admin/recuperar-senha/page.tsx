'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Mail, BookOpen, Eye, EyeOff } from 'lucide-react'
import { formatarCPF, validarCPF } from '@/lib/cpf'
import { cn } from '@/lib/utils'

const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

function PorEmail() {
  const [identificador, setIdentificador] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    setMensagem('')

    const res = await fetch('/api/recuperar-senha/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao enviar. Tente novamente.')
    } else {
      setMensagem(json.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
        Enviaremos um link de redefinição para o e-mail da sua conta.
      </p>

      <div>
        <label htmlFor="rec-identificador" className={labelClass}>E-mail, matrícula ou CPF</label>
        <input
          id="rec-identificador" type="text" required value={identificador}
          onChange={e => setIdentificador(e.target.value)}
          placeholder="seu@email.com, matrícula ou CPF"
          className={inputClass}
        />
      </div>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}
      {mensagem && <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">{mensagem}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? 'Enviando...' : 'Enviar Link'}
      </button>
    </form>
  )
}

function PorCPF() {
  const [matricula, setMatricula] = useState('')
  const [cpf, setCpf] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (novaSenha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (!validarCPF(cpf)) { setErro('CPF inválido. Confira os números digitados.'); return }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/recuperar-senha/cpf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula, cpf, dataNascimento: nascimento, novaSenha }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao redefinir. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/admin?senha_redefinida=1')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
        Para alunos: informe seus dados como estão na secretaria e escolha uma senha nova na hora.
      </p>

      <div>
        <label htmlFor="cpf-matricula" className={labelClass}>Matrícula</label>
        <input
          id="cpf-matricula" type="text" required value={matricula}
          onChange={e => setMatricula(e.target.value)}
          placeholder="Sua matrícula da escola"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cpf-cpf" className={labelClass}>CPF</label>
        <input
          id="cpf-cpf" type="text" required inputMode="numeric" value={cpf}
          onChange={e => setCpf(formatarCPF(e.target.value))}
          placeholder="000.000.000-00"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cpf-nascimento" className={labelClass}>Data de Nascimento</label>
        <input
          id="cpf-nascimento" type="date" required value={nascimento}
          onChange={e => setNascimento(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cpf-senha" className={labelClass}>Nova Senha</label>
        <div className="relative">
          <input
            id="cpf-senha" type={mostrar ? 'text' : 'password'} required value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={cn(inputClass, 'pr-11')}
          />
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="cpf-confirmar" className={labelClass}>Confirmar Nova Senha</label>
        <input
          id="cpf-confirmar" type={mostrar ? 'text' : 'password'} required value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
          placeholder="Repita a senha nova"
          className={inputClass}
        />
      </div>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
      </button>
    </form>
  )
}

export default function RecuperarSenhaPage() {
  const [aba, setAba] = useState<'email' | 'cpf'>('email')

  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Recuperar Senha</h1>
          <p className="text-white/40 text-sm font-mono mt-1">E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setAba('email')}
              className={cn(
                'flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors',
                aba === 'email' ? 'bg-white text-escola-azul' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
              )}
            >
              <Mail className="w-4 h-4" />
              Por E-mail
            </button>
            <button
              onClick={() => setAba('cpf')}
              className={cn(
                'flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors',
                aba === 'cpf' ? 'bg-white text-escola-azul' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
              )}
            >
              <BookOpen className="w-4 h-4" />
              Sou Aluno (CPF)
            </button>
          </div>

          {aba === 'email' ? <PorEmail /> : <PorCPF />}
        </div>

        <p className="text-center mt-4">
          <Link href="/admin" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
