import { prisma } from '@/lib/db'

/**
 * Desafios e equipes — o modulo de projeto integrador.
 *
 * A consulta da tela de um desafio era um join encadeado do PostgREST com
 * quatro niveis (equipes -> membros -> perfil e papel, mais entregas). Aqui
 * ela vira include aninhado, que le melhor e nao depende de decifrar a
 * sintaxe de string do PostgREST.
 */

/**
 * Um desafio, no formato que a tela espera.
 *
 * Cinco campos sao anulaveis no banco e nao-nulos no tipo do dominio —
 * mesmo padrao que ja apareceu em cursos, aulas, projetos e profiles.
 * Os valores de fallback aqui sao os que a tela ja assumia na pratica.
 */
export async function buscarDesafio(id: string) {
  const d = await prisma.desafios.findUnique({ where: { id } })
  if (!d) return null
  return {
    ...d,
    ano_letivo: d.ano_letivo ?? '',
    pontos_total: d.pontos_total ?? 0,
    publicado: d.publicado ?? false,
    created_at: d.created_at?.toISOString() ?? '',
    updated_at: d.updated_at?.toISOString() ?? '',
  }
}

export async function fasesDoDesafio(desafioId: string) {
  const linhas = await prisma.desafio_fases.findMany({
    where: { desafio_id: desafioId },
    orderBy: { ordem: 'asc' },
  })
  return linhas.map(f => ({ ...f, pontos_max: f.pontos_max ?? 0 }))
}

export async function papeisDoDesafio(desafioId: string) {
  return prisma.desafio_papeis.findMany({ where: { desafio_id: desafioId } })
}

/**
 * Equipes com membros (perfil e papel) e entregas.
 *
 * Tres conversoes acontecem aqui:
 *   - datas viram string ISO, como no resto da migracao;
 *   - `nota` e numeric no banco e o Prisma devolve Decimal, que o React nao
 *     sabe renderizar — vira number;
 *   - `dados_estruturados` era jsonb e virou JSON serializado.
 *
 * Os aliases `profile` e `papel` reproduzem os nomes que o select do PostgREST
 * dava ao join; o componente ja os consome assim.
 */
export async function equipesDoDesafio(desafioId: string) {
  const linhas = await prisma.equipes.findMany({
    where: { desafio_id: desafioId },
    include: {
      equipe_membros: {
        include: {
          profiles: { select: { nome_completo: true } },
          desafio_papeis: { select: { nome: true } },
        },
      },
      entregas: true,
    },
    orderBy: { created_at: 'asc' },
  })

  return linhas.map(e => ({
    ...e,
    created_at: e.created_at?.toISOString() ?? '',
    equipe_membros: e.equipe_membros.map(m => ({
      ...m,
      profile: m.profiles,
      papel: m.desafio_papeis,
    })),
    entregas: e.entregas.map(en => ({
      ...en,
      nota: en.nota === null ? null : Number(en.nota),
      status: (en.status ?? 'pendente') as 'pendente' | 'entregue' | 'avaliada',
      dados_estruturados: en.dados_estruturados
        ? (JSON.parse(en.dados_estruturados) as Record<string, unknown>)
        : null,
      enviado_em: en.enviado_em?.toISOString() ?? null,
      avaliado_em: en.avaliado_em?.toISOString() ?? null,
    })),
  }))
}

/** Ideias ainda em triagem, para vincular a um desafio. */
export async function ideiasEmTriagem() {
  const linhas = await prisma.ideias.findMany({
    where: { status: { in: ['nova', 'em_analise'] } },
    select: { id: true, titulo: true, status: true },
    orderBy: { created_at: 'desc' },
  })
  return linhas.map(i => ({ ...i, status: i.status ?? 'nova' }))
}

/**
 * Lista para a vitrine de desafios. Quem nao pode criar so enxerga os
 * publicados — o rascunho de um professor nao aparece para o aluno.
 */
export async function listarDesafios(apenasPublicados = false) {
  return prisma.desafios.findMany({
    where: apenasPublicados ? { publicado: true } : {},
    orderBy: { created_at: 'desc' },
    include: {
      desafio_fases: { select: { id: true } },
      equipes: { select: { id: true } },
    },
  })
}
