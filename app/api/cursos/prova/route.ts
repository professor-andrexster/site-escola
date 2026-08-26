import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { usuarioAtual } from '@/lib/auth/sessao'
import { dadosDaProva, perguntasDaProvaParaAluno, emitirCertificado, concluidasEntre } from '@/lib/db/cursos'
import { buscarPorId as buscarPerfil } from '@/lib/db/perfis'
import { ipDoRequest } from '@/lib/log'
import { registrar } from '@/lib/db/log'

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



// Entrega as perguntas da prova SEM a resposta correta. A tabela nega
// leitura direta do client de propósito: esta rota é o único caminho.
export async function GET(request: Request) {
  const user = await usuarioAtual()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const cursoId = new URL(request.url).searchParams.get('cursoId')
  if (!cursoId) return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })

  try {
    return NextResponse.json({ perguntas: await perguntasDaProvaParaAluno(cursoId) })
  } catch (erro) {
    console.error('[cursos/prova] falha ao carregar', erro)
    return NextResponse.json({ error: 'Erro ao carregar a prova.' }, { status: 400 })
  }
}

// Corrige a prova no servidor e, com nota suficiente, emite o certificado.
export async function POST(request: Request) {
  const user = await usuarioAtual()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const { cursoId, respostas } = (await request.json()) as {
    cursoId?: string
    respostas?: Record<string, string>
  }
  if (!cursoId || !respostas) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const ip = ipDoRequest(request)
  const { curso, aulas, perguntas, certificado } = await dadosDaProva(cursoId, user.id)

  if (!curso?.publicado) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })
  if (certificado) {
    return NextResponse.json({ aprovado: true, codigo: certificado.codigo, jaTinha: true })
  }
  if (!perguntas || perguntas.length === 0) {
    return NextResponse.json({ error: 'Este curso ainda não tem prova final.' }, { status: 400 })
  }

  // A prova só libera com o curso inteiro concluído; conferido aqui de novo
  // porque esconder o botão na tela não é regra de negócio.
  const aulaIds = aulas.map(a => a.id)
  const concluidas = new Set(await concluidasEntre(user.id, aulaIds))
  if (aulaIds.length === 0 || aulaIds.some(id => !concluidas.has(id))) {
    return NextResponse.json({ error: 'Conclua todas as aulas antes de fazer a prova.' }, { status: 403 })
  }

  const acertos = perguntas.filter(p => respostas[p.id] === p.resposta_correta).length
  const nota = Math.round((acertos / perguntas.length) * 100)

  if (nota < NOTA_MINIMA) {
    await registrar({
      acao: 'prova_final_reprovada',
      userId: user.id,
      detalhes: { curso: curso.titulo, nota, acertos, total: perguntas.length },
      ip,
    })
    return NextResponse.json({ aprovado: false, nota, acertos, total: perguntas.length, notaMinima: NOTA_MINIMA })
  }

  const perfil = await buscarPerfil(user.id)

  // Carga horária: valor oficial do curso, senão a soma das aulas, senão
  // uma hora por aula como piso.
  const minutos = aulas.reduce((soma, a) => soma + (a.duracao_estimada_min ?? 0), 0)
  const cargaHoraria = curso.carga_horaria
    ?? (minutos > 0 ? Math.max(1, Math.ceil(minutos / 60)) : aulaIds.length)

  // Em minutos: e o que o documento imprime. `cargaHoraria` arredonda para
  // cima, e um curso de 50 minutos sairia como "1 hora".
  const cargaMin = curso.carga_min ?? (minutos > 0 ? minutos : null)

  // O UNIQUE (user_id, curso_id) decide corridas de dois envios simultâneos;
  // colisão de código (raríssima) também cai aqui e ganha nova tentativa.
  // Tres tentativas: a unique (usuario, curso) resolve corrida de dois envios
  // simultaneos, e colisao de codigo — rarissima — ganha um codigo novo.
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const { codigo, jaTinha } = await emitirCertificado({
        codigo: gerarCodigo(),
        userId: user.id,
        cursoId,
        alunoNome: perfil?.nome_completo ?? 'Aluno',
        cursoTitulo: curso.titulo,
        autorNome: curso.autor_nome ?? null,
        cargaHoraria,
        cargaMin,
        nota,
      })
      if (jaTinha) {
        return NextResponse.json({ aprovado: true, nota, codigo, jaTinha: true })
      }
      await registrar({
        acao: 'certificado_emitido',
        userId: user.id,
        detalhes: { curso: curso.titulo, nota, codigo, carga_horaria: cargaHoraria },
        ip,
      })
      return NextResponse.json({ aprovado: true, nota, acertos, total: perguntas.length, codigo })
    } catch (erro) {
      console.error('[cursos/prova] tentativa de emissao falhou', erro)
    }
  }

  return NextResponse.json({ error: 'Erro ao emitir o certificado. Tente novamente.' }, { status: 500 })
}
