import { prisma } from '@/lib/db'
import {
  cargaPorExtenso, descricaoDoCertificado, nomeECargo, tituloDoCertificado,
} from '@/lib/certificado/texto'

/**
 * Tudo o que o certificado imprime, pronto para desenhar.
 *
 * O componente que desenha não conversa com o banco nem sabe formatar nada:
 * recebe este objeto e posiciona. Assim a arte pode ser trocada inteira sem
 * tocar em regra de negócio, que é o caminho previsto — o desenho novo vem de
 * um vetor de referência e substitui o atual.
 *
 * ---------------------------------------------------------------- o que é fixo
 *
 * `certificados` guarda uma FOTOGRAFIA do momento da emissão: nome do aluno,
 * título do curso, carga e data. É de propósito, e é o que faz um documento
 * valer: se o curso for renomeado ou tiver a carga ajustada amanhã, o papel que
 * a aluna já tem na mão continua dizendo o que dizia quando foi emitido.
 *
 * A DESCRIÇÃO do conteúdo é a exceção: ela não está na fotografia e é lida do
 * cadastro do curso agora. É texto editorial, não uma afirmação sobre o aluno —
 * se a descrição melhorar, é bom que o certificado acompanhe. Se um dia
 * precisar ser congelada também, o lugar é uma coluna nova em `certificados`.
 */
export type DadosDoCertificado = {
  /** Identificador. Não passa pela regra do traço: é dado, não texto. */
  codigo: string
  urlValidacao: string

  alunoNome: string

  /** Título do curso ou do módulo, já sem traço. */
  cursoTitulo: string
  /** Descrição do conteúdo, em frase corrida, já sem traço. Pode ser vazia. */
  cursoDescricao: string

  cargaMinutos: number
  /** "trinta minutos", "uma hora e trinta e cinco minutos". */
  cargaExtenso: string

  anoConclusao: number
  dataConclusao: string

  /** Assinatura da esquerda. */
  diretora: { nome: string; cargo: string }
  /** Assinatura da direita: quem responde pelo curso. */
  professor: { nome: string; cargo: string }

  /** Só para o selo: o certificado é de um curso ou de um módulo inteiro. */
  tipo: 'curso' | 'modulo'
}

const DOMINIO = 'escolaestadualdrjoaoberaldo.com'

/**
 * O nome de quem assina pela escola.
 *
 * Vem de `configuracoes_site`, e não de uma consulta por papel, porque existem
 * DUAS contas com papel de diretora — uma pessoa real e um usuário genérico
 * "Direção". Escolher pela consulta daria um resultado que muda conforme a
 * ordem das linhas, e o nome errado num documento assinado é pior do que um
 * campo em branco.
 */
async function assinaturaDaEscola(): Promise<{ nome: string; cargo: string }> {
  const linhas = await prisma.configuracoes_site.findMany({
    where: { chave: { in: ['diretora_nome', 'diretora_cargo'] } },
  })
  const mapa = new Map(linhas.map(l => [l.chave, l.valor]))
  const nome = mapa.get('diretora_nome')?.trim()
  if (!nome) return { nome: '', cargo: mapa.get('diretora_cargo')?.trim() || 'Diretora' }
  return nomeECargo(nome, mapa.get('diretora_cargo')?.trim() || 'Diretora')
}

export async function dadosDoCertificado(codigo: string): Promise<DadosDoCertificado | null> {
  const cert = await prisma.certificados.findFirst({ where: { codigo } })
  if (!cert) return null

  // A descrição segue o mesmo alvo do certificado: curso ou módulo.
  const descricaoBruta = cert.curso_id
    ? (await prisma.cursos.findUnique({
        where: { id: cert.curso_id }, select: { descricao: true },
      }))?.descricao ?? null
    : cert.modulo_id
      ? (await prisma.modulos.findUnique({
          where: { id: cert.modulo_id }, select: { descricao: true },
        }))?.descricao ?? null
      : null

  const emitido = cert.emitido_em ?? new Date()

  // `carga_horaria` é inteiro em horas e arredonda para cima: um curso de
  // trinta minutos vira 1 e o documento diria "uma hora". `carga_min` é a
  // verdade; o outro só entra se a linha for antiga e não tiver minutos.
  const minutos = cert.carga_min ?? (cert.carga_horaria ?? 0) * 60

  return {
    codigo: cert.codigo,
    urlValidacao: `${DOMINIO}/certificado/${cert.codigo}`,
    alunoNome: cert.aluno_nome,
    cursoTitulo: tituloDoCertificado(cert.curso_titulo),
    cursoDescricao: descricaoDoCertificado(descricaoBruta),
    cargaMinutos: minutos,
    cargaExtenso: cargaPorExtenso(minutos),
    anoConclusao: emitido.getFullYear(),
    dataConclusao: emitido.toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    diretora: await assinaturaDaEscola(),
    professor: nomeECargo(cert.autor_nome),
    tipo: cert.modulo_id ? 'modulo' : 'curso',
  }
}
