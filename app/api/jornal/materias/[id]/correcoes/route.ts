import { NextResponse } from 'next/server'
import { erro, exigirModerador, limparCache, texto } from '@/lib/jornal/api'
import { adicionarCorrecao } from '@/lib/jornal/dados'
import { prisma } from '@/lib/db'
import { auditar } from '@/lib/podcast/auditoria'

type Ctx = { params: Promise<{ id: string }> }

/** Erramos: a correcao fica publica na materia e na pagina /noticias/erramos. Vale para qualquer noticia no ar. */
export async function POST(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const n = await prisma.noticias.findUnique({ where: { id }, select: { id: true, titulo: true, publicado: true } })
  if (!n) return erro('Matéria não encontrada.', 404)
  if (!n.publicado) return erro('Correção pública só em matéria que está no ar. Em rascunho, é só editar.')
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const t = texto(b.texto, 1000)
  if (!t || t.length < 15) return erro('Explique o que estava errado e como ficou (pelo menos uma frase).')
  const c = await adicionarCorrecao(id, t, r.acesso.userId)
  await auditar({ atorId: r.acesso.userId, acao: 'jornal.correcao', alvoTipo: 'noticia', alvoId: id, alvoNome: n.titulo, detalhe: t })
  limparCache()
  return NextResponse.json({ ok: true, id: c.id })
}
