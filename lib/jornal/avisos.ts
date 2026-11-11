import { prisma } from '@/lib/db'
import { enviarAvisoDoPodcast } from '@/lib/email'
import { GESTAO_ROLES } from '@/lib/roles'
import { esc } from '@/lib/podcast/tipos'
import { NOME_JORNAL, type Materia } from '@/lib/jornal/tipos'

/**
 * Avisos por e-mail da redacao. Mesma regra do podcast: nunca seguram nem
 * derrubam a acao principal; falha de e-mail so vai para o log do servidor.
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
    void enviarAvisoDoPodcast({ email, ...m, assunto: `${NOME_JORNAL}: ${m.assunto}`, link: `${BASE}${m.link}` }).catch(e =>
      console.error('[jornal/avisos] e-mail não saiu', { assunto: m.assunto, motivo: e instanceof Error ? e.message : String(e) })
    )
  }
}

async function moderadores(): Promise<string[]> {
  const monitores = await prisma.podcast_membros.findMany({ where: { papel: 'monitor' }, select: { user_id: true } })
  if (monitores.length) return monitores.map(m => m.user_id)
  return (await prisma.profiles.findMany({ where: { role: { in: GESTAO_ROLES as string[] }, aprovado: true }, select: { id: true } })).map(p => p.id)
}

export async function avisarRevisaoDaMateria(m: Materia) {
  try {
    disparar(await emailsDe(await moderadores()), {
      assunto: 'matéria para revisar',
      titulo: 'Tem matéria esperando sua revisão',
      corpo: `<strong>${esc(m.titulo)}</strong>, de ${esc(m.autorNome.split(' ')[0] ?? '')}. Leia, confira as fontes e publique ou devolva com um recado.`,
      link: `/admin/jornal/materia/${m.id}`,
      botao: 'Abrir a matéria',
    })
  } catch (e) {
    console.error('[jornal/avisos] revisao', e)
  }
}

export async function avisarAutor(m: Materia, decisao: 'publicado' | 'devolvido' | 'retirado', recado?: string | null) {
  try {
    if (!m.autorId) return
    const t = {
      publicado: { assunto: 'sua matéria está no ar', titulo: 'Sua matéria está no ar!', corpo: `<strong>${esc(m.titulo)}</strong> foi publicada no ${NOME_JORNAL}.`, link: `/noticias/${m.slug}`, botao: 'Ver no site' },
      devolvido: { assunto: 'o monitor pediu um ajuste', titulo: 'O monitor pediu um ajuste', corpo: `<strong>${esc(m.titulo)}</strong> voltou para você.${recado ? `<br><br>Recado: ${esc(recado)}` : ''}`, link: `/admin/jornal/materia/${m.id}`, botao: 'Abrir a matéria' },
      retirado: { assunto: 'uma matéria saiu do ar', titulo: 'Uma matéria saiu do ar', corpo: `<strong>${esc(m.titulo)}</strong> foi tirada do ar pelo monitor.${recado ? `<br><br>Motivo: ${esc(recado)}` : ''}`, link: `/admin/jornal/materia/${m.id}`, botao: 'Abrir a matéria' },
    }[decisao]
    disparar(await emailsDe([m.autorId]), t)
  } catch (e) {
    console.error('[jornal/avisos] autor', e)
  }
}

export async function avisarPautaNova(titulo: string) {
  try {
    disparar(await emailsDe(await moderadores()), {
      assunto: 'chegou sugestão de pauta',
      titulo: 'Alguém sugeriu uma pauta',
      corpo: `<strong>${esc(titulo)}</strong>. Ela só aparece no quadro público depois que você aceitar.`,
      link: '/admin/jornal?aba=pautas',
      botao: 'Ver as pautas',
    })
  } catch (e) {
    console.error('[jornal/avisos] pauta', e)
  }
}
