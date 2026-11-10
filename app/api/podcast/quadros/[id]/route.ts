import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { atualizarQuadro, buscarQuadro, moverQuadro, removerQuadro } from '@/lib/podcast/dados'
import { erro, exigirModerador, texto } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

interface Ctx { params: Promise<{ id: string }> }

/** Edita nome/ideia, ativa/desativa ou move (mover: 'cima' | 'baixo'). */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const q = await buscarQuadro(id)
  if (!q) return erro('Quadro não encontrado.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  try {
    if (b.mover === 'cima' || b.mover === 'baixo') {
      await moverQuadro(id, b.mover)
    } else {
      const c: { nome?: string; ideia?: string | null; ativo?: boolean } = {}
      if (b.nome !== undefined) {
        const nome = texto(b.nome, 60)
        if (!nome || nome.length < 3) return erro('O nome precisa de pelo menos 3 letras.')
        c.nome = nome
      }
      if (b.ideia !== undefined) c.ideia = texto(b.ideia, 240)
      if (typeof b.ativo === 'boolean') c.ativo = b.ativo
      if (Object.keys(c).length === 0) return erro('Nada para mudar.')
      await atualizarQuadro(id, c)
      if (c.ativo !== undefined && c.ativo !== q.ativo) {
        await auditar({ atorId: r.acesso.userId, acao: c.ativo ? 'quadro.ativado' : 'quadro.desativado', alvoTipo: 'quadro', alvoId: id, alvoNome: q.nome })
      }
      if (c.nome !== undefined || c.ideia !== undefined) {
        await auditar({ atorId: r.acesso.userId, acao: 'quadro.editado', alvoTipo: 'quadro', alvoId: id, alvoNome: c.nome ?? q.nome, detalhe: c.nome && c.nome !== q.nome ? `antes: ${q.nome}` : null })
      }
    }
    // O nome do quadro aparece na capa dos episódios, no site todo.
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[podcast/quadros/id]', e)
    return erro('Não consegui salvar o quadro. Tente de novo.', 500)
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const q = await buscarQuadro(id)
  if (!q) return erro('Quadro não encontrado.', 404)
  const res = await removerQuadro(id)
  if ('erro' in res) return erro(res.erro, 409)
  await auditar({ atorId: r.acesso.userId, acao: 'quadro.removido', alvoTipo: 'quadro', alvoId: id, alvoNome: q.nome })
  revalidatePath('/podcast')
  return NextResponse.json({ ok: true })
}
