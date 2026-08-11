/**
 * Autenticacao propria (fase 4), contra o MariaDB.
 *
 * Diferente das outras suites, esta importa os modulos de verdade
 * (lib/auth/senha, lib/db/sessoes) em vez de falar com o banco na mao: o que
 * precisa ser protegido aqui e o comportamento deles, nao o do banco. O
 * atalho `@/` e resolvido por tests/alias.mjs.
 *
 * O que estes testes seguram: o token nunca fica em claro no banco, sessao
 * revogada/expirada nao passa, conta bloqueada derruba a sessao em curso,
 * trocar a senha derruba todos os dispositivos, e o link de redefinicao serve
 * uma vez so.
 */
import { prisma } from '@/lib/db'
import { conferir, gerarHash, senhaFraca } from '@/lib/auth/senha'
import {
  abrirSessao,
  consumirTokenDeSenha,
  criarTokenDeSenha,
  hashDoToken,
  revogarSessao,
  revogarSessoesDoUsuario,
  sessaoValida,
  sortearToken,
  tokenDeSenhaValido,
} from '@/lib/db/sessoes'

const EMAIL = 'teste-auth@exemplo.invalido'
let falhas = 0
const ok = (rotulo, cond, extra = '') => {
  console.log(`${cond ? 'ok   ' : 'FALHA'} ${rotulo}${extra ? ' — ' + extra : ''}`)
  if (!cond) falhas++
}

const limpar = () => prisma.usuarios.deleteMany({ where: { email: EMAIL } })

async function contaNova() {
  await limpar()
  return prisma.usuarios.create({
    data: { email: EMAIL, encrypted_password: await gerarHash('senha123') },
    select: { id: true },
  })
}

try {
  await limpar()

  // ------------------------------------------------------------- senha
  const hash = await gerarHash('senha123')
  ok('bcrypt gera hash diferente da senha', hash !== 'senha123')
  ok('hash confere com a senha certa', await conferir('senha123', hash))
  ok('hash recusa a senha errada', !(await conferir('senha124', hash)))
  ok('hash malformado nao explode, so nao bate', !(await conferir('senha123', 'nao-e-hash')))
  ok('senha curta e recusada pela regra unica', Boolean(senhaFraca('12345')) && senhaFraca('123456') === null)

  // ------------------------------------------------------------ sessao
  const conta = await contaNova()

  const token = sortearToken()
  await abrirSessao({ usuarioId: conta.id, token })

  const linha = await prisma.sessoes.findFirst({ where: { usuario_id: conta.id } })
  ok('o banco guarda o HASH do token, nunca o token',
     linha.token_hash !== token && linha.token_hash === hashDoToken(token))

  const viva = await sessaoValida(token)
  ok('sessao valida devolve o usuario', viva?.usuario.id === conta.id)

  await revogarSessao(token)
  ok('sessao revogada nao passa', (await sessaoValida(token)) === null)

  const vencido = sortearToken()
  await abrirSessao({ usuarioId: conta.id, token: vencido })
  await prisma.sessoes.updateMany({
    where: { token_hash: hashDoToken(vencido) },
    data: { expira_em: new Date(Date.now() - 1000) },
  })
  ok('sessao expirada nao passa', (await sessaoValida(vencido)) === null)

  const doBloqueado = sortearToken()
  await abrirSessao({ usuarioId: conta.id, token: doBloqueado })
  await prisma.usuarios.update({
    where: { id: conta.id },
    data: { banned_until: new Date(Date.now() + 60_000) },
  })
  ok('conta bloqueada derruba a sessao em curso', (await sessaoValida(doBloqueado)) === null)
  await prisma.usuarios.update({ where: { id: conta.id }, data: { banned_until: null } })

  const a = sortearToken()
  const b = sortearToken()
  await abrirSessao({ usuarioId: conta.id, token: a })
  await abrirSessao({ usuarioId: conta.id, token: b })
  await revogarSessoesDoUsuario(conta.id)
  ok('revogar todas derruba os dois dispositivos',
     (await sessaoValida(a)) === null && (await sessaoValida(b)) === null)

  // -------------------------------------------------- token de redefinicao
  const antigo = sortearToken()
  await criarTokenDeSenha(conta.id, antigo)
  ok('token de senha recem-criado vale', Boolean(await tokenDeSenhaValido(antigo)))

  const novo = sortearToken()
  await criarTokenDeSenha(conta.id, novo)
  ok('pedir outro link invalida o anterior', (await tokenDeSenhaValido(antigo)) === null)

  const registro = await tokenDeSenhaValido(novo)
  await consumirTokenDeSenha(registro.id)
  ok('token de senha serve uma vez so', (await tokenDeSenhaValido(novo)) === null)

  // Sessao cai por cascata quando a conta e apagada.
  await prisma.usuarios.delete({ where: { id: conta.id } })
  ok('apagar a conta leva as sessoes junto',
     (await prisma.sessoes.count({ where: { usuario_id: conta.id } })) === 0)
} finally {
  await limpar()
  const sobrou = await prisma.usuarios.count({ where: { email: EMAIL } })
  ok('banco limpo ao final', sobrou === 0, `${sobrou} conta(s)`)
  await prisma.$disconnect()
}
process.exit(falhas ? 1 : 0)
