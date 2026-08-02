import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registrarAtividade, ipDoRequest } from '@/lib/log'

const NOTA_MINIMA = 70

// Alfabeto sem 0/O, 1/I/L: o código vai impresso no certificado e alguém
// vai digitá-lo à mão para validar.
const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function gerarCodigo(): string {
  const bytes = randomBytes(8)
  let saida = ''
  for (let i = 0; i < bytes.length; i++) saida += ALFABETO_CODIGO[bytes[i] % ALFABETO_CODIGO.length]
  return `JB-${saida}`
}

async function usuarioLogado() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Entrega as perguntas da prova SEM a resposta correta. A tabela nega
// leitura direta do client de propósito: esta rota é o único caminho.
export async function GET(request: Request) {
  const user = await usuarioLogado()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const cursoId = new URL(request.url).searchParams.get('cursoId')
  if (!cursoId) return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: perguntas, error } = await admin
    .from('curso_prova_perguntas')
    .select('id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, ordem')
    .eq('curso_id', cursoId)
    .order('ordem')

  if (error) return NextResponse.json({ error: 'Erro ao carregar a prova.' }, { status: 400 })
  return NextResponse.json({ perguntas: perguntas ?? [] })
}

// Corrige a prova no servidor e, com nota suficiente, emite o certificado.
export async function POST(request: Request) {
  const user = await usuarioLogado()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const { cursoId, respostas } = (await request.json()) as {
    cursoId?: string
    respostas?: Record<string, string>
  }
  if (!cursoId || !respostas) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const ip = ipDoRequest(request)

  const [{ data: curso }, { data: aulas }, { data: perguntas }, { data: jaEmitido }] = await Promise.all([
    admin.from('cursos').select('id, titulo, autor_nome, carga_horaria, publicado').eq('id', cursoId).maybeSingle(),
    admin.from('aulas').select('id, duracao_estimada_min').eq('curso_id', cursoId).eq('publicado', true),
    admin.from('curso_prova_perguntas').select('id, resposta_correta').eq('curso_id', cursoId),
    admin.from('certificados').select('codigo').eq('curso_id', cursoId).eq('user_id', user.id).maybeSingle(),
  ])

  if (!curso?.publicado) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })
  if (jaEmitido) return NextResponse.json({ aprovado: true, codigo: jaEmitido.codigo, jaTinha: true })
  if (!perguntas || perguntas.length === 0) {
    return NextResponse.json({ error: 'Este curso ainda não tem prova final.' }, { status: 400 })
  }

  // A prova só libera com o curso inteiro concluído; conferido aqui de novo
  // porque esconder o botão na tela não é regra de negócio.
  const aulaIds = (aulas ?? []).map(a => a.id)
  const { data: progresso } = aulaIds.length > 0
    ? await admin.from('progresso_aulas').select('aula_id').eq('user_id', user.id).eq('concluida', true).in('aula_id', aulaIds)
    : { data: [] }
  const concluidas = new Set((progresso ?? []).map(p => p.aula_id))
  if (aulaIds.length === 0 || aulaIds.some(id => !concluidas.has(id))) {
    return NextResponse.json({ error: 'Conclua todas as aulas antes de fazer a prova.' }, { status: 403 })
  }

  const acertos = perguntas.filter(p => respostas[p.id] === p.resposta_correta).length
  const nota = Math.round((acertos / perguntas.length) * 100)

  if (nota < NOTA_MINIMA) {
    await registrarAtividade(admin, {
      acao: 'prova_final_reprovada',
      userId: user.id,
      detalhes: { curso: curso.titulo, nota, acertos, total: perguntas.length },
      ip,
    })
    return NextResponse.json({ aprovado: false, nota, acertos, total: perguntas.length, notaMinima: NOTA_MINIMA })
  }

  const { data: perfil } = await admin.from('profiles').select('nome_completo').eq('id', user.id).maybeSingle()

  // Carga horária: valor oficial do curso, senão a soma das aulas, senão
  // uma hora por aula como piso.
  const minutos = (aulas ?? []).reduce((soma, a) => soma + (a.duracao_estimada_min ?? 0), 0)
  const cargaHoraria = curso.carga_horaria
    ?? (minutos > 0 ? Math.max(1, Math.ceil(minutos / 60)) : aulaIds.length)

  // O UNIQUE (user_id, curso_id) decide corridas de dois envios simultâneos;
  // colisão de código (raríssima) também cai aqui e ganha nova tentativa.
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const codigo = gerarCodigo()
    const { error } = await admin.from('certificados').insert({
      codigo,
      user_id: user.id,
      curso_id: cursoId,
      aluno_nome: perfil?.nome_completo ?? 'Aluno',
      curso_titulo: curso.titulo,
      autor_nome: curso.autor_nome ?? null,
      carga_horaria: cargaHoraria,
      nota,
    })
    if (!error) {
      await registrarAtividade(admin, {
        acao: 'certificado_emitido',
        userId: user.id,
        detalhes: { curso: curso.titulo, nota, codigo, carga_horaria: cargaHoraria },
        ip,
      })
      return NextResponse.json({ aprovado: true, nota, acertos, total: perguntas.length, codigo })
    }
    if (error.code === '23505' && error.message.includes('user_id')) {
      const { data: existente } = await admin.from('certificados').select('codigo').eq('curso_id', cursoId).eq('user_id', user.id).maybeSingle()
      if (existente) return NextResponse.json({ aprovado: true, nota, codigo: existente.codigo, jaTinha: true })
    }
  }

  return NextResponse.json({ error: 'Erro ao emitir o certificado. Tente novamente.' }, { status: 500 })
}
