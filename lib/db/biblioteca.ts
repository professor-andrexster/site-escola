import { prisma } from '@/lib/db'
import type {
  biblioteca_obras,
  biblioteca_exemplares,
  biblioteca_leitores,
  biblioteca_emprestimos,
} from '@prisma/client'

/**
 * Biblioteca — catalogo, leitores e circulacao.
 *
 * Sexto modulo da fase 2: 41 das 371 chamadas, em 14 tabelas. Hoje o modulo
 * esta vazio no banco (so `biblioteca_configuracoes` tem uma linha), entao a
 * migracao nao move dado nenhum aqui — o que precisa e continuar funcionando
 * depois da virada.
 *
 * A circulacao e onde a falta de transacao mais machuca. Uma devolucao mexe em
 * quatro tabelas: fecha o emprestimo, libera a reserva da fila, muda a situacao
 * do exemplar e registra a movimentacao. Solta, uma falha no meio deixa o livro
 * marcado como devolvido e o exemplar ainda "emprestado" — ele some do catalogo
 * e nao pode ser emprestado de novo, sem erro visivel para ninguem.
 */

export type Obra = biblioteca_obras
export type Exemplar = biblioteca_exemplares
export type Leitor = biblioteca_leitores
export type Emprestimo = biblioteca_emprestimos

export const SITUACOES_ATIVAS = ['em_andamento', 'renovado'] as const

/**
 * Colunas estruturadas: o que no Postgres era `text[]` ou `jsonb` virou JSON
 * no MariaDB — e o JSON do MariaDB e `longtext` com uma CHECK por baixo. O
 * Prisma introspecta longtext e tipa como `String`, nao como Json.
 *
 * Consequencia pratica: o app precisa serializar e desserializar na mao.
 * Passar um array direto falha na CHECK json_valid(); ler devolve string.
 *
 * Sao oito colunas assim no sistema:
 *   text[]  -> biblioteca_obras.palavras_chave, aulas.slides_urls, projetos.tags
 *   jsonb   -> log_atividades.detalhes, testes_vocacionais.respostas,
 *              entregas.dados_estruturados, biblioteca_auditoria.valor_anterior
 *              e valor_novo
 *
 * log_atividades.detalhes e a mais sensivel: `registrarAtividade` grava nela
 * em todo login, cadastro e recusa do sistema inteiro.
 */
export function comoLista(valor: string | null): string[] {
  if (!valor) return []
  try {
    const v = JSON.parse(valor)
    return Array.isArray(v) ? v.map(String) : [valor]
  } catch {
    return [valor]
  }
}

/** Serializa para gravar numa coluna JSON. */
export function paraJson(valor: unknown): string {
  return JSON.stringify(valor ?? null)
}

// ------------------------------------------------------------- catalogo

export async function listarObras(): Promise<Obra[]> {
  return prisma.biblioteca_obras.findMany({ orderBy: { titulo: 'asc' } })
}

export async function buscarObra(id: string): Promise<Obra | null> {
  return prisma.biblioteca_obras.findUnique({ where: { id } })
}

export async function exemplaresDaObra(obraId: string): Promise<Exemplar[]> {
  return prisma.biblioteca_exemplares.findMany({
    where: { obra_id: obraId },
    orderBy: { tombo: 'asc' },
  })
}

/** Exemplar com o titulo da obra — o que a tela de circulacao mostra. */
export async function buscarExemplarComObra(id: string) {
  return prisma.biblioteca_exemplares.findUnique({
    where: { id },
    include: { biblioteca_obras: { select: { titulo: true } } },
  })
}

export async function buscarExemplarPorTombo(tombo: string) {
  return prisma.biblioteca_exemplares.findFirst({
    where: { tombo },
    include: { biblioteca_obras: { select: { titulo: true } } },
  })
}

/** Listas auxiliares de cadastro — so as ativas. */
export async function autoresAtivos() {
  return prisma.biblioteca_autores.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
}
export async function editorasAtivas() {
  return prisma.biblioteca_editoras.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
}
export async function categoriasAtivas() {
  return prisma.biblioteca_categorias.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
}

// -------------------------------------------------------------- leitores

export async function buscarLeitor(id: string): Promise<Leitor | null> {
  return prisma.biblioteca_leitores.findUnique({ where: { id } })
}

export async function emprestimosAtivosDoLeitor(leitorId: string): Promise<number> {
  return prisma.biblioteca_emprestimos.count({
    where: { leitor_id: leitorId, situacao: { in: [...SITUACOES_ATIVAS] } },
  })
}

// ---------------------------------------------------------- configuracao

/** Linha unica de configuracao (id = true no schema original). */
export async function configuracao() {
  return prisma.biblioteca_configuracoes.findFirst()
}

/** Datas nao letivas, para calcular a devolucao prevista. */
export async function diasSemExpediente(): Promise<Date[]> {
  const linhas = await prisma.biblioteca_calendario.findMany({ select: { data: true } })
  return linhas.map(l => l.data)
}

// ---------------------------------------------------------- circulacao
// Cada operacao abaixo e uma transacao: mexe em varias tabelas e nao pode
// terminar pela metade.

/**
 * Empresta um exemplar. Muda a situacao do exemplar, cria o emprestimo e
 * registra a movimentacao — junto.
 */
export async function emprestar(dados: {
  exemplarId: string
  leitorId: string
  dataPrevista: Date
  registradoPor: string
  observacoes?: string | null
}) {
  return prisma.$transaction(async tx => {
    const exemplar = await tx.biblioteca_exemplares.findUnique({
      where: { id: dados.exemplarId },
      select: { id: true, situacao: true },
    })
    if (!exemplar) throw new Error('Exemplar não encontrado.')
    if (exemplar.situacao !== 'disponivel') {
      throw new Error(`Exemplar não está disponível (${exemplar.situacao}).`)
    }

    const emprestimo = await tx.biblioteca_emprestimos.create({
      data: {
        exemplar_id: dados.exemplarId,
        leitor_id: dados.leitorId,
        data_emprestimo: new Date(),
        data_prevista: dados.dataPrevista,
        situacao: 'em_andamento',
        renovacoes_feitas: 0,
        registrado_por: dados.registradoPor,
        observacoes: dados.observacoes ?? null,
      },
    })

    await tx.biblioteca_exemplares.update({
      where: { id: dados.exemplarId },
      data: { situacao: 'emprestado' },
    })

    await tx.biblioteca_movimentacoes.create({
      data: {
        exemplar_id: dados.exemplarId,
        situacao_anterior: exemplar.situacao,
        situacao_nova: 'emprestado',
        motivo: 'emprestimo',
        responsavel_id: dados.registradoPor,
      },
    })

    return emprestimo
  })
}

/**
 * Devolve um exemplar. Fecha o emprestimo, libera a proxima reserva da fila,
 * atualiza o exemplar e registra a movimentacao.
 *
 * Se houver reserva aguardando, o exemplar vai para `reservado` em vez de
 * `disponivel` — senao a proxima pessoa da fila perde o livro para quem
 * chegou na frente no balcao.
 */
export async function devolver(dados: {
  emprestimoId: string
  devolvidoPor: string
  prazoValidadeReservaDias: number
}) {
  return prisma.$transaction(async tx => {
    const emprestimo = await tx.biblioteca_emprestimos.findUnique({
      where: { id: dados.emprestimoId },
      include: { biblioteca_exemplares: { select: { id: true, obra_id: true, situacao: true } } },
    })
    if (!emprestimo) throw new Error('Empréstimo não encontrado.')
    if (!SITUACOES_ATIVAS.includes(emprestimo.situacao as (typeof SITUACOES_ATIVAS)[number])) {
      throw new Error('Este empréstimo já foi encerrado.')
    }

    const agora = new Date()
    const atrasado = !!emprestimo.data_prevista && agora > emprestimo.data_prevista

    await tx.biblioteca_emprestimos.update({
      where: { id: dados.emprestimoId },
      data: {
        situacao: atrasado ? 'devolvido_com_atraso' : 'devolvido',
        data_devolucao: agora,
        devolvido_por: dados.devolvidoPor,
      },
    })

    const proxima = await tx.biblioteca_reservas.findFirst({
      where: { obra_id: emprestimo.biblioteca_exemplares.obra_id, situacao: 'aguardando' },
      orderBy: { posicao_fila: 'asc' },
    })

    if (proxima) {
      const validade = new Date(agora)
      validade.setDate(validade.getDate() + dados.prazoValidadeReservaDias)
      await tx.biblioteca_reservas.update({
        where: { id: proxima.id },
        data: { situacao: 'disponivel', validade },
      })
    }

    const novaSituacao = proxima ? 'reservado' : 'disponivel'
    await tx.biblioteca_exemplares.update({
      where: { id: emprestimo.exemplar_id },
      data: { situacao: novaSituacao },
    })

    await tx.biblioteca_movimentacoes.create({
      data: {
        exemplar_id: emprestimo.exemplar_id,
        situacao_anterior: 'emprestado',
        situacao_nova: novaSituacao,
        motivo: atrasado ? 'devolucao_com_atraso' : 'devolucao',
        responsavel_id: dados.devolvidoPor,
      },
    })

    return { atrasado, reservaLiberada: !!proxima }
  })
}

/** Renova um emprestimo em andamento, empurrando a data prevista. */
export async function renovar(dados: {
  emprestimoId: string
  novaDataPrevista: Date
  maxRenovacoes: number
}) {
  return prisma.$transaction(async tx => {
    const emprestimo = await tx.biblioteca_emprestimos.findUnique({
      where: { id: dados.emprestimoId },
    })
    if (!emprestimo) throw new Error('Empréstimo não encontrado.')
    if (!SITUACOES_ATIVAS.includes(emprestimo.situacao as (typeof SITUACOES_ATIVAS)[number])) {
      throw new Error('Este empréstimo já foi encerrado.')
    }
    if ((emprestimo.renovacoes_feitas ?? 0) >= dados.maxRenovacoes) {
      throw new Error('Limite de renovações atingido.')
    }

    return tx.biblioteca_emprestimos.update({
      where: { id: dados.emprestimoId },
      data: {
        situacao: 'renovado',
        data_prevista: dados.novaDataPrevista,
        renovacoes_feitas: (emprestimo.renovacoes_feitas ?? 0) + 1,
      },
    })
  })
}

// ------------------------------------------------------------- painel

export async function contarEmprestimosAtivos(): Promise<number> {
  return prisma.biblioteca_emprestimos.count({
    where: { situacao: { in: [...SITUACOES_ATIVAS] } },
  })
}

export async function contarExemplares(): Promise<number> {
  return prisma.biblioteca_exemplares.count()
}

/** Emprestimos vencidos e ainda abertos. */
export async function emprestimosAtrasados() {
  return prisma.biblioteca_emprestimos.findMany({
    where: { situacao: { in: [...SITUACOES_ATIVAS] }, data_prevista: { lt: new Date() } },
    include: {
      biblioteca_leitores: { select: { nome_completo: true, turma: true } },
      biblioteca_exemplares: {
        select: { tombo: true, biblioteca_obras: { select: { titulo: true } } },
      },
    },
    orderBy: { data_prevista: 'asc' },
  })
}
