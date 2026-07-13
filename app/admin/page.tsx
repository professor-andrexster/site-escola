'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador, senha: password }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Erro ao entrar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push(json.destino ?? '/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Dr. João Beraldo</h1>
          <p className="text-white/40 text-sm font-mono mt-1">Painel Escolar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Acesso ao Painel</span>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4" autoComplete="on">
            {searchParams.get('pendente') && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
                Cadastro enviado! Aguarde aprovação da direção.
              </div>
            )}
            {searchParams.get('conta_criada') && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
                Conta criada com sucesso! Faça seu primeiro acesso abaixo.
              </div>
            )}
            {searchParams.get('senha_redefinida') && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
                Senha redefinida! Entre com a nova senha.
              </div>
            )}

            <div>
              <label htmlFor="login-identificador" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                E-mail, matrícula ou CPF
              </label>
              <input
                id="login-identificador"
                name="email"
                type="text"
                required
                autoComplete="username"
                value={identificador}
                onChange={e => setIdentificador(e.target.value)}
                placeholder="seu@email.com, matrícula ou CPF"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-escola-azul transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link href="/admin/recuperar-senha" className="text-xs text-escola-azul hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center border-t border-gray-100 pt-4">
            <p className="text-gray-500 text-sm">
              Não tem conta?{' '}
              <Link href="/admin/cadastro" className="text-escola-azul font-semibold hover:underline">
                Cadastrar-se
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-mono">
          Escola Estadual Dr. João Beraldo · Carlos Chagas, MG
        </p>
      </div>
    </div>
  )
}
