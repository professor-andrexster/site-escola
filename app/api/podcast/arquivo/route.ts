import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { buscarEpisodio, buscarMembro, caminhoDaAutorizacao, caminhoDoTermoEntrevistado, listarMembros } from '@/lib/podcast/dados'
import { caminhoPrivado, mimeDoDocumento } from '@/lib/podcast/arquivos'
import { erro, exigirModerador } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

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
    await auditar({
      atorId: r.acesso.userId,
      acao: membro ? 'termo.aberto' : 'termo_entrevistado.aberto',
      alvoTipo: membro ? 'aluno' : 'episodio',
      alvoId: membro ?? episodio,
      alvoNome: await nomeDoAlvo(membro, episodio),
    })
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

async function nomeDoAlvo(membro: string | null, episodio: string | null): Promise<string | null> {
  if (membro) {
    const m = await buscarMembro(membro)
    return m ? (await listarMembros()).find(x => x.id === m.id)?.nome ?? null : null
  }
  return episodio ? (await buscarEpisodio(episodio))?.titulo ?? null : null
}
