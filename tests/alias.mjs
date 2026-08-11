/**
 * Resolve o atalho `@/` fora do Next.
 *
 * As suites antigas montavam o PrismaClient na mao e falavam com o banco
 * direto, entao nunca esbarraram nisso. A partir da fase 4 elas importam os
 * modulos de verdade (lib/auth, lib/db), e esses usam `@/lib/...` — que o
 * Node nao conhece, so o tsconfig e o bundler do Next.
 *
 * Registrado por tests/rodar.mjs com --import.
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./alias-hook.mjs', pathToFileURL('./tests/'))
