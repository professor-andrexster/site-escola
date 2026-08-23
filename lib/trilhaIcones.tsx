import { Code2, Cpu, Table2, PenTool, MonitorCog, Compass, type LucideIcon } from 'lucide-react'

/**
 * O ícone de cada trilha, em traço.
 *
 * Antes era emoji vindo do banco — 💻 🖥️ ⚙️ 📊 🎨. Emoji tem cor e desenho
 * próprios, que não são os da escola: ao lado do azul-marinho e do vermelho da
 * marca, ele destoa e puxa a página para um registro infantil. Também não
 * acompanha o tema (é o mesmo no claro e no escuro), não se alinha com os
 * outros ícones da interface, que são todos lucide, e muda de forma conforme o
 * sistema operacional de quem abre.
 *
 * O traço resolve os cinco de uma vez: herda a cor do texto, tem peso
 * consistente com o resto da interface e é igual em qualquer aparelho.
 *
 * O campo `trilhas.icone` continua no banco por enquanto — nada lê mais dele,
 * mas apagar coluna com o site no ar é risco sem ganho.
 */
const POR_TRILHA: Record<string, LucideIcon> = {
  programacao: Code2,
  hardware: Cpu,
  software: MonitorCog,
  'excel-e-dados': Table2,
  'design-digital': PenTool,
}

/** Casa pelo slug e, na falta dele, pelo nome — nem toda tela carrega o slug. */
const POR_NOME: Record<string, LucideIcon> = {
  'programação': Code2,
  'hardware': Cpu,
  'software': MonitorCog,
  'excel & dados': Table2,
  'design digital': PenTool,
}

export function iconeDaTrilha(trilha: { slug?: string | null; nome?: string | null }): LucideIcon {
  if (trilha.slug && POR_TRILHA[trilha.slug]) return POR_TRILHA[trilha.slug]
  const nome = trilha.nome?.trim().toLowerCase()
  if (nome && POR_NOME[nome]) return POR_NOME[nome]
  // Trilha nova, ainda sem ícone próprio: a bússola serve a qualquer uma sem
  // sugerir um assunto errado.
  return Compass
}
