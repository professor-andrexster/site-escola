import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { criarQuadro } from '@/lib/podcast/dados'
import { erro, exigirModerador, texto } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

/** Monitor ou direção cria um quadro novo. */
export async function POST(request: Request) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const nome = texto(b.nome, 60)
  if (!nome || nome.length < 3) return erro('Dê um nome ao quadro (pelo menos 3 letras).')
  const ideia = texto(b.ideia, 240)
  try {
    const q = await criarQuadro(nome, ideia, r.acesso.userId)
    if ('erro' in q) return erro(q.erro, 409)
    await auditar({ atorId: r.acesso.userId, acao: 'quadro.criado', alvoTipo: 'quadro', alvoId: q.id, alvoNome: nome, detalhe: ideia })
    revalidatePath('/podcast')
    return NextResponse.json({ ok: true, id: q.id })
  } catch (e) {
    console.error('[podcast/quadros]', e)
    return erro('Não consegui criar o quadro. O que você escreveu continua no formulário, tente de novo.', 500)
  }
}
