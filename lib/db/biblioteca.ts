import { prisma } from '@/lib/db'
import type {
  biblioteca_obras,
  biblioteca_exemplares,
  biblioteca_emprestimos,
} from '@prisma/client'
import type { BibliotecaLeitor, BibliotecaConfiguracoes } from '@/types/database'

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
export type Leitor = BibliotecaLeitor
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

/**
 * O banco guarda `situacao` e `tipo_leitor` como varchar; o dominio conhece o
 * conjunto valido, e as regras de emprestimo (limite por tipo, motivo de
 * bloqueio) dependem dele. Estreitar aqui e o mesmo padrao usado em perfis.
 */
export async function buscarLeitor(id: string): Promise<Leitor | null> {
  const l = await prisma.biblioteca_leitores.findUnique({ where: { id } })
  if (!l) return null
  return {
    ...l,
    data_nascimento: l.data_nascimento?.toISOString().slice(0, 10) ?? null,
    data_cadastro: l.data_cadastro?.toISOString().slice(0, 10) ?? null,
    criado_em: l.criado_em?.toISOString() ?? null,
    atualizado_em: l.atualizado_em?.toISOString() ?? null,
  } as unknown as Leitor
}

/** O emprestimo aberto de um exemplar, se houver. */
export async function emprestimoAtivoDoExemplar(exemplarId: string) {
  return prisma.biblioteca_emprestimos.findFirst({
    where: { exemplar_id: exemplarId, situacao: { in: [...SITUACOES_ATIVAS] } },
  })
}

export async function emprestimosAtivosDoLeitor(leitorId: string): Promise<number> {
  return prisma.biblioteca_emprestimos.count({
    where: { leitor_id: leitorId, situacao: { in: [...SITUACOES_ATIVAS] } },
  })
}

// ---------------------------------------------------------- configuracao

/**
 * Linha unica de configuracao. A coluna `id` e um boolean fixado em true — e
 * como o schema original garante linha unica. O dominio tipa como `true`
 * literal, entao a conversao acontece aqui.
 */
export async function configuracao(): Promise<BibliotecaConfiguracoes | null> {
  const c = await prisma.biblioteca_configuracoes.findFirst()
  return c ? ({ ...c, id: true } as unknown as BibliotecaConfiguracoes) : null
}

/** Datas nao letivas, para calcular a devolucao prevista. */
export async function diasSemExpediente(): Promise<Date[]> {
  const linhas = await prisma.biblioteca_calendario.findMany({ select: { data: true } })
  return linhas.map(l => l.data)
}

// ---------------------------------------------------------- circulacao
// Cada operacao abaixo e uma transacao: mexe em varias tabelas e nao pode
// terminar pela metade.

/** Erro de negocio da circulacao — a rota devolve a mensagem ao balcao. */
export class ErroCirculacao extends Error {}

/**
 * Empresta um exemplar: valida, cria o emprestimo, muda a situacao do
 * exemplar, registra a movimentacao e grava a auditoria — numa transacao.
 *
 * As duas recusas sao regra de acervo, nao detalhe tecnico: exemplar de
 * consulta local nunca sai, e exemplar que nao esta disponivel nao pode ser
 * emprestado por cima.
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
      include: { biblioteca_obras: { select: { titulo: true } } },
    })
    if (!exemplar) throw new ErroCirculacao(`Exemplar não encontrado (${dados.exemplarId}).`)

    const titulo = exemplar.biblioteca_obras?.titulo ?? 'Obra'
    if (exemplar.consulta_local) {
      throw new ErroCirculacao(
        `${titulo}, tombo ${exemplar.tombo}: é só para consulta local, não sai por empréstimo.`
      )
    }
    if (exemplar.situacao !== 'disponivel') {
      throw new ErroCirculacao(
        `${titulo}, tombo ${exemplar.tombo}: não está disponível (${exemplar.situacao}).`
      )
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
      data: {
        situacao: 'emprestado',
        atualizado_por: dados.registradoPor,
        atualizado_em: new Date(),
      },
    })

    await tx.biblioteca_movimentacoes.create({
      data: {
        exemplar_id: dados.exemplarId,
        situacao_anterior: exemplar.situacao,
        situacao_nova: 'emprestado',
        motivo: 'Empréstimo registrado no balcão',
        responsavel_id: dados.registradoPor,
      },
    })

    await tx.biblioteca_auditoria.create({
      data: {
        usuario_id: dados.registradoPor,
        acao: 'emprestimo_registrado',
        tabela_afetada: 'biblioteca_emprestimos',
        registro_afetado: emprestimo.id,
        valor_novo: JSON.stringify({
          exemplar_id: dados.exemplarId,
          leitor_id: dados.leitorId,
          data_prevista: dados.dataPrevista.toISOString().slice(0, 10),
        }),
      },
    })

    return { emprestimo, titulo, tombo: exemplar.tombo }
  })
}

/**
 * Devolve um exemplar, com todo o fluxo do balcao numa transacao so:
 *
 *   1. fecha o emprestimo (marcando atraso, se houver)
 *   2. decide o destino do exemplar — reparo se veio danificado, reservado se
 *      alguem esta na fila, disponivel caso contrario
 *   3. libera a proxima reserva, com validade
 *   4. registra a movimentacao
 *   5. suspende o leitor, se atrasou e a gestao configurou dias > 0
 *   6. grava a auditoria
 *
 * A ordem importa: com reserva na fila o exemplar vai para `reservado`, nao
 * `disponivel` — senao quem esperava perde o livro para quem chegou no balcao.
 *
 * Solto, esse fluxo eram sete escritas independentes. Falha na terceira
 * deixava o emprestimo fechado e o exemplar ainda como emprestado.
 */
export async function devolver(dados: {
  exemplarId: string
  devolvidoPor: string
  diasAtraso: number
  dano?: boolean
  observacaoDano?: string | null
  prazoValidadeReservaDias: number
  diasSuspensaoPorAtraso: number
}) {
  return prisma.$transaction(async tx => {
    const emprestimo = await tx.biblioteca_emprestimos.findFirst({
      where: { exemplar_id: dados.exemplarId, situacao: { in: [...SITUACOES_ATIVAS] } },
      include: {
        biblioteca_exemplares: {
          select: {
            id: true,
            obra_id: true,
            observacoes: true,
            biblioteca_obras: { select: { id: true, titulo: true } },
          },
        },
        biblioteca_leitores: { select: { id: true, nome_completo: true } },
      },
    })
    if (!emprestimo) throw new Error('Este exemplar não está emprestado no momento.')

    const agora = new Date()
    const atrasado = dados.diasAtraso > 0
    const situacaoFinal = atrasado ? 'devolvido_com_atraso' : 'devolvido'

    await tx.biblioteca_emprestimos.update({
      where: { id: emprestimo.id },
      data: {
        situacao: situacaoFinal,
        data_devolucao: agora,
        devolvido_por: dados.devolvidoPor,
        atualizado_em: agora,
      },
    })

    let novaSituacao = 'disponivel'
    if (dados.dano) {
      novaSituacao = 'em_reparo'
    } else {
      const proxima = await tx.biblioteca_reservas.findFirst({
        where: { obra_id: emprestimo.biblioteca_exemplares.obra_id, situacao: 'aguardando' },
        orderBy: { posicao_fila: 'asc' },
      })
      if (proxima) {
        novaSituacao = 'reservado'
        const validade = new Date(agora)
        validade.setDate(validade.getDate() + dados.prazoValidadeReservaDias)
        await tx.biblioteca_reservas.update({
          where: { id: proxima.id },
          data: { situacao: 'disponivel', validade, atualizado_em: agora },
        })
      }
    }

    await tx.biblioteca_exemplares.update({
      where: { id: dados.exemplarId },
      data: {
        situacao: novaSituacao,
        observacoes:
          dados.dano && dados.observacaoDano
            ? dados.observacaoDano
            : emprestimo.biblioteca_exemplares.observacoes,
        atualizado_por: dados.devolvidoPor,
        atualizado_em: agora,
      },
    })

    await tx.biblioteca_movimentacoes.create({
      data: {
        exemplar_id: dados.exemplarId,
        situacao_anterior: 'emprestado',
        situacao_nova: novaSituacao,
        motivo: dados.dano
          ? `Devolução com dano: ${dados.observacaoDano ?? 'sem detalhe informado'}`
          : 'Devolução registrada no balcão',
        responsavel_id: dados.devolvidoPor,
      },
    })

    // Suspensao automatica so quando a gestao configurou dias > 0. Com zero,
    // nada alem do registro acontece — e a regra que estava no codigo antigo.
    let leitorSuspenso = false
    if (atrasado && emprestimo.biblioteca_leitores && dados.diasSuspensaoPorAtraso > 0) {
      await tx.biblioteca_leitores.update({
        where: { id: emprestimo.biblioteca_leitores.id },
        data: {
          situacao: 'bloqueado',
          motivo_bloqueio: `Suspensão automática por devolução com ${dados.diasAtraso} dia(s) de atraso.`,
          atualizado_por: dados.devolvidoPor,
          atualizado_em: agora,
        },
      })
      leitorSuspenso = true
    }

    // valor_anterior e valor_novo sao colunas JSON: serializar na mao.
    await tx.biblioteca_auditoria.create({
      data: {
        usuario_id: dados.devolvidoPor,
        acao: 'devolucao_registrada',
        tabela_afetada: 'biblioteca_emprestimos',
        registro_afetado: emprestimo.id,
        valor_anterior: JSON.stringify({ situacao: emprestimo.situacao }),
        valor_novo: JSON.stringify({ situacao: situacaoFinal, dias_atraso: dados.diasAtraso }),
      },
    })

    return {
      atrasado,
      novaSituacaoExemplar: novaSituacao,
      leitorSuspenso,
      obraTitulo: emprestimo.biblioteca_exemplares.biblioteca_obras?.titulo ?? null,
      leitorNome: emprestimo.biblioteca_leitores?.nome_completo ?? null,
    }
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
