import { prisma } from '@/lib/db'

/**
 * Desafio final de curso: o aluno envia, o professor aprova, sai o certificado.
 *
 * Por que uma tabela própria em vez de reusar `entregas`: aquela é indexada por
 * EQUIPE e por FASE, e a tela dela é construída em torno de equipe, papel e
 * fase — modelo do projeto em grupo. Curso é trabalho individual, e forçar uma
 * equipe de uma pessoa por aluno faria o aluno entrar num espaço de projeto
 * coletivo para mandar um arquivo sozinho.
 *
 * O que foi reaproveitado é o que importa: o mesmo vocabulário de status
 * (entregue / aprovado / recusado), o mesmo caminho de upload (`/api/arquivos`)
 * e o mesmo desenho de avaliação com nota e devolutiva do professor.
 */

export type EnvioComAluno = Awaited<ReturnType<typeof filaDeCorrecao>>[number]

/** O desafio que vale certificado num curso. No máximo um por curso. */
export async function desafioFinalDoCurso(cursoId: string) {
  return prisma.curso_desafios.findFirst({
    where: { curso_id: cursoId, vale_certificado: true },
    select: {
      id: true,
      titulo: true,
      enunciado: true,
      formatos_aceitos: true,
      instrucoes_envio: true,
      curso_id: true,
    },
  })
}

/** O envio de um aluno para um desafio, se existir. */
export async function envioDoAluno(desafioId: string, userId: string) {
  return prisma.curso_desafio_envios.findUnique({
    where: { desafio_id_user_id: { desafio_id: desafioId, user_id: userId } },
  })
}

/**
 * Grava ou substitui o envio.
 *
 * Reenviar depois de recusado volta o status para `entregue` e limpa a
 * devolutiva anterior — senão o aluno corrige e continua vendo a recusa
 * antiga, sem saber se o professor já olhou de novo.
 *
 * Envio já aprovado não é substituído: o certificado pode já ter saído.
 */
export async function enviarDesafio(dados: {
  desafioId: string
  userId: string
  arquivoUrl: string | null
  linkUrl: string | null
  comentario: string | null
}) {
  const atual = await envioDoAluno(dados.desafioId, dados.userId)
  if (atual?.status === 'aprovado') return { jaAprovado: true as const, envio: atual }

  const valores = {
    arquivo_url: dados.arquivoUrl,
    link_url: dados.linkUrl,
    comentario: dados.comentario,
    status: 'entregue',
    feedback_professor: null,
    avaliado_por: null,
    avaliado_em: null,
    enviado_em: new Date(),
  }

  const envio = await prisma.curso_desafio_envios.upsert({
    where: { desafio_id_user_id: { desafio_id: dados.desafioId, user_id: dados.userId } },
    create: { desafio_id: dados.desafioId, user_id: dados.userId, ...valores },
    update: valores,
  })
  return { jaAprovado: false as const, envio }
}

/** Fila do professor: o que está esperando correção, mais antigo primeiro. */
export async function filaDeCorrecao(cursoId: string) {
  const envios = await prisma.curso_desafio_envios.findMany({
    where: { curso_desafios: { curso_id: cursoId } },
    orderBy: [{ status: 'asc' }, { enviado_em: 'asc' }],
    include: { curso_desafios: { select: { titulo: true } } },
  })
  if (!envios.length) return []

  // O nome do aluno vem de profiles, que não tem relação declarada com
  // curso_desafio_envios — a chave é o id da conta.
  const perfis = await prisma.profiles.findMany({
    where: { id: { in: envios.map(e => e.user_id) } },
    select: { id: true, nome_completo: true, turma: true, email: true },
  })
  const porId = new Map(perfis.map(p => [p.id, p]))

  return envios.map(e => ({
    id: e.id,
    status: e.status,
    arquivoUrl: e.arquivo_url,
    linkUrl: e.link_url,
    comentario: e.comentario,
    feedback: e.feedback_professor,
    enviadoEm: e.enviado_em.toISOString(),
    desafioTitulo: e.curso_desafios.titulo,
    aluno: porId.get(e.user_id) ?? null,
    userId: e.user_id,
  }))
}

/** Quem é o autor do curso. */
export async function autorDoCurso(cursoId: string): Promise<string | null> {
  const c = await prisma.cursos.findUnique({ where: { id: cursoId }, select: { criado_por: true } })
  return c?.criado_por ?? null
}

/**
 * Quem pode avaliar o desafio final de um curso.
 *
 * Três origens, e cada uma existe por um motivo:
 *
 * - o AUTOR do curso, que é a regra pedida;
 * - avaliadores CONVIDADOS por ele, para dividir a correção quando a turma é
 *   grande ou quando outro professor da área ajuda;
 * - a GESTÃO, como destravamento: se o autor sai da escola ou fica indisponível,
 *   sem isso o aluno fica preso esperando aprovação de alguém que não volta.
 */
export async function podeAvaliarCurso(
  cursoId: string,
  userId: string,
  role: string
): Promise<boolean> {
  if (['diretora', 'vice_diretora', 'admin'].includes(role)) return true
  if ((await autorDoCurso(cursoId)) === userId) return true
  return Boolean(
    await prisma.curso_avaliadores.findFirst({
      where: { curso_id: cursoId, user_id: userId },
      select: { id: true },
    })
  )
}

/** Avaliadores convidados de um curso, com nome, para a tela de gestão. */
export async function avaliadoresConvidados(cursoId: string) {
  const linhas = await prisma.curso_avaliadores.findMany({
    where: { curso_id: cursoId },
    orderBy: { criado_em: 'asc' },
  })
  if (!linhas.length) return []
  const perfis = await prisma.profiles.findMany({
    where: { id: { in: linhas.map(l => l.user_id) } },
    select: { id: true, nome_completo: true, email: true, role: true },
  })
  const porId = new Map(perfis.map(p => [p.id, p]))
  return linhas.map(l => ({ id: l.id, userId: l.user_id, perfil: porId.get(l.user_id) ?? null }))
}

export async function convidarAvaliador(cursoId: string, userId: string, convidadoPor: string) {
  return prisma.curso_avaliadores.create({
    data: { curso_id: cursoId, user_id: userId, convidado_por: convidadoPor },
  })
}

export async function removerAvaliador(id: string) {
  return prisma.curso_avaliadores.delete({ where: { id } })
}

/** Professores e monitores que podem ser convidados a avaliar. */
export async function candidatosAAvaliador(cursoId: string) {
  const jaSao = (await prisma.curso_avaliadores.findMany({
    where: { curso_id: cursoId },
    select: { user_id: true },
  })).map(l => l.user_id)
  const autor = await autorDoCurso(cursoId)

  return prisma.profiles.findMany({
    where: {
      role: { in: ['professor', 'monitor'] },
      aprovado: true,
      NOT: { id: { in: [...jaSao, ...(autor ? [autor] : [])] } },
    },
    select: { id: true, nome_completo: true, email: true, role: true },
    orderBy: { nome_completo: 'asc' },
  })
}

/** O envio, com o curso a que pertence — para conferir quem pode avaliar. */
export async function envioComCurso(envioId: string) {
  return prisma.curso_desafio_envios.findUnique({
    where: { id: envioId },
    select: {
      id: true,
      user_id: true,
      status: true,
      curso_desafios: { select: { curso_id: true, vale_certificado: true } },
    },
  })
}

export async function avaliarEnvio(dados: {
  envioId: string
  aprovado: boolean
  feedback: string | null
  avaliadorId: string
}) {
  return prisma.curso_desafio_envios.update({
    where: { id: dados.envioId },
    data: {
      status: dados.aprovado ? 'aprovado' : 'recusado',
      feedback_professor: dados.feedback,
      avaliado_por: dados.avaliadorId,
      avaliado_em: new Date(),
    },
  })
}

/** Marca qual desafio de um curso vale certificado. Só um por curso. */
export async function definirDesafioFinal(cursoId: string, desafioId: string, opcoes: {
  formatosAceitos?: string | null
  instrucoesEnvio?: string | null
}) {
  return prisma.$transaction(async tx => {
    await tx.curso_desafios.updateMany({
      where: { curso_id: cursoId, vale_certificado: true },
      data: { vale_certificado: false },
    })
    return tx.curso_desafios.update({
      where: { id: desafioId },
      data: {
        vale_certificado: true,
        formatos_aceitos: opcoes.formatosAceitos ?? null,
        instrucoes_envio: opcoes.instrucoesEnvio ?? null,
      },
    })
  })
}
