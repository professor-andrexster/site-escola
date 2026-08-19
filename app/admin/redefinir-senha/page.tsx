'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-escola-azul transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

// Destino do link "esqueci minha senha" enviado por email.
// O link traz ?token=, sorteado no servidor e guardado como hash. Ele não abre
// sessão nenhuma: só a rota de redefinição o aceita, uma vez só, e a pessoa
// entra de novo com a senha nova.
export default function RedefinirSenhaPage() {
  const [pronto, setPronto] = useState(false)
  const [token, setToken] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '')
    setPronto(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setLoading(true)
    setErro('')

    const res = await fetch('/api/auth/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senha: novaSenha }),
    })
    if (!res.ok) {
      setErro((await res.json().catch(() => ({}))).error ?? 'Erro ao redefinir a senha.')
      setLoading(false)
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
          <h1 className="font-playfair text-white font-black text-2xl">Nova Senha</h1>
          <p className="text-white/55 text-sm font-mono mt-1">E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-elevation-high overflow-hidden">
          {!pronto ? (
            <p className="p-6 text-sm text-gray-500 text-center">Verificando o link...</p>
          ) : !token ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Este link não está completo. Peça uma nova redefinição de senha.
              </p>
              <Link href="/admin/recuperar-senha" className="inline-block text-sm text-escola-azul font-semibold hover:underline">
                Pedir um novo link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="nova-senha" className={labelClass}>Nova Senha</label>
                <div className="relative">
                  <input
                    id="nova-senha" type={mostrar ? 'text' : 'password'} required value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={cn(inputClass, 'pr-11')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(!mostrar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
                    aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmar-senha" className={labelClass}>Confirmar Nova Senha</label>
                <input
                  id="confirmar-senha" type={mostrar ? 'text' : 'password'} required value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a senha nova"
                  className={inputClass}
                />
              </div>

              {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-escola-azul-medio transition-colors disabled:opacity-50 text-sm foco-painel"
              >
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
