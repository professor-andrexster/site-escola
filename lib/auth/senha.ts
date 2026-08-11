import bcrypt from 'bcryptjs'

/**
 * Hash de senha.
 *
 * bcrypt, e nao argon2, por um motivo especifico desta migracao: o Supabase
 * guardava as senhas em bcrypt. Os hashes exportados de `auth.users` entram
 * direto em `usuarios.encrypted_password` e continuam validando aqui — ninguem
 * precisa trocar de senha na virada.
 *
 * O custo 10 e o mesmo que o Supabase usava, entao hash antigo e hash novo
 * levam o mesmo tempo para conferir.
 */
const CUSTO = 10

export async function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO)
}

export async function conferir(senha: string, hash: string): Promise<boolean> {
  // O bcryptjs recusa hash malformado com excecao; aqui isso e so "nao bate".
  try {
    return await bcrypt.compare(senha, hash)
  } catch {
    return false
  }
}

/**
 * Consome o mesmo tempo de um bcrypt real.
 *
 * Sem isto, uma conta inexistente responde muito mais rapido que uma com senha
 * errada, e da para descobrir quais e-mails existem so cronometrando o login.
 */
export async function gastarTempoDeHash(): Promise<void> {
  await bcrypt.compare(
    'senha-que-nao-existe',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
  )
}

/**
 * Regra minima de senha. Ate agora ela estava repetida em seis lugares
 * (cadastro de aluno, de professor, convite, criacao pela gestao, recuperacao
 * por CPF e a tela de cadastro), todos com o mesmo "pelo menos 6 caracteres".
 *
 * O minimo continua 6: endurecer a regra e decisao da direcao, nao efeito
 * colateral de trocar de provedor de autenticacao. Agora esta em um lugar so,
 * entao subir para 8 com letra e numero e uma linha aqui.
 */
export const MINIMO_DE_SENHA = 6

export function senhaFraca(senha: string): string | null {
  if (senha.length < MINIMO_DE_SENHA) {
    return `A senha deve ter pelo menos ${MINIMO_DE_SENHA} caracteres.`
  }
  return null
}
