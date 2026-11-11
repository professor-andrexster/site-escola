import { prisma } from '@/lib/db'
import type { noticias as LinhaNoticia } from '@prisma/client'
import { anoLetivoAtual, nomePublico, slugDe } from '@/lib/podcast/tipos'
import {
  CHECKLIST, COMO_OUVIU, SLUGS_RESERVADOS, STATUS, TIPOS, ehEditoria, ehTema, ehVeredito, ehVinculo, hojeSP, textoDaRedacaoParaHtml,
  type ColunaPauta, type Correcao, type Edicao, type Fonte, type Materia, type Pauta, type StatusMateria, type StatusPauta, type TipoMateria,
} from '@/lib/jornal/tipos'

/**
 * Redacao do JBInforma. A materia mora na propria tabela `noticias` (as paginas
 * publicas continuam lendo `publicado = true`); as colunas novas guardam o que
 * faz dela jornal: editoria, fontes, conferencia, selo da checagem.
 *
 * Regras garantidas aqui (sem RLS no MariaDB, so codigo):
 * - `publicado` so vira true pela funcao publicarMateria, chamada pelo monitor.
 * - O HTML de `conteudo` sempre sai do texto puro: aluno nao injeta marcacao.
 * - Materia com `status` NULL e noticia antiga (ou do podcast): a redacao nao mexe.
 */

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null)
const dia = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null)

function lerJson<T>(v: string | null, padrao: T): T {
  if (!v) return padrao
  try { return JSON.parse(v) as T } catch { return padrao }
}

export function limparFontes(v: unknown): Fonte[] {
  if (!Array.isArray(v)) return []
  return v
    .map(f => {
      const o = (f ?? {}) as Record<string, unknown>
      const nome = typeof o.nome === 'string' ? o.nome.trim().slice(0, 80) : ''
      const papel = typeof o.papel === 'string' ? o.papel.trim().slice(0, 120) : ''
      const como = typeof o.como === 'string' && o.como in COMO_OUVIU ? (o.como as Fonte['como']) : 'pessoalmente'
      return { nome, papel, como }
    })
    .filter(f => f.nome.length >= 2)
    .slice(0, 12)
}

function paraMateria(n: LinhaNoticia): Materia {
  const tipo = (TIPOS as readonly string[]).includes(n.tipo) ? (n.tipo as TipoMateria) : 'materia'
  return {
    id: n.id,
    slug: n.slug,
    tipo,
    editoria: ehEditoria(n.editoria) ? n.editoria : null,
    categoria: n.categoria,
    titulo: n.titulo,
    resumo: n.resumo,
    texto: n.texto,
    imagemUrl: n.imagem_url,
    fontes: limparFontes(lerJson<unknown>(n.fontes, [])),
    checklist: lerJson<string[]>(n.checklist, []).filter(c => typeof c === 'string'),
    boato: n.boato,
    veredito: ehVeredito(n.veredito) ? n.veredito : null,
    tema: ehTema(n.tema) ? n.tema : null,
    comoChecamos: (n.como_checamos ?? '').split('\n').map(l => l.trim()).filter(Boolean),
    memoriaAno: n.memoria_ano,
    validoAte: dia(n.valido_ate),
    status: (STATUS as readonly string[]).includes(n.status ?? '') ? (n.status as StatusMateria) : n.publicado ? 'publicado' : 'rascunho',
    feedback: n.feedback,
    autorId: n.autor_id,
    autorNome: n.autor_nome ?? '',
    pautaId: n.pauta_id,
    publicadoEm: iso(n.publicado_em),
    criadoEm: n.created_at.toISOString(),
    atualizadoEm: n.updated_at.toISOString(),
  }
}

// ── Redacao ─────────────────────────────────────────────────────────────────

/** So materia nascida na redacao (status preenchido). Noticia antiga devolve null. */
export async function buscarMateria(id: string): Promise<Materia | null> {
  const n = await prisma.noticias.findUnique({ where: { id } })
  return n && n.status ? paraMateria(n) : null
}

export async function materiasDoAutor(userId: string): Promise<Materia[]> {
  const l = await prisma.noticias.findMany({ where: { autor_id: userId, NOT: { status: null } }, orderBy: { updated_at: 'desc' }, take: 200 })
  return l.map(paraMateria)
}

export async function todasAsMaterias(): Promise<Materia[]> {
  const l = await prisma.noticias.findMany({ where: { NOT: { status: null } }, orderBy: { updated_at: 'desc' }, take: 300 })
  return l.map(paraMateria)
}

async function slugLivre(titulo: string): Promise<string> {
  let base = slugDe(titulo)
  if (base === 'episodio') base = 'materia'
  if (SLUGS_RESERVADOS.includes(base)) base = `${base}-jb`
  let slug = base
  for (let i = 2; await prisma.noticias.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`
  return slug
}

export async function criarMateria(autor: { id: string; nome: string }, c: { titulo: string; tipo: TipoMateria; pautaId?: string | null }) {
  const slug = await slugLivre(c.titulo)
  return prisma.$transaction(async tx => {
    const n = await tx.noticias.create({
      data: {
        titulo: c.titulo, slug, tipo: c.tipo, status: 'rascunho', publicado: false, destaque_home: false,
        autor_id: autor.id, autor_nome: autor.nome, pauta_id: c.pautaId ?? null,
      },
      select: { id: true },
    })
    if (c.pautaId) {
      // A pauta so e pega se ainda estiver livre: dois alunos nao levam a mesma.
      const pegou = await tx.jornal_pautas.updateMany({
        where: { id: c.pautaId, status: 'sugerida', noticia_id: null },
        data: { status: 'apurando', responsavel_id: autor.id, noticia_id: n.id, atualizado_em: new Date() },
      })
      if (pegou.count === 0) throw new PautaIndisponivel()
    }
    return n
  })
}
export class PautaIndisponivel extends Error {}

export interface CamposMateria {
  titulo: string
  resumo: string | null
  texto: string | null
  editoria: string | null
  categoria: string | null
  fontes: Fonte[]
  checklist: string[]
  boato: string | null
  veredito: string | null
  tema: string | null
  comoChecamos: string[]
  memoriaAno: number | null
  validoAte: string | null
}

export async function atualizarMateria(id: string, tipo: TipoMateria, c: CamposMateria) {
  const validas = CHECKLIST[tipo].map(i => i.chave)
  await prisma.noticias.update({
    where: { id },
    data: {
      titulo: c.titulo,
      resumo: c.resumo,
      texto: c.texto,
      conteudo: textoDaRedacaoParaHtml(c.texto) || null,
      editoria: ehEditoria(c.editoria) ? c.editoria : null,
      categoria: c.categoria,
      fontes: JSON.stringify(c.fontes),
      checklist: JSON.stringify(c.checklist.filter(k => validas.includes(k))),
      boato: tipo === 'checagem' ? c.boato : null,
      veredito: tipo === 'checagem' && ehVeredito(c.veredito) ? c.veredito : null,
      tema: tipo === 'checagem' && ehTema(c.tema) ? c.tema : null,
      como_checamos: tipo === 'checagem' ? c.comoChecamos.map(l => l.trim().slice(0, 300)).filter(Boolean).slice(0, 12).join('\n') || null : null,
      memoria_ano: tipo === 'memoria' ? c.memoriaAno : null,
      valido_ate: tipo === 'servico' && c.validoAte && /^\d{4}-\d{2}-\d{2}$/.test(c.validoAte) ? new Date(`${c.validoAte}T00:00:00Z`) : null,
      updated_at: new Date(),
    },
  })
}

export async function definirImagem(id: string, url: string | null) {
  await prisma.noticias.update({ where: { id }, data: { imagem_url: url, updated_at: new Date() } })
}

export async function mudarStatusMateria(id: string, status: Exclude<StatusMateria, 'publicado'>, feedback?: string | null) {
  await prisma.noticias.update({
    where: { id },
    data: { status, publicado: false, ...(feedback !== undefined ? { feedback } : {}), updated_at: new Date() },
  })
}

/** Publica. A data que o leitor ve passa a ser a da primeira publicacao. */
export async function publicarMateria(m: Materia, por: { id: string; nome: string }) {
  const agora = new Date()
  await prisma.$transaction(async tx => {
    await tx.noticias.update({
      where: { id: m.id },
      data: {
        status: 'publicado', publicado: true, feedback: null, updated_at: agora,
        ...(m.publicadoEm ? {} : { publicado_em: agora, created_at: agora }),
      },
    })
    await tx.noticias_log.create({ data: { noticia_id: m.id, noticia_titulo: m.titulo, user_id: por.id, autor_nome: por.nome, acao: 'publicou (redação)' } })
  })
}

/** Apaga rascunho que nunca foi ao ar e solta a pauta que ele segurava. */
export async function removerMateria(m: Materia) {
  await prisma.$transaction(async tx => {
    await tx.jornal_pautas.updateMany({ where: { noticia_id: m.id }, data: { status: 'sugerida', responsavel_id: null, noticia_id: null, atualizado_em: new Date() } })
    await tx.noticias_log.updateMany({ where: { noticia_id: m.id }, data: { noticia_id: null } })
    await tx.noticias.delete({ where: { id: m.id } })
  })
}

export async function resumoDaRedacao() {
  const [revisao, noAr, rascunhos, pautasNovas, pautasFila, edicoes] = await Promise.all([
    prisma.noticias.count({ where: { status: 'revisao' } }),
    prisma.noticias.count({ where: { status: 'publicado', publicado: true } }),
    prisma.noticias.count({ where: { status: { in: ['rascunho', 'ajustar'] } } }),
    prisma.jornal_pautas.count({ where: { status: 'nova' } }),
    prisma.jornal_pautas.count({ where: { status: 'sugerida' } }),
    prisma.jornal_edicoes.count({ where: { status: 'publicada' } }),
  ])
  return { revisao, noAr, rascunhos, pautasNovas, pautasFila, edicoes }
}

// ── Leitura publica ─────────────────────────────────────────────────────────

/** Quem assina, do jeito que pode aparecer no site: primeiro nome + turma, e so de aluno com termo valido. */
export interface Assinatura { nome: string; membroId: string }

export async function assinaturas(autorIds: (string | null)[]): Promise<Map<string, Assinatura>> {
  const ids = Array.from(new Set(autorIds.filter((x): x is string => !!x)))
  const mapa = new Map<string, Assinatura>()
  if (ids.length === 0) return mapa
  const membros = await prisma.podcast_membros.findMany({
    where: { user_id: { in: ids }, papel: 'aluno', autorizacao_status: 'aceita', ano_letivo: anoLetivoAtual() },
    select: { id: true, user_id: true },
  })
  if (membros.length === 0) return mapa
  const [perfis, alunos] = await Promise.all([
    prisma.profiles.findMany({ where: { id: { in: membros.map(m => m.user_id) } }, select: { id: true, nome_completo: true, turma: true } }),
    prisma.alunos.findMany({ where: { user_id: { in: membros.map(m => m.user_id) } }, select: { user_id: true, nome: true, turma: true } }),
  ])
  for (const m of membros) {
    const a = alunos.find(x => x.user_id === m.user_id)
    const p = perfis.find(x => x.id === m.user_id)
    const nome = a?.nome ?? p?.nome_completo
    if (nome) mapa.set(m.user_id, { nome: nomePublico(nome, a?.turma ?? p?.turma ?? null), membroId: m.id })
  }
  return mapa
}

type Filtro = { tipo?: TipoMateria; editoria?: string | null; categoria?: string | null; limite?: number }

export async function publicadas(f: Filtro = {}): Promise<Materia[]> {
  const l = await prisma.noticias.findMany({
    where: {
      publicado: true,
      ...(f.tipo ? { tipo: f.tipo } : {}),
      ...(f.editoria ? { editoria: f.editoria } : {}),
      ...(f.categoria ? { categoria: f.categoria } : {}),
    },
    orderBy: { created_at: 'desc' },
    take: f.limite ?? 120,
  })
  return l.map(paraMateria)
}

/** Materia no ar com o HTML do corpo (noticia antiga so tem o HTML; a da redacao tem os dois). */
export async function publicadaPorSlug(slug: string): Promise<{ materia: Materia; conteudo: string | null } | null> {
  const n = await prisma.noticias.findFirst({ where: { slug, publicado: true } })
  return n ? { materia: paraMateria(n), conteudo: n.conteudo } : null
}

/** Mural de servico: so o que ainda vale hoje. */
export async function servicosVigentes(limite = 30): Promise<Materia[]> {
  const hoje = new Date(`${hojeSP()}T00:00:00Z`)
  const l = await prisma.noticias.findMany({
    where: { publicado: true, tipo: 'servico', OR: [{ valido_ate: null }, { valido_ate: { gte: hoje } }] },
    orderBy: [{ valido_ate: 'asc' }, { created_at: 'desc' }],
    take: limite,
  })
  return l.map(paraMateria)
}

export async function memorias(): Promise<Materia[]> {
  const l = await prisma.noticias.findMany({ where: { publicado: true, tipo: 'memoria' }, orderBy: [{ memoria_ano: 'asc' }, { created_at: 'asc' }], take: 300 })
  return l.map(paraMateria)
}

/** Pagina do reporter: so existe para aluno com termo valido. */
export async function reporterPublico(membroId: string) {
  const m = await prisma.podcast_membros.findUnique({ where: { id: membroId }, select: { user_id: true } })
  if (!m) return null
  const a = (await assinaturas([m.user_id])).get(m.user_id)
  if (!a) return null
  const [lista, episodios] = await Promise.all([
    prisma.noticias.findMany({ where: { publicado: true, autor_id: m.user_id, NOT: { status: null } }, orderBy: { created_at: 'desc' }, take: 100 }),
    prisma.podcast_participantes.count({ where: { user_id: m.user_id, podcast_episodios: { status: 'publicado' } } }).catch(() => 0),
  ])
  return { nome: a.nome, materias: lista.map(paraMateria), episodios }
}

// ── Pauta aberta ────────────────────────────────────────────────────────────

type LinhaPauta = Awaited<ReturnType<typeof prisma.jornal_pautas.findMany>>[number]

async function montarPautas(linhas: LinhaPauta[]): Promise<Pauta[]> {
  const nIds = linhas.map(l => l.noticia_id).filter((x): x is string => !!x)
  const rIds = linhas.map(l => l.responsavel_id).filter((x): x is string => !!x)
  const [ns, as] = await Promise.all([
    nIds.length ? prisma.noticias.findMany({ where: { id: { in: nIds } }, select: { id: true, slug: true, publicado: true, status: true } }) : [],
    assinaturas(rIds),
  ])
  return linhas.map(l => {
    const n = ns.find(x => x.id === l.noticia_id)
    const status = (['nova', 'sugerida', 'apurando', 'recusada'] as const).includes(l.status as StatusPauta) ? (l.status as StatusPauta) : 'nova'
    const coluna: ColunaPauta = n?.publicado ? 'publicada' : n?.status === 'revisao' ? 'revisao' : status
    return {
      id: l.id,
      titulo: l.titulo,
      descricao: l.descricao,
      origem: l.origem === 'equipe' ? 'equipe' : 'publico',
      nome: l.nome ? l.nome.trim().split(/\s+/)[0] : null,
      vinculo: ehVinculo(l.vinculo) ? l.vinculo : null,
      status,
      coluna,
      resposta: l.resposta,
      responsavelId: l.responsavel_id,
      responsavelNome: l.responsavel_id ? as.get(l.responsavel_id)?.nome ?? null : null,
      noticiaId: l.noticia_id,
      noticiaSlug: n?.publicado ? n.slug : null,
      criadoEm: l.criado_em.toISOString(),
    }
  })
}

export async function todasAsPautas(): Promise<Pauta[]> {
  return montarPautas(await prisma.jornal_pautas.findMany({ orderBy: { criado_em: 'desc' }, take: 300 }))
}

/** Quadro publico: nunca mostra o que ainda nao passou pela redacao, nem o que foi recusado. */
export async function quadroPublico(): Promise<Pauta[]> {
  const l = await prisma.jornal_pautas.findMany({ where: { status: { in: ['sugerida', 'apurando'] } }, orderBy: { atualizado_em: 'desc' }, take: 60 })
  return (await montarPautas(l)).map(p => ({ ...p, descricao: null, responsavelId: null }))
}

export async function buscarPauta(id: string): Promise<Pauta | null> {
  const l = await prisma.jornal_pautas.findUnique({ where: { id } })
  return l ? (await montarPautas([l]))[0] : null
}

export async function pautasRecentesDoIp(ip: string): Promise<number> {
  return prisma.jornal_pautas.count({ where: { ip, criado_em: { gte: new Date(Date.now() - 60 * 60 * 1000) } } })
}

export async function criarPauta(c: { titulo: string; descricao: string | null; origem: 'publico' | 'equipe'; nome: string | null; vinculo: string | null; ip: string | null }) {
  return prisma.jornal_pautas.create({
    data: {
      titulo: c.titulo, descricao: c.descricao, origem: c.origem, nome: c.nome, vinculo: ehVinculo(c.vinculo) ? c.vinculo : null, ip: c.ip,
      // Sugestao da propria equipe ja entra na fila; a do publico espera a redacao ler.
      status: c.origem === 'equipe' ? 'sugerida' : 'nova',
    },
    select: { id: true },
  })
}

export async function moderarPauta(id: string, d: { status?: 'sugerida' | 'recusada'; resposta?: string | null }) {
  await prisma.jornal_pautas.update({
    where: { id },
    data: { ...(d.status ? { status: d.status } : {}), ...(d.resposta !== undefined ? { resposta: d.resposta } : {}), atualizado_em: new Date() },
  })
}

export async function removerPauta(id: string) {
  await prisma.jornal_pautas.delete({ where: { id } })
}

// ── Edicao da semana ────────────────────────────────────────────────────────

type LinhaEdicao = Awaited<ReturnType<typeof prisma.jornal_edicoes.findMany>>[number]

const paraEdicao = (e: LinhaEdicao): Edicao => ({
  id: e.id,
  numero: e.numero,
  titulo: e.titulo,
  inicio: dia(e.inicio)!,
  fim: dia(e.fim)!,
  carta: e.carta,
  materias: lerJson<string[]>(e.materias, []).filter(x => typeof x === 'string'),
  episodioId: e.episodio_id,
  status: e.status === 'publicada' ? 'publicada' : 'rascunho',
  publicadoEm: iso(e.publicado_em),
})

export async function listarEdicoes(soPublicadas = false): Promise<Edicao[]> {
  const l = await prisma.jornal_edicoes.findMany({ where: soPublicadas ? { status: 'publicada' } : {}, orderBy: { numero: 'desc' }, take: 200 })
  return l.map(paraEdicao)
}

export async function buscarEdicao(id: string): Promise<Edicao | null> {
  const e = await prisma.jornal_edicoes.findUnique({ where: { id } })
  return e ? paraEdicao(e) : null
}

export async function edicaoPublicada(numero: number): Promise<Edicao | null> {
  const e = await prisma.jornal_edicoes.findFirst({ where: { numero, status: 'publicada' } })
  return e ? paraEdicao(e) : null
}

export async function ultimaEdicao(): Promise<Edicao | null> {
  const e = await prisma.jornal_edicoes.findFirst({ where: { status: 'publicada' }, orderBy: { numero: 'desc' } })
  return e ? paraEdicao(e) : null
}

/** Segunda e domingo da semana de hoje, no fuso da escola. */
function semanaAtual(): { inicio: string; fim: string } {
  const [a, m, d] = hojeSP().split('-').map(Number)
  const hoje = new Date(Date.UTC(a, m - 1, d))
  const desdeSegunda = (hoje.getUTCDay() + 6) % 7
  const inicio = new Date(hoje.getTime() - desdeSegunda * 86400000)
  const fim = new Date(inicio.getTime() + 6 * 86400000)
  return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) }
}

/** Nova edicao em rascunho, ja com o que foi publicado na semana. */
export async function criarEdicao(por: string) {
  const { inicio, fim } = semanaAtual()
  const daSemana = await prisma.noticias.findMany({
    where: { publicado: true, created_at: { gte: new Date(`${inicio}T03:00:00Z`), lt: new Date(new Date(`${fim}T03:00:00Z`).getTime() + 86400000) } },
    orderBy: [{ destaque_home: 'desc' }, { created_at: 'desc' }],
    select: { id: true },
    take: 12,
  })
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const ultimo = await prisma.jornal_edicoes.aggregate({ _max: { numero: true } })
    const numero = (ultimo._max.numero ?? 0) + 1
    try {
      return await prisma.jornal_edicoes.create({
        data: {
          numero, titulo: `Edição nº ${numero}`, inicio: new Date(`${inicio}T00:00:00Z`), fim: new Date(`${fim}T00:00:00Z`),
          materias: JSON.stringify(daSemana.map(n => n.id)), criado_por: por,
        },
        select: { id: true, numero: true },
      })
    } catch (e) {
      if ((e as { code?: string })?.code !== 'P2002') throw e
    }
  }
  throw new Error('Não consegui numerar a edição. Tente de novo.')
}

export async function atualizarEdicao(id: string, c: { titulo: string; inicio: string; fim: string; carta: string | null; materias: string[]; episodioId: string | null }) {
  await prisma.jornal_edicoes.update({
    where: { id },
    data: {
      titulo: c.titulo, inicio: new Date(`${c.inicio}T00:00:00Z`), fim: new Date(`${c.fim}T00:00:00Z`), carta: c.carta,
      materias: JSON.stringify(c.materias), episodio_id: c.episodioId,
    },
  })
}

export async function mudarStatusEdicao(e: Edicao, status: 'rascunho' | 'publicada') {
  await prisma.jornal_edicoes.update({
    where: { id: e.id },
    data: { status, ...(status === 'publicada' && !e.publicadoEm ? { publicado_em: new Date() } : {}) },
  })
}

export async function removerEdicao(id: string) {
  await prisma.jornal_edicoes.delete({ where: { id } })
}

/** Materias da edicao na ordem escolhida. Na leitura publica, so as que continuam no ar. */
export async function materiasDaEdicao(e: Edicao, soNoAr = true): Promise<Materia[]> {
  if (e.materias.length === 0) return []
  const l = await prisma.noticias.findMany({ where: { id: { in: e.materias }, ...(soNoAr ? { publicado: true } : {}) } })
  return e.materias.map(id => l.find(n => n.id === id)).filter((n): n is LinhaNoticia => !!n).map(paraMateria)
}

/** O que pode entrar numa edicao: tudo que esta no ar, mais recente primeiro. */
export async function candidatasDaEdicao(): Promise<{ id: string; titulo: string; tipo: string; data: string }[]> {
  const l = await prisma.noticias.findMany({ where: { publicado: true }, orderBy: { created_at: 'desc' }, take: 60, select: { id: true, titulo: true, tipo: true, created_at: true } })
  return l.map(n => ({ id: n.id, titulo: n.titulo, tipo: n.tipo, data: n.created_at.toISOString() }))
}

export async function episodiosParaEdicao(): Promise<{ id: string; titulo: string; slug: string }[]> {
  return prisma.podcast_episodios.findMany({
    where: { status: 'publicado', NOT: { audio_url: null } }, orderBy: { publicado_em: 'desc' }, take: 30, select: { id: true, titulo: true, slug: true },
  })
}

export async function episodioDaEdicao(id: string | null): Promise<{ titulo: string; slug: string } | null> {
  if (!id) return null
  return prisma.podcast_episodios.findFirst({ where: { id, status: 'publicado' }, select: { titulo: true, slug: true } })
}

// ── Erramos ─────────────────────────────────────────────────────────────────

export async function adicionarCorrecao(noticiaId: string, texto: string, por: string) {
  return prisma.jornal_correcoes.create({ data: { noticia_id: noticiaId, texto, criado_por: por }, select: { id: true } })
}

export async function removerCorrecao(id: string) {
  await prisma.jornal_correcoes.delete({ where: { id } })
}

export async function buscarCorrecao(id: string) {
  return prisma.jornal_correcoes.findUnique({ where: { id } })
}

export async function correcoesDaNoticia(noticiaId: string): Promise<Correcao[]> {
  const l = await prisma.jornal_correcoes.findMany({ where: { noticia_id: noticiaId }, orderBy: { criado_em: 'asc' } })
  return l.map(c => ({ id: c.id, noticiaId: c.noticia_id, texto: c.texto, criadoEm: c.criado_em.toISOString() }))
}

/** Pagina Erramos: so correcao de materia que esta no ar. */
export async function todasAsCorrecoes(): Promise<(Correcao & { titulo: string; slug: string })[]> {
  const l = await prisma.jornal_correcoes.findMany({ orderBy: { criado_em: 'desc' }, take: 200 })
  if (l.length === 0) return []
  const ns = await prisma.noticias.findMany({ where: { id: { in: l.map(c => c.noticia_id) }, publicado: true }, select: { id: true, titulo: true, slug: true } })
  return l.flatMap(c => {
    const n = ns.find(x => x.id === c.noticia_id)
    return n ? [{ id: c.id, noticiaId: c.noticia_id, texto: c.texto, criadoEm: c.criado_em.toISOString(), titulo: n.titulo, slug: n.slug }] : []
  })
}
