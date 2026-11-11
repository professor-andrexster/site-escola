import { NextResponse } from 'next/server'
import { erro, exigirAcesso, limparCache, podeEditarMateria, podeVerMateria, texto } from '@/lib/jornal/api'
import { atualizarMateria, buscarMateria, limparFontes, mudarStatusMateria, publicarMateria, removerMateria } from '@/lib/jornal/dados'
import { apagarFoto } from '@/lib/jornal/arquivos'
import { avisarAutor, avisarRevisaoDaMateria } from '@/lib/jornal/avisos'
import { nomeDoUsuario } from '@/lib/podcast/dados'
import { auditar } from '@/lib/podcast/auditoria'
import { CATEGORIAS } from '@/lib/categorias'
import { pendencias, type Materia } from '@/lib/jornal/tipos'

type Ctx = { params: Promise<{ id: string }> }

const ACOES = ['enviar', 'publicar', 'ajustar', 'retirar', 'rascunho'] as const
type Acao = (typeof ACOES)[number]

/**
 * Salva campos e/ou muda o status.
 *   { campos: {...} }              salva
 *   { campos: {...}, acao: '...' } salva e depois age (o que foi digitado nunca se perde por causa da acao)
 * Quem nao e o autor nem moderador recebe 404, como se a materia nao existisse.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  const { id } = await params
  const m = await buscarMateria(id)
  if (!m || !podeVerMateria(m, a)) return erro('Matéria não encontrada.', 404)

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const acao = (ACOES as readonly string[]).includes(String(b.acao)) ? (b.acao as Acao) : null
  const c = b.campos && typeof b.campos === 'object' ? (b.campos as Record<string, unknown>) : null
  if (!c && !acao) return erro('Nada para salvar.')

  let atual: Materia = m
  if (c) {
    if (!podeEditarMateria(m, a)) return erro(m.status === 'revisao' ? 'A matéria está com o monitor. Espere a resposta para editar.' : 'Só o monitor edita matéria que já foi ao ar.', 403)
    const titulo = texto(c.titulo, 140)
    if (!titulo || titulo.length < 4) return erro('A matéria precisa de um título.')
    const ano = Number(c.memoriaAno)
    const categoria = texto(c.categoria, 20)
    await atualizarMateria(id, m.tipo, {
      titulo,
      resumo: texto(c.resumo, 300),
      texto: texto(c.texto, 20000),
      editoria: texto(c.editoria, 12),
      categoria: categoria && categoria in CATEGORIAS ? categoria : null,
      fontes: limparFontes(c.fontes),
      checklist: Array.isArray(c.checklist) ? c.checklist.filter((x): x is string => typeof x === 'string').slice(0, 12) : [],
      boato: texto(c.boato, 600),
      veredito: texto(c.veredito, 12),
      tema: texto(c.tema, 12),
      comoChecamos: Array.isArray(c.comoChecamos) ? c.comoChecamos.filter((x): x is string => typeof x === 'string') : [],
      memoriaAno: Number.isInteger(ano) && ano >= 1946 && ano <= new Date().getFullYear() ? ano : null,
      validoAte: texto(c.validoAte, 10),
    })
    atual = (await buscarMateria(id))!
    await auditar({ atorId: a.userId, acao: 'jornal.editada', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo })
    if (atual.status === 'publicado') limparCache()
  }

  if (!acao) return NextResponse.json({ ok: true, materia: atual })

  // A partir daqui os campos ja estao salvos. Se a acao for recusada, a resposta diz isso.
  const salvo = c ? ' O que você escreveu já está salvo.' : ''
  const recusa = (msg: string, status = 400) => NextResponse.json({ ok: false, error: msg + salvo, materia: atual }, { status })

  if (acao === 'enviar') {
    if (atual.autorId !== a.userId && !a.moderador) return recusa('Só quem escreveu envia para revisão.', 403)
    if (atual.status !== 'rascunho' && atual.status !== 'ajustar') return recusa('Essa matéria já foi enviada.')
    const falta = pendencias(atual)
    if (falta.length) return recusa(`Ainda falta: ${falta.join(' ')}`)
    await mudarStatusMateria(id, 'revisao')
    await auditar({ atorId: a.userId, acao: 'jornal.enviada', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo })
    void avisarRevisaoDaMateria(atual)
  } else {
    if (!a.moderador) return recusa('Só o monitor ou a direção faz isso.', 403)
    if (acao === 'publicar') {
      const falta = pendencias(atual)
      if (falta.length) return recusa(`Não dá para publicar ainda: ${falta.join(' ')}`)
      await publicarMateria(atual, { id: a.userId, nome: (await nomeDoUsuario(a.userId)) ?? '' })
      await auditar({ atorId: a.userId, acao: 'jornal.publicada', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo })
      void avisarAutor(atual, 'publicado')
    } else if (acao === 'ajustar') {
      const recado = texto(b.feedback, 600)
      if (!recado) return recusa('Escreva o que precisa mudar: o repórter só vê o seu recado.')
      await mudarStatusMateria(id, 'ajustar', recado)
      await auditar({ atorId: a.userId, acao: 'jornal.devolvida', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo, detalhe: recado })
      void avisarAutor(atual, 'devolvido', recado)
    } else if (acao === 'retirar') {
      const motivo = texto(b.motivo, 600)
      await mudarStatusMateria(id, 'retirado', motivo)
      await auditar({ atorId: a.userId, acao: 'jornal.retirada', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo, detalhe: motivo })
      void avisarAutor(atual, 'retirado', motivo)
    } else {
      await mudarStatusMateria(id, 'rascunho', null)
      await auditar({ atorId: a.userId, acao: 'jornal.rascunho', alvoTipo: 'noticia', alvoId: id, alvoNome: atual.titulo })
    }
    limparCache()
  }
  return NextResponse.json({ ok: true, materia: await buscarMateria(id) })
}

/** Apaga rascunho que nunca foi ao ar. Materia publicada sai do ar, nao some. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  const { id } = await params
  const m = await buscarMateria(id)
  if (!m || !podeVerMateria(m, a)) return erro('Matéria não encontrada.', 404)
  if (m.publicadoEm) return erro('Essa matéria já foi publicada. Tire do ar em vez de apagar.', 409)
  if (!a.moderador && !(m.status === 'rascunho' || m.status === 'ajustar')) return erro('A matéria está com o monitor.', 403)
  await removerMateria(m)
  await apagarFoto(m.imagemUrl)
  await auditar({ atorId: a.userId, acao: 'jornal.apagada', alvoTipo: 'noticia', alvoId: id, alvoNome: m.titulo })
  return NextResponse.json({ ok: true })
}
