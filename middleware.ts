import { NextResponse, type NextRequest } from 'next/server'

/**
 * Desvio de quem não tem sessão para a tela de entrada.
 *
 * Aqui só olhamos se o cookie existe. O middleware roda no runtime Edge, onde
 * o Prisma não alcança o banco — então não dá para conferir se o token é
 * válido, nem se expirou.
 *
 * Isso é suficiente porque este middleware nunca foi a autorização de nada:
 * toda página do painel passa por `getProfileOrRedirect`, e toda rota de API
 * por `lib/apiGestao`, que leem a sessão de verdade no banco. Um cookie
 * inventado passa por aqui e é recusado uma camada abaixo — só não gasta um
 * redirect no caminho.
 */

const COOKIE_DE_SESSAO = 'jb_sessao'

const PUBLICAS = [
  '/admin',
  '/admin/cadastro',
  '/admin/recuperar-senha',
  '/admin/redefinir-senha',
  '/admin/convite',
]

export function middleware(request: NextRequest) {
  const temCookie = Boolean(request.cookies.get(COOKIE_DE_SESSAO)?.value)

  if (!PUBLICAS.includes(request.nextUrl.pathname) && !temCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
