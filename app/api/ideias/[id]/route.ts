import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { mudarStatusDaIdeia } from '@/lib/db/comunidade'

const STATUS = ['nova', 'em_analise', 'adotada', 'arquivada']

/**
 * Muda o status da ideia. Moderar e de professor, monitor ou gestao — era o
 * `podeModerar` que a tela usava so para decidir se mostrava o seletor.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res
  const { id } = await params

  const { status } = (await request.json()) as { status?: string }
  if (!status || !STATUS.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  try {
    await mudarStatusDaIdeia(id, status)
    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error('[ideias/:id] falha ao mudar status', erro)
    return NextResponse.json({ error: 'Erro ao mudar o status.' }, { status: 400 })
  }
}
