/**
 * JBInforma: tipos, rotulos e helpers puros da redacao. Sem Prisma, para os
 * componentes cliente importarem daqui.
 */
import { esc } from '@/lib/podcast/tipos'

export const NOME_JORNAL = 'JBInforma'

export const TIPOS = ['materia', 'checagem', 'memoria', 'servico'] as const
export type TipoMateria = (typeof TIPOS)[number]

export const ROTULO_TIPO: Record<TipoMateria, { nome: string; desc: string }> = {
  materia: { nome: 'Matéria', desc: 'Notícia da escola, do bairro ou da cidade, com gente daqui ouvida.' },
  checagem: { nome: 'É verdade?', desc: 'Um boato que anda circulando, conferido passo a passo.' },
  memoria: { nome: 'Memória JB', desc: 'História, foto antiga ou depoimento de quem passou pela escola desde 1946.' },
  servico: { nome: 'Serviço', desc: 'Informação útil com data: inscrição, prazo, campanha, horário.' },
}

export const EDITORIAS = {
  escola: { nome: 'Escola', desc: 'O que acontece dentro do JB.' },
  bairro: { nome: 'Bairro', desc: 'A rua, a praça e o entorno da escola.' },
  cidade: { nome: 'Cidade', desc: 'Carlos Chagas e o Vale do Mucuri.' },
} as const
export type Editoria = keyof typeof EDITORIAS
export const ehEditoria = (v: unknown): v is Editoria => typeof v === 'string' && v in EDITORIAS

export const STATUS = ['rascunho', 'revisao', 'ajustar', 'publicado', 'retirado'] as const
export type StatusMateria = (typeof STATUS)[number]
export const ROTULO_STATUS: Record<StatusMateria, string> = {
  rascunho: 'Rascunho',
  revisao: 'Esperando o monitor',
  ajustar: 'Precisa de ajuste',
  publicado: 'No ar',
  retirado: 'Tirada do ar',
}

/** Selo da checagem. As cores ficam em components/jornal/estilos.ts (o Tailwind nao le a pasta lib). */
export const VEREDITOS = {
  verdade: { nome: 'É verdade', frase: 'Conferimos e a informação está certa.' },
  falso: { nome: 'É falso', frase: 'Conferimos e a informação não é verdadeira.' },
  enganoso: { nome: 'É enganoso', frase: 'Tem um pedaço de verdade, mas do jeito que circula engana.' },
  sem_prova: { nome: 'Sem prova', frase: 'Ninguém conseguiu confirmar. Não repasse até ter certeza.' },
} as const
export type Veredito = keyof typeof VEREDITOS
export const ehVeredito = (v: unknown): v is Veredito => typeof v === 'string' && v in VEREDITOS

/**
 * Temas que a checagem aceita. A lista e fechada de proposito: jornal de
 * escola nao checa politico, partido nem eleicao (decisao da direcao, 2026-11-10).
 */
export const TEMAS = {
  saude: 'Saúde',
  golpe: 'Golpe e fraude',
  concurso: 'Concurso, vaga e matrícula',
  servico: 'Serviço público e prazo',
} as const
export type Tema = keyof typeof TEMAS
export const ehTema = (v: unknown): v is Tema => typeof v === 'string' && v in TEMAS

export const COMO_OUVIU = {
  pessoalmente: 'Conversa pessoalmente',
  telefone: 'Ligação',
  mensagem: 'Mensagem',
  documento: 'Documento ou site oficial',
} as const
export type ComoOuviu = keyof typeof COMO_OUVIU

export interface Fonte {
  nome: string
  /** Quem e: "merendeira da escola", "moradora da Rua X", "site da Prefeitura". */
  papel: string
  como: ComoOuviu
}

/** O que o reporter confere antes de mandar ao monitor. */
export const CHECKLIST: Record<TipoMateria, { chave: string; texto: string }[]> = {
  materia: [
    { chave: 'fonte', texto: 'Ouvi pelo menos uma pessoa daqui e ela sabe que vai sair no jornal.' },
    { chave: 'dados', texto: 'Conferi nomes, datas, horários e números, um por um.' },
    { chave: 'lados', texto: 'Se a história tem dois lados, ouvi os dois.' },
    { chave: 'foto', texto: 'Quem aparece na foto autorizou. Sem foto de criança sem o responsável saber.' },
    { chave: 'autoria', texto: 'O texto é meu. Não copiei de outro site nem deixei um robô escrever sem conferir.' },
  ],
  checagem: [
    { chave: 'origem', texto: 'Escrevi o boato como ele circula, sem aumentar.' },
    { chave: 'oficial', texto: 'Fui em pelo menos uma fonte oficial ou em quem entende do assunto.' },
    { chave: 'passos', texto: 'Anotei cada passo da conferência para o leitor poder refazer.' },
    { chave: 'tema', texto: 'O assunto não é político, partido nem eleição.' },
    { chave: 'pessoa', texto: 'Não exponho quem repassou o boato.' },
  ],
  memoria: [
    { chave: 'fonte', texto: 'Sei de quem é a foto ou a história e a pessoa (ou a família) deixou publicar.' },
    { chave: 'dados', texto: 'Conferi o ano e os nomes com mais de uma pessoa ou com um documento.' },
    { chave: 'autoria', texto: 'O texto é meu.' },
  ],
  servico: [
    { chave: 'oficial', texto: 'A informação veio de fonte oficial (secretaria, prefeitura, edital).' },
    { chave: 'dados', texto: 'Conferi datas, horários, endereço e documentos pedidos.' },
    { chave: 'validade', texto: 'Coloquei até quando o aviso vale.' },
  ],
}

export const VINCULOS = {
  aluno: 'Aluno(a) do JB',
  familia: 'Família de aluno',
  funcionario: 'Professor ou funcionário',
  'ex-aluno': 'Ex-aluno(a)',
  morador: 'Morador(a) de Carlos Chagas',
} as const
export type Vinculo = keyof typeof VINCULOS
export const ehVinculo = (v: unknown): v is Vinculo => typeof v === 'string' && v in VINCULOS

export const STATUS_PAUTA = ['nova', 'sugerida', 'apurando', 'recusada'] as const
export type StatusPauta = (typeof STATUS_PAUTA)[number]
/** Coluna do quadro, ja contando a materia ligada (revisao e publicada saem dela). */
export type ColunaPauta = 'nova' | 'sugerida' | 'apurando' | 'revisao' | 'publicada' | 'recusada'
export const ROTULO_COLUNA: Record<ColunaPauta, string> = {
  nova: 'Chegou agora',
  sugerida: 'Na fila',
  apurando: 'Apurando',
  revisao: 'Em revisão',
  publicada: 'Publicada',
  recusada: 'Não vai virar matéria',
}

export interface Materia {
  id: string
  slug: string
  tipo: TipoMateria
  editoria: Editoria | null
  categoria: string | null
  titulo: string
  resumo: string | null
  texto: string | null
  imagemUrl: string | null
  fontes: Fonte[]
  checklist: string[]
  boato: string | null
  veredito: Veredito | null
  tema: Tema | null
  comoChecamos: string[]
  memoriaAno: number | null
  validoAte: string | null
  status: StatusMateria
  feedback: string | null
  autorId: string | null
  autorNome: string
  pautaId: string | null
  publicadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface Pauta {
  id: string
  titulo: string
  descricao: string | null
  origem: 'publico' | 'equipe'
  /** So o primeiro nome. */
  nome: string | null
  vinculo: Vinculo | null
  status: StatusPauta
  coluna: ColunaPauta
  resposta: string | null
  responsavelId: string | null
  responsavelNome: string | null
  noticiaId: string | null
  noticiaSlug: string | null
  criadoEm: string
}

export interface Edicao {
  id: string
  numero: number
  titulo: string
  inicio: string
  fim: string
  carta: string | null
  materias: string[]
  episodioId: string | null
  status: 'rascunho' | 'publicada'
  publicadoEm: string | null
}

export interface Correcao {
  id: string
  noticiaId: string
  texto: string
  criadoEm: string
}

/** Slugs que sao paginas fixas de /noticias: materia nenhuma pode usar. */
export const SLUGS_RESERVADOS = ['e-verdade', 'edicoes', 'edicao', 'pauta', 'memoria', 'servico', 'erramos', 'reporter', 'como-fazemos']

/**
 * Texto puro da redacao -> HTML seguro. O aluno nao escreve HTML: tudo e
 * escapado, e so tres marcas simples viram formato:
 *   "## Titulo"  intertitulo        "> fala"  citacao        "- item"  lista
 */
export function textoDaRedacaoParaHtml(texto: string | null): string {
  if (!texto) return ''
  return texto
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean)
    .map(b => {
      if (b.startsWith('## ')) return `<h2>${esc(b.slice(3).trim())}</h2>`
      const linhas = b.split('\n')
      if (linhas.every(l => l.startsWith('> '))) return `<blockquote><p>${linhas.map(l => esc(l.slice(2))).join('<br>')}</p></blockquote>`
      if (linhas.every(l => l.startsWith('- '))) return `<ul>${linhas.map(l => `<li>${esc(l.slice(2))}</li>`).join('')}</ul>`
      return `<p>${esc(b).replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
}

/** O que falta para a materia poder ir ao monitor. Lista vazia = pode ir. */
export function pendencias(m: Pick<Materia, 'tipo' | 'titulo' | 'resumo' | 'texto' | 'editoria' | 'fontes' | 'checklist' | 'boato' | 'veredito' | 'tema' | 'comoChecamos' | 'memoriaAno' | 'validoAte'>): string[] {
  const f: string[] = []
  if (m.titulo.trim().length < 8) f.push('Título com pelo menos 8 letras.')
  if (!m.resumo || m.resumo.trim().length < 20) f.push('Resumo de uma ou duas frases (aparece no card).')
  if (!m.texto || m.texto.trim().length < 200) f.push('Texto com pelo menos 200 letras.')
  if (m.tipo !== 'memoria' && !m.editoria) f.push('Escolha a editoria: Escola, Bairro ou Cidade.')
  if (m.fontes.length < 1) f.push(m.tipo === 'checagem' || m.tipo === 'servico' ? 'Diga de onde veio a informação (pelo menos uma fonte).' : 'Pelo menos uma pessoa daqui ouvida (quem a gente ouviu).')
  if (m.tipo === 'checagem') {
    if (!m.boato || m.boato.trim().length < 10) f.push('Escreva o boato do jeito que ele circula.')
    if (!m.tema) f.push('Escolha o tema da checagem.')
    if (!m.veredito) f.push('Escolha o selo: verdade, falso, enganoso ou sem prova.')
    if (m.comoChecamos.length < 2) f.push('Conte pelo menos dois passos de como você conferiu.')
  }
  if (m.tipo === 'memoria' && (!m.memoriaAno || m.memoriaAno < 1946 || m.memoriaAno > new Date().getFullYear())) f.push('Diga o ano da história (de 1946 para cá).')
  if (m.tipo === 'servico' && !m.validoAte) f.push('Diga até quando o aviso vale.')
  const faltam = CHECKLIST[m.tipo].filter(c => !m.checklist.includes(c.chave))
  if (faltam.length) f.push(`Faltam ${faltam.length} item(ns) da conferência antes de enviar.`)
  return f
}

/** "2026-11-09" -> "9 de novembro". */
export function dataCurta(iso: string, comAno = false): string {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', ...(comAno ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, d)))
}

export const periodoDaEdicao = (e: Pick<Edicao, 'inicio' | 'fim'>) => `${dataCurta(e.inicio)} a ${dataCurta(e.fim, true)}`

/** Data por extenso no fuso da escola: materia publicada as 22h nao pode sair com a data do dia seguinte. */
export const dataLonga = (iso: string | Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso))

/** Hoje no fuso da escola, YYYY-MM-DD. */
export const hojeSP = (agora = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora)
