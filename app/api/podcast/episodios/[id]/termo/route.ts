import { NextResponse } from 'next/server'
import { buscarEpisodio, definirTermoEntrevistado } from '@/lib/podcast/dados'
import { gravarDocumento } from '@/lib/podcast/arquivos'
import { erro, exigirAcesso, podeEditar } from '@/lib/podcast/api'

interface Ctx { params: Promise<{ id: string }> }

/** Termo assinado por quem deu a entrevista. Pasta privada. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!podeEditar(ep, r.acesso)) return erro('Você não pode mexer neste episódio agora.', 403)
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('Nenhum arquivo chegou. Escolha o termo de novo.')
  const g = await gravarDocumento(arquivo, 'podcast-termos')
  if ('erro' in g) return erro(g.erro)
  try {
    await definirTermoEntrevistado(id, g.caminho)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[podcast/termo]', e)
    return erro('O arquivo subiu, mas não consegui registrar. Tente de novo.', 500)
  }
}
