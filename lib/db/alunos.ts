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

export type Aluno = Omit<alunos, 'criado_em' | 'atualizado_em' | 'data_nascimento' | 'ativo'> & {
  criado_em: string
  atualizado_em: string
  data_nascimento: string | null
  // `ativo` e anulavel no banco; nulo significa ativo, que e o default da
  // coluna. Coagir aqui evita `?? true` espalhado pelas telas.
  ativo: boolean
}

/** Campos publicos — o que pode aparecer em portfolio e vitrine. */
export const CAMPOS_PUBLICOS = {
  id: true, nome: true, matricula: true, turma: true, serie: true,
  turno: true, foto_url: true, ativo: true,
} as const

function serializar(a: alunos): Aluno {
  return {
    ...a,
    ativo: a.ativo ?? true,
    criado_em: a.criado_em?.toISOString() ?? '',
    atualizado_em: a.atualizado_em?.toISOString() ?? '',
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

/**
 * Resolve o e-mail da FICHA para a conta de login.
 *
 * A escola dá a cada aluno um e-mail institucional (@aluno.mg.gov.br), e é ele
 * que fica gravado em `alunos.email`. Só que a conta de acesso costuma ter sido
 * criada com o e-mail pessoal — e o aluno, naturalmente, tenta entrar com o
 * institucional, que é o que ele considera "o e-mail dele".
 *
 * Sem isto, o login responde "conta não encontrada" para um aluno que existe,
 * está aprovado e tem ficha. Aconteceu com o Olliver em 18/08/2026, três
 * tentativas seguidas, e tinha acontecido antes com a Lilian.
 *
 * Só resolve fichas que já têm conta: sem `user_id` não há para onde apontar.
 */
export async function contaDoEmailDaFicha(email: string): Promise<string | null> {
  const a = await prisma.alunos.findFirst({
    where: { email: email.trim(), NOT: { user_id: null } },
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

/**
 * Portfolio publico completo: dados do aluno, perfil vocacional e projetos.
 *
 * So campos publicos. CPF, nascimento e contatos ficam de fora — no Supabase
 * quem barrava era o grant por coluna da migration 016; aqui e a lista
 * explicita de CAMPOS_PUBLICOS.
 */
export async function portfolioPublico(matricula: string) {
  const aluno = await prisma.alunos.findFirst({
    where: { matricula: normalizarMatricula(matricula), ativo: true },
    select: {
      ...CAMPOS_PUBLICOS,
      perfis_vocacionais: {
        select: {
          pontuacao: true,
          trilhas: { select: { nome: true, cor_tailwind: true } },
        },
      },
    },
  })
  if (!aluno) return null

  // Este é o portfólio PÚBLICO do aluno: entra só o que foi aprovado. O aluno
  // vê os próprios rascunhos em Meu Portfólio, que é outra tela.
  const projetos = await prisma.projetos.findMany({
    where: { aluno_id: aluno.id, status: 'aprovado' },
    include: { trilhas: { select: { nome: true, cor_tailwind: true } } },
    orderBy: { criado_em: 'desc' },
  })

  return {
    aluno,
    // `destaque` e anulavel no banco, e nulo aqui significa "nao destacado".
    // Coagir na camada evita espalhar `?? false` por cada tela que le projeto.
    projetos: projetos.map(p => ({
      ...p,
      tags: p.tags ? (JSON.parse(p.tags) as string[]) : [],
      destaque: p.destaque ?? false,
      criado_em: p.criado_em?.toISOString() ?? null,
    })),
  }
}

/** Matriculas dos alunos ativos — usado pelo generateStaticParams. */
export async function matriculasAtivas(): Promise<string[]> {
  const linhas = await prisma.alunos.findMany({
    where: { ativo: true },
    select: { matricula: true },
  })
  return linhas.map(a => a.matricula)
}

/** Nome e turma, para o titulo da pagina publica. */
export async function nomeETurma(matricula: string) {
  return prisma.alunos.findFirst({
    where: { matricula: normalizarMatricula(matricula) },
    select: { nome: true, turma: true },
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

/**
 * Fichas ativas que ainda nao foram reivindicadas por nenhuma conta.
 *
 * E o universo de busca do auto-cadastro: quem se cadastra sozinho nao digita
 * mais matricula nem CPF, entao a ficha dele e procurada por nome e turma
 * dentro desta lista. Filtrar por `user_id: null` aqui e o que impede alguem
 * de se apossar da ficha de um colega que ja tem conta.
 */
export async function fichasSemConta() {
  return prisma.alunos.findMany({
    where: { user_id: null, NOT: { ativo: false } },
    select: { id: true, nome: true, turma: true, data_nascimento: true },
  })
}

/**
 * Proxima matricula livre no padrao ALU<ano><sequencial de 4 digitos>.
 *
 * O auto-cadastro precisa disto porque `alunos.matricula` e NOT NULL UNIQUE:
 * quando nao existe ficha para casar, o sistema cria uma, e a matricula tem
 * que sair de algum lugar sem o aluno digitar.
 *
 * Duas pessoas se cadastrando no mesmo segundo pegariam o mesmo numero. O
 * unique do banco recusa a segunda, e quem chama repete — ver `criarCadastro`.
 */
export async function proximaMatricula(ano = new Date().getFullYear()): Promise<string> {
  const prefixo = `ALU${ano}`

  // Le todas e pega o maior sufixo NUMERICO, em vez de confiar no maior
  // lexicografico. Uma matricula digitada torta ("ALU2026TEMP") ordena depois
  // de "ALU20260031" e daria NaN — e como o gerador e deterministico, ele
  // devolveria o mesmo numero invalido a cada tentativa e o cadastro nunca
  // mais sairia. Sao poucas dezenas de linhas; ler todas sai barato.
  const linhas = await prisma.alunos.findMany({
    where: { matricula: { startsWith: prefixo } },
    select: { matricula: true },
  })

  const maior = linhas.reduce((maximo, { matricula }) => {
    const sufixo = matricula.slice(prefixo.length)
    if (!/^\d+$/.test(sufixo)) return maximo
    return Math.max(maximo, Number(sufixo))
  }, 0)

  return `${prefixo}${String(maior + 1).padStart(4, '0')}`
}

export async function remover(id: string) {
  return prisma.alunos.delete({ where: { id } })
}
