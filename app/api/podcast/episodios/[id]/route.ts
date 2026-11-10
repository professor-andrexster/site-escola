import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import {
  atualizarEpisodio, buscarEpisodio, listarMembros, mudarStatus, participantesSemAutorizacao,
  PendenciaDeAutorizacao, publicarEpisodio, quadroValido, removerEpisodio, retirarEpisodio, type CamposEpisodio,
} from '@/lib/podcast/dados'
import { erro, exigirAcesso, participa, podeAudio, podeEditar, texto } from '@/lib/podcast/api'
import { auditar } from '@/lib/podcast/auditoria'
import type { Episodio } from '@/lib/podcast/tipos'

interface Ctx { params: Promise<{ id: string }> }

/** Podcast, episodio, JBInforma (lista e noticia) e home: tudo que pode mostrar o episodio. */
function revalidar(_ep: Episodio) {
  revalidatePath('/', 'layout')
}

/** O que falta para o episódio ir ao ar. Vazio = pode. */
/** Edição do monitor que deixaria o episódio no ar faltando algo: nada é salvo. */
class EdicaoRecusada extends Error {}

async function pendencias(ep: Episodio, tx?: Prisma.TransactionClient): Promise<string[]> {
  const p: string[] = []
  if (ep.tipo === 'entrevista' && !ep.audioUrl) p.push('Entrevista precisa do áudio.')
  if (ep.tipo === 'materia' && !(ep.texto && ep.texto.trim().length >= 80)) p.push('A matéria precisa de um texto com pelo menos umas três linhas.')
  if (!ep.resumo) p.push('Escreva o resumo (uma ou duas frases que chamem para ouvir).')
  if (ep.tipo === 'entrevista' && ep.entrevistadoNome && !ep.temTermoEntrevistado) p.push(`Falta o termo assinado por ${ep.entrevistadoNome}.`)
  const sem = await participantesSemAutorizacao(ep, tx)
  if (sem.length) p.push(`Sem autorização aceita: ${sem.join(', ')}.`)
  return p
}

/**
 * Edita campos e/ou faz uma ação.
 *   acao: enviar (aluno manda para o monitor) | publicar | ajustar (com feedback) | retirar | rascunho
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  const { id } = await params
  let ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>

  // 1) campos
  const campos: CamposEpisodio = {}
  if (b.titulo !== undefined) {
    const t = texto(b.titulo, 140)
    if (!t || t.length < 4) return erro('O título precisa de pelo menos 4 letras.')
    campos.titulo = t
  }
  if (b.tipo !== undefined) {
    campos.tipo = b.tipo === 'materia' ? 'materia' : 'entrevista'
    if (campos.tipo === 'entrevista' && ep.tipo !== 'entrevista' && !podeAudio(a)) {
      return erro('Você ainda não tem permissão para gravar áudio, então o formato fica matéria. Peça a permissão ao monitor.', 403)
    }
  }
  if (b.quadro !== undefined) campos.quadro = await quadroValido(b.quadro, ep.quadro)
  if (b.resumo !== undefined) campos.resumo = texto(b.resumo, 300)
  if (b.texto !== undefined) campos.texto = typeof b.texto === 'string' && b.texto.trim() ? b.texto.slice(0, 20000) : null
  if (b.entrevistadoNome !== undefined) campos.entrevistadoNome = texto(b.entrevistadoNome, 120)
  if (b.entrevistadoDescricao !== undefined) campos.entrevistadoDescricao = texto(b.entrevistadoDescricao, 200)
  if (b.noJbinforma !== undefined) campos.noJbinforma = b.noJbinforma === true
  if (Array.isArray(b.participantes)) {
    const equipe = new Set((await listarMembros()).map(m => m.userId))
    campos.participantes = (b.participantes as unknown[]).filter((x): x is string => typeof x === 'string' && equipe.has(x)).slice(0, 12)
  }

  try {
    if (Object.keys(campos).length > 0) {
      if (!podeEditar(ep, a)) {
        return erro(ep.status === 'revisao' ? 'O episódio está com o monitor. Espere a resposta para mexer de novo.' : 'Você não pode editar este episódio.', 403)
      }
      if (ep.status === 'publicado') {
        // Episodio no ar: editar, conferir e republicar a noticia numa transacao so.
        // Se a edicao deixaria faltando algo, nada e salvo e o episodio continua no ar como estava.
        const nome = await nomeDe(a.userId)
        try {
          ep = await prisma.$transaction(async tx => {
            await atualizarEpisodio(id, campos, tx)
            const novo = (await buscarEpisodio(id, tx))!
            const falta = await pendencias(novo, tx)
            if (falta.length) throw new EdicaoRecusada(falta.join(' '))
            await publicarEpisodio(novo, { id: a.userId, nome }, tx)
            return novo
          })
          revalidar(ep)
        } catch (e) {
          if (e instanceof EdicaoRecusada || e instanceof PendenciaDeAutorizacao) {
            return erro(`Não salvei: o episódio está no ar e ficaria faltando: ${e.message} Ele continua no ar como estava.`, 409)
          }
          throw e
        }
      } else {
        await atualizarEpisodio(id, campos)
        ep = (await buscarEpisodio(id))!
      }
    }

    // 2) acao
    const acao = b.acao
    if (acao === 'enviar') {
      if (!participa(ep, a.userId) && !a.moderador) return erro('Sem permissão.', 403)
      if (ep.status !== 'rascunho' && ep.status !== 'ajustar') return erro('Esse episódio já foi enviado.')
      const falta = await pendencias(ep)
      if (falta.length) return erro(`Ainda falta: ${falta.join(' ')}`)
      await mudarStatus(id, 'revisao')
    } else if (acao === 'publicar') {
      if (!a.moderador) return erro('Só o monitor publica.', 403)
      const falta = await pendencias(ep)
      if (falta.length) return erro(`Não dá para publicar ainda: ${falta.join(' ')}`)
      try {
        await publicarEpisodio(ep, { id: a.userId, nome: await nomeDe(a.userId) })
      } catch (e) {
        if (e instanceof PendenciaDeAutorizacao) return erro(`Não dá para publicar ainda: ${e.message}`)
        throw e
      }
    } else if (acao === 'ajustar') {
      if (!a.moderador) return erro('Só o monitor devolve.', 403)
      const fb = texto(b.feedback, 2000)
      if (!fb) return erro('Escreva o que a equipe precisa ajustar.')
      if (ep.status === 'publicado') await retirarEpisodio(ep, fb)
      await mudarStatus(id, 'ajustar', fb)
    } else if (acao === 'retirar') {
      if (!a.moderador) return erro('Só o monitor tira do ar.', 403)
      await retirarEpisodio(ep, texto(b.motivo, 500))
    } else if (acao === 'rascunho') {
      if (!a.moderador) return erro('Sem permissão.', 403)
      if (ep.status === 'publicado') await retirarEpisodio(ep, 'Voltou para rascunho.')
      await mudarStatus(id, 'rascunho')
    } else if (acao !== undefined) {
      return erro('Ação desconhecida.')
    }

    const final = (await buscarEpisodio(id))!
    const editou = Object.keys(campos).length > 0
    const acaoAud: Record<string, string> = { enviar: 'episodio.enviado', publicar: 'episodio.publicado', ajustar: 'episodio.devolvido', retirar: 'episodio.retirado', rascunho: 'episodio.rascunho' }
    if (editou) await auditar({ atorId: a.userId, acao: 'episodio.editado', alvoTipo: 'episodio', alvoId: id, alvoNome: final.titulo, detalhe: `campos: ${Object.keys(campos).join(', ')}` })
    if (typeof acao === 'string' && acaoAud[acao]) {
      await auditar({
        atorId: a.userId, acao: acaoAud[acao], alvoTipo: 'episodio', alvoId: id, alvoNome: final.titulo,
        detalhe: acao === 'ajustar' ? texto(b.feedback, 300) : acao === 'retirar' ? texto(b.motivo, 300) : acao === 'publicar' ? (final.audioUrl ? 'com áudio' : 'sem áudio') : null,
      })
    }
    if (acao || final.status === 'publicado') revalidar(final)
    return NextResponse.json({ ok: true, episodio: final })
  } catch (e) {
    console.error('[podcast/episodios/id]', e)
    return erro('Não consegui salvar. Tente de novo.', 500)
  }
}

async function nomeDe(userId: string) {
  return (await prisma.profiles.findUnique({ where: { id: userId }, select: { nome_completo: true } }))?.nome_completo ?? 'Monitor'
}

/** Apaga rascunho. Publicado ou retirado não se apaga: fica o histórico. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const ep = await buscarEpisodio(id)
  if (!ep) return erro('Episódio não encontrado.', 404)
  if (!(r.acesso.moderador || ep.autorId === r.acesso.userId)) return erro('Sem permissão.', 403)
  if (ep.status !== 'rascunho' && ep.status !== 'ajustar') return erro('Só rascunho pode ser apagado.', 409)
  await removerEpisodio(id)
  await auditar({ atorId: r.acesso.userId, acao: 'episodio.apagado', alvoTipo: 'episodio', alvoId: id, alvoNome: ep.titulo })
  revalidar(ep)
  return NextResponse.json({ ok: true })
}
