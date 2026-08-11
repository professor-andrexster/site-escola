import { prisma } from '@/lib/db'
import type { alunos, Prisma } from '@prisma/client'
import { normalizarMatricula } from '@/lib/matricula'

/**
 * Registro academico dos alunos.
 *
 * O vinculo entre a ficha e a conta de login e `alunos.user_id` — nao
 * `identidades.aluno_id`, que nunca existiu no banco e custou dois dias de
 * investigacao. Toda resolucao aluno<->conta passa por aqui, para que essa
 * confusao nao se repita.
 *
 * Colunas sensiveis (cpf, data_nascimento, telefone, responsavel) so saem
 * pelas funcoes marcadas GESTAO. No Supabase, quem protegia isso era o grant
 * por coluna da migration 016; aqui e responsabilidade de quem chama.
 */

export type Aluno = Omit<alunos, 'criado_em' | 'atualizado_em' | 'data_nascimento'> & {
  criado_em: string | null
  atualizado_em: string | null
  data_nascimento: string | null
}

/** Campos publicos — o que pode aparecer em portfolio e vitrine. */
export const CAMPOS_PUBLICOS = {
  id: true, nome: true, matricula: true, turma: true, serie: true,
  turno: true, foto_url: true, ativo: true,
} as const

function serializar(a: alunos): Aluno {
  return {
    ...a,
    criado_em: a.criado_em?.toISOString() ?? null,
    atualizado_em: a.atualizado_em?.toISOString() ?? null,
    data_nascimento: a.data_nascimento?.toISOString().slice(0, 10) ?? null,
  }
}

/** A ficha ligada a uma conta. E a consulta que o "meu perfil" faz. */
export async function buscarPorUsuario(userId: string): Promise<Aluno | null> {
  const a = await prisma.alunos.findFirst({ where: { user_id: userId } })
  return a ? serializar(a) : null
}

/** Busca por matricula, sem diferenciar caixa. */
export async function buscarPorMatricula(matricula: string): Promise<Aluno | null> {
  const a = await prisma.alunos.findFirst({
    where: { matricula: normalizarMatricula(matricula) },
  })
  return a ? serializar(a) : null
}

/** Resolve matricula -> conta, para o login por matricula. */
export async function contaDaMatricula(matricula: string): Promise<string | null> {
  const a = await prisma.alunos.findFirst({
    where: { matricula: normalizarMatricula(matricula) },
    select: { user_id: true },
  })
  return a?.user_id ?? null
}

/** Perfil publico para portfolio: so aluno ativo, so campos publicos. */
export async function perfilPublico(matricula: string) {
  return prisma.alunos.findFirst({
    where: { matricula: normalizarMatricula(matricula), ativo: true },
    select: CAMPOS_PUBLICOS,
  })
}

/** Alunos ativos, campos publicos — para listagens abertas. */
export async function listarAtivosPublico() {
  return prisma.alunos.findMany({
    where: { ativo: true },
    select: CAMPOS_PUBLICOS,
    orderBy: { nome: 'asc' },
  })
}

// ------------------------------------------------------------- GESTAO

export async function listarTodos(): Promise<Aluno[]> {
  const linhas = await prisma.alunos.findMany({ orderBy: { nome: 'asc' } })
  return linhas.map(serializar)
}

export async function buscarPorId(id: string): Promise<Aluno | null> {
  const a = await prisma.alunos.findUnique({ where: { id } })
  return a ? serializar(a) : null
}

/** Checa duplicata de matricula, cpf ou email, ignorando um id. */
export async function jaExiste(
  campo: 'matricula' | 'cpf' | 'email',
  valor: string,
  ignorarId?: string
): Promise<boolean> {
  const v = campo === 'matricula' ? normalizarMatricula(valor) : valor.trim()
  const achado = await prisma.alunos.findFirst({
    where: { [campo]: v, ...(ignorarId ? { NOT: { id: ignorarId } } : {}) },
    select: { id: true },
  })
  return !!achado
}

// Prisma.alunosCreateInput/UpdateInput dao a forma exata; o Record generico
// vinha das rotas antigas, que montavam objeto solto.
export async function criar(dados: Prisma.alunosCreateInput) {
  return prisma.alunos.create({ data: dados, select: { id: true } })
}

export async function atualizar(id: string, dados: Prisma.alunosUpdateInput) {
  return prisma.alunos.update({
    where: { id },
    data: { ...dados, atualizado_em: new Date() },
  })
}

/** Liga a ficha academica a conta recem-criada. */
export async function vincularConta(id: string, userId: string) {
  return prisma.alunos.update({ where: { id }, data: { user_id: userId } })
}

export async function remover(id: string) {
  return prisma.alunos.delete({ where: { id } })
}
