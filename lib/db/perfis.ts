import { prisma } from '@/lib/db'
import type { profiles } from '@prisma/client'
import type { Profile } from '@/types/database'

/**
 * Perfis de acesso — a tabela `profiles`, que diz quem e cada conta e o que
 * ela pode.
 *
 * No Supabase, quem barrava aluno lendo perfil alheio era o RLS. No MariaDB
 * nao existe RLS: quem chama daqui e responsavel por ter verificado o papel
 * antes. As funcoes marcadas GESTAO nunca devem ser chamadas de rota publica.
 */

// created_at/updated_at sao anulaveis no banco vivo, ainda que a migration 023
// as declare NOT NULL — o schema real e a fonte da verdade aqui.
//
// `role` e varchar no banco e uniao fechada no dominio. Estreitar no
// serializar faz todo consumidor receber o tipo do dominio, sem cast espalhado
// pelas telas.
export type Perfil = Omit<profiles, 'created_at' | 'updated_at' | 'role'> & {
  created_at: string | null
  updated_at: string | null
  role: Profile['role']
}

/** Papeis que podem administrar. Espelha GESTAO_ROLES de lib/roles.ts. */
export const PAPEIS_GESTAO = ['diretora', 'vice_diretora', 'admin'] as const

/** Papeis que carregam turma — os demais tem turma nula. */
export const PAPEIS_COM_TURMA = ['aluno', 'aluno_fundamental', 'monitor'] as const

function serializar(p: profiles): Perfil {
  return {
    ...p,
    role: p.role as Profile['role'],
    created_at: p.created_at?.toISOString() ?? null,
    updated_at: p.updated_at?.toISOString() ?? null,
  }
}

export async function buscarPorId(id: string): Promise<Perfil | null> {
  const p = await prisma.profiles.findUnique({ where: { id } })
  return p ? serializar(p) : null
}

export async function buscarPorEmail(email: string): Promise<Perfil | null> {
  const p = await prisma.profiles.findFirst({ where: { email: email.trim().toLowerCase() } })
  return p ? serializar(p) : null
}

/**
 * Papel e aprovacao — o par que o login consulta a cada entrada.
 *
 * O banco guarda `role` como varchar e o Prisma tipa como string; o dominio
 * conhece o conjunto valido. Estreitar aqui e o papel da camada: quem chama
 * recebe o tipo do dominio, nao o do banco.
 */
export async function papelEAprovacao(
  id: string
): Promise<{ role: Profile['role']; aprovado: boolean } | null> {
  const p = await prisma.profiles.findUnique({
    where: { id },
    select: { role: true, aprovado: true },
  })
  return p ? { role: p.role as Profile['role'], aprovado: p.aprovado } : null
}

export async function ehGestao(id: string): Promise<boolean> {
  const p = await papelEAprovacao(id)
  return !!p && p.aprovado && (PAPEIS_GESTAO as readonly string[]).includes(p.role)
}

/** Quantos aguardam aprovacao, por papel. Alimenta o contador do painel. */
export async function contarPendentes(papeis: string[]): Promise<number> {
  return prisma.profiles.count({ where: { aprovado: false, role: { in: papeis } } })
}

// ------------------------------------------------------------- GESTAO
// So de rota que ja verificou o papel de quem chama.

/**
 * Quem aguarda aprovacao, ja com a matricula quando for aluno.
 *
 * Continuam duas consultas com um Map no meio, e nao um join: profiles.id e
 * alunos.user_id apontam ambos para `usuarios`, mas nao um para o outro —
 * nao existe relacao direta entre as duas tabelas. O que muda e o lugar: o
 * emparelhamento sai da tela e vem para a camada.
 */
export async function pendentesDeAprovacao(papeis: string[]) {
  const linhas = await prisma.profiles.findMany({
    where: { role: { in: papeis }, aprovado: false },
    orderBy: { created_at: 'asc' },
  })
  if (!linhas.length) return []

  const fichas = await prisma.alunos.findMany({
    where: { user_id: { in: linhas.map(p => p.id) } },
    select: { user_id: true, matricula: true },
  })
  const matriculaPorConta = new Map(
    fichas.filter(f => f.user_id).map(f => [f.user_id as string, f.matricula])
  )

  return linhas.map(p => ({
    ...serializar(p),
    matricula: matriculaPorConta.get(p.id) ?? null,
  }))
}

export async function listarPorPapeis(papeis: string[]): Promise<Perfil[]> {
  const linhas = await prisma.profiles.findMany({
    where: { role: { in: papeis } },
    orderBy: [{ aprovado: 'asc' }, { nome_completo: 'asc' }],
  })
  return linhas.map(serializar)
}

export async function listarAprovadosPorPapeis(papeis: string[]) {
  return prisma.profiles.findMany({
    where: { role: { in: papeis }, aprovado: true },
    select: { id: true, nome_completo: true, turma: true },
    orderBy: { nome_completo: 'asc' },
  })
}

/**
 * Tudo que as telas de Administradores e Funcionarios precisam: os perfis dos
 * papeis pedidos, os dados de identidade de cada um, e o log recente ja com o
 * nome de quem agiu.
 *
 * As duas telas montavam isto igual, cada uma com quatro consultas e dois Maps
 * repetidos. Aqui e uma funcao so — e o nome no log passa a sair resolvido,
 * em vez de a tela cruzar com uma lista de todos os perfis do sistema.
 */
export async function painelDeUsuarios(papeis: string[]) {
  const linhas = await prisma.profiles.findMany({
    where: { role: { in: papeis } },
    orderBy: [{ aprovado: 'asc' }, { created_at: 'desc' }],
  })

  const identidades = await prisma.identidades.findMany({
    where: { user_id: { in: linhas.map(p => p.id) } },
    select: { user_id: true, cpf: true, email_alternativo: true, criado_via: true },
  })
  const porConta = new Map(identidades.map(i => [i.user_id, i]))

  const registros = await prisma.log_atividades.findMany({
    orderBy: { criado_em: 'desc' },
    take: 100,
  })

  // So os nomes que o log referencia, em vez de todos os perfis do sistema.
  // Array.from em vez de spread do Set: o target do tsconfig e anterior a es2015.
  const idsNoLog = Array.from(new Set(registros.map(r => r.user_id).filter(Boolean) as string[]))
  const nomes = idsNoLog.length
    ? await prisma.profiles.findMany({
        where: { id: { in: idsNoLog } },
        select: { id: true, nome_completo: true },
      })
    : []
  const nomePorId = new Map(nomes.map(n => [n.id, n.nome_completo]))

  return {
    perfis: linhas.map(p => {
      const ident = porConta.get(p.id)
      return {
        ...serializar(p),
        email: p.email ?? '',
        cpf: ident?.cpf ?? null,
        email_alternativo: ident?.email_alternativo ?? null,
        criado_via: ident?.criado_via ?? null,
      }
    }),
    log: registros.map(r => ({
      ...r,
      criado_em: r.criado_em?.toISOString() ?? null,
      detalhes: r.detalhes ? (JSON.parse(r.detalhes) as Record<string, unknown>) : null,
      nome: r.user_id ? nomePorId.get(r.user_id) ?? null : null,
    })),
  }
}

export async function criar(dados: {
  id: string
  nome_completo: string
  role: string
  turma?: string | null
  disciplina?: string | null
  aprovado: boolean
  email: string
}) {
  return prisma.profiles.create({ data: dados })
}

export async function aprovar(id: string) {
  return prisma.profiles.update({ where: { id }, data: { aprovado: true } })
}

export async function revogar(id: string) {
  return prisma.profiles.update({ where: { id }, data: { aprovado: false } })
}

export async function alterarPapel(id: string, role: string) {
  return prisma.profiles.update({ where: { id }, data: { role } })
}

/**
 * Espelha a turma do registro academico na conta de login. Sem isto, trocar a
 * turma na ficha do aluno nao muda o que ele enxerga — foi exatamente o bug
 * corrigido em f84496a, e a camada existe para que ele nao volte.
 */
export async function sincronizarTurma(id: string, turma: string) {
  const p = await prisma.profiles.findUnique({ where: { id }, select: { role: true } })
  if (!p || !(PAPEIS_COM_TURMA as readonly string[]).includes(p.role)) return null
  return prisma.profiles.update({ where: { id }, data: { turma } })
}

export async function remover(id: string) {
  return prisma.profiles.delete({ where: { id } })
}
