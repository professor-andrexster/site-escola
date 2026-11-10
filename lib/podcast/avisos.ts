import { prisma } from '@/lib/db'
import { enviarAvisoDoPodcast } from '@/lib/email'
import { GESTAO_ROLES } from '@/lib/roles'
import { NOME_PODCAST, esc, type Episodio } from '@/lib/podcast/tipos'

/**
 * Avisos por e-mail do podcast. Nunca seguram nem derrubam a acao principal:
 * saem depois da resposta, e falha de e-mail so vai para o log do servidor.
 * (O aviso dentro do painel nao depende disto: vem do status do episodio.)
 */

const BASE = (process.env.APP_URL ?? '').replace(/\/$/, '')

async function emailsDe(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return []
  const us = await prisma.usuarios.findMany({ where: { id: { in: userIds } }, select: { email: true } })
  return us.map(u => u.email).filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
}

function disparar(emails: string[], m: { assunto: string; titulo: string; corpo: string; link: string; botao: string }) {
  if (!BASE) return
  for (const email of Array.from(new Set(emails))) {
    void enviarAvisoDoPodcast({ email, ...m, link: `${BASE}${m.link}` }).catch(e =>
      console.error('[podcast/avisos] e-mail não saiu', { assunto: m.assunto, motivo: e instanceof Error ? e.message : String(e) })
    )
  }
}

/** Equipe mandou episodio: avisa os monitores (ou a direcao, se nao houver monitor). */
export async function avisarRevisao(ep: Episodio) {
  try {
    const monitores = await prisma.podcast_membros.findMany({ where: { papel: 'monitor' }, select: { user_id: true } })
    let ids = monitores.map(m => m.user_id)
    if (ids.length === 0) {
      ids = (await prisma.profiles.findMany({ where: { role: { in: GESTAO_ROLES as string[] }, aprovado: true }, select: { id: true } })).map(p => p.id)
    }
    disparar(await emailsDe(ids), {
      assunto: `${NOME_PODCAST}: episódio para revisar`,
      titulo: 'Tem episódio esperando sua revisão',
      corpo: `<strong>${esc(ep.titulo)}</strong>, enviado por ${esc(ep.autorNome.split(' ')[0] ?? '')}. Ouça, leia e publique ou devolva com um recado.`,
      link: `/admin/podcast/episodio/${ep.id}`,
      botao: 'Abrir o episódio',
    })
  } catch (e) {
    console.error('[podcast/avisos] revisao', e)
  }
}

/** Monitor decidiu: avisa quem fez o episodio. */
export async function avisarEquipe(ep: Episodio, decisao: 'publicado' | 'devolvido' | 'retirado', recado?: string | null) {
  try {
    const ids = Array.from(new Set([ep.autorId, ...ep.participantes.map(p => p.userId)]))
    const textos = {
      publicado: { assunto: 'seu episódio está no ar', titulo: 'Seu episódio está no ar!', corpo: `<strong>${esc(ep.titulo)}</strong> foi publicado. Agora a escola inteira pode ouvir.`, link: `/podcast/${ep.slug}`, botao: 'Ver no site' },
      devolvido: { assunto: 'o monitor pediu um ajuste', titulo: 'O monitor pediu um ajuste', corpo: `<strong>${esc(ep.titulo)}</strong> voltou para você.${recado ? `<br><br>Recado: ${esc(recado)}` : ''}`, link: `/admin/podcast/episodio/${ep.id}`, botao: 'Abrir o episódio' },
      retirado: { assunto: 'um episódio saiu do ar', titulo: 'Um episódio saiu do ar', corpo: `<strong>${esc(ep.titulo)}</strong> foi tirado do ar pelo monitor.${recado ? `<br><br>Motivo: ${esc(recado)}` : ''}`, link: `/admin/podcast/episodio/${ep.id}`, botao: 'Abrir o episódio' },
    }[decisao]
    disparar(await emailsDe(ids), { ...textos, assunto: `${NOME_PODCAST}: ${textos.assunto}` })
  } catch (e) {
    console.error('[podcast/avisos] equipe', e)
  }
}
