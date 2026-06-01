'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TURMAS } from '@/lib/turmas'

export default function CadastroForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'aluno' | 'professor'>('aluno')
  const [turma, setTurma] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (!nome.trim()) { setError('Informe seu nome completo.'); return }
    if (role === 'aluno' && !turma) { setError('Selecione sua turma.'); return }

    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !data.user) {
      setError(authError?.message ?? 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    // Alunos são aprovados automaticamente; professores aguardam aprovação da direção
    const aprovado = role === 'aluno'

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      nome_completo: nome.trim(),
      role,
      turma: role === 'aluno' ? turma : null,
      disciplina: role === 'professor' ? disciplina.trim() || null : null,
      aprovado,
    })

    if (profileError) {
      setError('Erro ao salvar perfil: ' + profileError.message)
      setLoading(false)
      return
    }

    if (aprovado) {
      // Aluno já tem acesso — redireciona direto para o painel
      router.push('/admin/dashboard')
    } else {
      // Professor aguarda aprovação da direção
      await supabase.auth.signOut()
      router.push('/admin?pendente=1')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Tipo de conta */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de Conta</label>
        <div className="grid grid-cols-2 gap-2">
          {(['aluno', 'professor'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                role === r
                  ? 'border-escola-azul bg-escola-azul text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {r === 'aluno' ? '👤 Aluno' : '👨‍🏫 Professor'}
            </button>
          ))}
        </div>
        {role === 'professor' && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
            Professores aguardam aprovação da direção antes de acessar o painel.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo *</label>
        <input
          type="text"
          required
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Seu nome completo"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
        />
      </div>

      {role === 'aluno' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Turma *</label>
          <select
            value={turma}
            onChange={e => setTurma(e.target.value)}
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors bg-white"
          >
            <option value="">Selecione sua turma</option>
            {TURMAS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {role === 'professor' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina</label>
          <input
            type="text"
            value={disciplina}
            onChange={e => setDisciplina(e.target.value)}
            placeholder="Ex: Matemática, Português, TI"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail *</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha *</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Senha *</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repita a senha"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm mt-2"
      >
        {loading ? 'Criando conta...' : role === 'aluno' ? 'Criar Conta e Entrar' : 'Enviar Cadastro'}
      </button>
    </form>
  )
}
