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

/** Publicadas com imagem, para a faixa de fotos da home. */
export async function publicadasComImagem(limite = 6) {
  return prisma.noticias.findMany({
    where: { publicado: true, NOT: { imagem_url: null } },
    select: { id: true, titulo: true, imagem_url: true, slug: true },
    orderBy: { created_at: 'desc' },
    take: limite,
  })
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

/**
 * Todas as noticias. `autorId` restringe ao que aquela pessoa escreveu — e o
 * que o monitor enxerga, que no Supabase era uma policy de RLS e aqui precisa
 * ser dito pelo chamador.
 */
export async function listarTodas(autorId?: string): Promise<Noticia[]> {
  const linhas = await prisma.noticias.findMany({
    where: autorId ? { autor_id: autorId } : {},
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(serializar)
}

export async function buscarPorId(id: string): Promise<Noticia | null> {
  const n = await prisma.noticias.findUnique({ where: { id } })
  return n ? serializar(n) : null
}

/** Log de atividades, o mais recente primeiro. So a gestao ve. */
export async function logDeAtividades(limite = 30) {
  const linhas = await prisma.noticias_log.findMany({
    orderBy: { created_at: 'desc' },
    take: limite,
  })
  return linhas.map(l => ({ ...l, created_at: l.created_at?.toISOString() ?? '' }))
}

export type CamposDeNoticia = {
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  imagem_url: string | null
  publicado: boolean
  destaque_home: boolean
  categoria: string | null
}

/**
 * Cria a noticia e registra o log na mesma transacao. autor_id e autor_nome
 * vem da sessao: antes o navegador escolhia os dois, e o log — que existe para
 * a direcao saber quem mexeu no que — podia ser assinado com qualquer nome.
 */
export async function criar(campos: CamposDeNoticia, autor: { id: string; nome: string }, acao: string) {
  return prisma.$transaction(async tx => {
    if (campos.destaque_home) {
      await tx.noticias.updateMany({ where: { destaque_home: true }, data: { destaque_home: false } })
    }
    const n = await tx.noticias.create({
      data: { ...campos, autor_id: autor.id, autor_nome: autor.nome },
      select: { id: true },
    })
    await tx.noticias_log.create({
      data: {
        noticia_id: n.id, noticia_titulo: campos.titulo,
        user_id: autor.id, autor_nome: autor.nome, acao,
      },
    })
    return n
  })
}

export async function atualizar(
  id: string,
  campos: CamposDeNoticia,
  autor: { id: string; nome: string },
  acao: string
) {
  return prisma.$transaction(async tx => {
    if (campos.destaque_home) {
      await tx.noticias.updateMany({
        where: { destaque_home: true, NOT: { id } },
        data: { destaque_home: false },
      })
    }
    await tx.noticias.update({ where: { id }, data: { ...campos, updated_at: new Date() } })
    await tx.noticias_log.create({
      data: {
        noticia_id: id, noticia_titulo: campos.titulo,
        user_id: autor.id, autor_nome: autor.nome, acao,
      },
    })
  })
}

/** Quem escreveu — usado para o monitor so mexer no que e dele. */
export async function autorDaNoticia(id: string) {
  return prisma.noticias.findUnique({
    where: { id },
    select: { autor_id: true, titulo: true },
  })
}

/** Uma linha do log. Sempre chamada pelo servidor, com o autor da sessao. */
export async function registrarLog(dados: {
  noticiaId: string | null
  titulo: string
  autor: { id: string; nome: string }
  acao: string
}) {
  return prisma.noticias_log.create({
    data: {
      noticia_id: dados.noticiaId,
      noticia_titulo: dados.titulo,
      user_id: dados.autor.id,
      autor_nome: dados.autor.nome,
      acao: dados.acao,
    },
  })
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
