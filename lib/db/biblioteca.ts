import { prisma } from '@/lib/db'
import type {
  biblioteca_obras,
  biblioteca_exemplares,
  biblioteca_emprestimos,
} from '@prisma/client'
import type { Prisma } from '@prisma/client'
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

/**
 * Cria uma obra. `palavrasChave` chega como lista e vai serializada: a coluna
 * e JSON (longtext com CHECK no MariaDB), e passar array direto estoura a
 * validacao — o codigo antigo passava, porque no Postgres era text[] nativo.
 */
export async function criarObra(
  // UncheckedCreateInput aceita as FKs cruas (editora_id, categoria_id); o
  // CreateInput exigiria conectar a relacao, que nao e como as rotas montam.
  dados: Omit<Prisma.biblioteca_obrasUncheckedCreateInput, 'palavras_chave'> & { palavrasChave?: string[] }
) {
  const { palavrasChave, ...resto } = dados
  return prisma.biblioteca_obras.create({
    data: { ...resto, palavras_chave: JSON.stringify(palavrasChave ?? []) },
  })
}

export async function atualizarObra(
  id: string,
  dados: Omit<Prisma.biblioteca_obrasUncheckedUpdateInput, 'palavras_chave'> & { palavrasChave?: string[] }
) {
  const { palavrasChave, ...resto } = dados
  return prisma.biblioteca_obras.update({
    where: { id },
    data: {
      ...resto,
      ...(palavrasChave !== undefined ? { palavras_chave: JSON.stringify(palavrasChave) } : {}),
      atualizado_em: new Date(),
    },
  })
}

/** Liga autores a uma obra. Chamado separado do create, ver a rota. */
export async function vincularAutores(obraId: string, autorIds: string[]) {
  if (!autorIds.length) return
  return prisma.biblioteca_obras_autores.createMany({
    data: autorIds.map(autorId => ({ obra_id: obraId, autor_id: autorId })),
  })
}

export async function substituirAutores(obraId: string, autorIds: string[]) {
  return prisma.$transaction(async tx => {
    await tx.biblioteca_obras_autores.deleteMany({ where: { obra_id: obraId } })
    if (autorIds.length) {
      await tx.biblioteca_obras_autores.createMany({
        data: autorIds.map(autorId => ({ obra_id: obraId, autor_id: autorId })),
      })
    }
  })
}

/** Obra com autores, editora e categoria — a ficha completa do acervo. */
export async function obraCompleta(id: string) {
  return prisma.biblioteca_obras.findUnique({
    where: { id },
    include: {
      biblioteca_obras_autores: { include: { biblioteca_autores: true } },
      biblioteca_editoras: { select: { id: true, nome: true } },
      biblioteca_categorias: { select: { id: true, nome: true } },
    },
  })
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

/** Busca por tombo OU codigo de barras — o balcao usa os dois no leitor. */
export async function buscarExemplarPorCodigo(codigo: string) {
  return prisma.biblioteca_exemplares.findFirst({
    where: { OR: [{ tombo: codigo }, { codigo_barras: codigo }] },
    include: { biblioteca_obras: { select: { id: true, titulo: true, capa_url: true } } },
  })
}

/** Emprestimo aberto de um exemplar, com quem esta com ele. */
export async function emprestimoAbertoComLeitor(exemplarId: string) {
  return prisma.biblioteca_emprestimos.findFirst({
    where: { exemplar_id: exemplarId, situacao: { in: [...SITUACOES_ATIVAS] } },
    include: {
      biblioteca_leitores: {
        select: { id: true, nome_completo: true, turma: true, tipo_leitor: true },
      },
    },
  })
}

export async function criarExemplar(dados: {
  obraId: string
  tombo: string
  codigoBarras?: string | null
  estante?: string | null
  prateleira?: string | null
  origemAquisicao?: string
  valorReferencia?: number | null
  consultaLocal?: boolean
  estadoConservacao?: string
  observacoes?: string | null
  atualizadoPor: string
}) {
  return prisma.biblioteca_exemplares.create({
    data: {
      obra_id: dados.obraId,
      tombo: dados.tombo,
      codigo_barras: dados.codigoBarras ?? null,
      estante: dados.estante ?? null,
      prateleira: dados.prateleira ?? null,
      origem_aquisicao: dados.origemAquisicao ?? 'compra',
      valor_referencia: dados.valorReferencia ?? null,
      consulta_local: dados.consultaLocal ?? false,
      estado_conservacao: dados.estadoConservacao ?? 'bom',
      observacoes: dados.observacoes ?? null,
      data_entrada: new Date(),
      atualizado_por: dados.atualizadoPor,
    },
  })
}

/**
 * Listas auxiliares de cadastro — autores, editoras e categorias.
 *
 * As tres tem a mesma forma (id, nome, ativo) e dao vontade de parametrizar,
 * mas os tipos genericos do Prisma nao unificam entre modelos: uma funcao que
 * recebe "qual tabela" nao compila. Tres pares explicitos e mais honesto que
 * lutar com o tipo.
 *
 * A busca usa `contains`, que no MariaDB ja ignora caixa pela collation
 * utf8mb4_unicode_ci — o ilike do Postgres nao precisa de equivalente.
 */
export async function autoresAtivos(busca?: string | null) {
  return prisma.biblioteca_autores.findMany({
    where: { ativo: true, ...(busca ? { nome: { contains: busca } } : {}) },
    orderBy: { nome: 'asc' },
  })
}
export async function criarAutor(nome: string, atualizadoPor: string) {
  return prisma.biblioteca_autores.create({ data: { nome, atualizado_por: atualizadoPor } })
}

export async function editorasAtivas(busca?: string | null) {
  return prisma.biblioteca_editoras.findMany({
    where: { ativo: true, ...(busca ? { nome: { contains: busca } } : {}) },
    orderBy: { nome: 'asc' },
  })
}
export async function criarEditora(nome: string, atualizadoPor: string) {
  return prisma.biblioteca_editoras.create({ data: { nome, atualizado_por: atualizadoPor } })
}

export async function categoriasAtivas(busca?: string | null) {
  return prisma.biblioteca_categorias.findMany({
    where: { ativo: true, ...(busca ? { nome: { contains: busca } } : {}) },
    orderBy: { nome: 'asc' },
  })
}
export async function criarCategoria(nome: string, atualizadoPor: string) {
  return prisma.biblioteca_categorias.create({ data: { nome, atualizado_por: atualizadoPor } })
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

/** Leitores, para a tela de busca do balcao. */
export async function listarLeitores(busca?: string | null) {
  return prisma.biblioteca_leitores.findMany({
    // Busca por nome, matricula OU turma — os tres campos que o balcao digita.
    where: busca
      ? {
          OR: [
            { nome_completo: { contains: busca } },
            { matricula: { contains: busca } },
            { turma: { contains: busca } },
          ],
        }
      : {},
    select: {
      id: true, nome_completo: true, nome_social: true, tipo_leitor: true,
      matricula: true, turma: true, turno: true, situacao: true, motivo_bloqueio: true,
    },
    orderBy: { nome_completo: 'asc' },
    take: 20,
  })
}

export async function criarLeitor(dados: Prisma.biblioteca_leitoresUncheckedCreateInput) {
  return prisma.biblioteca_leitores.create({ data: dados })
}

export async function atualizarLeitor(
  id: string,
  dados: Prisma.biblioteca_leitoresUncheckedUpdateInput
) {
  return prisma.biblioteca_leitores.update({
    where: { id },
    data: { ...dados, atualizado_em: new Date() },
  })
}

/** Emprestimos abertos de um leitor, com obra e tombo. */
export async function emprestimosAbertosDoLeitor(leitorId: string) {
  return prisma.biblioteca_emprestimos.findMany({
    where: { leitor_id: leitorId, situacao: { in: [...SITUACOES_ATIVAS] } },
    include: {
      biblioteca_exemplares: {
        select: { id: true, tombo: true, biblioteca_obras: { select: { titulo: true } } },
      },
    },
    orderBy: { data_prevista: 'asc' },
  })
}

/** Historico completo de emprestimos de um leitor. */
export async function emprestimosDoLeitor(leitorId: string) {
  return prisma.biblioteca_emprestimos.findMany({
    where: { leitor_id: leitorId },
    include: {
      biblioteca_exemplares: {
        select: { id: true, tombo: true, biblioteca_obras: { select: { titulo: true } } },
      },
    },
    orderBy: { data_emprestimo: 'desc' },
  })
}

export async function buscarExemplar(id: string) {
  return prisma.biblioteca_exemplares.findUnique({ where: { id } })
}

/**
 * Atualiza um exemplar e, quando a situacao muda, registra a movimentacao —
 * junto. Solto, o exemplar mudava de estado sem rastro se a segunda escrita
 * falhasse, e o historico de um acervo e o que sustenta inventario.
 */
export async function atualizarExemplar(
  id: string,
  dados: Prisma.biblioteca_exemplaresUncheckedUpdateInput,
  movimentacao?: { situacaoAnterior: string; situacaoNova: string; motivo: string; responsavelId: string }
) {
  return prisma.$transaction(async tx => {
    const exemplar = await tx.biblioteca_exemplares.update({
      where: { id },
      data: { ...dados, atualizado_em: new Date() },
    })
    if (movimentacao) {
      await tx.biblioteca_movimentacoes.create({
        data: {
          exemplar_id: id,
          situacao_anterior: movimentacao.situacaoAnterior,
          situacao_nova: movimentacao.situacaoNova,
          motivo: movimentacao.motivo,
          responsavel_id: movimentacao.responsavelId,
        },
      })
    }
    return exemplar
  })
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

/** Calendario completo, para a tela de configuracao. */
export async function calendario() {
  return prisma.biblioteca_calendario.findMany({ orderBy: { data: 'asc' } })
}

export async function adicionarDiaSemExpediente(dados: {
  data: Date
  motivo: string
  criadoPor: string
}) {
  return prisma.biblioteca_calendario.create({
    data: { data: dados.data, motivo: dados.motivo, criado_por: dados.criadoPor },
  })
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

/** Emprestimo aberto com leitor e obra — o que a renovacao precisa avaliar. */
export async function emprestimoParaRenovar(id: string) {
  return prisma.biblioteca_emprestimos.findFirst({
    where: { id, situacao: { in: [...SITUACOES_ATIVAS] } },
    include: {
      biblioteca_exemplares: { select: { obra_id: true } },
      biblioteca_leitores: true,
    },
  })
}

/** Quantas reservas aguardam por uma obra. */
export async function reservasNaFila(obraId: string): Promise<number> {
  return prisma.biblioteca_reservas.count({
    where: { obra_id: obraId, situacao: 'aguardando' },
  })
}

/**
 * Renova um emprestimo: registra a renovacao no historico e empurra a data
 * prevista — junto. Eram duas escritas soltas, e falha na segunda deixava
 * renovacao registrada sem a data ter mudado.
 *
 * As recusas de negocio (atraso, limite, fila de reserva) ficam na rota, que
 * tem o calendario e as regras de prazo por tipo de leitor.
 */
export async function renovar(dados: {
  emprestimoId: string
  dataPrevistaAnterior: Date
  novaDataPrevista: Date
  renovacoesFeitas: number
  autorizadoPor: string
}) {
  return prisma.$transaction(async tx => {
    await tx.biblioteca_renovacoes.create({
      data: {
        emprestimo_id: dados.emprestimoId,
        autorizado_por: dados.autorizadoPor,
        data_prevista_anterior: dados.dataPrevistaAnterior,
        nova_data_prevista: dados.novaDataPrevista,
      },
    })

    const atualizado = await tx.biblioteca_emprestimos.update({
      where: { id: dados.emprestimoId },
      data: {
        situacao: 'renovado',
        renovacoes_feitas: dados.renovacoesFeitas + 1,
        data_prevista: dados.novaDataPrevista,
        atualizado_em: new Date(),
      },
    })

    // A auditoria entra na mesma transacao: renovacao sem rastro e pior que
    // renovacao que falhou, porque ninguem descobre depois.
    await tx.biblioteca_auditoria.create({
      data: {
        usuario_id: dados.autorizadoPor,
        acao: 'emprestimo_renovado',
        tabela_afetada: 'biblioteca_emprestimos',
        registro_afetado: dados.emprestimoId,
        valor_anterior: JSON.stringify({
          data_prevista: dados.dataPrevistaAnterior.toISOString().slice(0, 10),
          renovacoes_feitas: dados.renovacoesFeitas,
        }),
        valor_novo: JSON.stringify({
          data_prevista: dados.novaDataPrevista.toISOString().slice(0, 10),
          renovacoes_feitas: dados.renovacoesFeitas + 1,
        }),
      },
    })

    return atualizado
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
