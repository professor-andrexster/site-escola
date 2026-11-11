import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { acessoDe } from '@/lib/podcast/dados'
import { erro, ipDoPedido, limparCache, podeEscrever, texto } from '@/lib/jornal/api'
import { criarPauta, pautasRecentesDoIp } from '@/lib/jornal/dados'
import { avisarPautaNova } from '@/lib/jornal/avisos'
import { auditar } from '@/lib/podcast/auditoria'

/**
 * Sugestao de pauta. Aberta a qualquer pessoa, sem login: por isso a sugestao
 * do publico nasce "nova" e so aparece no quadro depois que a redacao aceitar.
 * Protecoes: campo-isca para robo, 3 envios por hora por IP, tamanho limitado.
 * Nao pede contato de ninguem: a escola nao guarda telefone de quem sugeriu.
 */
export async function POST(request: Request) {
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  // Campo-isca: gente nao ve nem preenche. Robo preenche e recebe "ok" sem nada ser gravado.
  if (typeof b.site === 'string' && b.site.trim()) return NextResponse.json({ ok: true })

  const titulo = texto(b.titulo, 140)
  const descricao = texto(b.descricao, 1500)
  if (!titulo || titulo.length < 8) return erro('Conte em uma frase o que você quer que o jornal investigue (pelo menos 8 letras).')

  const u = await usuarioAtual()
  const acesso = u ? await acessoDe(u.id) : null
  const daEquipe = Boolean(acesso && podeEscrever(acesso) && b.origem === 'equipe')
  const ip = await ipDoPedido()

  if (!daEquipe && ip && (await pautasRecentesDoIp(ip)) >= 3) {
    return erro('Você já mandou três sugestões na última hora. Guarde esta e envie mais tarde.', 429)
  }

  try {
    const p = await criarPauta({
      titulo, descricao, origem: daEquipe ? 'equipe' : 'publico',
      nome: daEquipe ? null : texto(b.nome, 80), vinculo: daEquipe ? null : texto(b.vinculo, 16), ip,
    })
    if (daEquipe) {
      await auditar({ atorId: acesso!.userId, acao: 'jornal.pauta_equipe', alvoTipo: 'pauta', alvoId: p.id, alvoNome: titulo })
      limparCache()
    } else void avisarPautaNova(titulo)
    return NextResponse.json({ ok: true, id: p.id })
  } catch (e) {
    console.error('[jornal/pautas] criar', e)
    return erro('Não deu para guardar a sugestão agora. Seu texto continua na tela: tente de novo.', 500)
  }
}
