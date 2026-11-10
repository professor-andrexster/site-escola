import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buscarEpisodio, marcarTranscricao, salvarTranscricao } from '@/lib/podcast/dados'
import { erro, exigirModerador } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'
import { transcreverEmSegundoPlano, transcricaoConfigurada } from '@/lib/podcast/transcrever'

interface Ctx { params: Promise<{ id: string }> }

/** Monitor pede a transcrição automática. Só de episódio publicado. Responde na hora; o texto chega depois. */
export async function POST(_request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (ep.status !== 'publicado') return erro('A transcrição automática só roda em episódio publicado (o áudio já está aberto no site).', 409)
  if (!ep.audioUrl) return erro('Este episódio não tem áudio.')
  if (!transcricaoConfigurada()) return erro('A chave de IA não está configurada neste servidor. Você pode escrever a transcrição à mão.', 503)
  if (ep.transcricaoStatus === 'gerando') return erro('Já tem uma transcrição sendo gerada. Espere um minuto.', 409)
  await marcarTranscricao(id, { status: 'gerando' })
  await auditar({ atorId: r.acesso.userId, acao: 'transcricao.pedida', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
  void transcreverEmSegundoPlano(id)
  return NextResponse.json({ ok: true })
}

/** Monitor corrige o texto e/ou decide se aparece no site. Corpo: { texto?, publica? } */
export async function PUT(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const d: { texto?: string | null; publica?: boolean } = {}
  if (b.texto !== undefined) d.texto = typeof b.texto === 'string' && b.texto.trim() ? b.texto.slice(0, 200_000) : null
  if (typeof b.publica === 'boolean') d.publica = b.publica
  if (d.texto === undefined && d.publica === undefined) return erro('Nada para salvar.')
  const textoFinal = d.texto !== undefined ? d.texto : ep.transcricao
  if (d.publica && !textoFinal) return erro('Não há transcrição para mostrar.')
  if (d.texto === null) d.publica = false
  try {
    await salvarTranscricao(id, d)
    if (d.texto !== undefined) await auditar({ atorId: r.acesso.userId, acao: 'transcricao.editada', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
    if (d.publica !== undefined && d.publica !== ep.transcricaoPublica) {
      await auditar({ atorId: r.acesso.userId, acao: d.publica ? 'transcricao.publicada' : 'transcricao.ocultada', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
    }
    revalidatePath(`/podcast/${ep.slug}`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[podcast/transcricao]', e)
    return erro('Não consegui salvar a transcrição. O texto continua na tela, tente de novo.', 500)
  }
}
