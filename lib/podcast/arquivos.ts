import { randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { PREFIXO_PUBLICO } from '@/lib/storage/arquivos'

/**
 * Arquivos do podcast.
 *
 * Dois destinos, e a diferenca importa:
 *
 * - AUDIO vai para a pasta publica (UPLOAD_ROOT/podcast-audios), servida pelo
 *   nginx em /arquivos: e o episodio que a escola inteira ouve.
 * - AUTORIZACAO dos pais e TERMO do entrevistado vao para a pasta PRIVADA
 *   (fora de UPLOAD_ROOT). Tem nome, CPF e assinatura de responsavel; o nginx
 *   nao serve essa pasta, so a rota /api/podcast/arquivo, que confere quem pede.
 */

const RAIZ_PUBLICA = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), 'data', 'uploads')
export const RAIZ_PRIVADA =
  process.env.PRIVATE_UPLOAD_ROOT ?? path.join(path.dirname(path.resolve(RAIZ_PUBLICA)), 'privado')

const MB = 1024 * 1024
export const LIMITE_AUDIO = 25 * MB // nginx do site aceita 30M por requisicao
export const LIMITE_DOCUMENTO = 15 * MB

function casa(bytes: Uint8Array, assinatura: number[], deslocamento = 0) {
  return assinatura.every((b, i) => bytes[deslocamento + i] === b)
}

/** Tipo de audio pelos bytes. O navegador grava webm (Chrome/Android) ou mp4 (iPhone). */
export function tipoDeAudio(bytes: Uint8Array): { ext: string; mime: string } | null {
  if (casa(bytes, [0x49, 0x44, 0x33])) return { ext: 'mp3', mime: 'audio/mpeg' } // ID3
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return { ext: 'mp3', mime: 'audio/mpeg' } // frame MPEG
  if (casa(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return { ext: 'm4a', mime: 'audio/mp4' } // ....ftyp
  if (casa(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return { ext: 'webm', mime: 'audio/webm' } // EBML
  if (casa(bytes, [0x4f, 0x67, 0x67, 0x53])) return { ext: 'ogg', mime: 'audio/ogg' } // OggS
  if (casa(bytes, [0x52, 0x49, 0x46, 0x46]) && casa(bytes, [0x57, 0x41, 0x56, 0x45], 8)) return { ext: 'wav', mime: 'audio/wav' }
  return null
}

/** Documento assinado: PDF ou foto do papel. */
export function tipoDeDocumento(bytes: Uint8Array): { ext: string; mime: string } | null {
  if (casa(bytes, [0x25, 0x50, 0x44, 0x46])) return { ext: 'pdf', mime: 'application/pdf' }
  if (casa(bytes, [0xff, 0xd8, 0xff])) return { ext: 'jpg', mime: 'image/jpeg' }
  if (casa(bytes, [0x89, 0x50, 0x4e, 0x47])) return { ext: 'png', mime: 'image/png' }
  if (casa(bytes, [0x52, 0x49, 0x46, 0x46]) && casa(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return { ext: 'webp', mime: 'image/webp' }
  return null
}

const nomeAleatorio = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}-${randomBytes(8).toString('hex')}`

export async function gravarAudio(arquivo: File): Promise<{ erro: string } | { url: string; bytes: number }> {
  if (arquivo.size === 0) return { erro: 'O áudio está vazio.' }
  if (arquivo.size > LIMITE_AUDIO) return { erro: 'O áudio passa de 25 MB. Corte um pedaço ou exporte em MP3.' }
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const tipo = tipoDeAudio(bytes)
  if (!tipo) return { erro: 'Não reconheci esse arquivo como áudio. Use MP3, M4A, WEBM, OGG ou WAV.' }
  const nome = `${nomeAleatorio('ep')}.${tipo.ext}`
  await mkdir(path.join(RAIZ_PUBLICA, 'podcast-audios'), { recursive: true })
  await writeFile(path.join(RAIZ_PUBLICA, 'podcast-audios', nome), bytes)
  return { url: `${PREFIXO_PUBLICO}/podcast-audios/${nome}`, bytes: arquivo.size }
}

export type PastaPrivada = 'podcast-autorizacoes' | 'podcast-termos'

export async function gravarDocumento(
  arquivo: File,
  pasta: PastaPrivada
): Promise<{ erro: string } | { caminho: string }> {
  if (arquivo.size === 0) return { erro: 'O arquivo está vazio.' }
  if (arquivo.size > LIMITE_DOCUMENTO) return { erro: 'O arquivo passa de 15 MB. Tire a foto com qualidade menor.' }
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const tipo = tipoDeDocumento(bytes)
  if (!tipo) return { erro: 'Envie o termo em PDF ou uma foto (JPG, PNG).' }
  const nome = `${nomeAleatorio('termo')}.${tipo.ext}`
  await mkdir(path.join(RAIZ_PRIVADA, pasta), { recursive: true })
  await writeFile(path.join(RAIZ_PRIVADA, pasta, nome), bytes)
  return { caminho: `${pasta}/${nome}` }
}

/** Caminho absoluto de um arquivo privado, ou null se escapar da pasta. */
export function caminhoPrivado(relativo: string): string | null {
  const raiz = path.resolve(RAIZ_PRIVADA) + path.sep
  const alvo = path.resolve(RAIZ_PRIVADA, relativo)
  return alvo.startsWith(raiz) ? alvo : null
}

export function mimeDoDocumento(relativo: string): string {
  const ext = path.extname(relativo).slice(1).toLowerCase()
  return ({ pdf: 'application/pdf', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as Record<string, string>)[ext] ?? 'application/octet-stream'
}
