import { NextResponse } from 'next/server'
import { exigirQuizStaff } from '@/lib/apiGestao'
import { GESTAO_ROLES } from '@/lib/roles'

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    perguntas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          enunciado: { type: 'string' },
          alternativa_a: { type: 'string' },
          alternativa_b: { type: 'string' },
          alternativa_c: { type: 'string' },
          alternativa_d: { type: 'string' },
          resposta_correta: { type: 'string', enum: ['a', 'b', 'c', 'd'] },
        },
        required: ['enunciado', 'alternativa_a', 'alternativa_b', 'alternativa_c', 'alternativa_d', 'resposta_correta'],
      },
    },
  },
  required: ['perguntas'],
}

export async function POST(request: Request) {
  // Mesma guarda das rotas de quiz: professor, monitor ou gestao.
  const auth = await exigirQuizStaff()
  if (!auth.ok) return auth.res

  const { materia, quantidade } = await request.json()

  if (!materia || typeof materia !== 'string' || !materia.trim()) {
    return NextResponse.json({ error: 'Informe a matéria/tema.' }, { status: 400 })
  }

  // A chave vivia nas variáveis da Vercel e não veio na migração para este
  // servidor. A mensagem fala com quem está na tela — um professor —, e não
  // com quem mantém o sistema: nome de variável não diz nada para ele, e o
  // caminho manual continua aberto enquanto a chave não é configurada.
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'A geração automática de perguntas ainda não está configurada neste servidor. ' +
          'Peça à direção para cadastrar a chave de IA. Enquanto isso, você pode adicionar ' +
          'as perguntas manualmente logo abaixo.',
      },
      // 503: o serviço existe e está indisponível por configuração. 500 sugere
      // defeito, e faz procurar bug onde falta ajuste.
      { status: 503 }
    )
  }

  const qtd = Math.min(Math.max(Number(quantidade) || 10, 1), 20)

  const prompt = `Crie ${qtd} perguntas de múltipla escolha em português, em nível de ensino médio, sobre o tema "${materia.trim()}". ` +
    'Cada pergunta deve ter exatamente 4 alternativas curtas e claras (a, b, c, d), com apenas uma correta. ' +
    'Varie os assuntos dentro do tema e o nível de dificuldade.'

  /**
   * Modelos em ordem de preferência.
   *
   * `gemini-flash-latest` resolve hoje para o 3.7, que vive sobrecarregado:
   * devolvia 503 "high demand" depois de 20 a 50 segundos, de forma
   * consistente, enquanto os flash-lite respondiam em 2 a 4 segundos com a
   * mesma qualidade para pergunta de múltipla escolha de ensino médio.
   *
   * A lista é reserva, não capricho: 503 é sobrecarga temporária do lado do
   * Google, e um modelo só significa que a geração cai junto com ele. Os
   * apelidos com `-latest` evitam ficar preso a uma versão que sai do ar.
   */
  const MODELOS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash']

  const corpo = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  })

  let res: Response | null = null
  let ultimoStatus = 0

  for (const modelo of MODELOS) {
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo }
      )
    } catch {
      ultimoStatus = 0
      continue
    }
    if (res.ok) break

    ultimoStatus = res.status
    // 503 e 429 são "tente de novo": vale passar para o próximo modelo. Erro
    // 4xx de outra natureza é problema do pedido ou da chave, e repetir em
    // outro modelo só gastaria o tempo de quem está esperando.
    if (res.status !== 503 && res.status !== 429) break
    res = null
  }

  if (!res || !res.ok) {
    console.error('[gerar-perguntas] nenhum modelo respondeu', { ultimoStatus })
    return NextResponse.json(
      {
        error:
          ultimoStatus === 503 || ultimoStatus === 429
            ? 'O serviço de IA está congestionado neste momento. Tente de novo em alguns minutos, ou escreva as perguntas manualmente abaixo.'
            : 'Não foi possível gerar as perguntas agora. Tente de novo ou escreva manualmente abaixo.',
      },
      { status: 502 }
    )
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    return NextResponse.json({ error: 'A IA não retornou nenhuma pergunta.' }, { status: 502 })
  }

  let parsed: { perguntas?: unknown[] }
  try {
    parsed = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Erro ao interpretar a resposta da IA.' }, { status: 502 })
  }

  if (!Array.isArray(parsed.perguntas) || parsed.perguntas.length === 0) {
    return NextResponse.json({ error: 'A IA não retornou nenhuma pergunta.' }, { status: 502 })
  }

  return NextResponse.json({ perguntas: parsed.perguntas })
}
