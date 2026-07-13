import type { SupabaseClient } from '@supabase/supabase-js'
import { limparCPF, validarCPF } from '@/lib/cpf'

/**
 * Resolve um identificador de login (email, CPF ou matrícula) para o email
 * da conta. Usar sempre com o admin client (service role) — consulta colunas
 * protegidas. Retorna null se não encontrar.
 */
export async function resolverEmail(admin: SupabaseClient, identificador: string): Promise<string | null> {
  const valor = identificador.trim()
  if (!valor) return null

  if (valor.includes('@')) return valor.toLowerCase()

  const digitos = limparCPF(valor)

  // CPF válido → identidades.cpf → email da conta
  if (digitos.length === 11 && validarCPF(digitos)) {
    const { data } = await admin.from('identidades').select('user_id').eq('cpf', digitos).maybeSingle()
    if (data?.user_id) {
      const email = await emailDoUsuario(admin, data.user_id)
      if (email) return email
    }
  }

  // Matrícula → alunos.user_id → email da conta
  const { data: aluno } = await admin.from('alunos').select('user_id').eq('matricula', valor).maybeSingle()
  if (aluno?.user_id) return emailDoUsuario(admin, aluno.user_id)

  return null
}

/** Mascara um identificador sensível para registro em log (CPF nunca inteiro). */
export function mascararIdentificador(identificador: string): string {
  const digitos = limparCPF(identificador)
  if (digitos.length === 11 && !identificador.includes('@')) {
    return `cpf ***${digitos.slice(-4)}`
  }
  return identificador.trim()
}

async function emailDoUsuario(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await admin.auth.admin.getUserById(userId)
  return data.user?.email ?? null
}
