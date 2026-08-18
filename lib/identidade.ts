import { limparCPF, validarCPF } from '@/lib/cpf'
import { normalizarMatricula } from '@/lib/matricula'
import { contaDoCpf } from '@/lib/db/identidades'
import { contaDaMatricula, contaDoEmailDaFicha } from '@/lib/db/alunos'
import { emailDaConta } from '@/lib/auth/sessao'

/**
 * Resolve um identificador de login (email, CPF ou matricula) para o email da
 * conta. Retorna null se nao encontrar.
 *
 * ATENCAO ao caso do email: quando nao ha conta com aquele endereco, o valor e
 * devolvido como esta, em vez de retornar null. E proposital — a resposta ao
 * usuario precisa ser generica, senao a tela vira um verificador de quais
 * emails estao cadastrados.
 *
 * O custo disso apareceu em agosto de 2026: dois alunos nao conseguiam entrar
 * porque digitavam um email parecido, mas nao igual, ao da conta ("lilian."
 * com ponto contra "lilian" sem). O Supabase respondia "credenciais
 * invalidas", igual a senha errada, e o log registrava como senha_incorreta.
 * A rota de login agora grava o email resolvido (mascarado) junto do erro,
 * para que a proxima vez seja diagnosticavel em minutos.
 *
 * Em 18/08/2026 apareceu a outra metade do problema: o aluno digita o email
 * INSTITUCIONAL (@aluno.mg.gov.br), que e o que a escola deu a ele e o que
 * esta na ficha, enquanto a conta foi criada com o email pessoal. Por isso o
 * email agora tambem e procurado em `alunos.email` antes de desistir. Isso nao
 * revela nada a mais: quem digita email inexistente continua recebendo a mesma
 * mensagem generica de quem erra a senha.
 */
export async function resolverEmail(identificador: string): Promise<string | null> {
  const valor = identificador.trim()
  if (!valor) return null

  if (valor.includes('@')) {
    const email = valor.toLowerCase()

    // O e-mail da ficha (institucional) resolve para a conta de login, que
    // pode ter sido criada com outro endereco.
    const userId = await contaDoEmailDaFicha(email)
    if (userId) {
      const daConta = await emailDaConta(userId)
      if (daConta) return daConta
    }

    return email
  }

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
