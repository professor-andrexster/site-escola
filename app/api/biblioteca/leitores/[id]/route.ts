import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirBibliotecaStaff } from '@/lib/apiGestao'
import { registrarAuditoriaBiblioteca } from '@/lib/biblioteca/auditoria'
import { validarLeitor } from '@/lib/biblioteca/leitores'

type CorpoLeitor = {
  nomeCompleto?: string
  nomeSocial?: string | null
  tipoLeitor?: string
  matricula?: string | null
  dataNascimento?: string | null
  turma?: string | null
  turno?: string | null
  anoEscolar?: string | null
  telefone?: string | null
  email?: string | null
  nomeResponsavel?: string | null
  telefoneResponsavel?: string | null
  observacoes?: string | null
  situacao?: 'ativo' | 'inativo' | 'bloqueado'
  motivoBloqueio?: string | null
}

// Ficha rapida do leitor com o que esta com ele agora, usada no cartao do
// balcao de emprestimo e na tela de devolucao.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { id } = await params
  const admin = createAdminClient()

  const { data: leitor } = await admin.from('biblioteca_leitores').select('*').eq('id', id).maybeSingle()
  if (!leitor) return NextResponse.json({ error: 'Leitor não encontrado.' }, { status: 404 })

  const { data: emprestimos } = await admin
    .from('biblioteca_emprestimos')
    .select('*, biblioteca_exemplares(id, tombo, biblioteca_obras(titulo))')
    .eq('leitor_id', id)
    .in('situacao', ['em_andamento', 'renovado'])
    .order('data_prevista')

  return NextResponse.json({ leitor, emprestimosAbertos: emprestimos ?? [] })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const { id } = await params
  const body = (await request.json()) as CorpoLeitor
  if (!body.nomeCompleto?.trim()) return NextResponse.json({ error: 'Informe o nome completo do leitor.' }, { status: 400 })
  if (!body.tipoLeitor) return NextResponse.json({ error: 'Selecione o tipo de leitor.' }, { status: 400 })

  const validacao = validarLeitor({
    tipoLeitor: body.tipoLeitor,
    dataNascimento: body.dataNascimento,
    nomeResponsavel: body.nomeResponsavel,
    telefoneResponsavel: body.telefoneResponsavel,
  })
  if (!validacao.ok) return NextResponse.json({ error: validacao.erro }, { status: 400 })

  const admin = createAdminClient()
  const { data: anterior } = await admin.from('biblioteca_leitores').select('*').eq('id', id).maybeSingle()
  if (!anterior) return NextResponse.json({ error: 'Leitor não encontrado.' }, { status: 404 })

  const situacao = body.situacao ?? anterior.situacao
  if (situacao === 'bloqueado' && !body.motivoBloqueio?.trim()) {
    return NextResponse.json({ error: 'Informe o motivo do bloqueio.' }, { status: 400 })
  }

  const { data: leitor, error } = await admin
    .from('biblioteca_leitores')
    .update({
      nome_completo: body.nomeCompleto.trim(),
      nome_social: body.nomeSocial?.trim() || null,
      tipo_leitor: body.tipoLeitor,
      matricula: body.matricula?.trim() || null,
      data_nascimento: body.dataNascimento || null,
      turma: body.turma?.trim() || null,
      turno: body.turno?.trim() || null,
      ano_escolar: body.anoEscolar?.trim() || null,
      telefone: body.telefone?.trim() || null,
      email: body.email?.trim() || null,
      nome_responsavel: body.nomeResponsavel?.trim() || null,
      telefone_responsavel: body.telefoneResponsavel?.trim() || null,
      observacoes: body.observacoes?.trim() || null,
      situacao,
      motivo_bloqueio: situacao === 'bloqueado' ? body.motivoBloqueio?.trim() : null,
      atualizado_por: auth.userId,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao salvar o leitor: ' + error.message }, { status: 400 })

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: situacao !== anterior.situacao ? 'leitor_situacao_alterada' : 'leitor_editado',
    tabelaAfetada: 'biblioteca_leitores',
    registroAfetado: id,
    valorAnterior: anterior,
    valorNovo: leitor,
  })

  return NextResponse.json({ leitor })
}
