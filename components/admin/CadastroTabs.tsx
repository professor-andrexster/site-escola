'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, BookOpen, Briefcase } from 'lucide-react'
import { formatarCPF, validarCPF } from '@/lib/cpf'
import { cn } from '@/lib/utils'

const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

function CampoSenha({ id, label, valor, onChange, placeholder }: {
  id: string
  label: string
  valor: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [mostrar, setMostrar] = useState(false)
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={mostrar ? 'text' : 'password'}
          required
          value={valor}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
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
  )
}

function FormAluno() {
  const [matricula, setMatricula] = useState('')
  const [cpf, setCpf] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [email, setEmail] = useState('')
  const [emailAlternativo, setEmailAlternativo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (!validarCPF(cpf)) { setErro('CPF inválido. Confira os números digitados.'); return }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/cadastro/aluno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matricula,
        cpf,
        dataNascimento: nascimento,
        email,
        senha,
        emailAlternativo: emailAlternativo || undefined,
      }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao criar a conta. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/admin?conta_criada=1')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
        Seus dados precisam bater com o cadastro da secretaria. Se der erro, procure a direção.
      </p>

      <div>
        <label htmlFor="aluno-matricula" className={labelClass}>Matrícula *</label>
        <input
          id="aluno-matricula" type="text" required value={matricula}
          onChange={e => setMatricula(e.target.value)}
          placeholder="Sua matrícula da escola"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="aluno-cpf" className={labelClass}>CPF *</label>
        <input
          id="aluno-cpf" type="text" required inputMode="numeric" value={cpf}
          onChange={e => setCpf(formatarCPF(e.target.value))}
          placeholder="000.000.000-00"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="aluno-nascimento" className={labelClass}>Data de Nascimento *</label>
        <input
          id="aluno-nascimento" type="date" required value={nascimento}
          onChange={e => setNascimento(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="aluno-email" className={labelClass}>E-mail *</label>
        <input
          id="aluno-email" type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="aluno-email-alt" className={labelClass}>E-mail de um responsável (opcional)</label>
        <input
          id="aluno-email-alt" type="email" value={emailAlternativo}
          onChange={e => setEmailAlternativo(e.target.value)}
          placeholder="email@do-responsavel.com"
          className={inputClass}
        />
        <p className="text-[11px] text-gray-400 mt-1">Ajuda a recuperar sua conta se você perder o acesso ao seu e-mail.</p>
      </div>

      <CampoSenha id="aluno-senha" label="Senha *" valor={senha} onChange={setSenha} placeholder="Mínimo 6 caracteres" />
      <CampoSenha id="aluno-confirmar" label="Confirmar Senha *" valor={confirmar} onChange={setConfirmar} placeholder="Repita a senha" />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm mt-2"
      >
        {loading ? 'Criando conta...' : 'Criar Minha Conta'}
      </button>
    </form>
  )
}

function FormProfessor() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (!nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (!validarCPF(cpf)) { setErro('CPF inválido. Confira os números digitados.'); return }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/cadastro/professor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        cpf,
        dataNascimento: nascimento || undefined,
        disciplina: disciplina || undefined,
        senha,
      }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao enviar o cadastro. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/admin?pendente=1')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
        Cadastro para professores e equipe pedagógica. Sua conta aguardará aprovação da direção antes de acessar o painel.
      </p>

      <div>
        <label htmlFor="prof-nome" className={labelClass}>Nome Completo *</label>
        <input
          id="prof-nome" type="text" required value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Seu nome completo"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="prof-cpf" className={labelClass}>CPF *</label>
        <input
          id="prof-cpf" type="text" required inputMode="numeric" value={cpf}
          onChange={e => setCpf(formatarCPF(e.target.value))}
          placeholder="000.000.000-00"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="prof-nascimento" className={labelClass}>Data de Nascimento</label>
        <input
          id="prof-nascimento" type="date" value={nascimento}
          onChange={e => setNascimento(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="prof-disciplina" className={labelClass}>Disciplina</label>
        <input
          id="prof-disciplina" type="text" value={disciplina}
          onChange={e => setDisciplina(e.target.value)}
          placeholder="Ex: Matemática, Português, TI"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="prof-email" className={labelClass}>E-mail *</label>
        <input
          id="prof-email" type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={inputClass}
        />
      </div>

      <CampoSenha id="prof-senha" label="Senha *" valor={senha} onChange={setSenha} placeholder="Mínimo 6 caracteres" />
      <CampoSenha id="prof-confirmar" label="Confirmar Senha *" valor={confirmar} onChange={setConfirmar} placeholder="Repita a senha" />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm mt-2"
      >
        {loading ? 'Enviando...' : 'Enviar Cadastro'}
      </button>
    </form>
  )
}

export default function CadastroTabs() {
  const [aba, setAba] = useState<'aluno' | 'professor'>('aluno')

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-2">
        <button
          onClick={() => setAba('aluno')}
          className={cn(
            'flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors',
            aba === 'aluno' ? 'bg-white text-escola-azul' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Sou Aluno
        </button>
        <button
          onClick={() => setAba('professor')}
          className={cn(
            'flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors',
            aba === 'professor' ? 'bg-white text-escola-azul' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
          )}
        >
          <Briefcase className="w-4 h-4" />
          Sou Professor
        </button>
      </div>

      {aba === 'aluno' ? <FormAluno /> : <FormProfessor />}
    </div>
  )
}
