import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { avaliarEnvio, envioComCurso, podeAvaliarCurso } from '@/lib/db/desafio-curso'
import { buscarPorId as buscarCurso, duracaoTotal, emitirCertificado } from '@/lib/db/cursos'
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
 * Quem avalia: o autor do curso, quem ele convidar, e a gestao como
 * destravamento. A regra mora em podeAvaliarCurso, num lugar so.
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
  if (!(await podeAvaliarCurso(cursoId, usuario.id, perfil.role))) {
    return NextResponse.json(
      { error: 'Só o professor autor do curso, ou quem ele convidou, avalia este desafio.' },
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

    const [curso, aluno] = await Promise.all([buscarCurso(cursoId), buscarPerfil(envio.user_id)])
    if (!curso || !aluno) {
      return NextResponse.json({ error: 'Curso ou aluno não encontrado.' }, { status: 404 })
    }

    // A carga horária do curso é o que vale. Se ninguém preencheu, cai para a
    // soma das durações das aulas — melhor que imprimir zero num documento.
    const carga = curso.carga_horaria ?? Math.max(1, Math.round((await duracaoTotal(cursoId)) / 60))

    const cert = await emitirCertificado({
      userId: envio.user_id,
      cursoId,
      alunoNome: aluno.nome_completo,
      cursoTitulo: curso.titulo,
      autorNome: curso.autor_nome ?? null,
      codigo: gerarCodigo(),
      cargaHoraria: carga,
      // Aprovação de desafio prático é binária: não há prova com nota. 100
      // registra "aprovado" no campo que o certificado imprime.
      nota: 100,
    })
    return NextResponse.json({ ok: true, certificado: cert })
  } catch (erro) {
    console.error('[cursos/desafio-final/envios/:id] falha', erro)
    return NextResponse.json({ error: 'Erro ao avaliar o envio.' }, { status: 400 })
  }
}
