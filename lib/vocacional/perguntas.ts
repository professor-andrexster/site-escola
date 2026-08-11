/**
 * O questionario vocacional e os pesos de cada trilha.
 *
 * Vive fora do componente porque a apuracao passou a ser do servidor: a tela
 * mostra as perguntas, a rota recalcula a pontuacao a partir dos mesmos pesos.
 * Antes o navegador mandava a pontuacao ja pronta para perfis_vocacionais.
 */
export interface Pergunta {
  id: number
  texto: string
  pesos: Record<string, number>
}

export const PERGUNTAS: Pergunta[] = [
  { id: 1, texto: 'Você gosta de organizar dados em tabelas e encontrar padrões?', pesos: { 'Excel & Dados': 3, 'Programação': 1 } },
  { id: 2, texto: 'Prefere trabalhar com peças físicas, montar e desmontar equipamentos?', pesos: { 'Hardware': 3, 'Software': 1 } },
  { id: 3, texto: 'Gosta de criar layouts, escolher cores e fazer coisas bonitas visualmente?', pesos: { 'Design Digital': 3 } },
  { id: 4, texto: 'Fica curioso quando um programa trava — quer entender o porquê?', pesos: { 'Software': 3, 'Programação': 2 } },
  { id: 5, texto: 'Já tentou criar um site, app ou script por conta própria?', pesos: { 'Programação': 3 } },
  { id: 6, texto: 'Consegue explicar para outras pessoas como usar um computador?', pesos: { 'Software': 2, 'Hardware': 1 } },
  { id: 7, texto: 'Usa planilhas para controlar gastos, notas ou qualquer coisa pessoal?', pesos: { 'Excel & Dados': 3 } },
  { id: 8, texto: 'Já editou uma foto, vídeo ou fez um cartaz digital?', pesos: { 'Design Digital': 3, 'Software': 1 } },
  { id: 9, texto: 'Se um computador der problema, você tenta resolver antes de pedir ajuda?', pesos: { 'Hardware': 2, 'Software': 2 } },
  { id: 10, texto: 'Tem interesse em entender como a internet funciona por dentro?', pesos: { 'Programação': 2, 'Hardware': 2, 'Software': 1 } },
  { id: 11, texto: 'Gosta de seguir instruções passo a passo com precisão?', pesos: { 'Excel & Dados': 2, 'Software': 2 } },
  { id: 12, texto: 'Prefere criar algo do zero a consertar algo existente?', pesos: { 'Programação': 2, 'Design Digital': 2 } },
  { id: 13, texto: 'Trabalha bem com números e lógica matemática?', pesos: { 'Programação': 2, 'Excel & Dados': 2 } },
  { id: 14, texto: 'Você se importa com a aparência e usabilidade dos aplicativos que usa?', pesos: { 'Design Digital': 3, 'Programação': 1 } },
  { id: 15, texto: 'Quer trabalhar consertando computadores de empresas ou pessoas?', pesos: { 'Hardware': 3, 'Software': 2 } },
]

/**
 * Percentual por trilha: o quanto o aluno marcou, sobre o maximo possivel.
 * `respostas` vem na ordem das perguntas, com valor entre 0 e 1.
 */
export function apurar(respostas: Array<{ pergunta_id: number; resposta: number }>) {
  const soma: Record<string, number> = {}
  const maximo: Record<string, number> = {}

  for (const pergunta of PERGUNTAS) {
    const marcada = respostas.find(r => r.pergunta_id === pergunta.id)
    const valor = marcada ? marcada.resposta : 0
    for (const [trilha, peso] of Object.entries(pergunta.pesos)) {
      soma[trilha] = (soma[trilha] ?? 0) + peso * valor
      maximo[trilha] = (maximo[trilha] ?? 0) + peso
    }
  }

  return (nome: string) =>
    maximo[nome] ? Math.round((soma[nome] / maximo[nome]) * 100) : 0
}
