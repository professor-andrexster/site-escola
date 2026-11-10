import { NextResponse } from 'next/server'
import { criarEpisodio, quadroValido } from '@/lib/podcast/dados'
import { alunoLiberado, erro, exigirAcesso, podeAudio, texto } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'

/** Começa um episódio (rascunho). Aluno liberado ou monitor. */
export async function POST(request: Request) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  if (!a.moderador && !alunoLiberado(a)) {
    const m = a.membro
    return erro(
      m?.papel !== 'aluno'
        ? 'Só quem está na equipe do podcast cria episódio.'
        : !m.liberado
          ? 'Você ainda não pode criar episódio: falta a autorização do seu responsável ser aceita pelo monitor.'
          : 'Seu termo está ok, mas o monitor ainda não liberou você para postar. Fale com ele.',
      403
    )
  }
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const titulo = texto(b.titulo, 140)
  if (!titulo || titulo.length < 4) return erro('Dê um título ao episódio (pode mudar depois).')
  const tipo = b.tipo === 'materia' ? 'materia' : 'entrevista'
  if (tipo === 'entrevista' && !podeAudio(a)) return erro('Você ainda não tem permissão para gravar áudio. Comece uma matéria escrita ou peça a permissão ao monitor.', 403)
  const quadro = await quadroValido(b.quadro)
  try {
    const ep = await criarEpisodio(a.userId, { titulo, tipo, quadro })
    await auditar({ atorId: a.userId, acao: 'episodio.criado', alvoTipo: 'episodio', alvoId: ep.id, alvoNome: titulo, detalhe: tipo })
    return NextResponse.json({ ok: true, id: ep.id })
  } catch (e) {
    console.error('[podcast/episodios]', e)
    return erro('Não consegui criar o episódio. Tente de novo.', 500)
  }
}
