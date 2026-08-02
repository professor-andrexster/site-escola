import type { BibliotecaConfiguracoes, BibliotecaLeitor } from '@/types/database'

export type SituacaoExibicao = 'em_andamento' | 'atrasado' | 'devolvido' | 'devolvido_com_atraso' | 'renovado' | 'perdido'

/** Soma o prazo configurado a partir da data de inicio, pulando os dias sem
 * expediente cadastrados no calendario (recesso, ferias). Cada dia sem
 * expediente encontrado no caminho estica o prazo em vez de contar como um
 * dos dias do prazo. */
export function calcularDataPrevista(dataInicio: Date, prazoDias: number, diasSemExpediente: Set<string>): Date {
  const cursor = new Date(dataInicio)
  let diasContados = 0
  while (diasContados < prazoDias) {
    cursor.setDate(cursor.getDate() + 1)
    const iso = cursor.toISOString().slice(0, 10)
    if (!diasSemExpediente.has(iso)) diasContados++
  }
  return cursor
}

/** "Atrasado" nunca e gravado no banco: e sempre calculado comparando a
 * data prevista com agora, na hora de exibir. */
export function calcularSituacaoExibicao(
  emprestimo: { situacao: string; data_prevista: string },
  hoje: Date = new Date()
): SituacaoExibicao {
  if (emprestimo.situacao === 'em_andamento' || emprestimo.situacao === 'renovado') {
    const prevista = new Date(emprestimo.data_prevista + 'T23:59:59')
    if (prevista < hoje) return 'atrasado'
  }
  return emprestimo.situacao as SituacaoExibicao
}

export function calcularDiasAtraso(dataPrevista: string, hoje: Date = new Date()): number {
  const prevista = new Date(dataPrevista + 'T23:59:59')
  const diffMs = hoje.getTime() - prevista.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export function prazoDiasPorTipo(config: BibliotecaConfiguracoes, tipo: BibliotecaLeitor['tipo_leitor']): number {
  switch (tipo) {
    case 'aluno': return config.prazo_dias_aluno
    case 'professor': return config.prazo_dias_professor
    case 'funcionario': return config.prazo_dias_funcionario
    default: return config.prazo_dias_comunidade
  }
}

export function limiteExemplaresPorTipo(config: BibliotecaConfiguracoes, tipo: BibliotecaLeitor['tipo_leitor']): number {
  switch (tipo) {
    case 'aluno': return config.limite_exemplares_aluno
    case 'professor': return config.limite_exemplares_professor
    case 'funcionario': return config.limite_exemplares_funcionario
    default: return config.limite_exemplares_comunidade
  }
}

/** Explica por que um leitor nao pode retirar nada agora, em uma frase, ou
 * null se puder. */
export function motivoBloqueioLeitor(leitor: Pick<BibliotecaLeitor, 'situacao' | 'motivo_bloqueio' | 'nome_completo'>): string | null {
  if (leitor.situacao === 'bloqueado') {
    return `${leitor.nome_completo} está bloqueado${leitor.motivo_bloqueio ? ': ' + leitor.motivo_bloqueio : '.'}`
  }
  if (leitor.situacao === 'inativo') {
    return `${leitor.nome_completo} está com o cadastro inativo.`
  }
  return null
}
