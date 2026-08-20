import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { usuarioAtual } from '@/lib/auth/sessao'
import { alunoDoUsuario, enderecoValido } from '@/lib/db/portfolio'

/**
 * Cria e edita projeto do portfólio do aluno.
 *
 * Quem pode: só o próprio aluno, e só nos projetos dele — o `aluno_id` nunca vem
 * do corpo da requisição, sai da sessão. Sem isso, mudar um número no formulário
 * publicaria projeto no nome de outra pessoa.
 */

const LIMITE_POR_ALUNO = 20

function erro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status })
}

/** O que vale para criar e para editar. */
function lerCampos(corpo: Record<string, unknown>) {
  const titulo = String(corpo.titulo ?? '').trim()
  const descricao = String(corpo.descricao ?? '').trim()

  if (titulo.length < 3) return { erro: 'O título precisa de pelo menos 3 caracteres.' }
  if (titulo.length > 120) return { erro: 'O título passa de 120 caracteres.' }
  if (descricao.length > 2000) return { erro: 'A descrição passa de 2000 caracteres.' }

  const linkSite = enderecoValido(corpo.linkSite as string)
  const linkRepo = enderecoValido(corpo.linkRepo as string)
  const imagem = enderecoValido(corpo.imagemUrl as string)

  if (corpo.linkSite && !linkSite) return { erro: 'O link do site precisa começar com http:// ou https://' }
  if (corpo.linkRepo && !linkRepo) return { erro: 'O link do código precisa começar com http:// ou https://' }

  return {
    dados: {
      titulo,
      descricao: descricao || null,
      link_externo: linkSite,
      repo_url: linkRepo,
      imagem_url: imagem,
    },
  }
}

export async function POST(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return erro('Faça login para continuar.', 401)

  const aluno = await alunoDoUsuario(usuario.id)
  if (!aluno) return erro('Só aluno com ficha na escola publica no portfólio.', 403)

  const corpo = await request.json().catch(() => null)
  if (!corpo) return erro('Requisição sem corpo.')

  const { erro: problema, dados } = lerCampos(corpo)
  if (problema || !dados) return erro(problema ?? 'Dados inválidos.')

  const quantos = await prisma.projetos.count({ where: { aluno_id: aluno.id } })
  if (quantos >= LIMITE_POR_ALUNO) {
    return erro(`Você já tem ${LIMITE_POR_ALUNO} projetos. Apague um antes de criar outro.`)
  }

  // `enviar: true` manda direto para a revisão; sem isso nasce rascunho, para o
  // aluno montar aos poucos sem ocupar a fila do professor.
  const status = corpo.enviar ? 'pendente' : 'rascunho'

  const criado = await prisma.projetos.create({
    data: {
      ...dados,
      aluno_id: aluno.id,
      status,
      serie_na_epoca: aluno.serie ?? null,
      criado_em: new Date(),
      atualizado_em: new Date(),
    },
    select: { id: true, status: true },
  })

  return NextResponse.json({ id: criado.id, status: criado.status }, { status: 201 })
}

export async function PATCH(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return erro('Faça login para continuar.', 401)

  const aluno = await alunoDoUsuario(usuario.id)
  if (!aluno) return erro('Só aluno com ficha na escola publica no portfólio.', 403)

  const corpo = await request.json().catch(() => null)
  if (!corpo?.id) return erro('Projeto não informado.')

  const atual = await prisma.projetos.findFirst({
    where: { id: String(corpo.id), aluno_id: aluno.id },
    select: { id: true, status: true },
  })
  if (!atual) return erro('Projeto não encontrado.', 404)

  // Projeto aprovado sai do ar ao ser editado e volta para a fila. O que está
  // publicado com o nome da escola foi conferido daquele jeito; mudar o conteúdo
  // sem nova conferência tornaria a revisão decorativa.
  const novoStatus = corpo.enviar
    ? 'pendente'
    : atual.status === 'aprovado'
      ? 'pendente'
      : atual.status === 'recusado'
        ? 'rascunho'
        : atual.status

  const { erro: problema, dados } = lerCampos(corpo)
  if (problema || !dados) return erro(problema ?? 'Dados inválidos.')

  await prisma.projetos.update({
    where: { id: atual.id },
    data: {
      ...dados,
      status: novoStatus,
      // O motivo da recusa some quando o aluno mexe: ele já se refere a uma
      // versão que não existe mais.
      motivo_recusa: null,
      atualizado_em: new Date(),
    },
  })

  return NextResponse.json({ ok: true, status: novoStatus })
}

export async function DELETE(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) return erro('Faça login para continuar.', 401)

  const aluno = await alunoDoUsuario(usuario.id)
  if (!aluno) return erro('Só aluno com ficha na escola publica no portfólio.', 403)

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return erro('Projeto não informado.')

  const apagados = await prisma.projetos.deleteMany({
    where: { id, aluno_id: aluno.id },
  })
  if (!apagados.count) return erro('Projeto não encontrado.', 404)

  return NextResponse.json({ ok: true })
}
