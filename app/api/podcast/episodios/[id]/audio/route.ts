import { NextResponse } from 'next/server'
import { buscarEpisodio, definirAudio } from '@/lib/podcast/dados'
import { gravarAudio } from '@/lib/podcast/arquivos'
import { erro, exigirAcesso, podeEditar } from '@/lib/podcast/api'

interface Ctx { params: Promise<{ id: string }> }

/** Sobe o áudio do episódio (gravado no site ou arquivo pronto). Substitui o anterior. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso)) return erro('Você não pode mudar o áudio deste episódio agora.', 403)
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('O áudio não chegou. Tente de novo.')
  const g = await gravarAudio(arquivo)
  if ('erro' in g) return erro(g.erro)
  try {
    await definirAudio(id, g.url, g.bytes)
    return NextResponse.json({ ok: true, audioUrl: g.url, audioBytes: g.bytes })
  } catch (e) {
    console.error('[podcast/audio]', e)
    return erro('O áudio subiu, mas não consegui ligar ao episódio. Tente de novo.', 500)
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso) || ep.status === 'publicado') return erro('Não dá para tirar o áudio agora.', 403)
  await definirAudio(id, null, null)
  return NextResponse.json({ ok: true })
}
