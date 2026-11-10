import { NextResponse } from 'next/server'
import { aceitarAutorizacao, atualizarResponsavel, buscarMembro, removerMembro, revogarAutorizacao } from '@/lib/podcast/dados'
import { erro, exigirAcesso, exigirModerador, texto } from '@/lib/podcast/api'
import { cpfValido, digitos } from '@/lib/podcast/tipos'

interface Ctx { params: Promise<{ id: string }> }

/** acao: aceitar | revogar | renovar | responsavel (corrige nome/CPF e volta para pendente) */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const m = await buscarMembro(id)
  if (!m || m.papel !== 'aluno') return erro('Aluno não encontrado na equipe.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>

  try {
    if (b.acao === 'aceitar') {
      if (!m.autorizacao_arquivo) return erro('Suba o termo assinado antes de aceitar.')
      await aceitarAutorizacao(id, r.acesso.userId)
      return NextResponse.json({ ok: true })
    }
    if (b.acao === 'revogar') {
      const retirados = await revogarAutorizacao(id)
      return NextResponse.json({ ok: true, retirados })
    }
    if (b.acao === 'renovar') {
      // Ano letivo novo: mesmo responsavel, termo novo para assinar.
      if (!m.responsavel_nome || !m.responsavel_cpf) return erro('Preencha o responsável antes.')
      await atualizarResponsavel(id, { nome: m.responsavel_nome, cpf: m.responsavel_cpf })
      return NextResponse.json({ ok: true })
    }
    if (b.acao === 'responsavel') {
      const nome = texto(b.responsavelNome, 120)
      if (!nome || nome.split(/\s+/).length < 2) return erro('Escreva o nome completo do responsável.')
      const cpf = typeof b.responsavelCpf === 'string' ? digitos(b.responsavelCpf) : ''
      if (!cpfValido(cpf)) return erro('Esse CPF não é válido. Confira os números.')
      await atualizarResponsavel(id, { nome, cpf })
      return NextResponse.json({ ok: true })
    }
    return erro('Ação desconhecida.')
  } catch (e) {
    console.error('[podcast/membros/id]', e)
    return erro('Não consegui salvar. Tente de novo.', 500)
  }
}

/** Remove da equipe (monitor tira aluno; direção tira monitor). */
export async function DELETE(_request: Request, { params }: Ctx) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const { id } = await params
  const m = await buscarMembro(id)
  if (!m) return erro('Membro não encontrado.', 404)
  if (m.papel === 'monitor' ? !r.acesso.gestao : !r.acesso.moderador) return erro('Sem permissão.', 403)
  const res = await removerMembro(id)
  if ('erro' in res) return erro(res.erro, 409)
  return NextResponse.json({ ok: true })
}
