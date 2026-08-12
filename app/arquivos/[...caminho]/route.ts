import { NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { Readable } from 'stream'
import { caminhoNoDisco, ehAnexo, tipoDeConteudo } from '@/lib/storage/arquivos'

/**
 * Entrega os arquivos enviados pelo site.
 *
 * Existe para o sistema funcionar sem depender do nginx. Na virada (fase 7) o
 * nginx passa a servir `/arquivos` direto do disco, que é mais rápido — e como
 * o prefixo é o mesmo, nenhuma URL já gravada no banco precisa mudar.
 *
 * Público de propósito: capa de curso, foto de notícia e imagem de projeto
 * aparecem no site aberto, como apareciam no bucket público do Supabase.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caminho: string[] }> }
) {
  const { caminho } = await params

  const absoluto = caminhoNoDisco(caminho)
  if (!absoluto) return new NextResponse('Não encontrado.', { status: 404 })

  try {
    const info = await stat(absoluto)
    if (!info.isFile()) return new NextResponse('Não encontrado.', { status: 404 })

    const relativo = caminho.join('/')
    const stream = Readable.toWeb(createReadStream(absoluto)) as ReadableStream

    return new NextResponse(stream, {
      headers: {
        'Content-Type': tipoDeConteudo(relativo),
        'Content-Length': String(info.size),
        // Entrega de desafio é arquivo arbitrário: baixa, nunca abre no
        // navegador. Sem isto, um HTML enviado como entrega rodaria no
        // domínio da escola, com acesso aos cookies de quem abrisse.
        ...(ehAnexo(relativo) ? { 'Content-Disposition': 'attachment' } : {}),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Não encontrado.', { status: 404 })
  }
}
