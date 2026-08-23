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

/**
 * Curso no formato das telas: as quatro datas viram string. A tabela tem
 * created_at/updated_at E criado_em/atualizado_em — as duas convencoes que se
 * encontraram — entao as quatro precisam ser convertidas.
 */
function serializarCurso(c: cursos) {
  return {
    ...c,
    criado_em: c.criado_em?.toISOString() ?? null,
    atualizado_em: c.atualizado_em?.toISOString() ?? null,
    created_at: c.created_at?.toISOString() ?? null,
    updated_at: c.updated_at?.toISOString() ?? null,
  }
}

/**
 * Aula no formato que as telas esperam: datas em string, slides_urls como
 * lista e as flags sem nulo.
 *
 * slides_urls era text[] no Postgres e virou JSON (longtext) no MariaDB —
 * mesma armadilha das outras sete colunas estruturadas. Aqui ela e desfeita
 * uma vez, na camada, em vez de em cada tela.
 */
function serializarAula(a: aulas) {
  return {
    ...a,
    curso_id: a.curso_id ?? '',
    ordem: a.ordem ?? 0,
    publicado: a.publicado ?? false,
    revisado: a.revisado ?? false,
    slides_urls: a.slides_urls ? (JSON.parse(a.slides_urls) as string[]) : [],
    created_at: a.created_at?.toISOString() ?? '',
    updated_at: a.updated_at?.toISOString() ?? '',
  }
}
export type Aula = aulas
export type Certificado = certificados

// -------------------------------------------------------------- catalogo

/** Cursos publicados, na ordem definida pela gestao. */
export async function catalogoDoPainel() {
  const linhas = await prisma.cursos.findMany({
    where: { publicado: true },
    orderBy: { ordem: 'asc' },
  })
  return linhas.map(serializarCurso)
}

/**
 * Pagina publica de um curso: so o que e publicado, curso e aulas. Um curso
 * publicado pode ter aula em rascunho, e ela nao aparece aqui.
 */
export async function cursoPublicoPorSlug(slug: string) {
  const curso = await prisma.cursos.findFirst({
    where: { slug, publicado: true },
    select: { id: true, titulo: true, descricao: true },
  })
  if (!curso) return null
  const aulas = await prisma.aulas.findMany({
    where: { curso_id: curso.id, publicado: true },
    select: { id: true, titulo: true, ordem: true },
    orderBy: { ordem: 'asc' },
  })
  return { curso, aulas }
}

/** Os primeiros cursos publicados, para a vitrine da home. */
export async function cursosDaHome(limite = 3) {
  return prisma.cursos.findMany({
    where: { publicado: true },
    select: {
      id: true, titulo: true, slug: true, descricao: true,
      capa_url: true, categoria: true, nivel: true,
    },
    orderBy: { ordem: 'asc' },
    take: limite,
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

/**
 * Catalogo publico: cursos publicados, com as aulas publicadas e a contagem de
 * desafios por aula. Eram tres consultas e tres Maps montados na tela.
 */
export async function catalogoPublico() {
  const cursos = await prisma.cursos.findMany({
    where: { publicado: true },
    orderBy: { ordem: 'asc' },
    include: {
      aulas: {
        where: { publicado: true },
        select: {
          id: true, titulo: true, ordem: true, curso_id: true, duracao_estimada_min: true,
          _count: { select: { curso_desafios: true } },
        },
        orderBy: { ordem: 'asc' },
      },
    },
  })
  // Datas viram string ISO como nas demais camadas: os componentes esperam
  // string, herdado do formato JSON do Supabase.
  return cursos.map(c => ({
    ...c,
    criado_em: c.criado_em?.toISOString() ?? null,
    atualizado_em: c.atualizado_em?.toISOString() ?? null,
    created_at: c.created_at?.toISOString() ?? null,
    updated_at: c.updated_at?.toISOString() ?? null,
    aulas: c.aulas.map(a => ({ ...a, desafios: a._count.curso_desafios })),
    totalAulas: c.aulas.length,
  }))
}

/**
 * Progresso do aluno em cada curso publicado. Vinha de lib/cursosProgresso.ts,
 * que recebia o client do Supabase por parametro.
 */
export async function progressoPorUsuario(userId: string) {
  const [cursos, aulas, concluidas] = await Promise.all([
    prisma.cursos.findMany({
      where: { publicado: true },
      select: { id: true, titulo: true, slug: true, categoria: true },
      orderBy: { ordem: 'asc' },
    }),
    prisma.aulas.findMany({ where: { publicado: true }, select: { id: true, curso_id: true } }),
    prisma.progresso_aulas.findMany({
      where: { user_id: userId, concluida: true },
      select: { aula_id: true },
    }),
  ])

  const feitas = new Set(concluidas.map(c => c.aula_id))
  return cursos.map(curso => {
    const doCurso = aulas.filter(a => a.curso_id === curso.id)
    const total = doCurso.length
    const completas = doCurso.filter(a => feitas.has(a.id)).length
    return {
      // `id` e nao `cursoId`: e o nome que as tres telas consumidoras usam.
      // Renomear aqui seria mudanca de contrato disfarcada de migracao.
      id: curso.id,
      titulo: curso.titulo,
      slug: curso.slug,
      categoria: curso.categoria,
      totalAulas: total,
      aulasConcluidas: completas,
      percentual: total > 0 ? Math.round((completas / total) * 100) : 0,
    }
  })
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

/**
 * Tudo que a tela de um curso precisa: o curso publicado, as aulas, o
 * progresso do aluno, os desafios do curso e o estado da prova final.
 *
 * A contagem de perguntas da prova vinha pelo admin client porque a tabela
 * negava leitura direta ao aluno — o gabarito mora nela. Aqui a protecao e
 * outra: a funcao devolve so o NUMERO de perguntas, nunca as perguntas.
 */
export async function cursoParaAluno(slug: string, userId: string) {
  const curso = await prisma.cursos.findFirst({ where: { slug, publicado: true } })
  if (!curso) return null

  const aulasBrutas = await prisma.aulas.findMany({
    where: { curso_id: curso.id, publicado: true },
    orderBy: { ordem: 'asc' },
  })
  const aulas = aulasBrutas.map(serializarAula)

  const [progresso, desafios, totalPerguntasProva, certificado] = await Promise.all([
    prisma.progresso_aulas.findMany({
      where: { user_id: userId, aula_id: { in: aulas.map(a => a.id) } },
      select: { aula_id: true, slide_atual: true, concluida: true },
    }),
    // Desafios soltos do curso, para a secao "Projeto do curso" — que so
    // exibe o enunciado, sem envio.
    //
    // O desafio final fica de fora: ele tem tela propria (DesafioFinal), com
    // formulario de envio e acompanhamento. Sem este filtro ele apareceria
    // duas vezes na mesma pagina, uma delas sem como enviar nada.
    prisma.curso_desafios
      .findMany({
        where: { curso_id: curso.id, aula_id: null, vale_certificado: false },
        select: { id: true, titulo: true, enunciado: true, tipo: true, ordem: true },
        orderBy: { ordem: 'asc' },
      })
      .then(ds => ds.map(d => ({ ...d, ordem: d.ordem ?? 0 }))),
    prisma.curso_prova_perguntas.count({ where: { curso_id: curso.id } }),
    prisma.certificados.findFirst({
      where: { curso_id: curso.id, user_id: userId },
      select: { codigo: true, nota: true, carga_horaria: true, carga_min: true },
    }),
  ])

  return { curso, aulas, progresso, desafios, totalPerguntasProva, certificado }
}

/** Curso publicado com as aulas publicadas, para o player. */
export async function cursoComAulas(slug: string) {
  const curso = await prisma.cursos.findFirst({ where: { slug, publicado: true } })
  if (!curso) return null
  const aulas = await prisma.aulas.findMany({
    where: { curso_id: curso.id, publicado: true },
    orderBy: { ordem: 'asc' },
  })
  return { curso: serializarCurso(curso), aulas: aulas.map(serializarAula) }
}

/** Desafios de uma aula, sem gabarito — a coluna e bloqueada para alunos. */
/**
 * Desafios exibidos dentro do player da aula.
 *
 * O desafio final fica de fora mesmo quando esta preso a uma aula. Em cinco
 * cursos (HTML, CSS, JavaScript, Excel e PHP) ele nasceu como desafio da
 * ultima aula e depois foi promovido a final, entao manteve o `aula_id`. Sem
 * este filtro, o aluno veria o mesmo projeto em dois lugares: aqui, como
 * exercicio solto, e na pagina do curso, com o formulario de entrega — e
 * provavelmente entregaria no lugar que nao recebe.
 */
export async function desafiosDaAula(aulaId: string) {
  const linhas = await prisma.curso_desafios.findMany({
    where: { aula_id: aulaId, vale_certificado: false },
    select: { id: true, titulo: true, enunciado: true, tipo: true, ordem: true },
    orderBy: { ordem: 'asc' },
  })
  // `ordem` e anulavel no banco; a tela usa para ordenar e numerar.
  return linhas.map(d => ({ ...d, ordem: d.ordem ?? 0 }))
}

/** Progresso do aluno numa aula especifica. */
export async function progressoDaAula(userId: string, aulaId: string) {
  return prisma.progresso_aulas.findFirst({
    where: { user_id: userId, aula_id: aulaId },
    select: { slide_atual: true, concluida: true },
  })
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
/**
 * Progresso do aluno numa aula. `slideAtual` marca onde ele parou; `concluida`
 * so vira true, nunca volta — reabrir uma aula ja concluida nao a desconclui.
 *
 * O curso da aula e lido do banco, e nao aceito do chamador: assim o progresso
 * nao pode ser lancado no curso errado.
 */
export async function registrarProgresso(dados: {
  userId: string
  aulaId: string
  slideAtual?: number
  concluida?: boolean
}) {
  const aula = await prisma.aulas.findUnique({
    where: { id: dados.aulaId },
    select: { curso_id: true },
  })
  if (!aula?.curso_id) throw new Error('Aula não encontrada.')

  const marcarConcluida = dados.concluida === true
  return prisma.progresso_aulas.upsert({
    where: { user_id_aula_id: { user_id: dados.userId, aula_id: dados.aulaId } },
    create: {
      user_id: dados.userId,
      curso_id: aula.curso_id,
      aula_id: dados.aulaId,
      slide_atual: dados.slideAtual ?? 0,
      concluida: marcarConcluida,
      concluida_em: marcarConcluida ? new Date() : null,
    },
    update: {
      ...(dados.slideAtual !== undefined ? { slide_atual: dados.slideAtual } : {}),
      ...(marcarConcluida ? { concluida: true, concluida_em: new Date() } : {}),
    },
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

/**
 * Perguntas da prova SEM a resposta correta — e o que vai para o aluno.
 * A separacao e proposital: a resposta so existe no servidor, na correcao.
 */
export async function perguntasDaProvaParaAluno(cursoId: string) {
  return prisma.curso_prova_perguntas.findMany({
    where: { curso_id: cursoId },
    select: {
      id: true, enunciado: true, ordem: true,
      alternativa_a: true, alternativa_b: true, alternativa_c: true, alternativa_d: true,
    },
    orderBy: { ordem: 'asc' },
  })
}

/**
 * Substitui as perguntas da prova numa transacao. Era apagar tudo e reinserir,
 * solto: falha entre os dois deixava o curso sem prova nenhuma, e o aluno via
 * "este curso ainda nao tem prova final".
 */
export async function substituirPerguntasDaProva(
  cursoId: string,
  perguntas: Array<{
    enunciado: string
    alternativa_a: string
    alternativa_b: string
    alternativa_c: string
    alternativa_d: string
    resposta_correta: string
  }>
) {
  return prisma.$transaction(async tx => {
    await tx.curso_prova_perguntas.deleteMany({ where: { curso_id: cursoId } })
    if (perguntas.length) {
      await tx.curso_prova_perguntas.createMany({
        data: perguntas.map((q, i) => ({ ...q, curso_id: cursoId, ordem: i })),
      })
    }
  })
}

/** Perguntas com gabarito — so para a gestao do curso. */
export async function perguntasDaProva(cursoId: string) {
  return prisma.curso_prova_perguntas.findMany({
    where: { curso_id: cursoId },
    orderBy: { ordem: 'asc' },
  })
}

/** Dados que a correcao da prova precisa, numa consulta so por tabela. */
export async function dadosDaProva(cursoId: string, userId: string) {
  const [curso, aulas, perguntas, certificado] = await Promise.all([
    prisma.cursos.findUnique({
      where: { id: cursoId },
      select: { id: true, titulo: true, autor_nome: true, carga_horaria: true, carga_min: true, publicado: true },
    }),
    prisma.aulas.findMany({
      where: { curso_id: cursoId, publicado: true },
      select: { id: true, duracao_estimada_min: true },
    }),
    prisma.curso_prova_perguntas.findMany({
      where: { curso_id: cursoId },
      select: { id: true, resposta_correta: true },
    }),
    prisma.certificados.findFirst({
      where: { curso_id: cursoId, user_id: userId },
      select: { codigo: true },
    }),
  ])
  return { curso, aulas, perguntas, certificado }
}

/**
 * Emite o certificado. A unique (user_id, curso_id) e quem decide corrida de
 * dois envios simultaneos; colisao de codigo, rarissima, tambem cai aqui e
 * ganha nova tentativa.
 *
 * Devolve o certificado existente quando a corrida foi perdida, em vez de
 * erro: para o aluno, ja ter o certificado e sucesso.
 */
export async function emitirCertificado(dados: {
  codigo: string
  userId: string
  cursoId: string
  alunoNome: string
  cursoTitulo: string
  autorNome: string | null
  cargaHoraria: number
  nota: number
}): Promise<{ codigo: string; jaTinha: boolean }> {
  try {
    const c = await prisma.certificados.create({
      data: {
        codigo: dados.codigo,
        user_id: dados.userId,
        curso_id: dados.cursoId,
        aluno_nome: dados.alunoNome,
        curso_titulo: dados.cursoTitulo,
        autor_nome: dados.autorNome,
        carga_horaria: dados.cargaHoraria,
        nota: dados.nota,
      },
    })
    return { codigo: c.codigo, jaTinha: false }
  } catch (erro) {
    if ((erro as { code?: string })?.code !== 'P2002') throw erro
    const existente = await prisma.certificados.findFirst({
      where: { curso_id: dados.cursoId, user_id: dados.userId },
      select: { codigo: true },
    })
    if (existente) return { codigo: existente.codigo, jaTinha: true }
    // Colisao de codigo, nao de (usuario, curso): quem chamou tenta de novo.
    throw erro
  }
}

/** Aulas concluidas por um usuario dentro de um conjunto. */
export async function concluidasEntre(userId: string, aulaIds: string[]): Promise<string[]> {
  if (!aulaIds.length) return []
  const linhas = await prisma.progresso_aulas.findMany({
    where: { user_id: userId, concluida: true, aula_id: { in: aulaIds } },
    select: { aula_id: true },
  })
  return linhas.map(l => l.aula_id)
}

/** Cursos aguardando aprovacao da gestao. */
export async function cursosPendentes() {
  const linhas = await prisma.cursos.findMany({
    where: { publicado: false },
    orderBy: { criado_em: 'desc' },
  })
  // cursos.criado_por aponta para a conta (usuarios), nao para profiles — o
  // nome do autor vem de uma segunda consulta, pelo mesmo id.
  const autores = await prisma.profiles.findMany({
    where: { id: { in: linhas.map(c => c.criado_por).filter((x): x is string => !!x) } },
    select: { id: true, nome_completo: true },
  })
  const nomePorId = new Map(autores.map(a => [a.id, a.nome_completo]))
  return linhas.map(c => ({
    ...serializarCurso(c),
    profiles: c.criado_por ? { nome_completo: nomePorId.get(c.criado_por) ?? '' } : undefined,
  }))
}

/** Curso com as aulas, para a tela de gestao (inclui rascunho). */
export async function cursoParaGestao(id: string) {
  const curso = await prisma.cursos.findUnique({ where: { id } })
  if (!curso) return null
  const aulas = await prisma.aulas.findMany({
    where: { curso_id: id },
    orderBy: { ordem: 'asc' },
  })
  return { curso: serializarCurso(curso), aulas: aulas.map(serializarAula) }
}

/** Uma aula pelo id, dentro de um curso. */
export async function aulaDoCurso(cursoId: string, aulaId: string) {
  const a = await prisma.aulas.findFirst({ where: { id: aulaId, curso_id: cursoId } })
  return a ? serializarAula(a) : null
}

export async function contarAulas(cursoId: string): Promise<number> {
  return prisma.aulas.count({ where: { curso_id: cursoId } })
}

// ------------------------------------------------------------------ GESTAO

/**
 * Cursos com a lista de ids das aulas — a tela de gestao so mostra a
 * contagem, mas o componente recebe o array e conta do lado dele.
 */
export async function cursosComAulas() {
  const linhas = await prisma.cursos.findMany({
    orderBy: [{ ordem: 'asc' }, { created_at: 'desc' }],
    include: { aulas: { select: { id: true } } },
  })
  return linhas.map(({ aulas, ...c }) => ({ ...serializarCurso(c), aulas }))
}

/**
 * Cria o curso. `criado_por` vem da sessao, nunca do corpo do pedido — antes
 * ninguem preenchia essa coluna, e por isso a tela de cursos pendentes
 * mostrava "Desconhecido" no lugar do autor.
 */
export async function criarCurso(dados: {
  titulo: string
  slug: string
  descricao: string | null
  categoria: string | null
  nivel: string
  capa_url: string | null
  carga_horaria: number | null
  publicado: boolean
  criadoPor: string
}) {
  const { criadoPor, ...campos } = dados
  const c = await prisma.cursos.create({
    data: { ...campos, criado_por: criadoPor },
    select: { id: true },
  })
  return c
}

export async function atualizarCurso(
  id: string,
  dados: {
    titulo: string
    slug: string
    descricao: string | null
    categoria: string | null
    nivel: string
    capa_url: string | null
    carga_horaria: number | null
    publicado?: boolean
  }
) {
  return prisma.cursos.update({
    where: { id },
    data: { ...dados, atualizado_em: new Date(), updated_at: new Date() },
  })
}

/** slides_urls era text[] no Postgres; aqui e JSON, e a conversao mora aqui. */
export async function criarAula(dados: {
  cursoId: string
  titulo: string
  slug: string
  descricao: string | null
  duracao_estimada_min: number | null
  publicado: boolean
  slides_urls: string[]
  ordem: number
}) {
  const { cursoId, slides_urls, ...campos } = dados
  return prisma.aulas.create({
    data: { ...campos, curso_id: cursoId, slides_urls: JSON.stringify(slides_urls) },
    select: { id: true },
  })
}

export async function atualizarAula(
  id: string,
  dados: {
    titulo: string
    slug: string
    descricao: string | null
    duracao_estimada_min: number | null
    publicado: boolean
    slides_urls: string[]
  }
) {
  const { slides_urls, ...campos } = dados
  return prisma.aulas.update({
    where: { id },
    data: { ...campos, slides_urls: JSON.stringify(slides_urls), updated_at: new Date() },
  })
}

/** Apaga a aula. progresso_aulas e curso_desafios caem por cascata no banco. */
export async function removerAula(id: string) {
  return prisma.aulas.delete({ where: { id } })
}

/** A qual curso uma aula pertence — usado para conferir dono antes de gravar. */
export async function cursoDaAula(aulaId: string): Promise<string | null> {
  const a = await prisma.aulas.findUnique({ where: { id: aulaId }, select: { curso_id: true } })
  return a?.curso_id ?? null
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
