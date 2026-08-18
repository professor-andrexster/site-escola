import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { avaliarEnvio, envioComCurso, podeAvaliarCurso } from '@/lib/db/desafio-curso'
import { buscarPorId as buscarCurso, duracaoTotal, emitirCertificado } from '@/lib/db/cursos'
import { emitirCertificadoDeModulo, moduloPorId, podeAvaliarModulo } from '@/lib/db/modulos'
import { buscarPorId as buscarPerfil } from '@/lib/db/perfis'
import { randomBytes } from 'crypto'

// Mesmo alfabeto da prova final: sem 0/O e 1/I/L, porque o codigo vai impresso
// no certificado e alguem vai digita-lo a mao para validar.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function gerarCodigo(): string {
  const bytes = randomBytes(8)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += ALFABETO[bytes[i] % ALFABETO.length]
  return `JB-${s}`
}

/**
 * Aprovacao ou recusa do desafio final. Aprovar emite o certificado.
 *
 * Atende os DOIS tipos de desafio final, porque os dois moram na mesma tabela:
 *
 *  - desafio de CURSO  (`curso_id`)  -> certificado do curso
 *  - desafio de MODULO (`modulo_id`) -> certificado do modulo, com a carga
 *    somada dos cursos dele
 *
 * Quem avalia: o autor, quem ele convidar, e a gestao como destravamento. No
 * modulo vale quem avalia qualquer curso dele — ver podeAvaliarModulo.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const { id } = await params
  const envio = await envioComCurso(id)
  if (!envio) return NextResponse.json({ error: 'Envio não encontrado.' }, { status: 404 })

  const cursoId = envio.curso_desafios.curso_id
  const moduloId = envio.curso_desafios.modulo_id

  if (!cursoId && !moduloId) {
    return NextResponse.json(
      { error: 'Desafio sem curso nem módulo. Avise a coordenação.' },
      { status: 400 }
    )
  }

  const podeAvaliar = moduloId
    ? await podeAvaliarModulo(moduloId, usuario.id, perfil.role)
    : await podeAvaliarCurso(cursoId!, usuario.id, perfil.role)

  if (!podeAvaliar) {
    return NextResponse.json(
      { error: 'Só o professor autor, ou quem ele convidou, avalia este desafio.' },
      { status: 403 }
    )
  }

  const { aprovado, feedback } = (await request.json()) as { aprovado?: boolean; feedback?: string }
  if (typeof aprovado !== 'boolean') {
    return NextResponse.json({ error: 'Informe se o desafio foi aprovado.' }, { status: 400 })
  }
  // Recusa sem devolutiva deixa o aluno sem saber o que corrigir.
  const texto = typeof feedback === 'string' && feedback.trim() ? feedback.trim() : null
  if (!aprovado && !texto) {
    return NextResponse.json({ error: 'Escreva o que precisa ser corrigido.' }, { status: 400 })
  }

  try {
    await avaliarEnvio({ envioId: id, aprovado, feedback: texto, avaliadorId: usuario.id })

    if (!aprovado || !envio.curso_desafios.vale_certificado) {
      return NextResponse.json({ ok: true, certificado: null })
    }

    const aluno = await buscarPerfil(envio.user_id)
    if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })

    // Aprovação de desafio prático é binária: não há prova com nota. 100
    // registra "aprovado" no campo que o certificado imprime.
    const NOTA_APROVADO = 100

    // ------------------------------------------------- certificado de módulo
    if (moduloId) {
      const modulo = await moduloPorId(moduloId)
      if (!modulo) return NextResponse.json({ error: 'Módulo não encontrado.' }, { status: 404 })

      const cert = await emitirCertificadoDeModulo({
        userId: envio.user_id,
        moduloId,
        alunoNome: aluno.nome_completo,
        moduloTitulo: modulo.nome,
        // O módulo reúne cursos de autores possivelmente diferentes, então o
        // certificado sai assinado pela escola, não por um professor.
        autorNome: null,
        codigo: gerarCodigo(),
        cargaHoraria: modulo.carga_horaria ?? 0,
        nota: NOTA_APROVADO,
      })
      return NextResponse.json({ ok: true, certificado: cert })
    }

    // -------------------------------------------------- certificado de curso
    const curso = await buscarCurso(cursoId!)
    if (!curso) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })

    // A carga horária do curso é o que vale. Se ninguém preencheu, cai para a
    // soma das durações das aulas — melhor que imprimir zero num documento.
    const carga = curso.carga_horaria ?? Math.max(1, Math.round((await duracaoTotal(cursoId!)) / 60))

    const cert = await emitirCertificado({
      userId: envio.user_id,
      cursoId: cursoId!,
      alunoNome: aluno.nome_completo,
      cursoTitulo: curso.titulo,
      autorNome: curso.autor_nome ?? null,
      codigo: gerarCodigo(),
      cargaHoraria: carga,
      nota: NOTA_APROVADO,
    })
    return NextResponse.json({ ok: true, certificado: cert })
  } catch (erro) {
    console.error('[cursos/desafio-final/envios/:id] falha', erro)
    return NextResponse.json({ error: 'Erro ao avaliar o envio.' }, { status: 400 })
  }
}
