import { NextResponse } from 'next/server'
import { exigirProfessorOuGestao } from '@/lib/apiGestao'
import { criarDesafio } from '@/lib/db/desafios'

/**
 * Cria o desafio com fases e papeis. Eram tres inserts soltos do navegador:
 * se o segundo falhasse, ficava um desafio sem fase nenhuma — a propria tela
 * dizia "desafio criado, mas houve erro nas fases".
 *
 * `professor_id` sai da sessao; a tela mandava o id no corpo.
 */
export async function POST(request: Request) {
  const auth = await exigirProfessorOuGestao()
  if (!auth.ok) return auth.res

  const b = (await request.json()) as Record<string, unknown>
  const titulo = typeof b.titulo === 'string' ? b.titulo.trim() : ''
  if (!titulo) return NextResponse.json({ error: 'Dê um título ao desafio.' }, { status: 400 })

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const fasesBrutas = Array.isArray(b.fases) ? b.fases : []
  const fases = fasesBrutas.map((f: Record<string, unknown>, i: number) => ({
    titulo: typeof f.titulo === 'string' ? f.titulo.trim() : '',
    descricao: texto(f.descricao),
    entregavel_instrucoes: texto(f.entregavel_instrucoes),
    pontos_max: Number.isFinite(Number(f.pontos_max)) ? Math.round(Number(f.pontos_max)) : 0,
    semana_sugerida: Number.isFinite(Number(f.semana_sugerida)) ? Math.round(Number(f.semana_sugerida)) : null,
    _i: i,
  }))
  if (fases.some(f => !f.titulo)) {
    return NextResponse.json({ error: 'Toda fase precisa de um título.' }, { status: 400 })
  }

  const papeisBrutos = Array.isArray(b.papeis) ? b.papeis : []
  const papeis = papeisBrutos
    .map((p: Record<string, unknown>) => ({
      nome: typeof p.nome === 'string' ? p.nome.trim() : '',
      descricao: texto(p.descricao),
    }))
    .filter(p => p.nome)

  try {
    const desafio = await criarDesafio({
      professorId: auth.userId,
      titulo,
      subtitulo: texto(b.subtitulo),
      briefing: texto(b.briefing),
      turmaAlvo: texto(b.turma_alvo),
      anoLetivo: typeof b.ano_letivo === 'string' && b.ano_letivo ? b.ano_letivo : '2026',
      pontosTotal: Number.isFinite(Number(b.pontos_total)) ? Math.round(Number(b.pontos_total)) : 100,
      publicado: b.publicado === true,
      fases: fases.map(({ _i, ...f }) => f),
      papeis,
    })
    return NextResponse.json({ id: desafio.id })
  } catch (erro) {
    console.error('[desafios] falha ao criar', erro)
    return NextResponse.json({ error: 'Erro ao criar o desafio.' }, { status: 400 })
  }
}
