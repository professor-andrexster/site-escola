'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { formatarCPF } from '@/lib/cpf'
import { cn } from '@/lib/utils'

const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-escola-azul transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

export default function ConvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()

  const [carregando, setCarregando] = useState(true)
  const [convite, setConvite] = useState<{ nome: string; email: string } | null>(null)
  const [erroConvite, setErroConvite] = useState('')

  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      if (!token) {
        setErroConvite('Link de convite incompleto.')
        setCarregando(false)
        return
      }
      const res = await fetch(`/api/convites/bibliotecario/aceitar?token=${encodeURIComponent(token)}`)
      const json = await res.json()
      if (!res.ok) {
        setErroConvite(json.error ?? 'Convite inválido.')
      } else {
        setConvite(json)
      }
      setCarregando(false)
    }
    carregar()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setEnviando(true)
    setErro('')

    const res = await fetch('/api/convites/bibliotecario/aceitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senha, cpf: cpf || undefined }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao ativar a conta. Tente novamente.')
      setEnviando(false)
      return
    }

    router.push('/admin?senha_redefinida=1')
  }

  return (
    <div className="min-h-screen bg-escola-marinho flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative inline-block w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20 shadow-elevation-low mb-4">
            <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="56px" className="object-cover" priority />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Convite de Acesso</h1>
          <p className="text-white/40 text-sm font-mono mt-1">Biblioteca · E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-elevation-high overflow-hidden">
          {carregando ? (
            <p className="p-6 text-sm text-gray-400 text-center">Verificando o convite...</p>
          ) : erroConvite ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-gray-600">{erroConvite}</p>
              <Link href="/admin" className="inline-block text-sm text-escola-azul font-semibold hover:underline">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Olá, <strong>{convite?.nome}</strong>. Crie sua senha para ativar o acesso da conta{' '}
                <strong>{convite?.email}</strong> ao sistema da biblioteca.
              </p>

              <div>
                <label htmlFor="convite-cpf" className={labelClass}>CPF (opcional)</label>
                <input
                  id="convite-cpf" type="text" inputMode="numeric" value={cpf}
                  onChange={e => setCpf(formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-400 mt-1">Ajuda a recuperar sua conta se você perder o acesso ao seu email.</p>
              </div>

              <div>
                <label htmlFor="convite-senha" className={labelClass}>Senha</label>
                <div className="relative">
                  <input
                    id="convite-senha" type={mostrar ? 'text' : 'password'} required value={senha}
                    onChange={e => setSenha(e.target.value)}
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
                <label htmlFor="convite-confirmar" className={labelClass}>Confirmar Senha</label>
                <input
                  id="convite-confirmar" type={mostrar ? 'text' : 'password'} required value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a senha"
                  className={inputClass}
                />
              </div>

              {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-escola-azul-medio transition-colors disabled:opacity-50 text-sm"
              >
                {enviando ? 'Ativando...' : 'Ativar Minha Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
