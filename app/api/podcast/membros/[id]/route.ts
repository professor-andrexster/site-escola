import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { aceitarAutorizacao, atualizarResponsavel, buscarMembro, definirPermissoes, nomeDoUsuario, removerMembro, revogarAutorizacao } from '@/lib/podcast/dados'
import { auditar } from '@/lib/podcast/auditoria'
import { erro, exigirAcesso, exigirModerador, texto } from '@/lib/podcast/api'
import { cpfValido, digitos } from '@/lib/podcast/tipos'

interface Ctx { params: Promise<{ id: string }> }

/** acao: aceitar | revogar | renovar | responsavel (corrige nome/CPF e volta para pendente) | permissoes */
export async function PATCH(request: Request, { params }: Ctx) {
  const r = await exigirModerador()
  if (!r.ok) return r.res
  const { id } = await params
  const m = await buscarMembro(id)
  if (!m || m.papel !== 'aluno') return erro('Aluno não encontrado na equipe.', 404)
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const quem = await nomeDoUsuario(m.user_id)
  const aud = (acao: string, detalhe?: string | null) =>
    auditar({ atorId: r.acesso.userId, acao, alvoTipo: 'aluno', alvoId: id, alvoNome: quem, detalhe })

  try {
    if (b.acao === 'permissoes') {
      const p: { podePostar?: boolean; podeAudio?: boolean } = {}
      if (typeof b.podePostar === 'boolean') p.podePostar = b.podePostar
      if (typeof b.podeAudio === 'boolean') p.podeAudio = b.podeAudio
      if (p.podePostar === undefined && p.podeAudio === undefined) return erro('Nada para mudar.')
      const novo = await definirPermissoes(id, p)
      await aud('aluno.permissoes', `postar: ${novo.pode_postar ? 'sim' : 'não'} · áudio: ${novo.pode_audio ? 'sim' : 'não'}`)
      return NextResponse.json({ ok: true, podePostar: novo.pode_postar, podeAudio: novo.pode_audio })
    }
    if (b.acao === 'aceitar') {
      if (!m.autorizacao_arquivo) return erro('Suba o termo assinado antes de aceitar.')
      await aceitarAutorizacao(id, r.acesso.userId)
      await aud('termo.aceito')
      return NextResponse.json({ ok: true })
    }
    if (b.acao === 'revogar') {
      const retirados = await revogarAutorizacao(id)
      await aud('termo.revogado', retirados ? `${retirados} episódio(s) saíram do ar` : null)
      // Episodio tirado do ar tem que sumir ja, nao depois do cache de 60 s.
      if (retirados > 0) revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, retirados })
    }
    if (b.acao === 'renovar') {
      // Ano letivo novo: mesmo responsavel, termo novo para assinar.
      if (!m.responsavel_nome || !m.responsavel_cpf) return erro('Preencha o responsável antes.')
      const retirados = await atualizarResponsavel(id, { nome: m.responsavel_nome, cpf: m.responsavel_cpf })
      await aud('aluno.renovado', retirados ? `${retirados} episódio(s) saíram do ar` : null)
      if (retirados > 0) revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, retirados })
    }
    if (b.acao === 'responsavel') {
      const nome = texto(b.responsavelNome, 120)
      if (!nome || nome.split(/\s+/).length < 2) return erro('Escreva o nome completo do responsável.')
      const cpf = typeof b.responsavelCpf === 'string' ? digitos(b.responsavelCpf) : ''
      if (!cpfValido(cpf)) return erro('Esse CPF não é válido. Confira os números.')
      const retirados = await atualizarResponsavel(id, { nome, cpf })
      await aud('aluno.responsavel', `novo responsável: ${nome}${retirados ? ` · ${retirados} episódio(s) saíram do ar` : ''}`)
      if (retirados > 0) revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, retirados })
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
  const quem = await nomeDoUsuario(m.user_id)
  const res = await removerMembro(id)
  if ('erro' in res) return erro(res.erro, 409)
  await auditar({ atorId: r.acesso.userId, acao: m.papel === 'monitor' ? 'monitor.removido' : 'aluno.removido', alvoTipo: m.papel === 'monitor' ? 'monitor' : 'aluno', alvoId: id, alvoNome: quem })
  return NextResponse.json({ ok: true })
}
