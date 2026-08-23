import { NextResponse } from 'next/server'
import { listarTrilhas, registrarTesteVocacional } from '@/lib/db/comunidade'
import { PERGUNTAS, apurar } from '@/lib/vocacional/perguntas'

/**
 * Apura o teste vocacional e grava o perfil.
 *
 * A pontuacao e recalculada aqui a partir dos pesos: a tela mandava o numero
 * pronto para perfis_vocacionais, e esse perfil e o que a coordenacao usa para
 * orientar a escolha de trilha do aluno.
 */
export async function POST(request: Request) {
  const { alunoId, respostas } = (await request.json()) as {
    alunoId?: string
    respostas?: Array<{ pergunta_id?: number; resposta?: number }>
  }
  if (!alunoId) return NextResponse.json({ error: 'Aluno não informado.' }, { status: 400 })
  if (!Array.isArray(respostas) || respostas.length !== PERGUNTAS.length) {
    return NextResponse.json({ error: 'Responda todas as perguntas.' }, { status: 400 })
  }

  const limpas = respostas.map(r => ({
    pergunta_id: Number(r.pergunta_id),
    resposta: Math.min(1, Math.max(0, Number(r.resposta))),
  }))
  if (limpas.some(r => !Number.isFinite(r.pergunta_id) || !Number.isFinite(r.resposta))) {
    return NextResponse.json({ error: 'Respostas inválidas.' }, { status: 400 })
  }

  const pontuacaoDe = apurar(limpas)
  const trilhas = await listarTrilhas()
  const resultado = trilhas
    .map(t => ({
      trilhaId: t.id,
      nome: t.nome,
      cor: t.cor_tailwind,
      pontuacao: pontuacaoDe(t.nome),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao)

  try {
    await registrarTesteVocacional(
      alunoId,
      limpas,
      resultado.map(r => ({ trilhaId: r.trilhaId, pontuacao: r.pontuacao }))
    )
    return NextResponse.json({ resultado })
  } catch (erro) {
    console.error('[vocacional] falha ao gravar', erro)
    return NextResponse.json({ error: 'Erro ao salvar o resultado.' }, { status: 400 })
  }
}
