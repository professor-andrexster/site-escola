import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { contaDoCpf } from '@/lib/db/identidades'
import { contaDaMatricula } from '@/lib/db/alunos'
import { emailDaConta } from '@/lib/auth/sessao'

/**
 * Resolve um identificador de login (email, CPF ou matricula) para o email da
 * conta. Retorna null se nao encontrar.
 *
 * ATENCAO ao primeiro caso: se o valor tem "@", ele e devolvido como esta, sem
 * conferir se existe conta com aquele endereco. E proposital — a resposta ao
 * usuario precisa ser generica, senao a tela vira um verificador de quais
 * emails estao cadastrados.
 *
 * O custo disso apareceu em agosto de 2026: dois alunos nao conseguiam entrar
 * porque digitavam um email parecido, mas nao igual, ao da conta ("lilian."
 * com ponto contra "lilian" sem). O Supabase respondia "credenciais
 * invalidas", igual a senha errada, e o log registrava como senha_incorreta.
 * A rota de login agora grava o email resolvido (mascarado) junto do erro,
 * para que a proxima vez seja diagnosticavel em minutos.
 */
export async function resolverEmail(identificador: string): Promise<string | null> {
  const valor = identificador.trim()
  if (!valor) return null

  if (valor.includes('@')) return valor.toLowerCase()

  const digitos = limparCPF(valor)

  // CPF valido -> identidades.cpf -> email da conta
  if (digitos.length === 11 && validarCPF(digitos)) {
    const userId = await contaDoCpf(digitos)
    if (userId) {
      const email = await emailDaConta(userId)
      if (email) return email
    }
  }

  // Matricula -> alunos.user_id -> email da conta
  const userId = await contaDaMatricula(normalizarMatricula(valor))
  return userId ? emailDaConta(userId) : null
}

/** Mascara um identificador sensivel para registro em log (CPF nunca inteiro). */
export function mascararIdentificador(identificador: string): string {
  const digitos = limparCPF(identificador)
  if (digitos.length === 11 && !identificador.includes('@')) {
    return `cpf ***${digitos.slice(-4)}`
  }
  return identificador.trim()
}
