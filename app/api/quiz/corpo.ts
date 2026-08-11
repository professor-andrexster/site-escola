import type { CamposDePergunta, CamposDeQuiz } from '@/lib/db/quiz'

export function lerCorpoDeQuiz(body: unknown): { erro: string } | { dados: CamposDeQuiz } {
  const b = (body ?? {}) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  if (!titulo) return { erro: 'O título é obrigatório.' }

  const tempo = typeof b.tempo_por_pergunta === 'number' ? Math.round(b.tempo_por_pergunta) : 30
  if (tempo < 5 || tempo > 300) {
    return { erro: 'O tempo por pergunta deve ficar entre 5 e 300 segundos.' }
  }

  return {
    dados: {
      titulo,
      descricao: typeof b.descricao === 'string' && b.descricao.trim() ? b.descricao : null,
      tempo_por_pergunta: tempo,
      turma_alvo: typeof b.turma_alvo === 'string' && b.turma_alvo ? b.turma_alvo : 'Todos',
    },
  }
}

export function lerCorpoDePergunta(body: unknown): { erro: string } | { dados: CamposDePergunta } {
  const b = (body ?? {}) as Record<string, unknown>
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const enunciado = texto(b.enunciado)
  const alternativas = {
    alternativa_a: texto(b.alternativa_a),
    alternativa_b: texto(b.alternativa_b),
    alternativa_c: texto(b.alternativa_c),
    alternativa_d: texto(b.alternativa_d),
  }
  if (!enunciado) return { erro: 'O enunciado é obrigatório.' }
  if (Object.values(alternativas).some(a => !a)) {
    return { erro: 'As quatro alternativas são obrigatórias.' }
  }
  if (!['a', 'b', 'c', 'd'].includes(texto(b.resposta_correta))) {
    return { erro: 'Escolha qual alternativa é a correta.' }
  }

  const pontos = typeof b.pontos === 'number' ? Math.round(b.pontos) : 100
  if (pontos < 0 || pontos > 10000) return { erro: 'Pontuação fora do intervalo.' }

  return {
    dados: { enunciado, ...alternativas, resposta_correta: texto(b.resposta_correta), pontos },
  }
}
