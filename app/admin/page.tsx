'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { GraduationCap, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('aprovado, role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .maybeSingle()

    if (!profile) {
      setError('Perfil não encontrado. Entre em contato com a direção.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!profile.aprovado) {
      router.push('/admin/pendente')
      return
    }

    router.push('/admin/dashboard')
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

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors"
              />
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
