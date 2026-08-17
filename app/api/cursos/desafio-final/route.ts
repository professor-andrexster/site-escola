import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { desafioFinalDoCurso, enviarDesafio, envioDoAluno } from '@/lib/db/desafio-curso'
import { buscarPorSlug } from '@/lib/db/cursos'

/** O desafio final do curso e o que este aluno ja enviou, se enviou. */
export async function GET(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const slug = new URL(request.url).searchParams.get('curso')
  if (!slug) return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })

  const curso = await buscarPorSlug(slug)
  if (!curso) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })

  const desafio = await desafioFinalDoCurso(curso.id)
  if (!desafio) return NextResponse.json({ desafio: null, envio: null })

  return NextResponse.json({ desafio, envio: await envioDoAluno(desafio.id, usuario.id) })
}

/**
 * Envio do desafio final.
 *
 * O arquivo sobe antes por /api/arquivos, que ja valida tipo e tamanho; aqui
 * chega so a URL. Aceita tambem link, para quem publicou no GitHub Pages —
 * que e justamente uma das aulas do curso de HTML e CSS.
 */
export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const b = (await request.json()) as Record<string, unknown>
  const desafioId = typeof b.desafioId === 'string' ? b.desafioId : ''
  if (!desafioId) return NextResponse.json({ error: 'Desafio não informado.' }, { status: 400 })

  const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const arquivoUrl = texto(b.arquivoUrl)
  const linkUrl = texto(b.linkUrl)
  if (!arquivoUrl && !linkUrl) {
    return NextResponse.json({ error: 'Envie um arquivo ou informe o link do seu trabalho.' }, { status: 400 })
  }

  try {
    const r = await enviarDesafio({
      desafioId,
      userId: usuario.id,
      arquivoUrl,
      linkUrl,
      comentario: texto(b.comentario),
    })
    if (r.jaAprovado) {
      return NextResponse.json(
        { error: 'Este desafio já foi aprovado. Não é possível reenviar.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ envio: r.envio })
  } catch (erro) {
    console.error('[cursos/desafio-final] falha ao enviar', erro)
    return NextResponse.json({ error: 'Erro ao enviar o desafio.' }, { status: 400 })
  }
}
