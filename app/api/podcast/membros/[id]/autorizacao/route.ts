import { NextResponse } from 'next/server'
import { buscarMembro, registrarAutorizacao } from '@/lib/podcast/dados'
import { gravarDocumento } from '@/lib/podcast/arquivos'
import { erro, exigirModerador } from '@/lib/podcast/api'

interface Ctx { params: Promise<{ id: string }> }

/** Monitor sobe o termo assinado (PDF ou foto). Vai para a pasta privada. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const m = await buscarMembro(id)
  if (!m || m.papel !== 'aluno') return erro('Aluno não encontrado na equipe.', 404)
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('Nenhum arquivo chegou. Escolha o termo de novo.')
  const g = await gravarDocumento(arquivo, 'podcast-autorizacoes')
  if ('erro' in g) return erro(g.erro)
  try {
    await registrarAutorizacao(id, g.caminho)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[podcast/autorizacao]', e)
    return erro('O arquivo subiu, mas não consegui registrar. Tente de novo.', 500)
  }
}
