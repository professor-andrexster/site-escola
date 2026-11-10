import { readFile, stat } from 'fs/promises'
import { caminhoPrivado, mimeDoAudio } from '@/lib/podcast/arquivos'
import { caminhoDoAudio, marcarTranscricao } from '@/lib/podcast/dados'

/**
 * Transcricao automatica do audio pelo Gemini (mesma chave do gerador de
 * perguntas do quiz).
 *
 * So roda em episodio PUBLICADO, a pedido do monitor: o audio ja e publico no
 * site, e nada que ainda nao foi aprovado sai do servidor. O texto fica
 * escondido ate o monitor revisar e ligar "mostrar no site".
 *
 * Roda em segundo plano (a rota responde na hora): um audio de 10 minutos
 * leva mais que os 60 s que o nginx espera.
 */

const MODELOS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash']
/** O pedido inteiro (base64) tem teto de 20 MB na API: ~14 MB de audio. */
export const LIMITE_TRANSCRICAO = 14 * 1024 * 1024

const PROMPT =
  'Transcreva este áudio em português do Brasil. É um episódio de podcast escolar feito por estudantes. ' +
  'Regras: escreva só o que foi dito, sem resumir e sem inventar; tire vícios de fala repetidos (né, tipo, hã) quando não mudam o sentido; ' +
  'separe em parágrafos curtos, com uma linha em branco entre eles; quando der para perceber a troca de quem fala, comece o parágrafo com ' +
  '"Entrevistador:" ou "Entrevistado:" (ou "Voz 1:", "Voz 2:" se não der para saber); trecho que não der para entender vira [inaudível]. ' +
  'Responda só com a transcrição, sem título e sem comentários.'

export function transcricaoConfigurada() {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function transcreverEmSegundoPlano(episodioId: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Falha('A chave de IA não está configurada neste servidor.')
    const relativo = await caminhoDoAudio(episodioId)
    const abs = relativo ? caminhoPrivado(relativo) : null
    if (!relativo || !abs) throw new Falha('O episódio não tem áudio.')
    if ((await stat(abs)).size > LIMITE_TRANSCRICAO) throw new Falha('O áudio passa de 14 MB, que é o limite da transcrição automática. Escreva a transcrição à mão ou suba um áudio menor.')

    const bytes = await readFile(abs)
    const corpo = JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeDoAudio(relativo), data: bytes.toString('base64') } }] }],
      generationConfig: { temperature: 0.1 },
    })

    let ultimo = 0
    for (const modelo of MODELOS) {
      let res: Response
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: corpo, signal: AbortSignal.timeout(150_000),
        })
      } catch {
        ultimo = 503
        continue
      }
      if (!res.ok) {
        ultimo = res.status
        if (res.status === 503 || res.status === 429) continue
        break
      }
      const dados = (await res.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null
      const texto = dados?.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim()
      if (texto && texto.length > 20) {
        await marcarTranscricao(episodioId, { status: 'pronta', texto: texto.slice(0, 200_000) })
        return
      }
      ultimo = 422
      break
    }
    throw new Falha(
      ultimo === 503 || ultimo === 429
        ? 'O serviço de IA está congestionado agora. Tente de novo em alguns minutos.'
        : ultimo === 422
          ? 'A IA não conseguiu entender esse áudio. Tente de novo ou escreva a transcrição à mão.'
          : 'A IA recusou o pedido (formato do áudio ou chave). Escreva a transcrição à mão.'
    )
  } catch (e) {
    const msg = e instanceof Falha ? e.message : 'A transcrição falhou por um erro inesperado. Tente de novo.'
    if (!(e instanceof Falha)) console.error('[podcast/transcrever]', e)
    await marcarTranscricao(episodioId, { status: 'erro', erro: msg }).catch(() => {})
  }
}

class Falha extends Error {}
