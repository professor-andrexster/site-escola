'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-escola-azul transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

// Destino do link "esqueci minha senha" enviado por email.
// O @supabase/ssr troca o código da URL por uma sessão de recuperação;
// aqui o usuário define a senha nova.
export default function RedefinirSenhaPage() {
  const [pronto, setPronto] = useState(false)
  const [sessaoValida, setSessaoValida] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function verificar() {
      // O link pode vir com ?code= (PKCE): troca por sessão antes de conferir
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
      const { data: { session } } = await supabase.auth.getSession()
      setSessaoValida(!!session)
      setPronto(true)
    }
    verificar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (novaSenha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      setErro('Erro ao redefinir a senha. O link pode ter expirado — peça um novo.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/admin?senha_redefinida=1')
  }

  return (
    <div className="min-h-screen bg-[#0d1f35] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-escola-vermelho mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-playfair text-white font-black text-2xl">Nova Senha</h1>
          <p className="text-white/40 text-sm font-mono mt-1">E.E. Dr. João Beraldo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {!pronto ? (
            <p className="p-6 text-sm text-gray-400 text-center">Verificando o link...</p>
          ) : !sessaoValida ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Este link expirou ou já foi usado.
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
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
