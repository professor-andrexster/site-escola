import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

/**
 * Auditoria do podcast: quem fez o quê, em quem, quando e de onde.
 *
 * Registrar nunca derruba a ação principal: se o insert falhar, fica no log
 * do servidor e a resposta segue. CPF nunca entra aqui (nem mascarado).
 */

export type AlvoTipo = 'monitor' | 'aluno' | 'episodio' | 'termo' | 'quadro' | 'noticia' | 'pauta' | 'edicao'

export const ROTULO_ACAO: Record<string, string> = {
  'monitor.adicionado': 'Tornou monitor',
  'monitor.removido': 'Tirou da monitoria',
  'aluno.adicionado': 'Adicionou aluno à equipe',
  'aluno.removido': 'Tirou aluno da equipe',
  'aluno.responsavel': 'Corrigiu responsável',
  'aluno.renovado': 'Gerou termo do ano novo',
  'aluno.permissoes': 'Mudou permissões',
  'termo.enviado': 'Subiu termo assinado',
  'termo.aceito': 'Conferiu termo e liberou',
  'termo.revogado': 'Revogou autorização',
  'termo.baixado': 'Baixou termo preenchido (com CPF)',
  'termo.aberto': 'Abriu termo assinado',
  'episodio.criado': 'Criou episódio',
  'episodio.editado': 'Editou episódio',
  'episodio.enviado': 'Enviou para revisão',
  'episodio.publicado': 'Publicou',
  'episodio.devolvido': 'Devolveu para ajuste',
  'episodio.retirado': 'Tirou do ar',
  'episodio.rascunho': 'Voltou para rascunho',
  'episodio.apagado': 'Apagou rascunho',
  'audio.enviado': 'Enviou áudio',
  'audio.removido': 'Removeu áudio',
  'termo_entrevistado.enviado': 'Subiu termo do entrevistado',
  'termo_entrevistado.aberto': 'Abriu termo do entrevistado',
  'capa.enviada': 'Enviou foto de capa',
  'capa.removida': 'Removeu foto de capa',
  'transcricao.pedida': 'Pediu transcrição automática',
  'transcricao.editada': 'Corrigiu a transcrição',
  'transcricao.publicada': 'Mostrou a transcrição no site',
  'transcricao.ocultada': 'Escondeu a transcrição do site',
  'quadro.criado': 'Criou quadro',
  'quadro.editado': 'Editou quadro',
  'quadro.ativado': 'Reativou quadro',
  'quadro.desativado': 'Desativou quadro',
  'quadro.removido': 'Apagou quadro',
  // Redacao do JBInforma (mesma equipe, mesma trilha de auditoria).
  'jornal.criada': 'Jornal: começou matéria',
  'jornal.editada': 'Jornal: editou matéria',
  'jornal.enviada': 'Jornal: enviou para revisão',
  'jornal.publicada': 'Jornal: publicou matéria',
  'jornal.devolvida': 'Jornal: devolveu para ajuste',
  'jornal.retirada': 'Jornal: tirou matéria do ar',
  'jornal.rascunho': 'Jornal: voltou para rascunho',
  'jornal.apagada': 'Jornal: apagou rascunho',
  'jornal.foto': 'Jornal: trocou a foto',
  'jornal.correcao': 'Jornal: publicou correção (Erramos)',
  'jornal.correcao_removida': 'Jornal: apagou correção',
  'jornal.pauta_aceita': 'Jornal: aceitou pauta',
  'jornal.pauta_recusada': 'Jornal: recusou pauta',
  'jornal.pauta_respondida': 'Jornal: respondeu pauta',
  'jornal.pauta_apagada': 'Jornal: apagou pauta',
  'jornal.pauta_equipe': 'Jornal: sugeriu pauta',
  'jornal.edicao_criada': 'Jornal: criou edição',
  'jornal.edicao_editada': 'Jornal: editou edição',
  'jornal.edicao_publicada': 'Jornal: publicou edição',
  'jornal.edicao_recolhida': 'Jornal: recolheu edição',
  'jornal.edicao_apagada': 'Jornal: apagou edição',
}

async function ipDaRequisicao(): Promise<string | null> {
  try {
    const h = await headers()
    // nginx do site manda o IP real em X-Real-IP; o primeiro de X-Forwarded-For pode ser forjado.
    return (h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',').pop()?.trim() ?? null)?.slice(0, 64) ?? null
  } catch {
    return null
  }
}

export async function auditar(e: {
  atorId: string | null
  acao: keyof typeof ROTULO_ACAO | string
  alvoTipo?: AlvoTipo
  alvoId?: string | null
  alvoNome?: string | null
  detalhe?: string | null
}) {
  try {
    const ator = e.atorId
      ? (await prisma.profiles.findUnique({ where: { id: e.atorId }, select: { nome_completo: true } }))?.nome_completo ?? null
      : null
    await prisma.podcast_auditoria.create({
      data: {
        ator_id: e.atorId,
        ator_nome: ator?.slice(0, 160) ?? null,
        acao: e.acao.slice(0, 40),
        alvo_tipo: e.alvoTipo ?? null,
        alvo_id: e.alvoId ?? null,
        alvo_nome: e.alvoNome?.slice(0, 200) ?? null,
        detalhe: e.detalhe?.slice(0, 500) ?? null,
        ip: await ipDaRequisicao(),
      },
    })
  } catch (erro) {
    console.error('[podcast/auditoria] falha ao registrar', e.acao, erro)
  }
}

export interface LinhaAuditoria {
  id: string
  quando: string
  atorNome: string | null
  acao: string
  rotulo: string
  alvoTipo: string | null
  alvoNome: string | null
  detalhe: string | null
  ip: string | null
}

export async function listarAuditoria(filtro: { pessoa?: string; acao?: string; limite?: number; antesDe?: string } = {}): Promise<LinhaAuditoria[]> {
  const linhas = await prisma.podcast_auditoria.findMany({
    where: {
      ...(filtro.acao ? { acao: { startsWith: filtro.acao } } : {}),
      ...(filtro.pessoa
        ? { OR: [{ ator_nome: { contains: filtro.pessoa } }, { alvo_nome: { contains: filtro.pessoa } }] }
        : {}),
      ...(filtro.antesDe ? { id: { lt: BigInt(filtro.antesDe) } } : {}),
    },
    orderBy: { id: 'desc' },
    take: Math.min(filtro.limite ?? 100, 300),
  })
  return linhas.map(l => ({
    id: l.id.toString(),
    quando: l.quando.toISOString(),
    atorNome: l.ator_nome,
    acao: l.acao,
    rotulo: ROTULO_ACAO[l.acao] ?? l.acao,
    alvoTipo: l.alvo_tipo,
    alvoNome: l.alvo_nome,
    detalhe: l.detalhe,
    ip: l.ip,
  }))
}
