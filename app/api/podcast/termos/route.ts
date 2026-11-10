import { NextResponse } from 'next/server'
import { buscarEpisodio, dadosDoTermo } from '@/lib/podcast/dados'
import { termoEntrevistado, termoResponsavel } from '@/lib/podcast/termos'
import { erro, exigirAcesso, participa } from '@/lib/podcast/api'
import { slugDe } from '@/lib/podcast/tipos'
import { auditar } from '@/lib/podcast/auditoria'

/**
 * PDF dos termos.
 *   ?modelo=responsavel               em branco (qualquer conta aprovada)
 *   ?modelo=responsavel&membro=<id>   preenchido (monitor ou direcao: tem CPF)
 *   ?modelo=entrevistado              em branco
 *   ?modelo=entrevistado&episodio=<id> com nome e assunto (quem participa ou monitor)
 */
export async function GET(request: Request) {
  const r = await exigirAcesso()
  if (!r.ok) return r.res
  const url = new URL(request.url)
  const modelo = url.searchParams.get('modelo')
  const membro = url.searchParams.get('membro')
  const episodio = url.searchParams.get('episodio')

  let bytes: Uint8Array
  let nome: string
  if (modelo === 'responsavel') {
    if (membro) {
      if (!r.acesso.moderador) return erro('Só o monitor do podcast gera o termo preenchido.', 403)
      const d = await dadosDoTermo(membro)
      if (!d) return erro('Aluno não encontrado na equipe.', 404)
      bytes = await termoResponsavel(d)
      nome = `autorizacao-${slugDe(d.alunoNome)}.pdf`
      await auditar({ atorId: r.acesso.userId, acao: 'termo.baixado', alvoTipo: 'aluno', alvoId: membro, alvoNome: d.alunoNome })
    } else {
      bytes = await termoResponsavel()
      nome = 'autorizacao-responsavel-em-branco.pdf'
    }
  } else if (modelo === 'entrevistado') {
    if (episodio) {
      const ep = await buscarEpisodio(episodio)
      if (!ep) return erro('Episódio não encontrado.', 404)
      if (!r.acesso.moderador && !participa(ep, r.acesso.userId)) return erro('Sem permissão.', 403)
      bytes = await termoEntrevistado({ nome: ep.entrevistadoNome ?? '', descricao: ep.entrevistadoDescricao ?? '', titulo: ep.titulo })
      nome = `termo-entrevistado-${slugDe(ep.entrevistadoNome ?? ep.titulo)}.pdf`
    } else {
      bytes = await termoEntrevistado()
      nome = 'termo-entrevistado-em-branco.pdf'
    }
  } else {
    return erro('Modelo desconhecido.')
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
