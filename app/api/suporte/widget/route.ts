import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { buscarPorId } from '@/lib/db/perfis'
import { isEquipe } from '@/lib/roles'
import { assinarChamados } from '@/lib/suporte/assinatura'

/**
 * Dados para o botão "Chamados" (widget do Bussola) no painel administrativo.
 *
 * Só a equipe (`isEquipe`) recebe os dados do widget — aluno recebe 204 e o
 * script do Bussola nunca carrega. A assinatura é calculada aqui, no
 * servidor: `CHAMADOS_SEGREDO` nunca vai para o cliente.
 */
export async function GET() {
  const user = await usuarioAtual()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await buscarPorId(user.id)
  if (!perfil?.aprovado) {
    return NextResponse.json({ error: 'Perfil não aprovado.' }, { status: 403 })
  }

  const chave = process.env.CHAMADOS_CHAVE
  const segredo = process.env.CHAMADOS_SEGREDO
  if (!isEquipe(perfil.role) || !chave || !segredo) {
    return new NextResponse(null, { status: 204 })
  }

  const assinatura = assinarChamados(segredo, perfil.id)

  return NextResponse.json(
    {
      sistema: chave,
      usuarioId: perfil.id,
      nome: perfil.nome_completo,
      email: perfil.email,
      papel: perfil.role,
      assinatura,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
