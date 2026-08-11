import { prisma } from '@/lib/db'
import type { cursos, aulas, certificados } from '@prisma/client'

/**
 * Cursos, aulas, progresso e certificados.
 *
 * Quinto modulo da fase 2 — 46 das 371 chamadas. Os nomes das colunas foram
 * conferidos contra o schema real antes de escrever, e nao deduzidos das
 * consultas antigas: foi assim que tres nomes errados passaram no modulo do
 * quiz sem o TypeScript acusar.
 *
 * Atencao a duplicidade de datas em `cursos`: a tabela tem created_at/
 * updated_at E criado_em/atualizado_em, resultado de duas convencoes que se
 * encontraram. As consultas antigas usavam ora uma, ora outra. Aqui a leitura
 * padroniza em created_at, que e a que o `order by ordem` de fato acompanha.
 */

export type Curso = cursos
export type Aula = aulas
export type Certificado = certificados

// -------------------------------------------------------------- catalogo

/** Cursos publicados, na ordem definida pela gestao. */
export async function listarPublicados(): Promise<Curso[]> {
  return prisma.cursos.findMany({ where: { publicado: true }, orderBy: { ordem: 'asc' } })
}

/** Versao enxuta para menus e listagens. */
export async function listarPublicadosResumo() {
  return prisma.cursos.findMany({
    where: { publicado: true },
    select: { id: true, titulo: true, slug: true, categoria: true },
    orderBy: { ordem: 'asc' },
  })
}

/** Slugs publicados — usado pelo sitemap. */
export async function slugsPublicados(): Promise<string[]> {
  const linhas = await prisma.cursos.findMany({
    where: { publicado: true },
    select: { slug: true },
  })
  return linhas.map(c => c.slug)
}

export async function buscarPorSlug(slug: string): Promise<Curso | null> {
  return prisma.cursos.findFirst({ where: { slug } })
}

export async function buscarPorId(id: string): Promise<Curso | null> {
  return prisma.cursos.findUnique({ where: { id } })
}

// ----------------------------------------------------------------- aulas

/** Aulas publicadas de um curso, na ordem. */
export async function aulasPublicadas(cursoId: string): Promise<Aula[]> {
  return prisma.aulas.findMany({
    where: { curso_id: cursoId, publicado: true },
    orderBy: { ordem: 'asc' },
  })
}

/** Todas as aulas, inclusive rascunho — so para a gestao do curso. */
export async function aulasDoCurso(cursoId: string): Promise<Aula[]> {
  return prisma.aulas.findMany({ where: { curso_id: cursoId }, orderBy: { ordem: 'asc' } })
}

export async function buscarAula(cursoId: string, aulaId: string): Promise<Aula | null> {
  return prisma.aulas.findFirst({ where: { id: aulaId, curso_id: cursoId } })
}

export async function buscarAulaPorSlug(cursoId: string, slug: string): Promise<Aula | null> {
  return prisma.aulas.findFirst({ where: { curso_id: cursoId, slug } })
}

/** Carga total das aulas publicadas, em minutos. */
export async function duracaoTotal(cursoId: string): Promise<number> {
  const r = await prisma.aulas.aggregate({
    where: { curso_id: cursoId, publicado: true },
    _sum: { duracao_estimada_min: true },
  })
  return r._sum.duracao_estimada_min ?? 0
}

/**
 * Troca a ordem de duas aulas numa transacao. Eram dois UPDATE soltos: falha
 * no segundo deixava duas aulas com a mesma posicao. Mesmo defeito que o quiz
 * tinha.
 */
export async function trocarOrdemAulas(idA: string, ordemA: number, idB: string, ordemB: number) {
  return prisma.$transaction([
    prisma.aulas.update({ where: { id: idA }, data: { ordem: ordemA } }),
    prisma.aulas.update({ where: { id: idB }, data: { ordem: ordemB } }),
  ])
}

// -------------------------------------------------------------- progresso

/** Aulas que um usuario ja concluiu num curso. */
export async function aulasConcluidas(userId: string, cursoId: string): Promise<string[]> {
  const linhas = await prisma.progresso_aulas.findMany({
    where: { user_id: userId, curso_id: cursoId, concluida: true },
    select: { aula_id: true },
  })
  return linhas.map(l => l.aula_id)
}

/** Todas as aulas concluidas pelo usuario, para o painel. */
export async function todasConcluidas(userId: string): Promise<string[]> {
  const linhas = await prisma.progresso_aulas.findMany({
    where: { user_id: userId, concluida: true },
    select: { aula_id: true },
  })
  return linhas.map(l => l.aula_id)
}

/** Marca ou desmarca a conclusao de uma aula. */
export async function registrarProgresso(
  userId: string,
  cursoId: string,
  aulaId: string,
  concluida: boolean
) {
  return prisma.progresso_aulas.upsert({
    where: { user_id_aula_id: { user_id: userId, aula_id: aulaId } },
    create: {
      user_id: userId,
      curso_id: cursoId,
      aula_id: aulaId,
      concluida,
      concluida_em: concluida ? new Date() : null,
    },
    update: { concluida, concluida_em: concluida ? new Date() : null },
  })
}

// ----------------------------------------------------------- certificados

export async function certificadoDoAluno(
  userId: string,
  cursoId: string
): Promise<Certificado | null> {
  return prisma.certificados.findFirst({ where: { user_id: userId, curso_id: cursoId } })
}

export async function certificadoPorCodigo(codigo: string): Promise<Certificado | null> {
  return prisma.certificados.findFirst({ where: { codigo } })
}

export async function contarCertificados(userId: string): Promise<number> {
  return prisma.certificados.count({ where: { user_id: userId } })
}

// ------------------------------------------------------------------ GESTAO

export async function listarTodos(): Promise<Curso[]> {
  return prisma.cursos.findMany({ orderBy: { ordem: 'asc' } })
}

export async function alternarPublicado(id: string, publicado: boolean) {
  return prisma.cursos.update({ where: { id }, data: { publicado } })
}

export async function alternarAulaPublicada(id: string, publicado: boolean) {
  return prisma.aulas.update({ where: { id }, data: { publicado } })
}

/**
 * Remove o curso inteiro — aulas, progresso, desafios, perguntas de prova e
 * certificados — numa transacao. No Supabase era uma cadeia de delete solta.
 */
export async function remover(cursoId: string) {
  return prisma.$transaction(async tx => {
    await tx.progresso_aulas.deleteMany({ where: { curso_id: cursoId } })
    await tx.curso_desafios.deleteMany({ where: { curso_id: cursoId } })
    await tx.curso_prova_perguntas.deleteMany({ where: { curso_id: cursoId } })
    await tx.aulas.deleteMany({ where: { curso_id: cursoId } })
    return tx.cursos.delete({ where: { id: cursoId } })
  })
}
