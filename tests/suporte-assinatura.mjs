/**
 * Teste puro de lib/suporte/assinatura.ts — sem banco, sem rede.
 *   npx tsx tests/suporte-assinatura.mjs
 *
 * O que precisa valer: a assinatura é determinística para o mesmo
 * (segredo, usuarioId, dia), muda se qualquer um dos três mudar, e
 * `diaSaoPaulo` usa o fuso de São Paulo — não o fuso local do processo nem
 * UTC, que na virada da noite já seria o dia seguinte em SP.
 */
import { assinarChamados, diaSaoPaulo } from '../lib/suporte/assinatura.ts'

let falhas = 0
const ok = (r, cond, x = '') => { console.log(`${cond ? 'ok   ' : 'FALHA'} ${r}${x ? ' — ' + x : ''}`); if (!cond) falhas++ }
const eq = (rotulo, obtido, esperado) =>
  ok(rotulo, obtido === esperado, obtido === esperado ? '' : `obtido "${obtido}", esperado "${esperado}"`)

console.log('== diaSaoPaulo ==')
eq('formato YYYY-MM-DD', diaSaoPaulo(new Date('2026-01-15T12:00:00Z')), '2026-01-15')
eq('meia-noite UTC ainda é o dia anterior em SP (UTC-3)', diaSaoPaulo(new Date('2026-01-15T02:00:00Z')), '2026-01-14')
eq('22h em SP (01h UTC do dia seguinte) já virou o próximo dia', diaSaoPaulo(new Date('2026-01-16T01:00:00Z')), '2026-01-15')

console.log('\n== assinarChamados ==')
const segredo = 'segredo-de-teste-48-caracteres-abcdefghijklmno'
const a1 = assinarChamados(segredo, 'user-1', '2026-01-15')
const a2 = assinarChamados(segredo, 'user-1', '2026-01-15')
eq('determinística para a mesma entrada', a1, a2)
ok('não é vazia', a1.length > 0)
ok('base64url — sem "+", "/" ou "="', !/[+/=]/.test(a1), a1)

const diferenteUsuario = assinarChamados(segredo, 'user-2', '2026-01-15')
ok('muda com o usuário', diferenteUsuario !== a1)

const diferenteDia = assinarChamados(segredo, 'user-1', '2026-01-16')
ok('muda com o dia', diferenteDia !== a1)

const diferenteSegredo = assinarChamados('outro-segredo', 'user-1', '2026-01-15')
ok('muda com o segredo', diferenteSegredo !== a1)

const semDiaExplicito = assinarChamados(segredo, 'user-1')
ok('dia default não quebra (usa diaSaoPaulo() atual)', typeof semDiaExplicito === 'string' && semDiaExplicito.length > 0)

console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\ntodas as verificações passaram')
process.exit(falhas ? 1 : 0)
