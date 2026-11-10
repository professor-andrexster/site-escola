import { episodiosPublicados } from '@/lib/podcast/dados'
import { NOME_PODCAST, esc, nomePublico } from '@/lib/podcast/tipos'

/**
 * Feed RSS do podcast (RSS 2.0 + tags do iTunes), para aplicativos de podcast.
 * Só episódios publicados e com áudio. Sai do ar junto com o episódio.
 * Créditos seguem a regra do site: primeiro nome e turma.
 */
// Sempre do banco: episodio publicado entra na hora e episodio retirado some na hora.
export const dynamic = 'force-dynamic'

const BASE = (process.env.APP_URL ?? 'https://escola.nexialabs.com.br').replace(/\/$/, '')
const DESCRICAO = 'O podcast feito pelos alunos da Escola Estadual Dr. João Beraldo, de Carlos Chagas (MG): entrevistas, notícias da escola e da cidade.'

export async function GET() {
  const eps = (await episodiosPublicados(200)).filter(e => e.audioUrl)
  const itens = eps.map(e => {
    const link = `${BASE}/podcast/${e.slug}`
    const quem = e.participantes.map(p => nomePublico(p.nome, p.turma)).join(', ')
    const desc = [e.resumo, quem ? `Com ${quem}.` : null].filter(Boolean).join(' ')
    return `    <item>
      <title>${esc(e.titulo)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">jb-no-ar-${e.id}</guid>
      <pubDate>${new Date(e.publicadoEm ?? e.criadoEm).toUTCString()}</pubDate>
      <description>${esc(desc)}</description>
      <itunes:summary>${esc(desc)}</itunes:summary>
      <itunes:explicit>false</itunes:explicit>
      <enclosure url="${BASE}/api/podcast/audio/${e.id}.${e.audioExt ?? 'mp3'}" length="${e.audioBytes ?? 0}" type="${e.audioMime ?? 'audio/mpeg'}" />
    </item>`
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NOME_PODCAST} · E.E. Dr. João Beraldo</title>
    <link>${BASE}/podcast</link>
    <atom:link href="${BASE}/podcast/feed.xml" rel="self" type="application/rss+xml" />
    <language>pt-BR</language>
    <description>${esc(DESCRICAO)}</description>
    <itunes:author>E.E. Dr. João Beraldo</itunes:author>
    <itunes:summary>${esc(DESCRICAO)}</itunes:summary>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Education" />
    <itunes:image href="${BASE}/logo.jpg" />
    <image><url>${BASE}/logo.jpg</url><title>${NOME_PODCAST}</title><link>${BASE}/podcast</link></image>
${itens.join('\n')}
  </channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'no-cache' } })
}
