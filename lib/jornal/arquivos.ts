import { randomBytes } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

/**
 * Foto da materia. Vai para a mesma pasta publica das imagens de noticia, mas
 * sempre regravada: sem EXIF (foto de celular leva a localizacao), girada do
 * jeito certo e com no maximo 1600 px. O arquivo original nunca toca o disco.
 */

const RAIZ = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), 'data', 'uploads')
const PASTA = 'noticias'
const LIMITE = 8 * 1024 * 1024

export async function gravarFoto(arquivo: File): Promise<{ erro: string } | { url: string }> {
  if (arquivo.size === 0) return { erro: 'A imagem está vazia.' }
  if (arquivo.size > LIMITE) return { erro: 'A imagem passa de 8 MB. Tire a foto com qualidade menor.' }
  let limpa: Buffer
  try {
    limpa = await sharp(Buffer.from(await arquivo.arrayBuffer())).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer()
  } catch {
    return { erro: 'Não consegui ler essa imagem. Envie uma foto JPG, PNG ou WEBP.' }
  }
  const nome = `jornal-${Date.now().toString(36)}-${randomBytes(8).toString('hex')}.jpg`
  await mkdir(path.join(RAIZ, PASTA), { recursive: true })
  await writeFile(path.join(RAIZ, PASTA, nome), limpa)
  return { url: `/arquivos/${PASTA}/${nome}` }
}

/** Apaga so foto que esta funcao gravou (prefixo jornal-). Imagem antiga de noticia fica onde esta. */
export async function apagarFoto(url: string | null) {
  const m = url?.match(/^\/arquivos\/noticias\/(jornal-[a-z0-9-]+\.jpg)$/)
  if (!m) return
  await unlink(path.join(RAIZ, PASTA, m[1])).catch(() => {})
}

/** Caminho no disco de uma imagem publica de noticia, para o PDF da edicao. */
export function caminhoDaImagem(url: string | null): string | null {
  const m = url?.match(/^\/arquivos\/(noticias\/[A-Za-z0-9._-]+)$/)
  return m ? path.join(RAIZ, m[1]) : null
}
