import { NextResponse } from 'next/server'
import { criarEpisodio } from '@/lib/podcast/dados'
import { alunoLiberado, erro, exigirAcesso, texto } from '@/lib/podcast/api'
import { QUADROS } from '@/lib/podcast/tipos'

/** Começa um episódio (rascunho). Aluno liberado ou monitor. */
export async function POST(request: Request) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  if (!a.moderador && !alunoLiberado(a)) {
    return erro(
      a.membro?.papel === 'aluno'
        ? 'Você ainda não pode criar episódio: falta a autorização do seu responsável ser aceita pelo monitor.'
        : 'Só quem está na equipe do podcast cria episódio.',
      403
    )
  }
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const titulo = texto(b.titulo, 140)
  if (!titulo || titulo.length < 4) return erro('Dê um título ao episódio (pode mudar depois).')
  const tipo = b.tipo === 'materia' ? 'materia' : 'entrevista'
  const quadro = QUADROS.some(q => q.chave === b.quadro) ? (b.quadro as string) : null
  try {
    const ep = await criarEpisodio(a.userId, { titulo, tipo, quadro })
    return NextResponse.json({ ok: true, id: ep.id })
  } catch (e) {
    console.error('[podcast/episodios]', e)
    return erro('Não consegui criar o episódio. Tente de novo.', 500)
  }
}
