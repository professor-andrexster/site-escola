import { NextResponse } from 'next/server'
import { erro, exigirAcesso, limparCache, podeEditarMateria, podeVerMateria } from '@/lib/jornal/api'
import { buscarMateria, definirImagem } from '@/lib/jornal/dados'
import { apagarFoto, gravarFoto } from '@/lib/jornal/arquivos'
import { auditar } from '@/lib/podcast/auditoria'

type Ctx = { params: Promise<{ id: string }> }

async function alvo(id: string) {
  const r = await exigirAcesso()
  if (!r.ok) return { res: r.res }
  const m = await buscarMateria(id)
  if (!m || !podeVerMateria(m, r.acesso)) return { res: erro('Matéria não encontrada.', 404) }
  if (!podeEditarMateria(m, r.acesso)) return { res: erro('A matéria não está com você agora.', 403) }
  return { m, a: r.acesso }
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params
  const x = await alvo(id)
  if ('res' in x) return x.res
  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File)) return erro('Nenhuma imagem chegou. Escolha a foto de novo.')
  let g: Awaited<ReturnType<typeof gravarFoto>>
  try {
    g = await gravarFoto(arquivo)
  } catch (e) {
    console.error('[jornal/imagem] gravar', e)
    return erro('O servidor não conseguiu guardar a foto. Ela continua no seu aparelho: tente de novo.', 500)
  }
  if ('erro' in g) return erro(g.erro)
  await definirImagem(id, g.url)
  await apagarFoto(x.m.imagemUrl)
  await auditar({ atorId: x.a.userId, acao: 'jornal.foto', alvoTipo: 'noticia', alvoId: id, alvoNome: x.m.titulo, detalhe: 'enviou' })
  if (x.m.status === 'publicado') limparCache()
  return NextResponse.json({ ok: true, url: g.url })
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const x = await alvo(id)
  if ('res' in x) return x.res
  await definirImagem(id, null)
  await apagarFoto(x.m.imagemUrl)
  await auditar({ atorId: x.a.userId, acao: 'jornal.foto', alvoTipo: 'noticia', alvoId: id, alvoNome: x.m.titulo, detalhe: 'removeu' })
  if (x.m.status === 'publicado') limparCache()
  return NextResponse.json({ ok: true })
}
