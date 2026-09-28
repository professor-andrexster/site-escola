import { prisma } from '@/lib/db'
import { TURMAS } from '@/lib/turmas'

/**
 * Aba Projetos: pastas por serie, trabalhos, envio de link do aluno e
 * avaliacao de andamento do professor.
 *
 * Nao confundir com `projetos` (lib/db/portfolio.ts): aquele e o portfolio
 * publico do aluno. Aqui e o trabalho que o professor passa para a turma —
 * o aluno publica o sistema, cola o link, e o professor abre o link e
 * registra como esta o andamento. Cada avaliacao fica no historico; o
 * envio guarda so a ultima, para a listagem da turma nao precisar de join.
 *
 * `cronograma` e `criterios` sao JSON no trabalho (listas curtas, editadas
 * inteiras pelo formulario). As marcas de cada criterio ficam em JSON na
 * avaliacao e espelhadas no envio.
 */

export {
  STATUS_ENVIO, ROTULO_STATUS, ROTULO_MARCA, slugDaSerie, notaSugerida, periodo, dataCurta, etapaDeHoje,
  type StatusEnvio, type Pasta, type Trabalho, type Envio, type EnvioDaTurma, type Avaliacao,
  type Etapa, type Criterio, type Marca, type Marcas,
} from '@/lib/projetos-turma-tipos'
import {
  STATUS_ENVIO, slugDaSerie,
  type StatusEnvio, type Pasta, type Trabalho, type Envio, type EnvioDaTurma, type Avaliacao,
  type Etapa, type Criterio, type Marcas,
} from '@/lib/projetos-turma-tipos'

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
const statusValido = (s: string): StatusEnvio =>
  (STATUS_ENVIO as readonly string[]).includes(s) ? (s as StatusEnvio) : 'enviado'

function lerJson(texto: string | null): unknown {
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}
function lerLista<T>(texto: string | null): T[] {
  const v = lerJson(texto)
  return Array.isArray(v) ? (v as T[]) : []
}
function lerMarcas(texto: string | null): Marcas | null {
  const v = lerJson(texto)
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Marcas) : null
}
const gravarJson = (v: unknown) => (v == null ? null : JSON.stringify(v))

function serializarTrabalho(t: {
  id: string; pasta_id: string; titulo: string; resumo: string | null; briefing: string | null
  arquivo_url: string | null; cronograma: string | null; criterios: string | null; pede_link_grupo: boolean
  publicado: boolean; ordem: number; criado_em: Date; atualizado_em: Date
  projeto_pastas: { serie: string }
}): Trabalho {
  return {
    id: t.id,
    pastaId: t.pasta_id,
    serie: t.projeto_pastas.serie,
    titulo: t.titulo,
    resumo: t.resumo,
    briefing: t.briefing,
    arquivoUrl: t.arquivo_url,
    cronograma: lerLista<Etapa>(t.cronograma),
    criterios: lerLista<Criterio>(t.criterios),
    pedeLinkGrupo: t.pede_link_grupo,
    publicado: t.publicado,
    ordem: t.ordem,
    criadoEm: t.criado_em.toISOString(),
    atualizadoEm: t.atualizado_em.toISOString(),
  }
}

function serializarEnvio(e: {
  id: string; trabalho_id: string; user_id: string; link_url: string; repo_url: string | null; link_grupo: string | null
  comentario: string | null; status: string; nota: unknown; feedback: string | null; etapa: number | null; criterios: string | null
  avaliado_em: Date | null; enviado_em: Date; atualizado_em: Date
}): Envio {
  return {
    id: e.id,
    trabalhoId: e.trabalho_id,
    userId: e.user_id,
    linkUrl: e.link_url,
    repoUrl: e.repo_url,
    linkGrupo: e.link_grupo,
    comentario: e.comentario,
    status: statusValido(e.status),
    nota: e.nota == null ? null : Number(e.nota),
    feedback: e.feedback,
    etapa: e.etapa,
    marcas: lerMarcas(e.criterios),
    avaliadoEm: iso(e.avaliado_em),
    enviadoEm: e.enviado_em.toISOString(),
    atualizadoEm: e.atualizado_em.toISOString(),
  }
}

// ── Pastas ────────────────────────────────────────────────────────────────

export async function listarPastas(): Promise<Pasta[]> {
  const pastas = await prisma.projeto_pastas.findMany({
    orderBy: [{ ordem: 'asc' }, { serie: 'asc' }],
    include: { projeto_trabalhos: { select: { publicado: true } } },
  })
  return pastas.map(p => ({
    id: p.id,
    serie: p.serie,
    ordem: p.ordem,
    totalTrabalhos: p.projeto_trabalhos.length,
    totalPublicados: p.projeto_trabalhos.filter(t => t.publicado).length,
  }))
}

export async function pastaPeloSlug(slug: string): Promise<Pasta | null> {
  const pastas = await listarPastas()
  return pastas.find(p => slugDaSerie(p.serie) === slug) ?? null
}

/** A pasta da serie do aluno ("2° Ano B" cai na pasta "2° Ano"). */
export async function pastaDaSerie(serie: string | null): Promise<Pasta | null> {
  if (!serie) return null
  const pastas = await listarPastas()
  return pastas.find(p => p.serie === serie || serie.startsWith(p.serie + ' ')) ?? null
}

/** Series da escola (lib/turmas) que ainda nao tem pasta. */
export async function seriesSemPasta(): Promise<string[]> {
  const existentes = new Set((await prisma.projeto_pastas.findMany({ select: { serie: true } })).map(p => p.serie))
  return TURMAS.filter(s => !existentes.has(s))
}

export async function criarPasta(serie: string, criadoPor: string | null): Promise<Pasta> {
  const ordem = TURMAS.indexOf(serie as (typeof TURMAS)[number])
  const p = await prisma.projeto_pastas.create({
    data: { serie, ordem: ordem < 0 ? 99 : ordem, criado_por: criadoPor },
  })
  return { id: p.id, serie: p.serie, ordem: p.ordem, totalTrabalhos: 0, totalPublicados: 0 }
}

// ── Trabalhos ─────────────────────────────────────────────────────────────

export async function trabalhosDaPasta(pastaId: string, apenasPublicados: boolean): Promise<Trabalho[]> {
  const lista = await prisma.projeto_trabalhos.findMany({
    where: { pasta_id: pastaId, ...(apenasPublicados ? { publicado: true } : {}) },
    orderBy: [{ ordem: 'asc' }, { criado_em: 'asc' }],
    include: { projeto_pastas: { select: { serie: true } } },
  })
  return lista.map(serializarTrabalho)
}

export async function buscarTrabalho(id: string): Promise<Trabalho | null> {
  const t = await prisma.projeto_trabalhos.findUnique({
    where: { id },
    include: { projeto_pastas: { select: { serie: true } } },
  })
  return t ? serializarTrabalho(t) : null
}

export interface CamposTrabalho {
  titulo: string
  resumo: string | null
  briefing: string | null
  arquivoUrl: string | null
  cronograma: Etapa[]
  criterios: Criterio[]
  pedeLinkGrupo: boolean
  publicado: boolean
}

export async function criarTrabalho(pastaId: string, campos: CamposTrabalho, criadoPor: string | null): Promise<Trabalho> {
  const ultimo = await prisma.projeto_trabalhos.aggregate({ where: { pasta_id: pastaId }, _max: { ordem: true } })
  const t = await prisma.projeto_trabalhos.create({
    data: {
      pasta_id: pastaId,
      titulo: campos.titulo,
      resumo: campos.resumo,
      briefing: campos.briefing,
      arquivo_url: campos.arquivoUrl,
      cronograma: gravarJson(campos.cronograma),
      criterios: gravarJson(campos.criterios),
      pede_link_grupo: campos.pedeLinkGrupo,
      publicado: campos.publicado,
      ordem: (ultimo._max.ordem ?? 0) + 1,
      criado_por: criadoPor,
    },
    include: { projeto_pastas: { select: { serie: true } } },
  })
  return serializarTrabalho(t)
}

export async function atualizarTrabalho(id: string, campos: Partial<CamposTrabalho>): Promise<Trabalho> {
  const t = await prisma.projeto_trabalhos.update({
    where: { id },
    data: {
      ...(campos.titulo !== undefined ? { titulo: campos.titulo } : {}),
      ...(campos.resumo !== undefined ? { resumo: campos.resumo } : {}),
      ...(campos.briefing !== undefined ? { briefing: campos.briefing } : {}),
      ...(campos.arquivoUrl !== undefined ? { arquivo_url: campos.arquivoUrl } : {}),
      ...(campos.cronograma !== undefined ? { cronograma: gravarJson(campos.cronograma) } : {}),
      ...(campos.criterios !== undefined ? { criterios: gravarJson(campos.criterios) } : {}),
      ...(campos.pedeLinkGrupo !== undefined ? { pede_link_grupo: campos.pedeLinkGrupo } : {}),
      ...(campos.publicado !== undefined ? { publicado: campos.publicado } : {}),
      atualizado_em: new Date(),
    },
    include: { projeto_pastas: { select: { serie: true } } },
  })
  return serializarTrabalho(t)
}

export async function removerTrabalho(id: string): Promise<void> {
  await prisma.projeto_trabalhos.delete({ where: { id } })
}

// ── Envios ────────────────────────────────────────────────────────────────

export async function envioDoAluno(trabalhoId: string, userId: string): Promise<Envio | null> {
  const e = await prisma.projeto_envios.findUnique({
    where: { trabalho_id_user_id: { trabalho_id: trabalhoId, user_id: userId } },
  })
  return e ? serializarEnvio(e) : null
}

/**
 * Aluno envia ou atualiza o link. Reenviar depois de uma avaliacao volta o
 * status para `enviado`: o professor precisa olhar de novo. A ultima
 * devolutiva (feedback, etapa, marcas) continua visivel — e o que o aluno
 * usou para corrigir.
 */
export async function salvarEnvio(dados: {
  trabalhoId: string
  userId: string
  linkUrl: string
  repoUrl: string | null
  linkGrupo: string | null
  comentario: string | null
}): Promise<Envio> {
  const e = await prisma.projeto_envios.upsert({
    where: { trabalho_id_user_id: { trabalho_id: dados.trabalhoId, user_id: dados.userId } },
    create: {
      trabalho_id: dados.trabalhoId,
      user_id: dados.userId,
      link_url: dados.linkUrl,
      repo_url: dados.repoUrl,
      link_grupo: dados.linkGrupo,
      comentario: dados.comentario,
      status: 'enviado',
    },
    update: {
      link_url: dados.linkUrl,
      repo_url: dados.repoUrl,
      link_grupo: dados.linkGrupo,
      comentario: dados.comentario,
      status: 'enviado',
      atualizado_em: new Date(),
    },
  })
  return serializarEnvio(e)
}

export async function buscarEnvio(id: string): Promise<(Envio & { serie: string; trabalho: Trabalho }) | null> {
  const e = await prisma.projeto_envios.findUnique({
    where: { id },
    include: { projeto_trabalhos: { include: { projeto_pastas: { select: { serie: true } } } } },
  })
  if (!e) return null
  const trabalho = serializarTrabalho(e.projeto_trabalhos)
  return { ...serializarEnvio(e), serie: trabalho.serie, trabalho }
}

/** Todos os envios de um trabalho, com nome e turma do aluno, mais recentes primeiro. */
export async function enviosDoTrabalho(trabalhoId: string): Promise<EnvioDaTurma[]> {
  const envios = await prisma.projeto_envios.findMany({
    where: { trabalho_id: trabalhoId },
    orderBy: { atualizado_em: 'desc' },
    include: {
      usuarios: {
        select: {
          alunos: { select: { nome: true, matricula: true, turma: true } },
          profiles: { select: { nome_completo: true, turma: true } },
        },
      },
    },
  })
  return envios.map(e => ({
    ...serializarEnvio(e),
    aluno: {
      nome: e.usuarios.alunos?.nome ?? e.usuarios.profiles?.nome_completo ?? 'Aluno sem ficha',
      matricula: e.usuarios.alunos?.matricula ?? null,
      turma: e.usuarios.alunos?.turma ?? e.usuarios.profiles?.turma ?? null,
    },
  }))
}

/** Alunos ativos da serie que ainda nao enviaram nada para este trabalho. */
export async function alunosSemEnvio(trabalhoId: string, serie: string): Promise<{ nome: string; turma: string }[]> {
  const [alunos, envios] = await Promise.all([
    prisma.alunos.findMany({
      where: { ativo: true, OR: [{ serie }, { serie: { startsWith: serie + ' ' } }] },
      select: { nome: true, turma: true, user_id: true },
      orderBy: { nome: 'asc' },
    }),
    prisma.projeto_envios.findMany({ where: { trabalho_id: trabalhoId }, select: { user_id: true } }),
  ])
  const enviaram = new Set(envios.map(e => e.user_id))
  return alunos.filter(a => !a.user_id || !enviaram.has(a.user_id)).map(a => ({ nome: a.nome, turma: a.turma }))
}

// ── Avaliacoes ────────────────────────────────────────────────────────────

/**
 * Registra uma avaliacao de andamento e espelha no envio. Transacao: sem
 * ela, a falha do segundo update deixaria a listagem mostrando um status
 * diferente do historico.
 */
export async function avaliarEnvio(dados: {
  envioId: string
  avaliadorId: string
  status: StatusEnvio
  nota: number | null
  feedback: string | null
  etapa: number | null
  marcas: Marcas | null
}): Promise<Envio> {
  const agora = new Date()
  const marcasJson = gravarJson(dados.marcas)
  const [, envio] = await prisma.$transaction([
    prisma.projeto_avaliacoes.create({
      data: {
        envio_id: dados.envioId,
        avaliador_id: dados.avaliadorId,
        status: dados.status,
        nota: dados.nota,
        feedback: dados.feedback,
        etapa: dados.etapa,
        criterios: marcasJson,
        criado_em: agora,
      },
    }),
    prisma.projeto_envios.update({
      where: { id: dados.envioId },
      data: {
        status: dados.status, nota: dados.nota, feedback: dados.feedback,
        etapa: dados.etapa, criterios: marcasJson, avaliado_em: agora, atualizado_em: agora,
      },
    }),
  ])
  return serializarEnvio(envio)
}

export async function avaliacoesDoEnvio(envioId: string): Promise<Avaliacao[]> {
  const lista = await prisma.projeto_avaliacoes.findMany({
    where: { envio_id: envioId },
    orderBy: { criado_em: 'desc' },
    include: { usuarios: { select: { profiles: { select: { nome_completo: true } } } } },
  })
  return lista.map(a => ({
    id: a.id,
    status: statusValido(a.status),
    nota: a.nota == null ? null : Number(a.nota),
    feedback: a.feedback,
    etapa: a.etapa,
    marcas: lerMarcas(a.criterios),
    criadoEm: a.criado_em.toISOString(),
    avaliador: a.usuarios?.profiles?.nome_completo ?? null,
  }))
}
