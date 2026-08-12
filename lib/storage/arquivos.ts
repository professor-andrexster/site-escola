import { createHash, randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

/**
 * Arquivos enviados pelo site, em disco.
 *
 * Substitui o Supabase Storage. O que muda de fundo: antes o navegador
 * escolhia o caminho e o nome do arquivo e escrevia direto no bucket. Aqui ele
 * escolhe só a FINALIDADE — uma de seis, fechada — e o servidor decide onde o
 * arquivo cai e como se chama.
 *
 * Isso fecha três coisas de uma vez: caminho com `../`, extensão mentindo
 * sobre o conteúdo, e envio para a pasta de outra pessoa.
 */

const RAIZ = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), 'data', 'uploads')

/** Prefixo público dos arquivos. O nginx assume este caminho na virada. */
export const PREFIXO_PUBLICO = '/arquivos'

const MB = 1024 * 1024

export type Finalidade = 'avatar' | 'noticia' | 'curso' | 'projeto' | 'desafio' | 'obra'

type Regra = { pasta: string; limite: number; tipos: string[] | 'qualquer' }

const IMAGENS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const REGRAS: Record<Finalidade, Regra> = {
  avatar: { pasta: 'avatares', limite: 5 * MB, tipos: IMAGENS },
  noticia: { pasta: 'noticias', limite: 8 * MB, tipos: IMAGENS },
  curso: { pasta: 'cursos', limite: 8 * MB, tipos: IMAGENS },
  projeto: { pasta: 'projetos', limite: 8 * MB, tipos: IMAGENS },
  obra: { pasta: 'biblioteca', limite: 5 * MB, tipos: IMAGENS },
  // A entrega de uma fase de desafio pode ser qualquer coisa: planilha,
  // apresentação, protótipo zipado. É o único envio sem lista de tipos, e por
  // isso o único servido com Content-Disposition: attachment.
  desafio: { pasta: 'desafios', limite: 25 * MB, tipos: 'qualquer' },
}

export function finalidadeValida(v: unknown): v is Finalidade {
  return typeof v === 'string' && v in REGRAS
}

/**
 * Tipo real do arquivo, pelos bytes iniciais.
 *
 * O `Content-Type` do multipart e a extensão do nome vêm do navegador: os dois
 * mentem. Um .php renomeado para .jpg passaria pelos dois e cairia numa pasta
 * servida publicamente.
 */
function tipoPelosBytes(bytes: Uint8Array): string | null {
  const casa = (assinatura: number[], deslocamento = 0) =>
    assinatura.every((b, i) => bytes[deslocamento + i] === b)

  if (casa([0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (casa([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (casa([0x47, 0x49, 0x46, 0x38])) return 'image/gif'
  // WEBP é RIFF....WEBP
  if (casa([0x52, 0x49, 0x46, 0x46]) && casa([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
  if (casa([0x25, 0x50, 0x44, 0x46])) return 'application/pdf'
  return null
}

const EXTENSAO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

/** Sobra do nome original só o que é seguro, para o arquivo continuar reconhecível. */
function apelido(nome: string): string {
  const base = path.basename(nome, path.extname(nome))
  const limpo = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40)
  return limpo || 'arquivo'
}

export type ArquivoGravado = { url: string; caminho: string; tamanho: number }

/**
 * Grava o arquivo e devolve a URL pública.
 *
 * `dono` entra no nome só para o arquivo ser rastreável até quem o enviou — o
 * nome tem componente aleatório, então não dá para adivinhar o arquivo de
 * ninguém a partir dele.
 */
export async function gravar(
  finalidade: Finalidade,
  arquivo: File,
  dono: string
): Promise<{ erro: string } | ArquivoGravado> {
  const regra = REGRAS[finalidade]

  if (arquivo.size === 0) return { erro: 'O arquivo está vazio.' }
  if (arquivo.size > regra.limite) {
    return { erro: `O arquivo passa do limite de ${Math.round(regra.limite / MB)} MB.` }
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const tipo = tipoPelosBytes(bytes)

  let extensao: string
  if (regra.tipos === 'qualquer') {
    // Sem lista de tipos, a extensão vem do nome — mas sanitizada, e o arquivo
    // é servido como anexo, nunca interpretado.
    const bruta = path.extname(arquivo.name).slice(1).toLowerCase()
    extensao = /^[a-z0-9]{1,8}$/.test(bruta) ? bruta : 'bin'
  } else {
    if (!tipo || !regra.tipos.includes(tipo)) {
      return { erro: 'Envie uma imagem JPG, PNG, WEBP ou GIF.' }
    }
    extensao = EXTENSAO[tipo]
  }

  const nome = [
    apelido(arquivo.name),
    createHash('sha256').update(dono).digest('hex').slice(0, 8),
    randomBytes(6).toString('hex'),
  ].join('-')

  const relativo = path.posix.join(regra.pasta, `${nome}.${extensao}`)
  const absoluto = path.join(RAIZ, regra.pasta, `${nome}.${extensao}`)

  await mkdir(path.dirname(absoluto), { recursive: true })
  await writeFile(absoluto, bytes)

  return {
    url: `${PREFIXO_PUBLICO}/${relativo}`,
    caminho: relativo,
    tamanho: arquivo.size,
  }
}

/**
 * Caminho absoluto de um arquivo pedido pela URL, ou null se escapar da raiz.
 *
 * A checagem final compara o caminho já resolvido com a raiz: é o que barra
 * `../`, link simbólico e nome com barra codificada de uma vez só.
 */
export function caminhoNoDisco(partes: string[]): string | null {
  const raizResolvida = path.resolve(RAIZ) + path.sep
  const alvo = path.resolve(RAIZ, ...partes)
  return alvo.startsWith(raizResolvida) ? alvo : null
}

/**
 * Arquivo que deve baixar em vez de abrir no navegador.
 *
 * Vale para a pasta de desafios (envio livre) e para TUDO que veio do Supabase
 * — os buckets antigos nunca validaram tipo nenhum, entao nao da para supor
 * que o que esta la e imagem de verdade.
 */
export function ehAnexo(caminho: string): boolean {
  return caminho.startsWith(`${REGRAS.desafio.pasta}/`) || caminho.startsWith(`${PASTA_LEGADO}/`)
}

/**
 * Onde os arquivos vindos do Supabase Storage caem, com a estrutura original
 * de bucket preservada: `legado/<bucket>/<caminho>`.
 *
 * Manter o caminho antigo faz a reescrita das URLs no banco ser uma troca de
 * prefixo, sem casar arquivo por arquivo — e nao arrisca colidir com nome de
 * arquivo novo, que segue outro esquema.
 */
export const PASTA_LEGADO = 'legado'

export function tipoDeConteudo(caminho: string): string {
  const ext = path.extname(caminho).slice(1).toLowerCase()
  const mapa: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
  }
  return mapa[ext] ?? 'application/octet-stream'
}
