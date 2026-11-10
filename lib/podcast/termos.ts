import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { NOME_PODCAST, formatarCpf } from '@/lib/podcast/tipos'

/**
 * Termos do podcast em PDF (A4), gerados no servidor.
 *
 * Dois modelos:
 * - Responsavel: autoriza o aluno menor a participar com nome, voz e imagem.
 *   Sai preenchido com o que o monitor digitou (aluno, turma, responsavel,
 *   CPF), ou em branco para imprimir varios.
 * - Entrevistado: quem da a entrevista autoriza o uso da voz e do nome.
 *
 * Base legal citada no texto: Constituicao art. 5º, X; Codigo Civil art. 20;
 * ECA arts. 17 e 100; LGPD art. 14, §1º (consentimento especifico de um dos
 * pais ou responsavel para dado de crianca e adolescente).
 */

const ESCOLA = 'Escola Estadual Dr. João Beraldo'
const CIDADE = 'Carlos Chagas - MG'
const AZUL = rgb(0.06, 0.2, 0.45)
const CINZA = rgb(0.35, 0.35, 0.35)
const MARGEM = 56
const LARGURA = 595.28
const ALTURA = 841.89

type Pena = { page: PDFPage; y: number; doc: PDFDocument; normal: PDFFont; negrito: PDFFont }

function quebrar(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const linhas: string[] = []
  for (const paragrafo of texto.split('\n')) {
    let atual = ''
    for (const palavra of paragrafo.split(' ')) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra
      if (fonte.widthOfTextAtSize(tentativa, tamanho) > largura && atual) {
        linhas.push(atual)
        atual = palavra
      } else atual = tentativa
    }
    linhas.push(atual)
  }
  return linhas
}

function novaPaginaSePreciso(p: Pena, altura: number) {
  if (p.y - altura < MARGEM) {
    p.page = p.doc.addPage([LARGURA, ALTURA])
    p.y = ALTURA - MARGEM
  }
}

function paragrafo(p: Pena, texto: string, opts: { tamanho?: number; negrito?: boolean; cor?: ReturnType<typeof rgb>; depois?: number } = {}) {
  const tamanho = opts.tamanho ?? 10.5
  const fonte = opts.negrito ? p.negrito : p.normal
  const linhas = quebrar(texto, fonte, tamanho, LARGURA - MARGEM * 2)
  for (const l of linhas) {
    novaPaginaSePreciso(p, tamanho * 1.5)
    p.page.drawText(l, { x: MARGEM, y: p.y - tamanho, size: tamanho, font: fonte, color: opts.cor ?? rgb(0.1, 0.1, 0.1) })
    p.y -= tamanho * 1.45
  }
  p.y -= opts.depois ?? 6
}

/** Campo "Rotulo: valor" com linha embaixo; valor vazio vira linha para preencher a mao. */
function campo(p: Pena, rotulo: string, valor: string, largura = LARGURA - MARGEM * 2, x = MARGEM, avancar = true) {
  novaPaginaSePreciso(p, 40)
  const yBase = p.y - 30
  p.page.drawText(rotulo, { x, y: p.y - 8, size: 8, font: p.negrito, color: CINZA })
  if (valor) p.page.drawText(valor, { x: x + 2, y: yBase + 4, size: 11, font: p.normal })
  p.page.drawLine({ start: { x, y: yBase }, end: { x: x + largura, y: yBase }, thickness: 0.6, color: CINZA })
  if (avancar) p.y -= 40
}

function cabecalho(p: Pena, titulo: string, subtitulo: string) {
  p.page.drawRectangle({ x: 0, y: ALTURA - 8, width: LARGURA, height: 8, color: AZUL })
  p.y -= 6
  paragrafo(p, `${ESCOLA} · ${CIDADE}`, { tamanho: 9, cor: CINZA, depois: 2 })
  paragrafo(p, titulo, { tamanho: 15, negrito: true, cor: AZUL, depois: 0 })
  paragrafo(p, subtitulo, { tamanho: 10, cor: CINZA, depois: 10 })
}

function assinatura(p: Pena, rotulo: string, nome: string) {
  novaPaginaSePreciso(p, 90)
  p.y -= 26
  campo(p, 'Local e data', `${CIDADE}, ____ de ______________ de ________`, 300)
  p.y -= 18
  const meio = LARGURA / 2
  p.page.drawLine({ start: { x: meio - 150, y: p.y }, end: { x: meio + 150, y: p.y }, thickness: 0.8 })
  const t1 = nome || rotulo
  p.page.drawText(t1, { x: meio - p.normal.widthOfTextAtSize(t1, 10) / 2, y: p.y - 13, size: 10, font: p.normal })
  if (nome) p.page.drawText(rotulo, { x: meio - p.normal.widthOfTextAtSize(rotulo, 8) / 2, y: p.y - 25, size: 8, font: p.normal, color: CINZA })
  p.y -= 40
}

function rodape(doc: PDFDocument, fonte: PDFFont, codigo: string) {
  const paginas = doc.getPages()
  paginas.forEach((pg, i) => {
    const t = `${NOME_PODCAST} · ${codigo} · página ${i + 1} de ${paginas.length}`
    pg.drawText(t, { x: MARGEM, y: 28, size: 7.5, font: fonte, color: CINZA })
  })
}

async function iniciar() {
  const doc = await PDFDocument.create()
  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold)
  const page = doc.addPage([LARGURA, ALTURA])
  return { doc, normal, negrito, page, y: ALTURA - MARGEM } as Pena
}

export interface DadosResponsavel {
  alunoNome: string
  turma: string
  matricula: string
  responsavelNome: string
  responsavelCpf: string
  ano: number
}

export async function termoResponsavel(d: Partial<DadosResponsavel> = {}): Promise<Uint8Array> {
  const p = await iniciar()
  const ano = d.ano ?? new Date().getFullYear()
  p.doc.setTitle(`Autorização do responsável - ${NOME_PODCAST}`)
  cabecalho(p, 'Termo de autorização do responsável', `Participação de estudante no podcast ${NOME_PODCAST} e na rádio da escola · ano letivo ${ano}`)

  paragrafo(p, 'Dados do estudante', { negrito: true, cor: AZUL, depois: 4 })
  campo(p, 'Nome do estudante', d.alunoNome ?? '')
  const terco = (LARGURA - MARGEM * 2 - 20) / 2
  campo(p, 'Turma', d.turma ?? '', terco, MARGEM, false)
  campo(p, 'Matrícula', d.matricula ?? '', terco, MARGEM + terco + 20)

  paragrafo(p, 'Dados do responsável legal', { negrito: true, cor: AZUL, depois: 4 })
  campo(p, 'Nome do responsável', d.responsavelNome ?? '')
  campo(p, 'CPF', d.responsavelCpf ? formatarCpf(d.responsavelCpf) : '', terco, MARGEM, false)
  campo(p, 'Parentesco (mãe, pai, avó, tutor...)', '', terco, MARGEM + terco + 20)
  campo(p, 'Telefone para contato', '', terco)

  paragrafo(p, 'O que estou autorizando', { negrito: true, cor: AZUL, depois: 4 })
  paragrafo(
    p,
    `Eu, responsável legal pelo estudante acima, autorizo a ${ESCOLA} a usar, sem cobrança e sem fins comerciais, o nome, a turma, a voz e a imagem do estudante nas produções do podcast ${NOME_PODCAST}: episódios em áudio, matérias do jornal JBInforma, a rádio da escola, o site oficial da escola e as redes sociais oficiais da escola.`
  )
  paragrafo(p, 'Fico ciente de que:', { negrito: true, depois: 2 })
  const itens = [
    'O estudante participa por vontade própria e pode deixar a equipe quando quiser.',
    'Todo episódio e toda matéria passam pela revisão de um professor antes de ir ao ar.',
    'No site aparece só o primeiro nome e a turma do estudante. Endereço, telefone e documentos dele nunca são publicados.',
    'Meu nome e meu CPF servem só para identificar quem assinou este termo. Ficam guardados pela escola em local restrito e não são publicados.',
    `Esta autorização vale para o ano letivo de ${ano}. Para o ano seguinte, a escola pede um termo novo.`,
    'Posso revogar esta autorização a qualquer momento, por escrito ou pessoalmente na secretaria. Ao revogar, a escola tira do ar os episódios em que o estudante aparece.',
  ]
  for (const i of itens) paragrafo(p, `•  ${i}`, { depois: 1 })
  p.y -= 4
  paragrafo(
    p,
    'Base legal: Constituição Federal, art. 5º, X; Código Civil, art. 20; Estatuto da Criança e do Adolescente, arts. 17 e 100; Lei Geral de Proteção de Dados (Lei 13.709/2018), art. 14, §1º.',
    { tamanho: 8.5, cor: CINZA }
  )
  assinatura(p, 'Assinatura do responsável legal', d.responsavelNome ?? '')
  rodape(p.doc, p.normal, 'Termo do responsável')
  return p.doc.save()
}

export async function termoEntrevistado(d: { nome?: string; descricao?: string; titulo?: string } = {}): Promise<Uint8Array> {
  const p = await iniciar()
  p.doc.setTitle(`Autorização de entrevistado - ${NOME_PODCAST}`)
  cabecalho(p, 'Termo de autorização de entrevistado', `Uso de voz, imagem e nome em entrevista do podcast ${NOME_PODCAST}`)

  campo(p, 'Nome de quem deu a entrevista', d.nome ?? '')
  campo(p, 'Quem é (cargo, profissão, relação com a escola)', d.descricao ?? '')
  const meia = (LARGURA - MARGEM * 2 - 20) / 2
  campo(p, 'CPF ou RG', '', meia, MARGEM, false)
  campo(p, 'Telefone', '', meia, MARGEM + meia + 20)
  campo(p, 'Assunto da entrevista', d.titulo ?? '')

  paragrafo(
    p,
    `Autorizo a ${ESCOLA} a gravar e publicar, sem cobrança e sem fins comerciais, a entrevista que dei aos estudantes da equipe do podcast ${NOME_PODCAST}, com minha voz, meu nome e, se houver, minha imagem, no podcast, no jornal JBInforma, na rádio da escola, no site oficial e nas redes sociais oficiais da escola.`
  )
  const itens = [
    'A entrevista pode ser editada para caber no tempo do episódio, sem mudar o sentido do que eu disse.',
    'Posso pedir para tirar a entrevista do ar a qualquer momento, falando com a direção da escola.',
    'Meus documentos e telefone não são publicados.',
  ]
  for (const i of itens) paragrafo(p, `•  ${i}`, { depois: 1 })
  assinatura(p, 'Assinatura de quem deu a entrevista', d.nome ?? '')
  paragrafo(p, 'Se quem deu a entrevista tiver menos de 18 anos, o responsável legal assina também:', { tamanho: 9, cor: CINZA })
  campo(p, 'Nome e CPF do responsável legal', '')
  assinatura(p, 'Assinatura do responsável legal', '')
  rodape(p.doc, p.normal, 'Termo do entrevistado')
  return p.doc.save()
}
