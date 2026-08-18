import { prisma } from '@/lib/db'

/**
 * Modulos: trilhas de ~20h que agrupam cursos afins, com nivel Facil, Medio ou
 * Dificil.
 *
 * O aluno recebe DOIS tipos de certificado: um por curso concluido (desafio
 * final do curso) e um por modulo concluido (desafio grande do modulo, que
 * treina tudo dele). Sao independentes — terminar o modulo nao exige ter tirado
 * o certificado de cada curso, exige ter concluido as aulas de todos eles.
 *
 * O desafio de modulo mora na MESMA tabela do desafio de curso
 * (`curso_desafios`), distinguido por `modulo_id` em vez de `curso_id`. Foi de
 * proposito: envio, fila de correcao e aprovacao ja existiam e estavam testados
 * de ponta a ponta, e reaproveita-los evitou duplicar a maquina inteira.
 */

export const NIVEIS = ['Fácil', 'Médio', 'Difícil'] as const
export type Nivel = (typeof NIVEIS)[number]

const CAMPOS_MODULO = {
  id: true, nome: true, slug: true, descricao: true, nivel: true,
  ordem: true, carga_horaria: true, capa_url: true,
} as const

/** Modulos publicados, na ordem, com os cursos de cada um. */
export async function modulosPublicados() {
  return prisma.modulos.findMany({
    where: { publicado: true },
    select: {
      ...CAMPOS_MODULO,
      cursos: {
        where: { publicado: true },
        select: {
          id: true, titulo: true, slug: true, carga_horaria: true,
          capa_url: true, ordem_no_modulo: true,
        },
        orderBy: { ordem_no_modulo: 'asc' },
      },
    },
    orderBy: [{ ordem: 'asc' }],
  })
}

export async function moduloPorSlug(slug: string) {
  return prisma.modulos.findFirst({
    where: { slug, publicado: true },
    select: {
      ...CAMPOS_MODULO,
      cursos: {
        where: { publicado: true },
        select: {
          id: true, titulo: true, slug: true, descricao: true,
          carga_horaria: true, capa_url: true, ordem_no_modulo: true,
        },
        orderBy: { ordem_no_modulo: 'asc' },
      },
    },
  })
}

export async function moduloPorId(id: string) {
  return prisma.modulos.findUnique({ where: { id }, select: CAMPOS_MODULO })
}

/** O desafio grande do modulo, se houver. */
export async function desafioDoModulo(moduloId: string) {
  return prisma.curso_desafios.findFirst({
    where: { modulo_id: moduloId, vale_certificado: true },
    select: {
      id: true, titulo: true, enunciado: true,
      formatos_aceitos: true, instrucoes_envio: true, modulo_id: true,
    },
  })
}

/**
 * Quanto do modulo o aluno concluiu.
 *
 * A conta e por AULA, nao por curso: um curso conta como concluido quando
 * todas as aulas publicadas dele estao concluidas. Contar certificado de curso
 * em vez de aula exigiria que o aluno tirasse todos os certificados de curso
 * antes de poder entregar o do modulo, o que empilharia dependencia sem
 * necessidade.
 */
export async function progressoDoModulo(moduloId: string, userId: string) {
  const cursos = await prisma.cursos.findMany({
    where: { modulo_id: moduloId, publicado: true },
    select: {
      id: true, titulo: true, slug: true,
      aulas: { where: { publicado: true }, select: { id: true } },
    },
  })

  const idsDeAula = cursos.flatMap(c => c.aulas.map(a => a.id))
  const concluidas = idsDeAula.length
    ? await prisma.progresso_aulas.findMany({
        where: { user_id: userId, aula_id: { in: idsDeAula }, concluida: true },
        select: { aula_id: true },
      })
    : []
  const feitas = new Set(concluidas.map(p => p.aula_id))

  const porCurso = cursos.map(c => {
    const total = c.aulas.length
    const feito = c.aulas.filter(a => feitas.has(a.id)).length
    return {
      id: c.id, titulo: c.titulo, slug: c.slug,
      aulas: total, concluidas: feito,
      completo: total > 0 && feito === total,
    }
  })

  return {
    cursos: porCurso,
    totalAulas: idsDeAula.length,
    aulasConcluidas: feitas.size,
    cursosCompletos: porCurso.filter(c => c.completo).length,
    completo: porCurso.length > 0 && porCurso.every(c => c.completo),
  }
}

export async function certificadoDoModulo(moduloId: string, userId: string) {
  return prisma.certificados.findFirst({
    where: { modulo_id: moduloId, user_id: userId },
    select: { codigo: true, nota: true, carga_horaria: true },
  })
}

/**
 * Quem pode corrigir o desafio de um modulo.
 *
 * Um modulo reune cursos que podem ter autores diferentes, entao vale quem
 * avalia QUALQUER curso dele — autor ou avaliador convidado. Gestao sempre
 * pode. Restringir ao autor de um curso especifico deixaria modulo sem
 * corretor quando o autor daquele curso saisse da escola.
 */
export async function podeAvaliarModulo(
  moduloId: string,
  userId: string,
  role: string
): Promise<boolean> {
  if (role === 'gestao' || role === 'direcao') return true

  const cursos = await prisma.cursos.findMany({
    where: { modulo_id: moduloId },
    select: { id: true, criado_por: true },
  })
  if (cursos.some(c => c.criado_por === userId)) return true

  const convite = await prisma.curso_avaliadores.findFirst({
    where: { curso_id: { in: cursos.map(c => c.id) }, user_id: userId },
    select: { id: true },
  })
  return !!convite
}

/** Emite o certificado do modulo. Mesmo contrato do de curso. */
export async function emitirCertificadoDeModulo(dados: {
  codigo: string
  userId: string
  moduloId: string
  alunoNome: string
  moduloTitulo: string
  autorNome: string | null
  cargaHoraria: number
  nota: number
}): Promise<{ codigo: string; jaTinha: boolean }> {
  try {
    const c = await prisma.certificados.create({
      data: {
        codigo: dados.codigo,
        user_id: dados.userId,
        modulo_id: dados.moduloId,
        // `curso_titulo` e NOT NULL e serve de titulo exibido no documento;
        // para certificado de modulo ele recebe o nome do modulo, e
        // `modulo_titulo` guarda o mesmo valor de forma explicita.
        curso_titulo: dados.moduloTitulo,
        modulo_titulo: dados.moduloTitulo,
        aluno_nome: dados.alunoNome,
        autor_nome: dados.autorNome,
        carga_horaria: dados.cargaHoraria,
        nota: dados.nota,
      },
    })
    return { codigo: c.codigo, jaTinha: false }
  } catch (erro) {
    if ((erro as { code?: string })?.code !== 'P2002') throw erro
    const existente = await prisma.certificados.findFirst({
      where: { modulo_id: dados.moduloId, user_id: dados.userId },
      select: { codigo: true },
    })
    if (existente) return { codigo: existente.codigo, jaTinha: true }
    // Colisao de codigo, nao de (usuario, modulo): quem chamou tenta de novo.
    throw erro
  }
}

/** Fila de correcao do desafio de um modulo. */
export async function filaDoModulo(moduloId: string) {
  const desafio = await desafioDoModulo(moduloId)
  if (!desafio) return []

  const envios = await prisma.curso_desafio_envios.findMany({
    where: { desafio_id: desafio.id },
    orderBy: [{ status: 'asc' }, { enviado_em: 'asc' }],
  })
  if (!envios.length) return []

  const perfis = await prisma.profiles.findMany({
    where: { id: { in: envios.map(e => e.user_id) } },
    select: { id: true, nome_completo: true, turma: true },
  })
  const porId = new Map(perfis.map(p => [p.id, p]))

  return envios.map(e => ({
    ...e,
    enviado_em: e.enviado_em.toISOString(),
    avaliado_em: e.avaliado_em?.toISOString() ?? null,
    aluno_nome: porId.get(e.user_id)?.nome_completo ?? '(sem perfil)',
    aluno_turma: porId.get(e.user_id)?.turma ?? null,
  }))
}

/**
 * Painel de entregas e certificados de quem corrige.
 *
 * Junta num lugar so os dois tipos de desafio final — de curso e de modulo — e
 * os certificados ja emitidos. Antes disso era preciso abrir curso por curso
 * para saber se havia algo esperando correcao, e nao havia tela nenhuma que
 * listasse certificados emitidos.
 *
 * Sem `userId`, devolve tudo (gestao). Com `userId`, so o que aquela pessoa
 * avalia: cursos que ela criou, cursos em que foi convidada, e modulos que
 * contenham qualquer um desses.
 */
export async function painelDeEntregas(opcoes: { userId?: string } = {}) {
  const { userId } = opcoes

  let cursosPermitidos: string[] | null = null
  let modulosPermitidos: string[] | null = null

  if (userId) {
    const [proprios, convidados] = await Promise.all([
      prisma.cursos.findMany({ where: { criado_por: userId }, select: { id: true, modulo_id: true } }),
      prisma.curso_avaliadores.findMany({
        where: { user_id: userId },
        select: { cursos: { select: { id: true, modulo_id: true } } },
      }),
    ])
    const todos = [...proprios, ...convidados.map(c => c.cursos)]
    cursosPermitidos = todos.map(c => c.id)
    modulosPermitidos = Array.from(new Set(todos.map(c => c.modulo_id).filter(Boolean) as string[]))
  }

  const envios = await prisma.curso_desafio_envios.findMany({
    where: {
      curso_desafios: {
        vale_certificado: true,
        ...(cursosPermitidos
          ? {
              OR: [
                { curso_id: { in: cursosPermitidos } },
                { modulo_id: { in: modulosPermitidos ?? [] } },
              ],
            }
          : {}),
      },
    },
    select: {
      id: true, user_id: true, status: true, arquivo_url: true, link_url: true,
      comentario: true, feedback_professor: true, enviado_em: true, avaliado_em: true,
      curso_desafios: {
        select: {
          id: true, titulo: true,
          cursos: { select: { titulo: true, slug: true, carga_horaria: true } },
          modulos: { select: { nome: true, slug: true, carga_horaria: true, nivel: true } },
        },
      },
    },
    orderBy: [{ status: 'asc' }, { enviado_em: 'desc' }],
  })

  const perfis = await prisma.profiles.findMany({
    where: { id: { in: Array.from(new Set(envios.map(e => e.user_id))) } },
    select: { id: true, nome_completo: true, turma: true },
  })
  const porId = new Map(perfis.map(p => [p.id, p]))

  // O certificado do aluno, para a linha ja aprovada trazer o codigo e o link
  // de impressao junto — que e o que a tela precisa mostrar.
  const certs = await prisma.certificados.findMany({
    where: { user_id: { in: Array.from(new Set(envios.map(e => e.user_id))) } },
    select: { codigo: true, user_id: true, curso_id: true, modulo_id: true, carga_horaria: true, emitido_em: true },
  })
  const certDeCurso = new Map(certs.filter(c => c.curso_id).map(c => [`${c.user_id}:${c.curso_id}`, c]))
  const certDeModulo = new Map(certs.filter(c => c.modulo_id).map(c => [`${c.user_id}:${c.modulo_id}`, c]))

  const cursoIdPorDesafio = await prisma.curso_desafios.findMany({
    where: { id: { in: envios.map(e => e.curso_desafios.id) } },
    select: { id: true, curso_id: true, modulo_id: true },
  })
  const idsPorDesafio = new Map(cursoIdPorDesafio.map(d => [d.id, d]))

  return envios.map(e => {
    const ids = idsPorDesafio.get(e.curso_desafios.id)
    const ehModulo = !!e.curso_desafios.modulos
    const cert = ehModulo
      ? certDeModulo.get(`${e.user_id}:${ids?.modulo_id}`)
      : certDeCurso.get(`${e.user_id}:${ids?.curso_id}`)

    return {
      id: e.id,
      aluno: porId.get(e.user_id)?.nome_completo ?? '(sem perfil)',
      turma: porId.get(e.user_id)?.turma ?? null,
      tipo: ehModulo ? ('modulo' as const) : ('curso' as const),
      origem: ehModulo ? e.curso_desafios.modulos!.nome : (e.curso_desafios.cursos?.titulo ?? '—'),
      origemSlug: ehModulo ? e.curso_desafios.modulos!.slug : (e.curso_desafios.cursos?.slug ?? ''),
      nivel: ehModulo ? e.curso_desafios.modulos!.nivel : null,
      carga: ehModulo ? e.curso_desafios.modulos!.carga_horaria : (e.curso_desafios.cursos?.carga_horaria ?? null),
      desafio: e.curso_desafios.titulo,
      status: e.status,
      arquivoUrl: e.arquivo_url,
      linkUrl: e.link_url,
      comentario: e.comentario,
      feedback: e.feedback_professor,
      enviadoEm: e.enviado_em.toISOString(),
      avaliadoEm: e.avaliado_em?.toISOString() ?? null,
      certificado: cert ? { codigo: cert.codigo, carga: cert.carga_horaria } : null,
    }
  })
}

/**
 * Todos os certificados de um aluno — de curso e de modulo — do mais recente
 * para o mais antigo.
 *
 * `curso_titulo` serve de titulo exibido nos dois casos: no certificado de
 * modulo ele recebe o nome do modulo na emissao. `modulo_id` diz qual dos dois
 * e, para a tela poder etiquetar.
 */
export async function certificadosDoAluno(userId: string) {
  return prisma.certificados.findMany({
    where: { user_id: userId },
    select: {
      codigo: true, curso_titulo: true, carga_horaria: true,
      emitido_em: true, curso_id: true, modulo_id: true,
    },
    orderBy: { emitido_em: 'desc' },
  })
}
