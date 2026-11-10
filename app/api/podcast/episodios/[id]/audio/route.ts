import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buscarEpisodio, definirAudio } from '@/lib/podcast/dados'
import { gravarAudio } from '@/lib/podcast/arquivos'
import { erro, exigirAcesso, podeAudio, podeEditar } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

interface Ctx { params: Promise<{ id: string }> }

/** Sobe o áudio do episódio (gravado no site ou arquivo pronto). Substitui o anterior. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const acesso = r.acesso
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso)) return erro('Você não pode mudar o áudio deste episódio agora.', 403)
  if (!podeAudio(r.acesso)) return erro('Você ainda não tem permissão para gravar áudio. Peça ao monitor.', 403)
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('O áudio não chegou. Tente de novo.')
  const g = await gravarAudio(arquivo).catch((e: unknown) => {
    console.error('[podcast] falha ao gravar arquivo', e)
    return { erro: 'O servidor não conseguiu guardar o arquivo. Ele continua no seu aparelho: tente de novo em instantes.' }
  })
  if ('erro' in g) return erro(g.erro)
  try {
    const r = await definirAudio(id, g.caminho, g.bytes)
    await auditar({ atorId: acesso.userId, acao: 'audio.enviado', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo, detalhe: `${Math.round(g.bytes / 1024)} KB` })
    if (ep.status === 'publicado') revalidatePath('/', 'layout')
    return NextResponse.json({
      ok: true,
      audioUrl: `/api/podcast/audio/${id}?v=${g.bytes}`,
      audioBytes: g.bytes,
      atualizadoEm: r.atualizado_em.toISOString(),
    })
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
  await auditar({ atorId: r.acesso.userId, acao: 'audio.removido', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
  return NextResponse.json({ ok: true })
}
