import { prisma } from '@/lib/db'
import { NIVEIS } from '@/lib/db/modulos'

/**
 * A trilha de desafios: todos os desafios dos cursos numa sequência única,
 * do Fácil ao Difícil.
 *
 * Eles já existiam, espalhados: 168 desafios de aula que só apareciam dentro
 * da aula, 19 finais de curso e 8 projetos de módulo. Não havia lugar nenhum
 * que respondesse "o que eu já fiz e o que vem agora".
 *
 * O nível vem do MÓDULO a que o desafio pertence — direto, no caso do projeto
 * de módulo; pelo curso, nos demais. Assim a ordem da trilha acompanha a
 * progressão que os módulos já definem, em vez de inventar uma classificação
 * paralela que sairia do lugar na primeira mudança de currículo.
 */

export type TipoDesafio = 'aula' | 'curso' | 'modulo'
export type EstadoDesafio = 'concluido' | 'entregue' | 'devolvido' | 'disponivel' | 'bloqueado'

export interface ItemDaTrilha {
  id: string
  titulo: string
  tipo: TipoDesafio
  nivel: string
  /** De onde ele vem, para a tela dizer "no curso X" ou "na aula Y". */
  origem: string
  origemSlug: string
  aulaSlug: string | null
  valeCertificado: boolean
  ordem: number
  estado: EstadoDesafio
}

/**
 * Monta a trilha para um aluno.
 *
 * Estado de cada item:
 *  - projeto de módulo e final de curso: pelo envio e pelo certificado;
 *  - desafio de aula: pela conclusão da aula, que é o sinal que existe. Ele não
 *    tem entrega própria — é exercício para fazer junto da aula.
 */
export async function trilhaDoAluno(userId: string): Promise<ItemDaTrilha[]> {
  const desafios = await prisma.curso_desafios.findMany({
    select: {
      id: true, titulo: true, ordem: true, vale_certificado: true,
      aula_id: true,
      aulas: { select: { slug: true, titulo: true } },
      cursos: {
        select: {
          titulo: true, slug: true, ordem_no_modulo: true,
          modulos: { select: { nome: true, slug: true, nivel: true, ordem: true } },
        },
      },
      modulos: { select: { nome: true, slug: true, nivel: true, ordem: true } },
    },
  })

  const [envios, certificados, progresso] = await Promise.all([
    prisma.curso_desafio_envios.findMany({
      where: { user_id: userId },
      select: { desafio_id: true, status: true },
    }),
    prisma.certificados.findMany({
      where: { user_id: userId },
      select: { curso_id: true, modulo_id: true },
    }),
    prisma.progresso_aulas.findMany({
      where: { user_id: userId, concluida: true },
      select: { aula_id: true },
    }),
  ])

  const porEnvio = new Map(envios.map(e => [e.desafio_id, e.status]))
  const aulasFeitas = new Set(progresso.map(p => p.aula_id))
  const temCertificado = new Set([
    ...certificados.filter(c => c.curso_id).map(c => 'c:' + c.curso_id),
    ...certificados.filter(c => c.modulo_id).map(c => 'm:' + c.modulo_id),
  ])

  const itens: ItemDaTrilha[] = []

  for (const d of desafios) {
    const modulo = d.modulos ?? d.cursos?.modulos
    // Desafio de curso que ficou fora de módulo não entra na trilha: sem nível
    // ele não teria onde ser colocado na sequência.
    if (!modulo) continue

    const tipo: TipoDesafio = d.modulos ? 'modulo' : d.aula_id ? 'aula' : 'curso'

    let estado: EstadoDesafio
    if (tipo === 'aula') {
      estado = d.aula_id && aulasFeitas.has(d.aula_id) ? 'concluido' : 'disponivel'
    } else {
      const status = porEnvio.get(d.id)
      estado =
        status === 'aprovado' ? 'concluido'
        : status === 'entregue' ? 'entregue'
        : status === 'recusado' ? 'devolvido'
        : 'disponivel'
    }

    itens.push({
      id: d.id,
      titulo: d.titulo,
      tipo,
      nivel: modulo.nivel,
      origem: d.modulos ? modulo.nome : (d.aulas?.titulo ?? d.cursos?.titulo ?? ''),
      origemSlug: d.cursos?.slug ?? modulo.slug,
      aulaSlug: d.aulas?.slug ?? null,
      valeCertificado: d.vale_certificado,
      // A ordem da trilha: módulo, depois curso dentro do módulo, depois o
      // desafio dentro do curso. O projeto do módulo vai por último (ordem 99).
      ordem:
        (modulo.ordem ?? 0) * 10000 +
        ((d.cursos?.ordem_no_modulo ?? 99) * 100) +
        (d.ordem ?? 0),
      estado,
    })
  }

  // `certificado` já implica concluído, mas o envio pode ter sido apagado; o
  // certificado é a prova que vale.
  for (const item of itens) {
    if (item.valeCertificado && item.estado !== 'concluido') {
      const chave = item.tipo === 'modulo' ? 'm:' : 'c:'
      if (temCertificado.has(chave + item.origemSlug)) item.estado = 'concluido'
    }
  }

  return itens.sort((a, b) => {
    const na = NIVEIS.indexOf(a.nivel as never)
    const nb = NIVEIS.indexOf(b.nivel as never)
    if (na !== nb) return na - nb
    return a.ordem - b.ordem
  })
}

/** Um desafio com tudo que a tela de detalhe precisa. */
export async function desafioParaTela(id: string) {
  return prisma.curso_desafios.findUnique({
    where: { id },
    select: {
      id: true, titulo: true, enunciado: true, tipo: true,
      vale_certificado: true, formatos_aceitos: true, instrucoes_envio: true,
      curso_id: true, modulo_id: true, aula_id: true,
      aulas: { select: { slug: true, titulo: true } },
      cursos: {
        select: {
          id: true, titulo: true, slug: true, carga_horaria: true,
          modulos: { select: { nome: true, slug: true, nivel: true } },
        },
      },
      modulos: { select: { id: true, nome: true, slug: true, nivel: true, carga_horaria: true } },
    },
  })
}
