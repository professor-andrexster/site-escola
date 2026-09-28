import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { papelEAprovacao } from '@/lib/db/perfis'
import { alunoDoUsuario } from '@/lib/db/portfolio'
import { buscarTrabalho, pastaDaSerie, salvarEnvio } from '@/lib/db/projetos-turma'
import { link, texto } from '@/lib/projetos-turma-validacao'

interface Ctx { params: Promise<{ id: string }> }

/**
 * Aluno envia ou atualiza o link do projeto.
 *
 * Quem pode: conta aprovada de aluno ou monitor, com ficha de aluno ativa
 * cuja serie e a da pasta do projeto, e o projeto publicado. Sem essa
 * conferencia um aluno do 3° ano mandava link para o trabalho do 2°.
 */
export async function POST(request: Request, { params }: Ctx) {
  const usuario = await usuarioAtual()
  if (!usuario) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  const perfil = await papelEAprovacao(usuario.id)
  if (!perfil?.aprovado || !['aluno', 'monitor'].includes(perfil.role)) {
    return NextResponse.json({ error: 'Só aluno envia projeto.' }, { status: 403 })
  }

  const { id } = await params
  const [trabalho, aluno] = await Promise.all([buscarTrabalho(id), alunoDoUsuario(usuario.id)])
  if (!trabalho || !trabalho.publicado) {
    return NextResponse.json({ error: 'Projeto não encontrado ou ainda não publicado.' }, { status: 404 })
  }
  if (!aluno || aluno.ativo === false) {
    return NextResponse.json({ error: 'Sua conta não tem ficha de aluno ativa. Fale com a secretaria.' }, { status: 403 })
  }
  const pasta = await pastaDaSerie(aluno.serie)
  if (!pasta || pasta.id !== trabalho.pastaId) {
    return NextResponse.json({ error: `Este projeto é da pasta ${trabalho.serie}; sua ficha está em ${aluno.serie}.` }, { status: 403 })
  }

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const linkUrl = link(b.linkUrl)
  if (!linkUrl) {
    return NextResponse.json(
      { error: 'Cole o link do site publicado, começando com https://. O que você digitou continua no formulário.' },
      { status: 400 }
    )
  }
  const repoUrl = link(b.repoUrl)
  if (repoUrl === false) {
    return NextResponse.json({ error: 'O link do repositório precisa começar com https://.' }, { status: 400 })
  }

  try {
    const envio = await salvarEnvio({
      trabalhoId: id,
      userId: usuario.id,
      linkUrl,
      repoUrl,
      comentario: texto(b.comentario, 2000),
    })
    return NextResponse.json({ ok: true, envio })
  } catch (erro) {
    console.error('[projetos-turma/envios] falha', erro)
    return NextResponse.json(
      { error: 'Não foi possível salvar o envio. Seu link continua aqui, tente de novo.' },
      { status: 400 }
    )
  }
}
