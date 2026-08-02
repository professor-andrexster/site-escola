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
}

// Busca por nome, matricula ou turma, usada no balcao de emprestimo e na
// listagem. Resultado aparece enquanto digita, por isso limitado e leve.
export async function GET(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

  const busca = new URL(request.url).searchParams.get('q')?.trim()
  const admin = createAdminClient()

  let query = admin
    .from('biblioteca_leitores')
    .select('id, nome_completo, nome_social, tipo_leitor, matricula, turma, turno, situacao, motivo_bloqueio')
    .order('nome_completo')
    .limit(20)

  if (busca) {
    query = query.or(`nome_completo.ilike.%${busca}%,matricula.ilike.%${busca}%,turma.ilike.%${busca}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar leitores.' }, { status: 400 })
  return NextResponse.json({ leitores: data })
}

export async function POST(request: Request) {
  const auth = await exigirBibliotecaStaff()
  if (!auth.ok) return auth.res

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

  const { data: leitor, error } = await admin
    .from('biblioteca_leitores')
    .insert({
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
      atualizado_por: auth.userId,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao cadastrar leitor: ' + error.message }, { status: 400 })

  await registrarAuditoriaBiblioteca(admin, {
    usuarioId: auth.userId,
    acao: 'leitor_criado',
    tabelaAfetada: 'biblioteca_leitores',
    registroAfetado: leitor.id,
    valorNovo: leitor,
  })

  return NextResponse.json({ leitor })
}
