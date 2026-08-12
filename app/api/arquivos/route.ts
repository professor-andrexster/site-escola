import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { equipeComMembros } from '@/lib/db/desafios'
import { isGestao } from '@/lib/roles'
import { finalidadeValida, gravar, type Finalidade } from '@/lib/storage/arquivos'
import { podeAvaliar } from '@/app/api/desafios/permissao'
import type { Profile } from '@/types/database'

/**
 * Envio de arquivo.
 *
 * No Supabase Storage não havia autorização nenhuma: o navegador escolhia o
 * bucket, o caminho e o nome, e escrevia. Dava para subir no lugar de outra
 * pessoa (`avatars/<id de qualquer um>`) e para gravar qualquer coisa com
 * qualquer extensão.
 *
 * Aqui o cliente manda a FINALIDADE, e cada finalidade tem quem pode.
 */

type Autor = { id: string; role: Profile['role'] }

async function autorizado(
  finalidade: Finalidade,
  autor: Autor,
  form: FormData
): Promise<string | null> {
  switch (finalidade) {
    // Foto de perfil: qualquer conta aprovada envia a sua.
    case 'avatar':
      return null

    case 'noticia':
      return autor.role === 'monitor' || isGestao(autor.role)
        ? null
        : 'Só a redação envia imagem de notícia.'

    case 'curso':
      return autor.role === 'professor' || autor.role === 'monitor' || isGestao(autor.role)
        ? null
        : 'Só professor envia material de curso.'

    case 'projeto':
      return isGestao(autor.role) ? null : 'Só a direção mexe no portfólio.'

    case 'obra':
      return autor.role === 'bibliotecario' || isGestao(autor.role)
        ? null
        : 'Só a biblioteca envia capa de obra.'

    // Entrega de desafio: integrante da equipe, ou quem avalia o desafio.
    case 'desafio': {
      const equipeId = form.get('equipeId')
      if (typeof equipeId !== 'string' || !equipeId) return 'Equipe não informada.'
      const equipe = await equipeComMembros(equipeId)
      if (!equipe) return 'Equipe não encontrada.'
      if (equipe.equipe_membros.some(m => m.profile_id === autor.id)) return null
      return (await podeAvaliar(equipe.desafio_id, autor)) ? null : 'Você não é dessa equipe.'
    }
  }
}

export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  const autor: Autor = { id: usuario.id, role: perfil.role }

  const form = await request.formData()
  const finalidade = form.get('finalidade')
  if (!finalidadeValida(finalidade)) {
    return NextResponse.json({ error: 'Finalidade desconhecida.' }, { status: 400 })
  }

  const arquivo = form.get('arquivo')
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  const recusa = await autorizado(finalidade, autor, form)
  if (recusa) return NextResponse.json({ error: recusa }, { status: 403 })

  const resultado = await gravar(finalidade, arquivo, autor.id)
  if ('erro' in resultado) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 })
  }

  return NextResponse.json({ url: resultado.url })
}
