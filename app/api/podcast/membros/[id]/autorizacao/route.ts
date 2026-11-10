import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buscarMembro, nomeDoUsuario, registrarAutorizacao } from '@/lib/podcast/dados'
import { auditar } from '@/lib/podcast/auditoria'
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
  const g = await gravarDocumento(arquivo, 'podcast-autorizacoes').catch((e: unknown) => {
    console.error('[podcast] falha ao gravar arquivo', e)
    return { erro: 'O servidor não conseguiu guardar o arquivo. Ele continua no seu aparelho: tente de novo em instantes.' }
  })
  if ('erro' in g) return erro(g.erro)
  try {
    const retirados = await registrarAutorizacao(id, g.caminho)
    await auditar({ atorId: r.acesso.userId, acao: 'termo.enviado', alvoTipo: 'aluno', alvoId: id, alvoNome: await nomeDoUsuario(m.user_id), detalhe: retirados ? `${retirados} episódio(s) saíram do ar até conferir` : null })
    if (retirados > 0) revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true, retirados })
  } catch (e) {
    console.error('[podcast/autorizacao]', e)
    return erro('O arquivo subiu, mas não consegui registrar. Tente de novo.', 500)
  }
}
