import { NextResponse } from 'next/server'
import { erro, exigirAcesso, podeEscrever, texto } from '@/lib/jornal/api'
import { PautaIndisponivel, buscarPauta, criarMateria } from '@/lib/jornal/dados'
import { nomeDoUsuario } from '@/lib/podcast/dados'
import { auditar } from '@/lib/podcast/auditoria'
import { TIPOS, type TipoMateria } from '@/lib/jornal/tipos'

/** Comeca uma materia em rascunho. Com `pautaId`, o reporter pega a pauta da fila. */
export async function POST(request: Request) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const a = r.acesso
  if (!podeEscrever(a)) return erro('Para escrever no jornal você precisa estar na equipe, com o termo aceito e a permissão de postar.', 403)

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const pautaId = texto(b.pautaId, 36)
  const pauta = pautaId ? await buscarPauta(pautaId) : null
  if (pautaId && !pauta) return erro('Essa pauta não existe mais.', 404)
  const titulo = texto(b.titulo, 140) ?? pauta?.titulo ?? ''
  if (titulo.length < 4) return erro('Dê um título (dá para mudar depois).')
  const tipo: TipoMateria = (TIPOS as readonly string[]).includes(String(b.tipo)) ? (b.tipo as TipoMateria) : 'materia'

  try {
    const n = await criarMateria({ id: a.userId, nome: (await nomeDoUsuario(a.userId)) ?? '' }, { titulo, tipo, pautaId })
    await auditar({ atorId: a.userId, acao: 'jornal.criada', alvoTipo: 'noticia', alvoId: n.id, alvoNome: titulo, detalhe: pauta ? `tipo: ${tipo}; pauta: ${pauta.titulo}` : `tipo: ${tipo}` })
    return NextResponse.json({ ok: true, id: n.id })
  } catch (e) {
    if (e instanceof PautaIndisponivel) return erro('Outra pessoa já pegou essa pauta. Escolha outra.', 409)
    console.error('[jornal/materias] criar', e)
    return erro('Não deu para criar a matéria. Tente de novo.', 500)
  }
}
