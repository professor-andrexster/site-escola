import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { filaDeCorrecao, podeAvaliarCurso } from '@/lib/db/desafio-curso'
import { buscarPorSlug } from '@/lib/db/cursos'
import { filaDoModulo, moduloPorSlug, podeAvaliarModulo } from '@/lib/db/modulos'

/**
 * Fila de correcao. Aceita `?curso=<slug>` ou `?modulo=<slug>` — sao os dois
 * tipos de desafio final, e os dois usam a mesma tabela de envios.
 *
 * So quem avalia enxerga: sao trabalhos de alunos, com nome e turma.
 */
export async function GET(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })

  const busca = new URL(request.url).searchParams
  const slugModulo = busca.get('modulo')

  if (slugModulo) {
    const modulo = await moduloPorSlug(slugModulo)
    if (!modulo) return NextResponse.json({ error: 'Módulo não encontrado.' }, { status: 404 })
    if (!(await podeAvaliarModulo(modulo.id, usuario.id, perfil.role))) {
      return NextResponse.json({ error: 'Você não avalia este módulo.' }, { status: 403 })
    }
    return NextResponse.json({ envios: await filaDoModulo(modulo.id) })
  }

  const slug = busca.get('curso')
  if (!slug) return NextResponse.json({ error: 'Curso ou módulo não informado.' }, { status: 400 })

  const curso = await buscarPorSlug(slug)
  if (!curso) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 })

  if (!(await podeAvaliarCurso(curso.id, usuario.id, perfil.role))) {
    return NextResponse.json({ error: 'Você não avalia este curso.' }, { status: 403 })
  }

  return NextResponse.json({ envios: await filaDeCorrecao(curso.id) })
}
