import { prisma } from '@/lib/db'

/**
 * Trilhas: o caminho que o aluno percorre.
 *
 * Elas ficam POR CIMA dos módulos, não no lugar deles. Um curso continua
 * pertencendo ao seu módulo — é o módulo que emite o certificado, e isso não
 * muda. A trilha responde outra pergunta: "quero aprender programação, por onde
 * começo e o que vem depois?".
 *
 * Por isso uma trilha atravessa módulos de propósito. Programação vai de HTML
 * (do módulo "A Primeira Página") a PHP (do módulo "Back-end e Dados"), e quem
 * está seguindo a sequência não precisa saber que a fronteira existe.
 */

export interface CursoDaTrilha {
  id: string
  slug: string
  titulo: string
  capaUrl: string | null
  cargaHoraria: number | null
  ordem: number
  /** O módulo continua ali por baixo — é dele que sai o certificado. */
  moduloNome: string | null
  moduloSlug: string | null
  nivel: string | null
}

export interface Trilha {
  id: string
  slug: string
  nome: string
  descricao: string | null
  icone: string | null
  cor: string | null
  ordem: number
  cursos: CursoDaTrilha[]
  cargaTotal: number
}

const SELECAO = {
  id: true, slug: true, titulo: true, capa_url: true,
  carga_horaria: true, ordem_na_trilha: true, nivel: true,
  modulos: { select: { nome: true, slug: true, nivel: true } },
} as const

type LinhaCurso = {
  id: string; slug: string; titulo: string; capa_url: string | null
  carga_horaria: number | null; ordem_na_trilha: number | null; nivel: string | null
  modulos: { nome: string; slug: string; nivel: string } | null
}

function paraCurso(c: LinhaCurso): CursoDaTrilha {
  return {
    id: c.id,
    slug: c.slug,
    titulo: c.titulo,
    capaUrl: c.capa_url,
    cargaHoraria: c.carga_horaria,
    ordem: c.ordem_na_trilha ?? 99,
    moduloNome: c.modulos?.nome ?? null,
    moduloSlug: c.modulos?.slug ?? null,
    // O nível de um curso é o do módulo dele: é o módulo que define a
    // progressão, e deixar os dois divergirem só criaria uma segunda verdade.
    nivel: c.modulos?.nivel ?? c.nivel,
  }
}

/** Todas as trilhas publicadas, com os cursos em ordem. */
export async function trilhasPublicadas(): Promise<Trilha[]> {
  const trilhas = await prisma.trilhas.findMany({
    where: { publicada: true },
    orderBy: { ordem: 'asc' },
    select: {
      id: true, slug: true, nome: true, descricao: true, icone: true,
      cor_tailwind: true, ordem: true,
      cursos: {
        where: { publicado: true },
        orderBy: { ordem_na_trilha: 'asc' },
        select: SELECAO,
      },
    },
  })

  return trilhas
    // Trilha sem curso publicado não vira card: um cartão que abre vazio é pior
    // do que a ausência dele.
    .filter(t => t.cursos.length > 0 && t.slug)
    .map(t => {
      const cursos = t.cursos.map(paraCurso)
      return {
        id: t.id,
        slug: t.slug!,
        nome: t.nome,
        descricao: t.descricao,
        icone: t.icone,
        cor: t.cor_tailwind,
        ordem: t.ordem,
        cursos,
        cargaTotal: cursos.reduce((s, c) => s + (c.cargaHoraria ?? 0), 0),
      }
    })
}

/** Uma trilha pelo slug, com a sequência de cursos. */
export async function trilhaPorSlug(slug: string): Promise<Trilha | null> {
  const t = await prisma.trilhas.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, nome: true, descricao: true, icone: true,
      cor_tailwind: true, ordem: true, publicada: true,
      cursos: {
        where: { publicado: true },
        orderBy: { ordem_na_trilha: 'asc' },
        select: SELECAO,
      },
    },
  })
  if (!t || !t.publicada || !t.slug) return null

  const cursos = t.cursos.map(paraCurso)
  return {
    id: t.id, slug: t.slug, nome: t.nome, descricao: t.descricao,
    icone: t.icone, cor: t.cor_tailwind, ordem: t.ordem,
    cursos,
    cargaTotal: cursos.reduce((s, c) => s + (c.cargaHoraria ?? 0), 0),
  }
}

/**
 * Onde o aluno está numa trilha: quantos cursos concluiu e qual é o próximo.
 *
 * Concluído = todas as aulas publicadas do curso marcadas. É o mesmo critério
 * que libera o projeto final, e usar dois critérios diferentes para "concluí"
 * seria a forma mais rápida de a tela contradizer o certificado.
 */
export async function progressoNaTrilha(cursoIds: string[], userId: string) {
  if (!cursoIds.length) return new Map<string, { total: number; feitas: number }>()

  const [aulas, feitas] = await Promise.all([
    prisma.aulas.groupBy({
      by: ['curso_id'],
      where: { curso_id: { in: cursoIds }, publicado: true },
      _count: { _all: true },
    }),
    prisma.progresso_aulas.groupBy({
      by: ['curso_id'],
      where: {
        user_id: userId,
        concluida: true,
        curso_id: { in: cursoIds },
        aulas: { publicado: true },
      },
      _count: { _all: true },
    }),
  ])

  const porCurso = new Map<string, { total: number; feitas: number }>()
  for (const a of aulas) {
    if (a.curso_id) porCurso.set(a.curso_id, { total: a._count._all, feitas: 0 })
  }
  for (const f of feitas) {
    if (!f.curso_id) continue
    const atual = porCurso.get(f.curso_id)
    if (atual) atual.feitas = f._count._all
  }
  return porCurso
}
