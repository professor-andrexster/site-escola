import { NextResponse } from 'next/server'
import { usuarioAtual } from '@/lib/auth/sessao'
import { buscarPorUsuario, jaExiste, atualizar } from '@/lib/db/alunos'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  // Buscar o aluno vinculado a este usuário.
  // O vínculo entre conta e registro acadêmico mora em alunos.user_id — é o que
  // o cadastro grava (api/cadastro/aluno e api/usuarios/criar) e o que o login
  // por matrícula consulta. A coluna identidades.aluno_id nunca é preenchida.
  const aluno = await buscarPorUsuario(usuario.id)

  if (!aluno) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  // So os campos que a tela de perfil edita — nao devolvemos cpf nem
  // nascimento, que a camada carrega mas a tela nao usa.
  return NextResponse.json({
    id: aluno.id,
    nome: aluno.nome,
    matricula: aluno.matricula,
    turma: aluno.turma,
    email: aluno.email,
    telefone: aluno.telefone,
    responsavel: aluno.responsavel,
    foto_url: aluno.foto_url,
  })
}

export async function PUT(request: Request) {
  const usuario = await usuarioAtual()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  // Mesmo vínculo do GET: alunos.user_id
  const aluno = await buscarPorUsuario(usuario.id)

  if (!aluno) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  const body = await request.json() as {
    email?: string
    telefone?: string
    responsavel?: string
    foto_url?: string | null
  }

  // Validações
  if (body.email && !REGEX_EMAIL.test(body.email.trim())) {
    return NextResponse.json({ error: 'E-mail inválido. Insira um e-mail válido (ex: aluno@escola.com).' }, { status: 400 })
  }

  // Verificar se o e-mail já existe para outro aluno
  if (body.email) {
    if (await jaExiste('email', body.email, aluno.id)) {
      return NextResponse.json({ error: 'Já existe outro aluno com esse e-mail.' }, { status: 400 })
    }
  }

  // Atualizar apenas os campos permitidos
  const dados: Record<string, unknown> = { atualizado_em: new Date().toISOString() }
  if (body.email !== undefined) dados.email = body.email?.trim() || null
  if (body.telefone !== undefined) dados.telefone = body.telefone?.trim() || null
  if (body.responsavel !== undefined) dados.responsavel = body.responsavel?.trim() || null
  if (body.foto_url !== undefined) dados.foto_url = body.foto_url || null

  try {
    await atualizar(aluno.id, dados)
  } catch (erro) {
    console.error('[meu-perfil] falha ao atualizar', erro)
    return NextResponse.json({ error: 'Erro ao atualizar seus dados.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
