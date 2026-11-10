import { prisma } from '@/lib/db'
import { isGestao } from '@/lib/roles'
import { papelEAprovacao } from '@/lib/db/perfis'
import type { Profile } from '@/types/database'
import { Prisma } from '@prisma/client'
import path from 'path'
import { apagarPrivado, mimeDoAudio } from '@/lib/podcast/arquivos'
import {
  anoLetivoAtual, esc, mascararCpf, slugDe, textoParaHtml, NOME_PODCAST,
  STATUS_AUTORIZACAO, STATUS_EPISODIO, TIPOS_EPISODIO,
  type Episodio, type Membro, type PessoaEquipe, type Quadro, type StatusAutorizacao, type StatusEpisodio, type TipoEpisodio,
} from '@/lib/podcast/tipos'

type Tx = Prisma.TransactionClient

/** Participante sem autorizacao valida no momento de publicar. */
export class PendenciaDeAutorizacao extends Error {}

/** Roda dentro da transacao recebida, ou abre uma. Permite juntar editar + republicar numa so. */
function naTransacao<T>(tx: Tx | undefined, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return tx ? fn(tx) : prisma.$transaction(fn)
}

/**
 * Podcast "JB no Ar": equipe, autorizacoes e episodios.
 *
 * Regras que esta camada garante (sem RLS no MariaDB, so codigo):
 * - Aluno so cria e edita episodio com autorizacao ACEITA e do ano letivo.
 * - So monitor do podcast ou gestao publica, devolve ou tira do ar.
 * - Revogar a autorizacao de um aluno tira do ar todo episodio publicado em
 *   que ele aparece (e a noticia no JBInforma junto).
 */

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
const statusAut = (s: string): StatusAutorizacao =>
  (STATUS_AUTORIZACAO as readonly string[]).includes(s) ? (s as StatusAutorizacao) : 'pendente'
const statusEp = (s: string): StatusEpisodio =>
  (STATUS_EPISODIO as readonly string[]).includes(s) ? (s as StatusEpisodio) : 'rascunho'
const tipoEp = (s: string): TipoEpisodio =>
  (TIPOS_EPISODIO as readonly string[]).includes(s) ? (s as TipoEpisodio) : 'entrevista'

// ── Quem e quem ─────────────────────────────────────────────────────────────

export type Acesso = {
  userId: string
  role: Profile['role']
  gestao: boolean
  /** Monitor do podcast (professor designado) ou gestao. */
  moderador: boolean
  membro: Membro | null
}

export async function acessoDe(userId: string): Promise<Acesso | null> {
  const perfil = await papelEAprovacao(userId)
  if (!perfil?.aprovado) return null
  const gestao = isGestao(perfil.role)
  const linha = await prisma.podcast_membros.findUnique({ where: { user_id: userId } })
  const membro = linha ? (await montarMembros([linha]))[0] : null
  return {
    userId,
    role: perfil.role,
    gestao,
    moderador: gestao || membro?.papel === 'monitor',
    membro,
  }
}

type LinhaMembro = Awaited<ReturnType<typeof prisma.podcast_membros.findMany>>[number]

async function montarMembros(linhas: LinhaMembro[]): Promise<Membro[]> {
  if (linhas.length === 0) return []
  const ids = linhas.map(l => l.user_id)
  const [perfis, alunos] = await Promise.all([
    prisma.profiles.findMany({ where: { id: { in: ids } }, select: { id: true, nome_completo: true, turma: true } }),
    prisma.alunos.findMany({ where: { user_id: { in: ids } }, select: { user_id: true, nome: true, turma: true, matricula: true } }),
  ])
  const ano = anoLetivoAtual()
  return linhas.map(l => {
    const p = perfis.find(x => x.id === l.user_id)
    const a = alunos.find(x => x.user_id === l.user_id)
    const status = statusAut(l.autorizacao_status)
    return {
      id: l.id,
      userId: l.user_id,
      papel: l.papel === 'monitor' ? 'monitor' : 'aluno',
      nome: a?.nome ?? p?.nome_completo ?? 'Sem nome',
      turma: a?.turma ?? p?.turma ?? null,
      matricula: a?.matricula ?? null,
      responsavelNome: l.responsavel_nome,
      cpfMascarado: mascararCpf(l.responsavel_cpf),
      autorizacaoStatus: status,
      temArquivo: Boolean(l.autorizacao_arquivo),
      anoLetivo: l.ano_letivo,
      liberado: l.papel === 'monitor' || (status === 'aceita' && l.ano_letivo === ano),
      vencida: l.papel !== 'monitor' && status === 'aceita' && l.ano_letivo !== ano,
      podePostar: l.papel === 'monitor' || l.pode_postar,
      podeAudio: l.papel === 'monitor' || l.pode_audio,
      podeCriar: l.papel === 'monitor' || (status === 'aceita' && l.ano_letivo === ano && l.pode_postar),
    }
  })
}

export async function listarMembros(): Promise<Membro[]> {
  const linhas = await prisma.podcast_membros.findMany({ orderBy: [{ papel: 'desc' }, { criado_em: 'asc' }] })
  const membros = await montarMembros(linhas)
  return membros.sort((a, b) => (a.papel === b.papel ? a.nome.localeCompare(b.nome, 'pt-BR') : a.papel === 'monitor' ? -1 : 1))
}

export async function buscarMembro(id: string) {
  return prisma.podcast_membros.findUnique({ where: { id } })
}

/** Nome para a auditoria (aluno: nome da ficha; professor: nome do perfil). */
export async function nomeDoUsuario(userId: string): Promise<string | null> {
  const a = await prisma.alunos.findFirst({ where: { user_id: userId }, select: { nome: true } })
  if (a) return a.nome
  return (await prisma.profiles.findUnique({ where: { id: userId }, select: { nome_completo: true } }))?.nome_completo ?? null
}

/** Professores aprovados que ainda nao sao monitores do podcast. */
export async function professoresDisponiveis() {
  const jaSao = new Set((await prisma.podcast_membros.findMany({ select: { user_id: true } })).map(m => m.user_id))
  const profs = await prisma.profiles.findMany({
    where: { role: 'professor', aprovado: true },
    select: { id: true, nome_completo: true, disciplina: true },
    orderBy: { nome_completo: 'asc' },
  })
  return profs.filter(p => !jaSao.has(p.id))
}

/** Alunos ativos, com conta no site, que ainda nao estao na equipe. */
export async function alunosDisponiveis() {
  const jaSao = new Set((await prisma.podcast_membros.findMany({ select: { user_id: true } })).map(m => m.user_id))
  const alunos = await prisma.alunos.findMany({
    where: { ativo: true, user_id: { not: null } },
    select: { id: true, nome: true, turma: true, matricula: true, responsavel: true, user_id: true },
    orderBy: { nome: 'asc' },
  })
  return alunos.filter(a => a.user_id && !jaSao.has(a.user_id))
}

export async function adicionarMonitor(userId: string, por: string) {
  return prisma.podcast_membros.create({
    data: { user_id: userId, papel: 'monitor', autorizacao_status: 'aceita', ano_letivo: anoLetivoAtual(), adicionado_por: por },
  })
}

export async function adicionarAluno(
  aluno: { id: string; userId: string },
  responsavel: { nome: string; cpf: string },
  por: string
) {
  return prisma.podcast_membros.create({
    data: {
      user_id: aluno.userId,
      papel: 'aluno',
      aluno_id: aluno.id,
      responsavel_nome: responsavel.nome,
      responsavel_cpf: responsavel.cpf,
      autorizacao_status: 'pendente',
      ano_letivo: anoLetivoAtual(),
      adicionado_por: por,
    },
  })
}

/**
 * Corrige responsavel/CPF (ou renova para o ano novo). O termo antigo deixa de
 * valer: volta para pendente, e o que estava no ar com o aluno sai do ar.
 * Devolve quantos episodios sairam.
 */
export async function atualizarResponsavel(id: string, responsavel: { nome: string; cpf: string }): Promise<number> {
  return prisma.$transaction(async tx => {
  const m = await tx.podcast_membros.update({
    where: { id },
    data: {
      responsavel_nome: responsavel.nome,
      responsavel_cpf: responsavel.cpf,
      autorizacao_status: 'pendente',
      autorizacao_arquivo: null,
      autorizacao_enviada_em: null,
      autorizacao_aceita_em: null,
      autorizacao_aceita_por: null,
      ano_letivo: anoLetivoAtual(),
    },
  })
  return retirarEpisodiosDe(tx, m.user_id, 'Tirado do ar: o responsável foi alterado e falta o termo novo assinado.')
  })
}

/** Termo assinado novo: espera conferencia. Se o aluno estava liberado, o que estava no ar sai ate o monitor aceitar. */
export async function registrarAutorizacao(id: string, caminho: string): Promise<number> {
  return prisma.$transaction(async tx => {
    const m = await tx.podcast_membros.update({
      where: { id },
      data: {
        autorizacao_arquivo: caminho,
        autorizacao_status: 'enviada',
        autorizacao_enviada_em: new Date(),
        autorizacao_aceita_em: null,
        autorizacao_aceita_por: null,
        ano_letivo: anoLetivoAtual(),
      },
    })
    return retirarEpisodiosDe(tx, m.user_id, 'Tirado do ar: chegou um termo novo e o monitor ainda não conferiu.')
  })
}

export async function aceitarAutorizacao(id: string, por: string) {
  return prisma.podcast_membros.update({
    where: { id },
    data: { autorizacao_status: 'aceita', autorizacao_aceita_em: new Date(), autorizacao_aceita_por: por },
  })
}

/**
 * Revoga: bloqueia o aluno e tira do ar os episodios publicados com ele.
 * Devolve quantos episodios sairam do ar, para a tela avisar.
 */
/** Tira do ar todo episodio publicado em que a pessoa aparece (e a noticia junto). */
async function retirarEpisodiosDe(tx: Tx, userId: string, motivo: string): Promise<number> {
  const eps = await tx.podcast_episodios.findMany({
    where: {
      status: 'publicado',
      OR: [{ autor_id: userId }, { podcast_participantes: { some: { user_id: userId } } }],
    },
    select: { id: true, noticia_id: true },
  })
  for (const e of eps) {
    await tx.podcast_episodios.update({ where: { id: e.id }, data: { status: 'retirado', feedback: motivo, atualizado_em: new Date() } })
    if (e.noticia_id) await tx.noticias.updateMany({ where: { id: e.noticia_id }, data: { publicado: false } })
  }
  return eps.length
}

/**
 * Revoga: bloqueia o aluno, tira do ar os episodios com ele e descarta o
 * termo (para nao ser "aceito" de novo com o papel que o responsavel revogou).
 * Devolve quantos episodios sairam do ar.
 */
export async function revogarAutorizacao(id: string): Promise<number> {
  return prisma.$transaction(async tx => {
    const m = await tx.podcast_membros.update({
      where: { id },
      data: { autorizacao_status: 'revogada', autorizacao_arquivo: null, autorizacao_aceita_em: null, autorizacao_aceita_por: null },
    })
    return retirarEpisodiosDe(tx, m.user_id, 'Tirado do ar: a autorização de um participante foi revogada.')
  })
}

/** Sai da equipe. Recusa se a pessoa aparece em episodio publicado (revogue antes, que tira do ar). */
export async function removerMembro(id: string): Promise<{ erro: string } | { ok: true }> {
  const m = await prisma.podcast_membros.findUnique({ where: { id } })
  if (!m) return { erro: 'Membro não encontrado.' }
  const noAr = await prisma.podcast_episodios.count({
    where: { status: 'publicado', OR: [{ autor_id: m.user_id }, { podcast_participantes: { some: { user_id: m.user_id } } }] },
  })
  if (noAr > 0) return { erro: `Essa pessoa aparece em ${noAr} episódio(s) no ar. Tire do ar antes de remover.` }
  await prisma.podcast_membros.delete({ where: { id } })
  return { ok: true }
}

/** Liga/desliga o que o aluno pode fazer. So aluno (monitor pode tudo). */
export async function definirPermissoes(id: string, p: { podePostar?: boolean; podeAudio?: boolean }) {
  return prisma.podcast_membros.update({
    where: { id },
    data: {
      ...(p.podePostar !== undefined ? { pode_postar: p.podePostar } : {}),
      ...(p.podeAudio !== undefined ? { pode_audio: p.podeAudio } : {}),
    },
  })
}

/** Numeros do painel. */
export async function resumoDoPainel() {
  const [membros, eps] = await Promise.all([
    listarMembros(),
    prisma.podcast_episodios.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  const alunos = membros.filter(m => m.papel === 'aluno')
  const conta = (s: string) => eps.find(e => e.status === s)?._count._all ?? 0
  return {
    monitores: membros.filter(m => m.papel === 'monitor').length,
    alunos: alunos.length,
    podemCriar: alunos.filter(m => m.podeCriar).length,
    esperandoTermo: alunos.filter(m => m.autorizacaoStatus === 'pendente' || m.vencida).length,
    termoParaConferir: alunos.filter(m => m.autorizacaoStatus === 'enviada').length,
    semPermissao: alunos.filter(m => m.liberado && !m.podePostar).length,
    emRevisao: conta('revisao'),
    noAr: conta('publicado'),
    rascunhos: conta('rascunho') + conta('ajustar'),
  }
}

/** Quantos episodios cada pessoa fez (autor ou participante). */
export async function episodiosPorPessoa(): Promise<Record<string, number>> {
  const ps = await prisma.podcast_participantes.groupBy({ by: ['user_id'], _count: { _all: true } })
  return Object.fromEntries(ps.map(p => [p.user_id, p._count._all]))
}

/** Dados para preencher o termo do responsavel. CPF inteiro: so para o PDF. */
export async function dadosDoTermo(membroId: string) {
  const m = await prisma.podcast_membros.findUnique({ where: { id: membroId } })
  if (!m || m.papel !== 'aluno') return null
  const a = m.aluno_id ? await prisma.alunos.findUnique({ where: { id: m.aluno_id }, select: { nome: true, turma: true, matricula: true } }) : null
  return {
    alunoNome: a?.nome ?? '',
    turma: a?.turma ?? '',
    matricula: a?.matricula ?? '',
    responsavelNome: m.responsavel_nome ?? '',
    responsavelCpf: m.responsavel_cpf ?? '',
    ano: m.ano_letivo,
  }
}

// ── Episodios ───────────────────────────────────────────────────────────────

type LinhaEpisodio = Awaited<ReturnType<typeof prisma.podcast_episodios.findMany<{ include: { podcast_participantes: true } }>>>[number]

async function montarEpisodios(linhas: LinhaEpisodio[], db: Tx = prisma): Promise<Episodio[]> {
  if (linhas.length === 0) return []
  const ids = Array.from(new Set(linhas.flatMap(l => [l.autor_id, ...l.podcast_participantes.map(p => p.user_id)])))
  const [perfis, alunos] = await Promise.all([
    db.profiles.findMany({ where: { id: { in: ids } }, select: { id: true, nome_completo: true, turma: true } }),
    db.alunos.findMany({ where: { user_id: { in: ids } }, select: { user_id: true, nome: true, turma: true } }),
  ])
  const quadros = await db.podcast_quadros.findMany({ select: { chave: true, nome: true } })
  const pessoa = (id: string) => {
    const a = alunos.find(x => x.user_id === id)
    const p = perfis.find(x => x.id === id)
    return { nome: a?.nome ?? p?.nome_completo ?? 'Alguém da equipe', turma: a?.turma ?? p?.turma ?? null }
  }
  return linhas.map(l => ({
    id: l.id,
    slug: l.slug,
    tipo: tipoEp(l.tipo),
    quadro: l.quadro,
    quadroNome: quadros.find(q => q.chave === l.quadro)?.nome ?? null,
    titulo: l.titulo,
    resumo: l.resumo,
    texto: l.texto,
    entrevistadoNome: l.entrevistado_nome,
    entrevistadoDescricao: l.entrevistado_descricao,
    temTermoEntrevistado: Boolean(l.termo_entrevistado),
    // audio_url guarda o caminho na pasta privada; para fora vai a rota que confere quem ouve.
    audioUrl: l.audio_url ? `/api/podcast/audio/${l.id}?v=${l.audio_bytes ?? 0}` : null,
    audioBytes: l.audio_bytes,
    audioMime: l.audio_url ? mimeDoAudio(l.audio_url) : null,
    audioExt: l.audio_url ? path.extname(l.audio_url).slice(1) : null,
    capaUrl: l.capa ? `/api/podcast/capa/${l.id}?v=${path.basename(l.capa, path.extname(l.capa)).slice(-8)}` : null,
    categoria: l.categoria,
    transcricao: l.transcricao,
    // 'gerando' ha mais de 5 min: o processo morreu (deploy, queda). Vira erro para poder tentar de novo.
    transcricaoStatus: l.transcricao_status === 'gerando' && l.transcricao_em && Date.now() - l.transcricao_em.getTime() > 5 * 60_000
      ? 'erro'
      : (['gerando', 'pronta', 'erro'].includes(l.transcricao_status ?? '') ? (l.transcricao_status as 'gerando' | 'pronta' | 'erro') : null),
    transcricaoErro: l.transcricao_status === 'gerando' ? 'A transcrição parou no meio. Tente de novo.' : l.transcricao_erro,
    transcricaoPublica: l.transcricao_publica,
    plays: l.plays,
    status: statusEp(l.status),
    feedback: l.feedback,
    noJbinforma: l.no_jbinforma,
    noticiaId: l.noticia_id,
    autorId: l.autor_id,
    autorNome: pessoa(l.autor_id).nome,
    participantes: l.podcast_participantes.map(p => ({ userId: p.user_id, ...pessoa(p.user_id) })),
    publicadoEm: iso(l.publicado_em),
    criadoEm: l.criado_em.toISOString(),
    atualizadoEm: l.atualizado_em.toISOString(),
  }))
}

const COM_PARTICIPANTES = { podcast_participantes: true } as const

export async function buscarEpisodio(id: string, db: Tx = prisma): Promise<Episodio | null> {
  const l = await db.podcast_episodios.findUnique({ where: { id }, include: COM_PARTICIPANTES })
  return l ? (await montarEpisodios([l], db))[0] : null
}

export async function episodioPublicadoPorSlug(slug: string): Promise<Episodio | null> {
  const l = await prisma.podcast_episodios.findFirst({ where: { slug, status: 'publicado' }, include: COM_PARTICIPANTES })
  return l ? (await montarEpisodios([l]))[0] : null
}

export async function episodiosPublicados(limite = 60): Promise<Episodio[]> {
  const ls = await prisma.podcast_episodios.findMany({
    where: { status: 'publicado' },
    orderBy: { publicado_em: 'desc' },
    take: limite,
    include: COM_PARTICIPANTES,
  })
  return montarEpisodios(ls)
}

/** Para o monitor: tudo, o que espera revisao primeiro. */
export async function todosOsEpisodios(): Promise<Episodio[]> {
  const ls = await prisma.podcast_episodios.findMany({ orderBy: { atualizado_em: 'desc' }, take: 200, include: COM_PARTICIPANTES })
  const eps = await montarEpisodios(ls)
  const peso: Record<StatusEpisodio, number> = { revisao: 0, ajustar: 1, rascunho: 2, publicado: 3, retirado: 4 }
  return eps.sort((a, b) => peso[a.status] - peso[b.status])
}

/** Para o aluno: os que ele criou ou em que aparece. */
export async function episodiosDoAluno(userId: string): Promise<Episodio[]> {
  const ls = await prisma.podcast_episodios.findMany({
    where: { OR: [{ autor_id: userId }, { podcast_participantes: { some: { user_id: userId } } }] },
    orderBy: { atualizado_em: 'desc' },
    include: COM_PARTICIPANTES,
  })
  return montarEpisodios(ls)
}

async function slugLivre(base: string, ignorarId?: string): Promise<string> {
  const raiz = slugDe(base)
  for (let i = 0; i < 50; i++) {
    const tentativa = i === 0 ? raiz : `${raiz}-${i + 1}`
    const existe = await prisma.podcast_episodios.findFirst({ where: { slug: tentativa, ...(ignorarId ? { id: { not: ignorarId } } : {}) }, select: { id: true } })
    if (!existe) return tentativa
  }
  return `${raiz}-${Date.now().toString(36)}`
}

export async function criarEpisodio(autorId: string, campos: { titulo: string; tipo: TipoEpisodio; quadro: string | null }) {
  let slug = await slugLivre(campos.titulo)
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await criarComSlug(autorId, campos, slug)
    } catch (e) {
      // Dois episodios com o mesmo titulo criados no mesmo instante.
      if (tentativa < 3 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        slug = `${slugDe(campos.titulo)}-${Date.now().toString(36)}`
        continue
      }
      throw e
    }
  }
}

function criarComSlug(autorId: string, campos: { titulo: string; tipo: TipoEpisodio; quadro: string | null }, slug: string) {
  return prisma.podcast_episodios.create({
    data: {
      slug,
      titulo: campos.titulo,
      tipo: campos.tipo,
      quadro: campos.quadro,
      autor_id: autorId,
      podcast_participantes: { create: [{ user_id: autorId }] },
    },
    select: { id: true },
  })
}

export interface CamposEpisodio {
  titulo?: string
  tipo?: TipoEpisodio
  quadro?: string | null
  resumo?: string | null
  texto?: string | null
  entrevistadoNome?: string | null
  entrevistadoDescricao?: string | null
  categoria?: string | null
  noJbinforma?: boolean
  participantes?: string[]
}

export async function atualizarEpisodio(id: string, c: CamposEpisodio, emTx?: Tx) {
  return naTransacao(emTx, async tx => {
    const atual = await tx.podcast_episodios.findUniqueOrThrow({ where: { id }, select: { autor_id: true, status: true } })
    await tx.podcast_episodios.update({
      where: { id },
      data: {
        ...(c.titulo !== undefined ? { titulo: c.titulo } : {}),
        ...(c.tipo !== undefined ? { tipo: c.tipo } : {}),
        ...(c.quadro !== undefined ? { quadro: c.quadro } : {}),
        ...(c.resumo !== undefined ? { resumo: c.resumo } : {}),
        ...(c.texto !== undefined ? { texto: c.texto } : {}),
        ...(c.entrevistadoNome !== undefined ? { entrevistado_nome: c.entrevistadoNome } : {}),
        ...(c.entrevistadoDescricao !== undefined ? { entrevistado_descricao: c.entrevistadoDescricao } : {}),
        ...(c.categoria !== undefined ? { categoria: c.categoria } : {}),
        ...(c.noJbinforma !== undefined ? { no_jbinforma: c.noJbinforma } : {}),
        atualizado_em: new Date(),
      },
    })
    if (c.participantes) {
      const lista = Array.from(new Set([atual.autor_id, ...c.participantes]))
      await tx.podcast_participantes.deleteMany({ where: { episodio_id: id } })
      await tx.podcast_participantes.createMany({ data: lista.map(user_id => ({ episodio_id: id, user_id })) })
    }
  })
}

/** Troca o audio (caminho na pasta privada) e apaga o arquivo anterior. */
export async function definirAudio(id: string, caminho: string | null, bytes: number | null) {
  const antes = await prisma.podcast_episodios.findUnique({ where: { id }, select: { audio_url: true } })
  const r = await prisma.podcast_episodios.update({ where: { id }, data: { audio_url: caminho, audio_bytes: bytes, atualizado_em: new Date() } })
  if (antes?.audio_url && antes.audio_url !== caminho) await apagarPrivado(antes.audio_url)
  return r
}

/** Para as rotas de audio e capa: caminhos no disco e quem pode abrir. */
export async function audioDoEpisodio(id: string) {
  return prisma.podcast_episodios.findUnique({
    where: { id },
    select: { audio_url: true, capa: true, status: true, autor_id: true, podcast_participantes: { select: { user_id: true } } },
  })
}

/** Troca a foto de capa (caminho na pasta privada) e apaga a anterior. */
export async function definirCapa(id: string, caminho: string | null) {
  const antes = await prisma.podcast_episodios.findUnique({ where: { id }, select: { capa: true } })
  const r = await prisma.podcast_episodios.update({ where: { id }, data: { capa: caminho, atualizado_em: new Date() } })
  if (antes?.capa && antes.capa !== caminho) await apagarPrivado(antes.capa)
  return r
}

/** Conta um play. So episodio publicado. */
export async function contarPlay(id: string): Promise<boolean> {
  const r = await prisma.podcast_episodios.updateMany({ where: { id, status: 'publicado' }, data: { plays: { increment: 1 } } })
  return r.count > 0
}

// ── Transcricao ─────────────────────────────────────────────────────────────

export async function caminhoDoAudio(id: string) {
  return (await prisma.podcast_episodios.findUnique({ where: { id }, select: { audio_url: true } }))?.audio_url ?? null
}

export async function marcarTranscricao(id: string, d: { status: 'gerando' | 'pronta' | 'erro'; texto?: string; erro?: string | null }) {
  await prisma.podcast_episodios.update({
    where: { id },
    data: {
      transcricao_status: d.status,
      transcricao_erro: d.erro ?? null,
      transcricao_em: new Date(),
      ...(d.texto !== undefined ? { transcricao: d.texto } : {}),
    },
  })
}

/** Monitor corrige o texto e decide se aparece no site. Nao mexe em atualizado_em (nao e conteudo do aluno). */
export async function salvarTranscricao(id: string, d: { texto?: string | null; publica?: boolean }) {
  await prisma.podcast_episodios.update({
    where: { id },
    data: {
      ...(d.texto !== undefined ? { transcricao: d.texto, transcricao_status: d.texto ? 'pronta' : null, transcricao_erro: null } : {}),
      ...(d.publica !== undefined ? { transcricao_publica: d.publica } : {}),
    },
  })
}

export async function definirTermoEntrevistado(id: string, caminho: string) {
  const antes = await prisma.podcast_episodios.findUnique({ where: { id }, select: { termo_entrevistado: true } })
  const r = await prisma.podcast_episodios.update({ where: { id }, data: { termo_entrevistado: caminho, atualizado_em: new Date() } })
  if (antes?.termo_entrevistado && antes.termo_entrevistado !== caminho) await apagarPrivado(antes.termo_entrevistado)
  return r
}

/** Equipe para o editor do episodio: so nome e turma. */
export function paraEditor(m: { userId: string; nome: string; turma: string | null }): PessoaEquipe {
  return { userId: m.userId, nome: m.nome, turma: m.turma }
}

export async function caminhoDoTermoEntrevistado(id: string) {
  return (await prisma.podcast_episodios.findUnique({ where: { id }, select: { termo_entrevistado: true } }))?.termo_entrevistado ?? null
}

export async function caminhoDaAutorizacao(membroId: string) {
  return (await prisma.podcast_membros.findUnique({ where: { id: membroId }, select: { autorizacao_arquivo: true } }))?.autorizacao_arquivo ?? null
}

export async function mudarStatus(id: string, status: StatusEpisodio, feedback?: string | null) {
  return prisma.podcast_episodios.update({
    where: { id },
    data: { status, ...(feedback !== undefined ? { feedback } : {}), atualizado_em: new Date() },
  })
}

/** Apaga o episodio, a noticia (ja despublicada) que ele tenha gerado e o audio. */
export async function removerEpisodio(id: string) {
  const ep = await prisma.podcast_episodios.findUnique({ where: { id }, select: { noticia_id: true, audio_url: true, capa: true, termo_entrevistado: true } })
  await prisma.$transaction(async tx => {
    await tx.podcast_episodios.delete({ where: { id } })
    // O log da noticia fica (FK ON DELETE SET NULL): registro de quem publicou e quando.
    if (ep?.noticia_id) await tx.noticias.deleteMany({ where: { id: ep.noticia_id, publicado: false } })
  })
  await apagarPrivado(ep?.audio_url ?? null)
  await apagarPrivado(ep?.termo_entrevistado ?? null)
  await apagarPrivado(ep?.capa ?? null)
}

/**
 * Participantes sem autorizacao valida. Publicar com alguem assim e
 * exatamente o que a autorizacao existe para impedir.
 */
export async function participantesSemAutorizacao(ep: Episodio, tx: Tx = prisma): Promise<string[]> {
  const ids = ep.participantes.map(p => p.userId)
  if (ids.length === 0) return []
  // Trava as linhas da equipe ate o fim da transacao: uma revogacao ao mesmo tempo espera.
  if (tx !== prisma) {
    await tx.$queryRaw`SELECT id FROM podcast_membros WHERE user_id IN (${Prisma.join(ids)}) FOR UPDATE`
  }
  const [linhas, perfis] = await Promise.all([
    tx.podcast_membros.findMany({ where: { user_id: { in: ids } } }),
    tx.profiles.findMany({ where: { id: { in: ids } }, select: { id: true, role: true } }),
  ])
  const membros = await montarMembros(linhas)
  const ano = anoLetivoAtual()
  return ep.participantes
    .filter(p => {
      const m = membros.find(x => x.userId === p.userId)
      if (m) return !(m.papel === 'monitor' || (m.autorizacaoStatus === 'aceita' && m.anoLetivo === ano))
      // Fora da equipe: adulto da escola (direcao, professor) nao precisa de termo; aluno precisa.
      const role = perfis.find(x => x.id === p.userId)?.role
      return !(role && (isGestao(role as Profile['role']) || role === 'professor'))
    })
    .map(p => p.nome)
}

/**
 * Publica: muda o status e, se pedido, cria ou atualiza a noticia no
 * JBInforma (categoria `podcast`) com o texto e o link para ouvir.
 */
export async function publicarEpisodio(ep: Episodio, por: { id: string; nome: string }, emTx?: Tx) {
  const resumo = ep.resumo ?? (ep.texto ? ep.texto.slice(0, 200) : null)
  const rodape = ep.audioUrl
    ? `\n<p><strong>Ouça o episódio completo no <a href="/podcast/${ep.slug}">${NOME_PODCAST}</a>.</strong></p>`
    : ''
  const creditos = `<p><em>Por ${ep.participantes.map(p => esc(p.nome.split(/\s+/)[0] ?? '')).join(', ')}, equipe do ${NOME_PODCAST}.</em></p>`
  const conteudo = `${textoParaHtml(ep.texto)}${rodape}\n${creditos}`

  return naTransacao(emTx, async tx => {
    // Participantes relidos dentro da transacao: se a lista mudou durante o publicar, vale a de agora.
    const atuais = await tx.podcast_participantes.findMany({ where: { episodio_id: ep.id }, select: { user_id: true } })
    const sem = await participantesSemAutorizacao(
      { ...ep, participantes: atuais.map(a => ep.participantes.find(p => p.userId === a.user_id) ?? { userId: a.user_id, nome: 'Participante novo', turma: null }) },
      tx
    )
    if (sem.length) throw new PendenciaDeAutorizacao(`Sem autorização aceita: ${sem.join(', ')}.`)
    let noticiaId = ep.noticiaId
    if (ep.noJbinforma) {
      if (noticiaId && (await tx.noticias.findUnique({ where: { id: noticiaId }, select: { id: true } }))) {
        await tx.noticias.update({
          where: { id: noticiaId },
          data: { titulo: ep.titulo, resumo, conteudo, publicado: true, categoria: ep.categoria ?? 'podcast', imagem_url: ep.capaUrl, updated_at: new Date() },
        })
      } else {
        let slug = `podcast-${ep.slug}`
        if (await tx.noticias.findUnique({ where: { slug }, select: { id: true } })) slug = `${slug}-${Date.now().toString(36)}`
        const n = await tx.noticias.create({
          data: {
            titulo: ep.titulo, slug, resumo, conteudo, publicado: true, destaque_home: false,
            categoria: ep.categoria ?? 'podcast', imagem_url: ep.capaUrl, autor_id: por.id, autor_nome: `${NOME_PODCAST} · ${por.nome}`,
          },
          select: { id: true },
        })
        noticiaId = n.id
      }
      await tx.noticias_log.create({
        data: { noticia_id: noticiaId!, noticia_titulo: ep.titulo, user_id: por.id, autor_nome: por.nome, acao: 'publicou (podcast)' },
      })
    } else if (noticiaId) {
      await tx.noticias.updateMany({ where: { id: noticiaId }, data: { publicado: false } })
    }
    await tx.podcast_episodios.update({
      where: { id: ep.id },
      data: {
        status: 'publicado', feedback: null, noticia_id: noticiaId,
        publicado_em: ep.publicadoEm ? new Date(ep.publicadoEm) : new Date(), publicado_por: por.id, atualizado_em: new Date(),
      },
    })
  })
}

export async function retirarEpisodio(ep: Episodio, motivo: string | null) {
  return prisma.$transaction(async tx => {
    await tx.podcast_episodios.update({ where: { id: ep.id }, data: { status: 'retirado', feedback: motivo, atualizado_em: new Date() } })
    if (ep.noticiaId) await tx.noticias.updateMany({ where: { id: ep.noticiaId }, data: { publicado: false } })
  })
}

/** Equipe que aparece no site publico: alunos liberados e monitores. So primeiro nome e turma. */
export async function equipePublica() {
  return (await listarMembros()).filter(m => m.liberado)
}

// ── Quadros ─────────────────────────────────────────────────────────────────

export async function listarQuadros(soAtivos = false): Promise<Quadro[]> {
  const [qs, uso] = await Promise.all([
    prisma.podcast_quadros.findMany({ where: soAtivos ? { ativo: true } : {}, orderBy: [{ ordem: 'asc' }, { nome: 'asc' }] }),
    prisma.podcast_episodios.groupBy({ by: ['quadro'], _count: { _all: true } }),
  ])
  return qs.map(q => ({
    id: q.id, chave: q.chave, nome: q.nome, ideia: q.ideia, ordem: q.ordem, ativo: q.ativo,
    episodios: uso.find(u => u.quadro === q.chave)?._count._all ?? 0,
  }))
}

/** Quadro que pode ser escolhido agora: ativo, ou o que o episodio ja usa. */
export async function quadroValido(chave: unknown, atual?: string | null): Promise<string | null> {
  if (typeof chave !== 'string' || !chave) return null
  if (chave === atual) return chave
  const q = await prisma.podcast_quadros.findUnique({ where: { chave }, select: { ativo: true } })
  return q?.ativo ? chave : null
}

export async function buscarQuadro(id: string) {
  return prisma.podcast_quadros.findUnique({ where: { id } })
}

export async function criarQuadro(nome: string, ideia: string | null, por: string): Promise<{ erro: string } | { id: string }> {
  const chave = slugDe(nome).slice(0, 30).replace(/-+$/, '')
  if (await prisma.podcast_quadros.findUnique({ where: { chave }, select: { id: true } })) {
    return { erro: 'Já existe um quadro com esse nome (ou muito parecido).' }
  }
  const ultimo = await prisma.podcast_quadros.aggregate({ _max: { ordem: true } })
  try {
    const q = await prisma.podcast_quadros.create({ data: { chave, nome, ideia, ordem: (ultimo._max.ordem ?? 0) + 1, criado_por: por }, select: { id: true } })
    return { id: q.id }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { erro: 'Já existe um quadro com esse nome.' }
    throw e
  }
}

/** Muda nome, ideia ou ativo. A chave nao muda: os episodios apontam para ela. */
export async function atualizarQuadro(id: string, c: { nome?: string; ideia?: string | null; ativo?: boolean }) {
  return prisma.podcast_quadros.update({
    where: { id },
    data: {
      ...(c.nome !== undefined ? { nome: c.nome } : {}),
      ...(c.ideia !== undefined ? { ideia: c.ideia } : {}),
      ...(c.ativo !== undefined ? { ativo: c.ativo } : {}),
    },
  })
}

/** Sobe ou desce um quadro na ordem, trocando de lugar com o vizinho. */
export async function moverQuadro(id: string, direcao: 'cima' | 'baixo') {
  return prisma.$transaction(async tx => {
    const todos = await tx.podcast_quadros.findMany({ orderBy: [{ ordem: 'asc' }, { nome: 'asc' }], select: { id: true } })
    const i = todos.findIndex(q => q.id === id)
    const j = direcao === 'cima' ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= todos.length) return
    ;[todos[i], todos[j]] = [todos[j], todos[i]]
    // Regrava a ordem de todos: conserta tambem ordens repetidas.
    for (let k = 0; k < todos.length; k++) await tx.podcast_quadros.update({ where: { id: todos[k].id }, data: { ordem: k + 1 } })
  })
}

/** Apaga quadro sem episodio. Com episodio, so da para desativar (o historico continua com o nome). */
export async function removerQuadro(id: string): Promise<{ erro: string } | { ok: true }> {
  const q = await prisma.podcast_quadros.findUnique({ where: { id } })
  if (!q) return { erro: 'Quadro não encontrado.' }
  const uso = await prisma.podcast_episodios.count({ where: { quadro: q.chave } })
  if (uso > 0) return { erro: `Este quadro tem ${uso} episódio(s). Desative em vez de apagar: ele some das opções e os episódios continuam com o nome.` }
  await prisma.podcast_quadros.delete({ where: { id } })
  return { ok: true }
}
