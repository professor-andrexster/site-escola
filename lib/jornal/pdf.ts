import { readFile } from 'fs/promises'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import QRCode from 'qrcode'
import sharp from 'sharp'
import { caminhoDaImagem } from '@/lib/jornal/arquivos'
import { EDITORIAS, NOME_JORNAL, VEREDITOS, periodoDaEdicao, type Edicao, type Materia } from '@/lib/jornal/tipos'

/**
 * Edicao da semana em PDF: uma folha A4 (frente e, se precisar, verso) para
 * imprimir e colar no mural, na cantina e no comercio do bairro. Quem nao tem
 * internet le o papel; quem tem aponta a camera para o codigo e cai no site.
 */

const L = 595.28
const A = 841.89
const M = 36
const UTIL = L - M * 2
const AZUL = rgb(0.06, 0.2, 0.45)
const VERMELHO = rgb(0.72, 0.11, 0.11)
const PRETO = rgb(0.08, 0.08, 0.08)
const CINZA = rgb(0.4, 0.4, 0.4)
const LINHA = rgb(0.75, 0.75, 0.75)
const CREME = rgb(0.97, 0.95, 0.9)

/** As fontes padrao do PDF so conhecem Latin-1 e alguns sinais. O resto (emoji, seta) sai. */
const seguro = (t: string) =>
  t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')

function quebrar(texto: string, fonte: PDFFont, tam: number, largura: number, maxLinhas = 99): string[] {
  const linhas: string[] = []
  let atual = ''
  for (const palavra of seguro(texto).replace(/\s+/g, ' ').trim().split(' ')) {
    const t = atual ? `${atual} ${palavra}` : palavra
    if (fonte.widthOfTextAtSize(t, tam) > largura && atual) { linhas.push(atual); atual = palavra } else atual = t
  }
  if (atual) linhas.push(atual)
  if (linhas.length > maxLinhas) {
    const corte = linhas.slice(0, maxLinhas)
    let ultima = corte[maxLinhas - 1]
    while (ultima.length > 4 && fonte.widthOfTextAtSize(`${ultima}...`, tam) > largura) ultima = ultima.slice(0, -1)
    corte[maxLinhas - 1] = `${ultima.replace(/[\s,.;:]+$/, '')}...`
    return corte
  }
  return linhas
}

type Pena = { doc: PDFDocument; page: PDFPage; y: number; serif: PDFFont; serifB: PDFFont; serifI: PDFFont; sans: PDFFont; sansB: PDFFont; rotulo: string }

function escrever(p: Pena, linhas: string[], x: number, o: { tam: number; fonte: PDFFont; cor?: RGB; entre?: number }) {
  for (const l of linhas) {
    p.page.drawText(l, { x, y: p.y - o.tam, size: o.tam, font: o.fonte, color: o.cor ?? PRETO })
    p.y -= o.tam * (o.entre ?? 1.28)
  }
}

function verso(p: Pena) {
  p.page = p.doc.addPage([L, A])
  p.page.drawText(seguro(p.rotulo), { x: M, y: A - 30, size: 8, font: p.sansB, color: CINZA })
  p.page.drawLine({ start: { x: M, y: A - 36 }, end: { x: L - M, y: A - 36 }, thickness: 0.6, color: LINHA })
  p.y = A - 48
}

const cabeca = (m: Materia) =>
  (m.tipo === 'checagem' ? 'É VERDADE?' : m.tipo === 'servico' ? 'SERVIÇO' : m.tipo === 'memoria' ? 'MEMÓRIA JB' : m.editoria ? EDITORIAS[m.editoria].nome.toUpperCase() : 'JBINFORMA')

async function fotoDe(doc: PDFDocument, url: string | null) {
  const caminho = caminhoDaImagem(url)
  if (!caminho) return null
  try {
    const jpg = await sharp(await readFile(caminho)).rotate().resize(900, 520, { fit: 'cover' }).jpeg({ quality: 78 }).toBuffer()
    return await doc.embedJpg(jpg)
  } catch {
    return null
  }
}

export async function pdfDaEdicao(e: Edicao, materias: Materia[], o: { base: string; assinaturas: Map<string, { nome: string }>; giro: { titulo: string; slug: string } | null }): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${NOME_JORNAL} - Edição nº ${e.numero}`)
  doc.setAuthor('Escola Estadual Dr. João Beraldo')
  const p: Pena = {
    doc, page: doc.addPage([L, A]), y: A - M,
    serif: await doc.embedFont(StandardFonts.TimesRoman), serifB: await doc.embedFont(StandardFonts.TimesRomanBold), serifI: await doc.embedFont(StandardFonts.TimesRomanItalic),
    sans: await doc.embedFont(StandardFonts.Helvetica), sansB: await doc.embedFont(StandardFonts.HelveticaBold),
    rotulo: `${NOME_JORNAL} · Edição nº ${e.numero} · ${periodoDaEdicao(e)}`,
  }
  const endereco = `${o.base.replace(/^https?:\/\//, '')}/noticias/edicao/${e.numero}`

  // Cabecalho de jornal
  p.page.drawRectangle({ x: 0, y: A - 8, width: L, height: 8, color: AZUL })
  p.y = A - 22
  const topo = 'ESCOLA ESTADUAL DR. JOÃO BERALDO · CARLOS CHAGAS, MG · DESDE 1946'
  p.page.drawText(topo, { x: (L - p.sansB.widthOfTextAtSize(topo, 7.5)) / 2, y: p.y - 7.5, size: 7.5, font: p.sansB, color: CINZA })
  p.y -= 16
  p.page.drawText(NOME_JORNAL, { x: (L - p.serifB.widthOfTextAtSize(NOME_JORNAL, 46)) / 2, y: p.y - 40, size: 46, font: p.serifB, color: AZUL })
  p.y -= 52
  const sub = 'O jornal feito pelos alunos. Toda matéria ouve gente daqui.'
  p.page.drawText(sub, { x: (L - p.serifI.widthOfTextAtSize(sub, 10)) / 2, y: p.y - 10, size: 10, font: p.serifI, color: PRETO })
  p.y -= 18
  p.page.drawLine({ start: { x: M, y: p.y }, end: { x: L - M, y: p.y }, thickness: 1.6, color: PRETO })
  p.y -= 12
  const esq = `EDIÇÃO Nº ${e.numero}`
  const dir = seguro(periodoDaEdicao(e).toUpperCase())
  p.page.drawText(esq, { x: M, y: p.y - 8, size: 8, font: p.sansB, color: VERMELHO })
  p.page.drawText(dir, { x: L - M - p.sansB.widthOfTextAtSize(dir, 8), y: p.y - 8, size: 8, font: p.sansB, color: PRETO })
  const meio = 'DISTRIBUIÇÃO GRATUITA'
  p.page.drawText(meio, { x: (L - p.sans.widthOfTextAtSize(meio, 8)) / 2, y: p.y - 8, size: 8, font: p.sans, color: CINZA })
  p.y -= 14
  p.page.drawLine({ start: { x: M, y: p.y }, end: { x: L - M, y: p.y }, thickness: 0.6, color: PRETO })
  p.y -= 14

  const assina = (m: Materia) => (m.autorId && o.assinaturas.get(m.autorId)?.nome) || `Redação ${NOME_JORNAL}`

  // Manchete: foto a esquerda (se houver), texto a direita
  const [manchete, ...resto] = materias
  if (manchete) {
    const foto = await fotoDe(doc, manchete.imagemUrl)
    const topoY = p.y
    const larguraFoto = foto ? 232 : 0
    const x = M + (foto ? larguraFoto + 16 : 0)
    const w = UTIL - (foto ? larguraFoto + 16 : 0)
    if (foto) p.page.drawImage(foto, { x: M, y: topoY - 134, width: larguraFoto, height: 134 })
    escrever(p, [cabeca(manchete)], x, { tam: 8, fonte: p.sansB, cor: VERMELHO, entre: 1.6 })
    escrever(p, quebrar(manchete.titulo, p.serifB, foto ? 21 : 26, w, 4), x, { tam: foto ? 21 : 26, fonte: p.serifB, entre: 1.1 })
    p.y -= 4
    if (manchete.resumo) escrever(p, quebrar(manchete.resumo, p.serif, 11, w, foto ? 5 : 4), x, { tam: 11, fonte: p.serif })
    p.y -= 3
    escrever(p, [seguro(`Por ${assina(manchete)}`)], x, { tam: 8, fonte: p.sans, cor: CINZA })
    p.y = Math.min(p.y, foto ? topoY - 134 : p.y) - 12
    p.page.drawLine({ start: { x: M, y: p.y }, end: { x: L - M, y: p.y }, thickness: 0.6, color: LINHA })
    p.y -= 12
  }

  // Demais materias em duas colunas, linha a linha
  const gap = 18
  const col = (UTIL - gap) / 2
  const bloco = (m: Materia) => {
    const titulo = quebrar(m.titulo, p.serifB, 13, col, 3)
    const selo = m.tipo === 'checagem' && m.veredito ? `Selo: ${VEREDITOS[m.veredito].nome}. ` : ''
    const resumo = quebrar(`${selo}${m.resumo ?? ''}`, p.serif, 9.5, col, 4)
    return { m, titulo, resumo, altura: 12 + titulo.length * 14.6 + resumo.length * 12.2 + 14 }
  }
  const RODAPE = 118
  for (let i = 0; i < resto.length; i += 2) {
    const par = resto.slice(i, i + 2).map(bloco)
    const altura = Math.max(...par.map(b => b.altura))
    if (p.y - altura < (doc.getPageCount() === 1 ? RODAPE : 50)) verso(p)
    const y0 = p.y
    par.forEach((b, j) => {
      const x = M + j * (col + gap)
      p.y = y0
      escrever(p, [cabeca(b.m)], x, { tam: 7, fonte: p.sansB, cor: VERMELHO, entre: 1.7 })
      escrever(p, b.titulo, x, { tam: 13, fonte: p.serifB, entre: 1.12 })
      p.y -= 2
      escrever(p, b.resumo, x, { tam: 9.5, fonte: p.serif })
      escrever(p, [seguro(`Por ${assina(b.m)}`)], x, { tam: 7, fonte: p.sans, cor: CINZA })
    })
    if (par.length === 2) p.page.drawLine({ start: { x: M + col + gap / 2, y: y0 }, end: { x: M + col + gap / 2, y: y0 - altura + 10 }, thickness: 0.4, color: LINHA })
    p.y = y0 - altura
  }

  // Recado da redacao
  if (e.carta) {
    const linhas = quebrar(e.carta, p.serifI, 10, UTIL - 24, 7)
    const h = linhas.length * 12.8 + 30
    if (p.y - h < (doc.getPageCount() === 1 ? RODAPE : 50)) verso(p)
    p.page.drawRectangle({ x: M, y: p.y - h, width: UTIL, height: h, color: CREME })
    p.page.drawRectangle({ x: M, y: p.y - h, width: 3, height: h, color: VERMELHO })
    p.y -= 10
    escrever(p, ['RECADO DA REDAÇÃO'], M + 12, { tam: 7.5, fonte: p.sansB, cor: VERMELHO, entre: 1.7 })
    escrever(p, linhas, M + 12, { tam: 10, fonte: p.serifI })
    p.y -= 14
  }

  // Rodape da primeira pagina: codigo para o site, Giro JB e pauta aberta
  const primeira = doc.getPage(0)
  const qr = await doc.embedPng(await QRCode.toBuffer(`${o.base}/noticias/edicao/${e.numero}`, { margin: 0, width: 300 }))
  primeira.drawLine({ start: { x: M, y: 104 }, end: { x: L - M, y: 104 }, thickness: 1.2, color: PRETO })
  primeira.drawImage(qr, { x: M, y: 34, width: 60, height: 60 })
  const tx = M + 72
  primeira.drawText('LEIA TUDO, COM FOTOS E FONTES', { x: tx, y: 86, size: 8, font: p.sansB, color: VERMELHO })
  primeira.drawText('Aponte a câmera do celular para o código ou acesse:', { x: tx, y: 73, size: 9, font: p.serif, color: PRETO })
  primeira.drawText(seguro(endereco), { x: tx, y: 60, size: 9.5, font: p.sansB, color: AZUL })
  if (o.giro) primeira.drawText(seguro(`Para ouvir: Giro JB da semana no podcast JB no Ar (${o.base.replace(/^https?:\/\//, '')}/podcast).`).slice(0, 110), { x: tx, y: 47, size: 8.5, font: p.serif, color: PRETO })
  primeira.drawText('Tem assunto para o jornal? Mande sua pauta no site ou fale com a equipe na escola.', { x: tx, y: 35, size: 8.5, font: p.serifI, color: CINZA })

  doc.getPages().forEach((pg, i, todas) => {
    const t = `${NOME_JORNAL} · Edição nº ${e.numero} · página ${i + 1} de ${todas.length}`
    pg.drawText(seguro(t), { x: L - M - p.sans.widthOfTextAtSize(seguro(t), 6.5), y: 20, size: 6.5, font: p.sans, color: CINZA })
  })
  return doc.save()
}
