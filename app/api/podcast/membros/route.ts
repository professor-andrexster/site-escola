import { NextResponse } from 'next/server'
import { adicionarAluno, alunosDisponiveis } from '@/lib/podcast/dados'
import { erro, exigirModerador, texto } from '@/lib/podcast/api'
import { cpfValido, digitos } from '@/lib/podcast/tipos'

/** Monitor adiciona aluno à equipe com nome e CPF do responsável. */
export async function POST(request: Request) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  if (typeof b.alunoId !== 'string') return erro('Escolha o aluno.')
  const nome = texto(b.responsavelNome, 120)
  if (!nome || nome.split(/\s+/).length < 2) return erro('Escreva o nome completo do responsável.')
  const cpf = typeof b.responsavelCpf === 'string' ? digitos(b.responsavelCpf) : ''
  if (!cpfValido(cpf)) return erro('Esse CPF não é válido. Confira os números.')

  const aluno = (await alunosDisponiveis()).find(a => a.id === b.alunoId)
  if (!aluno?.user_id) return erro('Esse aluno não está disponível: já está na equipe ou ainda não tem conta no site.')
  try {
    const m = await adicionarAluno({ id: aluno.id, userId: aluno.user_id }, { nome, cpf }, r.acesso.userId)
    return NextResponse.json({ ok: true, id: m.id })
  } catch (e) {
    console.error('[podcast/membros]', e)
    return erro('Não consegui adicionar o aluno. Tente de novo.', 500)
  }
}
