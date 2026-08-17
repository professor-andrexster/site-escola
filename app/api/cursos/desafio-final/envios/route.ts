import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { filaDeCorrecao, podeAvaliarCurso } from '@/lib/db/desafio-curso'
import { buscarPorSlug } from '@/lib/db/cursos'

/** Fila de correcao de um curso. So o autor do curso (ou a gestao) enxerga. */
export async function GET(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const slug = new URL(request.url).searchParams.get('curso')
  if (!slug) return NextResponse.json({ error: 'Curso não informado.' }, { status: 400 })

  const curso = await buscarPorSlug(slug)
  if (!curso) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })

  if (!(await podeAvaliarCurso(curso.id, usuario.id, perfil.role))) {
    return NextResponse.json({ error: 'Você não avalia este curso.' }, { status: 403 })
  }

  return NextResponse.json({ envios: await filaDeCorrecao(curso.id) })
}
