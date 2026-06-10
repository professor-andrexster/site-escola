import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aprovado')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.aprovado || !['professor', 'monitor', 'direcao'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const { materia, quantidade } = await request.json()

  if (!materia || typeof materia !== 'string' || !materia.trim()) {
    return NextResponse.json({ error: 'Informe a matéria/tema.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Geração por IA não configurada (GEMINI_API_KEY ausente).' }, { status: 500 })
  }

  const qtd = Math.min(Math.max(Number(quantidade) || 10, 1), 20)

  const prompt = `Crie ${qtd} perguntas de múltipla escolha em português, em nível de ensino médio, sobre o tema "${materia.trim()}". ` +
    'Cada pergunta deve ter exatamente 4 alternativas curtas e claras (a, b, c, d), com apenas uma correta. ' +
    'Varie os assuntos dentro do tema e o nível de dificuldade.'

  let res: Response
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    )
  } catch {
    return NextResponse.json({ error: 'Falha ao conectar com o serviço de IA.' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: `Erro ao gerar perguntas (status ${res.status}).` }, { status: 502 })
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
