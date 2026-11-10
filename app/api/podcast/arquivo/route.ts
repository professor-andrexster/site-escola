import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { caminhoDaAutorizacao, caminhoDoTermoEntrevistado } from '@/lib/podcast/dados'
import { caminhoPrivado, mimeDoDocumento } from '@/lib/podcast/arquivos'
import { erro, exigirModerador } from '@/lib/podcast/api'

/** Termo assinado (pasta privada). Só monitor do podcast ou direção. ?membro=<id> ou ?episodio=<id> */
export async function GET(request: Request) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const url = new URL(request.url)
  const membro = url.searchParams.get('membro')
  const episodio = url.searchParams.get('episodio')
  const relativo = membro ? await caminhoDaAutorizacao(membro) : episodio ? await caminhoDoTermoEntrevistado(episodio) : null
  if (!relativo) return erro('Arquivo não encontrado.', 404)
  const absoluto = caminhoPrivado(relativo)
  if (!absoluto) return erro('Arquivo não encontrado.', 404)
  try {
    const bytes = await readFile(absoluto)
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': mimeDoDocumento(relativo),
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return erro('Arquivo não encontrado no disco.', 404)
  }
}
