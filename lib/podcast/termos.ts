import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import { NOME_PODCAST, formatarCpf } from '@/lib/podcast/tipos'

/**
 * Termos do podcast em PDF (A4), gerados no servidor.
 *
 * Formato baseado em modelos oficiais de 2026 (Portaria SEME 857/2026 de
 * Cachoeiro de Itapemirim/ES e termo da SEDUC de Caraguatatuba/SP):
 * autorizacao previa, expressa, especifica e destacada, com caixas por tipo
 * de midia e por meio de divulgacao, finalidade delimitada (o podcast, no ano
 * letivo), vedacoes explicitas, direito de nao autorizar sem prejuizo,
 * revogacao formal, ciencia do proprio estudante e assinatura da direcao.
 *
 * Tres documentos:
 * - termoResponsavel: estudante menor no podcast (preenchido ou em branco).
 * - termoEntrevistado: quem da a entrevista (com bloco do responsavel se for menor).
 * - termoRevogacao: pedido do responsavel para cancelar a autorizacao.
 *
 * Base legal citada: CF art. 5º, X e art. 227; Codigo Civil art. 20; ECA
 * (Lei 8.069/1990) arts. 17, 18 e 100; ECA Digital (Lei 15.211/2025); LGPD
 * (Lei 13.709/2018) art. 14, §1º.
 */

const ESTADO = 'ESTADO DE MINAS GERAIS · SECRETARIA DE ESTADO DE EDUCAÇÃO'
const ESCOLA = 'Escola Estadual Dr. João Beraldo'
const CIDADE = 'Carlos Chagas - MG'
const AZUL = rgb(0.06, 0.2, 0.45)
const AZUL_CLARO = rgb(0.93, 0.95, 0.99)
const CINZA = rgb(0.38, 0.38, 0.38)
const LINHA = rgb(0.72, 0.72, 0.72)
const TEXTO = rgb(0.1, 0.1, 0.1)
const MARGEM = 42
const LARGURA = 595.28
const ALTURA = 841.89
const UTIL = LARGURA - MARGEM * 2

type Pena = { page: PDFPage; y: number; doc: PDFDocument; normal: PDFFont; negrito: PDFFont; italico: PDFFont; titulo: string }

function quebrar(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const linhas: string[] = []
  for (const par of texto.split('\n')) {
    let atual = ''
    for (const palavra of par.split(' ')) {
      const t = atual ? `${atual} ${palavra}` : palavra
      if (fonte.widthOfTextAtSize(t, tamanho) > largura && atual) { linhas.push(atual); atual = palavra } else atual = t
    }
    linhas.push(atual)
  }
  return linhas
}

function novaPagina(p: Pena) {
  p.page = p.doc.addPage([LARGURA, ALTURA])
  p.y = ALTURA - MARGEM
  p.page.drawText(p.titulo, { x: MARGEM, y: ALTURA - 32, size: 8, font: p.negrito, color: CINZA })
  p.y = ALTURA - 50
}

function espaco(p: Pena, altura: number) {
  if (p.y - altura < 44) novaPagina(p)
}

function texto(p: Pena, t: string, o: { tam?: number; fonte?: PDFFont; cor?: RGB; x?: number; largura?: number; depois?: number } = {}) {
  const tam = o.tam ?? 9
  const fonte = o.fonte ?? p.normal
  const x = o.x ?? MARGEM
  for (const l of quebrar(t, fonte, tam, o.largura ?? UTIL - (x - MARGEM))) {
    espaco(p, tam * 1.5)
    p.page.drawText(l, { x, y: p.y - tam, size: tam, font: fonte, color: o.cor ?? TEXTO })
    p.y -= tam * 1.42
  }
  p.y -= o.depois ?? 4
}

/** Faixa numerada de seção. */
function secao(p: Pena, numero: string, titulo: string) {
  espaco(p, 36)
  p.y -= 2
  p.page.drawRectangle({ x: MARGEM, y: p.y - 15, width: UTIL, height: 15, color: AZUL_CLARO })
  p.page.drawRectangle({ x: MARGEM, y: p.y - 15, width: 3, height: 15, color: AZUL })
  p.page.drawText(`${numero}. ${titulo.toUpperCase()}`, { x: MARGEM + 9, y: p.y - 10.8, size: 8.3, font: p.negrito, color: AZUL })
  p.y -= 21
}

/** Campo com rótulo pequeno e linha; valor vazio vira espaço para preencher à mão. */
function campo(p: Pena, rotulo: string, valor: string, largura: number, x: number) {
  const base = p.y - 22
  p.page.drawText(rotulo, { x, y: p.y - 7, size: 7, font: p.negrito, color: CINZA })
  if (valor) p.page.drawText(valor, { x: x + 2, y: base + 4, size: 10.5, font: p.normal, color: TEXTO })
  p.page.drawLine({ start: { x, y: base }, end: { x: x + largura, y: base }, thickness: 0.6, color: LINHA })
}

/** Linha de campos lado a lado: [rótulo, valor, fração da largura]. */
function linhaCampos(p: Pena, campos: [string, string, number][]) {
  espaco(p, 30)
  const gap = 14
  const total = UTIL - gap * (campos.length - 1)
  let x = MARGEM
  for (const [r, v, f] of campos) {
    const w = total * f
    campo(p, r, v, w, x)
    x += w + gap
  }
  p.y -= 30
}

function caixa(p: Pena, x: number, y: number) {
  p.page.drawRectangle({ x, y, width: 9, height: 9, borderColor: TEXTO, borderWidth: 0.8 })
}

/** Grade de opções com caixa de marcar, em colunas. */
function opcoes(p: Pena, itens: string[], colunas = 2) {
  const w = UTIL / colunas
  for (let i = 0; i < itens.length; i += colunas) {
    const linha = itens.slice(i, i + colunas)
    const alturas = linha.map(t => quebrar(t, p.normal, 9, w - 22).length)
    const h = Math.max(...alturas) * 11.5 + 3
    espaco(p, h)
    linha.forEach((t, j) => {
      const x = MARGEM + j * w
      caixa(p, x, p.y - 10)
      quebrar(t, p.normal, 9, w - 22).forEach((l, k) => p.page.drawText(l, { x: x + 15, y: p.y - 9 - k * 12, size: 9, font: p.normal, color: TEXTO }))
    })
    p.y -= h
  }
  p.y -= 2
}

function marcadores(p: Pena, itens: string[]) {
  for (const i of itens) {
    const linhas = quebrar(i, p.normal, 8.6, UTIL - 14)
    espaco(p, linhas.length * 11.6)
    p.page.drawText('•', { x: MARGEM + 2, y: p.y - 8.6, size: 8.6, font: p.negrito, color: AZUL })
    linhas.forEach((l, k) => p.page.drawText(l, { x: MARGEM + 12, y: p.y - 8.6 - k * 11.6, size: 8.6, font: p.normal, color: TEXTO }))
    p.y -= linhas.length * 11.6 + 1.2
  }
  p.y -= 3
}

/** Assinaturas lado a lado. */
function assinaturas(p: Pena, quem: { rotulo: string; nome?: string }[]) {
  espaco(p, 54)
  p.y -= 26
  const gap = 20
  const w = (UTIL - gap * (quem.length - 1)) / quem.length
  quem.forEach((q, i) => {
    const x = MARGEM + i * (w + gap)
    p.page.drawLine({ start: { x, y: p.y }, end: { x: x + w, y: p.y }, thickness: 0.8, color: TEXTO })
    const linha1 = q.nome || q.rotulo
    const tam1 = Math.min(8.5, (8.5 * w) / Math.max(w, p.normal.widthOfTextAtSize(linha1, 8.5)))
    p.page.drawText(linha1, { x: x + (w - p.normal.widthOfTextAtSize(linha1, tam1)) / 2, y: p.y - 11, size: tam1, font: q.nome ? p.normal : p.negrito, color: TEXTO })
    if (q.nome) p.page.drawText(q.rotulo, { x: x + (w - p.normal.widthOfTextAtSize(q.rotulo, 7)) / 2, y: p.y - 21, size: 7, font: p.normal, color: CINZA })
  })
  p.y -= 30
}

function localData(p: Pena) {
  espaco(p, 24)
  texto(p, `${CIDADE}, ______ de ______________________ de __________.`, { tam: 9.5, depois: 2 })
}

async function iniciar(titulo: string, subtitulo: string, codigo: string): Promise<Pena> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${titulo} - ${NOME_PODCAST}`)
  doc.setAuthor(ESCOLA)
  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const negrito = await doc.embedFont(StandardFonts.HelveticaBold)
  const italico = await doc.embedFont(StandardFonts.HelveticaOblique)
  const page = doc.addPage([LARGURA, ALTURA])
  const p: Pena = { doc, normal, negrito, italico, page, y: ALTURA - 34, titulo: `${titulo.toUpperCase()} · ${NOME_PODCAST}` }

  // Cabeçalho institucional
  p.page.drawRectangle({ x: 0, y: ALTURA - 6, width: LARGURA, height: 6, color: AZUL })
  const centro = (t: string, tam: number, f: PDFFont, cor: RGB) => {
    p.page.drawText(t, { x: (LARGURA - f.widthOfTextAtSize(t, tam)) / 2, y: p.y - tam, size: tam, font: f, color: cor })
    p.y -= tam * 1.5
  }
  centro(ESTADO, 7.5, negrito, CINZA)
  centro(`${ESCOLA.toUpperCase()} · ${CIDADE}`, 8.5, negrito, AZUL)
  p.y -= 6
  p.page.drawLine({ start: { x: MARGEM, y: p.y }, end: { x: LARGURA - MARGEM, y: p.y }, thickness: 0.6, color: LINHA })
  p.y -= 14
  centro(titulo.toUpperCase(), 13, negrito, TEXTO)
  centro(subtitulo, 9, italico, CINZA)
  p.page.drawText(codigo, { x: LARGURA - MARGEM - normal.widthOfTextAtSize(codigo, 7), y: ALTURA - 22, size: 7, font: normal, color: CINZA })
  p.y -= 4
  return p
}

function rodape(p: Pena) {
  const pgs = p.doc.getPages()
  pgs.forEach((pg, i) => {
    pg.drawLine({ start: { x: MARGEM, y: 34 }, end: { x: LARGURA - MARGEM, y: 34 }, thickness: 0.4, color: LINHA })
    pg.drawText(`${ESCOLA} · ${NOME_PODCAST} · 1ª via: escola (arquivo) · 2ª via: responsável`, { x: MARGEM, y: 23, size: 6.5, font: p.normal, color: CINZA })
    const t = `página ${i + 1} de ${pgs.length}`
    pg.drawText(t, { x: LARGURA - MARGEM - p.normal.widthOfTextAtSize(t, 6.5), y: 23, size: 6.5, font: p.normal, color: CINZA })
  })
}

const BASE_LEGAL =
  'Base legal: Constituição Federal, art. 5º, X, e art. 227; Código Civil, art. 20; Estatuto da Criança e do Adolescente (Lei 8.069/1990), arts. 17, 18 e 100; Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025); Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018), art. 14, §1º.'

// ─────────────────────────────────────────────────────────────────────────────

export interface DadosResponsavel {
  alunoNome: string
  turma: string
  matricula: string
  responsavelNome: string
  responsavelCpf: string
  ano: number
}

export async function termoResponsavel(d: Partial<DadosResponsavel> = {}): Promise<Uint8Array> {
  const ano = d.ano ?? new Date().getFullYear()
  const p = await iniciar(
    'Termo de autorização de uso de imagem, voz e nome',
    `Participação de estudante no podcast ${NOME_PODCAST}, na rádio e no jornal JBInforma · ano letivo ${ano}`,
    `Termo do responsável · ${ano}`
  )

  secao(p, '1', 'Estudante')
  linhaCampos(p, [['Nome completo do(a) estudante', d.alunoNome ?? '', 1]])
  linhaCampos(p, [['Turma', d.turma ?? '', 0.3], ['Matrícula', d.matricula ?? '', 0.3], ['Data de nascimento', '', 0.4]])

  secao(p, '2', 'Responsável legal')
  linhaCampos(p, [['Nome completo do(a) responsável', d.responsavelNome ?? '', 1]])
  linhaCampos(p, [['CPF', d.responsavelCpf ? formatarCpf(d.responsavelCpf) : '', 0.3], ['Parentesco (mãe, pai, avó, tutor...)', '', 0.36], ['Telefone / WhatsApp', '', 0.34]])

  secao(p, '3', 'Finalidade específica')
  texto(p,
    `Participação do(a) estudante no projeto pedagógico de comunicação da ${ESCOLA}: o podcast ${NOME_PODCAST}, a rádio interna e o jornal JBInforma. Os estudantes entrevistam pessoas, escrevem notícias e gravam episódios sob acompanhamento de professores. Esta autorização vale somente para este projeto e somente no ano letivo de ${ano}.`)

  secao(p, '4', 'O que o(a) estudante faz no projeto')
  texto(p, 'O(a) estudante pode exercer uma ou mais das funções abaixo. Todas acontecem dentro da escola, com acompanhamento de um professor monitor.', { depois: 3 })
  texto(p, `No podcast ${NOME_PODCAST} e na rádio da escola:`, { fonte: p.negrito, tam: 9, depois: 3 })
  marcadores(p, [
    'Pauta e roteiro: escolher o assunto do episódio, pesquisar e escrever as perguntas e o roteiro.',
    'Apresentação e locução: falar no episódio e nos avisos da rádio. A voz do(a) estudante fica gravada.',
    'Entrevista: entrevistar colegas, professores, funcionários e pessoas da comunidade. Quem dá a entrevista assina um termo próprio.',
    'Gravação: gravar o áudio pelo celular ou pelo computador, dentro do painel da escola, com o acesso pessoal do(a) estudante.',
    'Edição: ouvir a gravação, cortar trechos e escolher o que entra no episódio.',
    'Texto e capa: escrever o título e a descrição do episódio e escolher a imagem de capa.',
  ])
  texto(p, 'No jornal JBInforma:', { fonte: p.negrito, tam: 9, depois: 3 })
  marcadores(p, [
    'Pauta: sugerir assuntos e assumir pautas, inclusive as enviadas por moradores pelo site.',
    'Apuração: ouvir as pessoas envolvidas, conferir as informações e anotar quem foi ouvido.',
    'Redação: escrever matérias sobre a escola e o bairro. Matéria sobre a cidade só sai com aprovação da direção.',
    'Checagem ("É verdade?"): verificar boatos sobre saúde, golpes, concursos e serviços públicos, mostrando como a informação foi conferida. Política partidária e disputas locais ficam de fora.',
    'Memória e serviço: pesquisar a história da escola e escrever avisos úteis para a comunidade.',
    'Fotografia: fazer fotos para as matérias. Os dados de localização da foto são apagados antes de publicar.',
    'Correção: corrigir a matéria quando houver erro. A correção fica registrada na seção "Erramos".',
  ])
  texto(p, 'Limites que valem para todas as funções:', { fonte: p.negrito, tam: 9, depois: 3 })
  marcadores(p, [
    'O(a) estudante não publica nada sozinho(a). Tudo vai antes para o professor monitor, que publica, devolve para ajuste ou recusa.',
    'O que o(a) estudante faz no painel (criar, enviar, corrigir) fica registrado com data e hora, para a escola acompanhar.',
    'As gravações e as demais atividades acontecem dentro da escola. O(a) estudante não sai da escola para o projeto, e este termo não autoriza saída.',
  ])

  secao(p, '5', 'O que autorizo (marque cada item que autoriza)')
  texto(p, 'Tipo de conteúdo:', { fonte: p.negrito, tam: 9, depois: 3 })
  opcoes(p, [
    'Voz do(a) estudante (áudio dos episódios e entrevistas)',
    'Primeiro nome e turma nos créditos (nunca o nome completo no site)',
    'Fotografia do(a) estudante',
    'Vídeo do(a) estudante',
  ])
  espaco(p, 78) // as caixas de "onde" ficam juntas, sem quebrar entre páginas
  texto(p, 'Onde pode ser divulgado:', { fonte: p.negrito, tam: 9, depois: 3 })
  opcoes(p, [
    'Rádio interna da escola (somente dentro da escola)',
    `Página do podcast no site oficial da escola`,
    'Jornal da escola JBInforma, no site oficial',
    'Redes sociais oficiais da escola',
    'Aplicativos de podcast, que recebem os episódios pelo endereço público do programa (RSS)',
    'Edição impressa do jornal (folha da semana, mural e distribuição na escola)',
  ])
  espaco(p, 20)
  caixa(p, MARGEM, p.y - 10)
  p.page.drawText('NÃO AUTORIZO nenhum dos usos acima.', { x: MARGEM + 15, y: p.y - 9, size: 9, font: p.negrito, color: TEXTO })
  p.y -= 18

  secao(p, '6', 'Compartilhamento: por onde o conteúdo pode circular')
  texto(p, 'Leia com atenção. O que é publicado na internet pode ser visto e repassado por qualquer pessoa.', { depois: 3 })
  marcadores(p, [
    'Acesso público: o site da escola é aberto. Qualquer pessoa pode ler as matérias e ouvir os episódios, sem cadastro, e eles podem aparecer em buscas na internet.',
    'Repasse por terceiros: quem acessa pode copiar o endereço, baixar o áudio e repassar por WhatsApp, redes sociais ou outros meios. A escola não controla esse repasse.',
    'Aplicativos de podcast: se autorizado no item 5, os episódios ficam disponíveis em aplicativos de áudio, que copiam o programa a partir do endereço público (RSS).',
    'Folha impressa: a edição da semana pode ser impressa, afixada no mural e levada para casa por estudantes e famílias.',
    'Como o(a) estudante aparece: somente primeiro nome e turma. Nome completo, endereço, telefone, documentos e data de nascimento nunca são publicados.',
    'Canais oficiais: a escola só publica nos meios marcados no item 5. Servidores e professores não publicam o conteúdo em perfis pessoais.',
    'Compartilhamento pelo(a) estudante: ele(a) pode repassar o endereço do que já foi publicado. Não pode divulgar gravação bruta, bastidores, rascunho ou fala de colega e de entrevistado que ainda não passou pela revisão.',
    'Dados com terceiros: a escola não vende nem cede dados de estudantes e não usa o conteúdo em propaganda. O áudio já publicado pode ser enviado a um serviço automático de transcrição (Google) somente para gerar o texto do episódio.',
    'Depois da revogação: a escola tira o conteúdo do site, do endereço dos aplicativos e das redes oficiais. Cópias que outras pessoas já baixaram ou repassaram podem continuar circulando, e a escola não tem como apagá-las.',
  ])

  secao(p, '7', 'Condições e garantias')
  marcadores(p, [
    'A participação é voluntária e gratuita. Não autorizar não traz nenhum prejuízo ao(à) estudante na escola.',
    'Todo episódio e toda matéria são revisados por um professor monitor antes de serem publicados. O áudio já publicado pode ser transcrito por ferramenta automática, para quem não pode ouvir.',
    'O(a) estudante pode sair da equipe quando quiser, sem prejuízo.',
    'É proibido: uso comercial; uso fora da finalidade e dos meios marcados acima; publicação em perfis pessoais de servidores; exposição vexatória ou constrangedora; divulgar endereço, telefone, documentos, localização ou rotina do(a) estudante.',
    'Os dados deste termo (inclusive o CPF do responsável) servem apenas para identificar quem autorizou. Ficam guardados pela escola em local de acesso restrito e nunca são publicados (LGPD).',
    `Validade: ano letivo de ${ano}. Para o ano seguinte, a escola pedirá um novo termo.`,
    'Revogação: o responsável pode cancelar esta autorização a qualquer momento, por escrito, na secretaria da escola. A escola deixa de usar o conteúdo e tira do ar os episódios em que o(a) estudante aparece, a partir do recebimento do pedido.',
  ])
  texto(p, BASE_LEGAL, { tam: 7.5, cor: CINZA, fonte: p.italico, depois: 6 })

  secao(p, '8', 'Declaração e assinaturas')
  texto(p,
    'Declaro que li este termo, conheci as funções do(a) estudante descritas no item 4, entendi como o conteúdo pode ser compartilhado (item 6) e autorizo, de forma prévia, expressa, específica e destacada, somente os usos marcados no item 5. O(a) estudante também foi ouvido(a) e concorda em participar.')
  localData(p)
  assinaturas(p, [
    { rotulo: 'Responsável legal', nome: d.responsavelNome ?? '' },
    { rotulo: 'Estudante (ciência)', nome: d.alunoNome ?? '' },
    { rotulo: 'Direção (assinatura e carimbo)' },
  ])
  rodape(p)
  return p.doc.save()
}

export async function termoEntrevistado(d: { nome?: string; descricao?: string; titulo?: string } = {}): Promise<Uint8Array> {
  const p = await iniciar(
    'Termo de autorização de entrevistado',
    `Uso de voz, imagem e nome em entrevista do podcast ${NOME_PODCAST}`,
    'Termo do entrevistado'
  )
  secao(p, '1', 'Quem deu a entrevista')
  linhaCampos(p, [['Nome completo', d.nome ?? '', 1]])
  linhaCampos(p, [['Quem é (cargo, profissão, relação com a escola)', d.descricao ?? '', 1]])
  linhaCampos(p, [['CPF ou RG', '', 0.4], ['Telefone', '', 0.3], ['Data de nascimento', '', 0.3]])
  linhaCampos(p, [['Assunto da entrevista', d.titulo ?? '', 1]])

  secao(p, '2', 'O que autorizo (marque cada item)')
  texto(p, 'Tipo de conteúdo:', { fonte: p.negrito, tam: 9, depois: 3 })
  opcoes(p, ['Minha voz (áudio da entrevista)', 'Meu nome e minha função, como informados acima', 'Fotografia', 'Vídeo'])
  texto(p, 'Onde pode ser divulgado:', { fonte: p.negrito, tam: 9, depois: 3 })
  opcoes(p, ['Rádio interna da escola', 'Página do podcast no site oficial da escola', 'Jornal da escola JBInforma, no site oficial', 'Redes sociais oficiais da escola'])
  espaco(p, 20)
  caixa(p, MARGEM, p.y - 10)
  p.page.drawText('NÃO AUTORIZO a publicação da entrevista.', { x: MARGEM + 15, y: p.y - 9, size: 9, font: p.negrito, color: TEXTO })
  p.y -= 18

  secao(p, '3', 'Condições')
  marcadores(p, [
    `A entrevista foi feita por estudantes da equipe do ${NOME_PODCAST}, projeto pedagógico da ${ESCOLA}, sem cobrança e sem fins comerciais.`,
    'A gravação pode ser editada para caber no tempo do episódio, sem mudar o sentido do que eu disse.',
    'Meus documentos e telefone não são publicados.',
    'O site da escola é público. Quem acessa pode ouvir, baixar e repassar a entrevista por WhatsApp, redes sociais ou aplicativos de podcast, e a escola não controla esse repasse.',
    'Posso pedir a retirada da entrevista a qualquer momento, por escrito, na secretaria da escola. A escola tira do site e dos canais oficiais; cópias já repassadas por outras pessoas podem continuar circulando.',
  ])
  texto(p, BASE_LEGAL, { tam: 7.5, cor: CINZA, fonte: p.italico, depois: 6 })

  secao(p, '4', 'Assinaturas')
  localData(p)
  assinaturas(p, [{ rotulo: 'Quem deu a entrevista', nome: d.nome ?? '' }, { rotulo: 'Professor(a) monitor(a) do podcast' }])
  texto(p, 'Se quem deu a entrevista tiver menos de 18 anos, o responsável legal também preenche e assina:', { tam: 8.5, cor: CINZA, depois: 2 })
  linhaCampos(p, [['Nome do responsável legal', '', 0.6], ['CPF', '', 0.4]])
  assinaturas(p, [{ rotulo: 'Responsável legal (se menor de idade)' }])
  rodape(p)
  return p.doc.save()
}

export async function termoRevogacao(d: Partial<DadosResponsavel> = {}): Promise<Uint8Array> {
  const p = await iniciar(
    'Solicitação de revogação de autorização',
    `Cancelamento da autorização de uso de imagem, voz e nome no podcast ${NOME_PODCAST}`,
    'Revogação'
  )
  secao(p, '1', 'Identificação')
  linhaCampos(p, [['Nome completo do(a) estudante', d.alunoNome ?? '', 0.7], ['Turma', d.turma ?? '', 0.3]])
  linhaCampos(p, [['Nome completo do(a) responsável legal', d.responsavelNome ?? '', 0.65], ['CPF', d.responsavelCpf ? formatarCpf(d.responsavelCpf) : '', 0.35]])
  secao(p, '2', 'Pedido')
  texto(p, `Solicito o cancelamento da autorização de uso de imagem, voz e nome do(a) estudante acima no podcast ${NOME_PODCAST}. Peço que a escola:`)
  opcoes(p, [
    'Pare de usar a voz, a imagem e o nome do(a) estudante em novos conteúdos',
    'Tire do ar os episódios e matérias já publicados em que ele(a) aparece',
  ], 1)
  linhaCampos(p, [['Motivo (opcional)', '', 1]])
  texto(p, 'A revogação vale a partir da data em que este pedido for recebido pela escola.', { tam: 8.5, cor: CINZA })
  secao(p, '3', 'Assinaturas')
  localData(p)
  assinaturas(p, [{ rotulo: 'Responsável legal', nome: d.responsavelNome ?? '' }, { rotulo: 'Recebido por (escola) e data' }])
  rodape(p)
  return p.doc.save()
}
