import { prisma } from '@/lib/db'
import type { noticias } from '@prisma/client'

/**
 * Acesso a noticias. Primeiro modulo migrado do Supabase para o MariaDB —
 * serve de molde para os demais.
 *
 * A regra e: nenhuma pagina ou componente monta consulta. Tudo que le ou
 * escreve noticia passa por aqui. Foi a ausencia disso que deixou o mesmo
 * filtro (publicado = true) espalhado por seis arquivos, cada um podendo
 * esquece-lo.
 */

/**
 * O Prisma devolve `Date` nas colunas de data; o Supabase devolvia string ISO,
 * e e isso que os componentes esperam. Converter aqui — e nao em cada tela —
 * mantem os componentes intactos durante a migracao inteira. E a razao de a
 * camada existir: ela absorve a diferenca entre os dois bancos.
 */
export type Noticia = Omit<noticias, 'created_at' | 'updated_at'> & {
  created_at: string
  updated_at: string
}

function serializar(n: noticias): Noticia {
  return {
    ...n,
    created_at: n.created_at.toISOString(),
    updated_at: n.updated_at.toISOString(),
  }
}

/** Publicadas, mais recentes primeiro. Opcionalmente filtradas por categoria. */
export async function listarPublicadas(categoria?: string | null): Promise<Noticia[]> {
  const linhas = await prisma.noticias.findMany({
    where: { publicado: true, ...(categoria ? { categoria } : {}) },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(serializar)
}

/** Uma noticia publicada pelo slug. Null quando nao existe ou esta despublicada. */
export async function buscarPorSlug(slug: string): Promise<Noticia | null> {
  const n = await prisma.noticias.findFirst({ where: { slug, publicado: true } })
  return n ? serializar(n) : null
}

/** Slugs e data de atualizacao — usado pelo sitemap. */
export async function slugsPublicados(): Promise<Array<{ slug: string; updated_at: Date | null }>> {
  return prisma.noticias.findMany({
    where: { publicado: true },
    select: { slug: true, updated_at: true },
  })
}

/** A que esta em destaque na home, se houver. */
export async function buscarDestaque(): Promise<Noticia | null> {
  const n = await prisma.noticias.findFirst({
    where: { publicado: true, destaque_home: true },
    orderBy: { created_at: 'desc' },
  })
  return n ? serializar(n) : null
}

// ---------------------------------------------------------------- gestao
// Estas nao filtram por `publicado`: quem administra precisa ver rascunho.
// Chamar apenas de rota protegida — a checagem de papel e responsabilidade
// do chamador, porque o MySQL nao tem RLS para barrar por baixo.

export async function listarTodas(): Promise<Noticia[]> {
  const linhas = await prisma.noticias.findMany({ orderBy: { created_at: 'desc' } })
  return linhas.map(serializar)
}

export async function buscarPorId(id: string): Promise<Noticia | null> {
  const n = await prisma.noticias.findUnique({ where: { id } })
  return n ? serializar(n) : null
}

/** Historico de alteracoes de uma noticia. */
export async function historicoDaNoticia(noticiaId: string) {
  const linhas = await prisma.noticias_log.findMany({
    where: { noticia_id: noticiaId },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(l => ({ ...l, created_at: l.created_at?.toISOString() ?? null }))
}

export async function alternarPublicado(id: string, publicado: boolean) {
  return prisma.noticias.update({ where: { id }, data: { publicado } })
}

/** Marca o destaque da home, tirando o das demais na mesma transacao. */
export async function definirDestaque(id: string, destaque: boolean) {
  return prisma.$transaction(async tx => {
    if (destaque) {
      await tx.noticias.updateMany({
        where: { destaque_home: true, NOT: { id } },
        data: { destaque_home: false },
      })
    }
    return tx.noticias.update({ where: { id }, data: { destaque_home: destaque } })
  })
}

export async function remover(id: string) {
  return prisma.noticias.delete({ where: { id } })
}
