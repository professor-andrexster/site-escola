export type AcaoLog =
  | 'cadastro_aluno'
  | 'cadastro_professor'
  | 'cadastro_recusado'
  // Auto-cadastro achou mais de uma ficha sem dono com o mesmo nome e turma.
  // Nenhuma e escolhida (dar a ficha errada misturaria o historico de dois
  // alunos); fica para a tela de aprovacao resolver.
  | 'cadastro_ficha_ambigua'
  | 'login_ok'
  | 'login_falha'
  | 'logout'
  // Autenticacao propria (fase 4): a redefinicao por link de e-mail passou a
  // ser nossa, entao ganhou acao propria — 'senha_redefinida_cpf' e o outro
  // caminho, o do balcao com CPF e data de nascimento.
  | 'senha_redefinida'
  | 'redefinicao_falhou'
  | 'senha_redefinida_cpf'
  | 'senha_redefinida_admin'
  | 'recuperacao_recusada'
  | 'recuperacao_falhou'
  | 'usuario_criado_direcao'
  | 'aluno_aprovado_professor'
  | 'usuario_aprovado_gestao'
  | 'usuario_revogado_gestao'
  | 'aluno_bloqueado_por_inatividade'
  | 'papel_alterado'
  | 'perfil_atualizado'
  | 'convite_bibliotecario_criado'
  | 'convite_bibliotecario_aceito'
  | 'convite_bibliotecario_revogado'
  | 'prova_final_reprovada'
  | 'certificado_emitido'

/** Extrai o IP do request (Vercel preenche x-forwarded-for). */
export function ipDoRequest(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? null
}

/**
 * A gravacao e a contagem do log vivem em lib/db/log.ts desde a migracao.
 * Este arquivo mantem o tipo AcaoLog e o ipDoRequest, que sao dominio puro e
 * nao dependem de banco — e por isso continuam sendo importados de dezenas de
 * rotas sem trazer o cliente do banco junto.
 */
export { registrar, contarRecentes } from '@/lib/db/log'
