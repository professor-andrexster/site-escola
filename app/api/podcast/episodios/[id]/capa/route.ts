import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buscarEpisodio, definirCapa } from '@/lib/podcast/dados'
import { gravarCapa } from '@/lib/podcast/arquivos'
import { erro, exigirAcesso, podeEditar } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

interface Ctx { params: Promise<{ id: string }> }

/** Foto de capa do episódio (opcional). Substitui a anterior. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso)) return erro('Você não pode mudar a capa deste episódio agora.', 403)
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('A imagem não chegou. Escolha de novo.')
  const g = await gravarCapa(arquivo).catch((e: unknown) => {
    console.error('[podcast] falha ao gravar capa', e)
    return { erro: 'O servidor não conseguiu guardar a imagem. Ela continua no seu aparelho: tente de novo em instantes.' }
  })
  if ('erro' in g) return erro(g.erro)
  try {
    const linha = await definirCapa(id, g.caminho)
    await auditar({ atorId: r.acesso.userId, acao: 'capa.enviada', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
    if (ep.status === 'publicado') revalidatePath('/', 'layout')
    const novo = await buscarEpisodio(id)
    return NextResponse.json({ ok: true, capaUrl: novo?.capaUrl ?? null, atualizadoEm: linha.atualizado_em.toISOString() })
  } catch (e) {
    console.error('[podcast/capa]', e)
    return erro('A imagem subiu, mas não consegui ligar ao episódio. Tente de novo.', 500)
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso)) return erro('Você não pode mudar a capa deste episódio agora.', 403)
  const linha = await definirCapa(id, null)
  await auditar({ atorId: r.acesso.userId, acao: 'capa.removida', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
  if (ep.status === 'publicado') revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true, atualizadoEm: linha.atualizado_em.toISOString() })
}
