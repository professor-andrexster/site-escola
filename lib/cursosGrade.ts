export type Grade = '1º Ano' | '2º Ano' | '3º Ano' | 'Todas as Séries'

// Mapeamento de curso (por slug) para a série do EMTI em que é ofertado,
// conforme a grade curricular de Informática do CLAUDE.md.
const GRADE_POR_SLUG: Record<string, Grade> = {
  'cultura-digital': '1º Ano',

  'sistemas-operacionais': '2º Ano',
  'logica-de-programacao': '2º Ano',
  'poo-java': '2º Ano',
  'html-css': '2º Ano',
  'html-estrutura-da-web': '2º Ano',
  'css-estilo-e-layout': '2º Ano',
  'programacao-web-javascript': '2º Ano',
  'javascript-interatividade-web': '2º Ano',
  'arquitetura-e-manutencao': '2º Ano',

  'redes-de-computadores': '3º Ano',
  'php-backend-web': '3º Ano',
  'gerenciador-de-conteudo': '3º Ano',

  'excel-do-zero': 'Todas as Séries',
  'gestao-do-tempo': 'Todas as Séries',
  'pacote-office': 'Todas as Séries',
}

export const ORDEM_GRADE: Grade[] = ['1º Ano', '2º Ano', '3º Ano', 'Todas as Séries']

export function gradeDoCurso(slug: string): Grade {
  return GRADE_POR_SLUG[slug] ?? 'Todas as Séries'
}
