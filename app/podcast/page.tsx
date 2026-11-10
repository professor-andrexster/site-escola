import Link from 'next/link'
import type { Metadata } from 'next'
import { Headphones, Radio } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import CapaEpisodio from '@/components/podcast/CapaEpisodio'
import { episodiosPublicados, equipePublica, listarQuadros } from '@/lib/podcast/dados'
import { NOME_PODCAST, nomePublico } from '@/lib/podcast/tipos'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: `${NOME_PODCAST} · Podcast dos alunos`,
  description: 'O podcast feito pelos alunos da E.E. Dr. João Beraldo: entrevistas, notícias da escola e de Carlos Chagas. Toca na rádio da escola e aqui.',
}
export const revalidate = 60

export default async function PodcastPublicoPage() {
  const [episodios, equipe, quadros] = await Promise.all([episodiosPublicados(), equipePublica(), listarQuadros(true)])
  const [destaque, ...resto] = episodios
  const alunos = equipe.filter(m => m.papel === 'aluno')
  const monitores = equipe.filter(m => m.papel === 'monitor')

  return (
    <PageLayout>
      <div className="bg-escola-azul text-white py-12 border-b-2 border-escola-vermelho">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-escola-vermelho-claro mb-2">JBInforma · Podcast e rádio da escola</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-black">{NOME_PODCAST}</h1>
          <p className="text-white/70 mt-2 font-serif">Feito pelos alunos da João Beraldo. Toca na rádio da escola e aqui.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {destaque ? (
          <section className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] items-center mb-16">
            <CapaEpisodio quadroNome={destaque.quadroNome} tipo={destaque.tipo} grande />
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-widest text-escola-vermelho mb-2">Episódio mais recente · {destaque.publicadoEm ? formatDate(destaque.publicadoEm) : ''}</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                <Link href={`/podcast/${destaque.slug}`} className="hover:text-escola-azul transition-colors">{destaque.titulo}</Link>
              </h2>
              {destaque.resumo && <p className="text-lg text-gray-600 mb-5 max-w-[62ch]">{destaque.resumo}</p>}
              {destaque.audioUrl && <audio controls preload="metadata" src={destaque.audioUrl} className="w-full max-w-xl mb-4" />}
              <p className="text-sm text-gray-500">
                Com {destaque.participantes.map(p => nomePublico(p.nome, p.turma)).join(' · ')}
                {destaque.entrevistadoNome ? ` · entrevistando ${destaque.entrevistadoNome}` : ''}
              </p>
            </div>
          </section>
        ) : (
          <section className="text-center py-16 mb-12 border border-dashed border-escola-cinza-claro rounded-2xl">
            <Radio className="w-10 h-10 text-escola-azul mx-auto mb-3" />
            <h2 className="font-playfair text-2xl font-bold text-gray-900">O primeiro episódio está sendo gravado</h2>
            <p className="text-gray-600 mt-2">A equipe está preparando as primeiras entrevistas. Volte em breve, ou ouça na rádio da escola no intervalo.</p>
          </section>
        )}

        {resto.length > 0 && (
          <section className="mb-16">
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">Todos os episódios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resto.map(e => (
                <article key={e.id} className="bg-white border border-escola-cinza-claro overflow-hidden card-lift flex flex-col">
                  <Link href={`/podcast/${e.slug}`}><CapaEpisodio quadroNome={e.quadroNome} tipo={e.tipo} /></Link>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="font-mono text-[11px] text-escola-cinza mb-1">{e.publicadoEm ? formatDate(e.publicadoEm) : ''}{e.quadroNome ? ` · ${e.quadroNome}` : ''}</p>
                    <h3 className="font-playfair text-lg font-bold text-gray-900 mb-2">
                      <Link href={`/podcast/${e.slug}`} className="hover:text-escola-azul transition-colors">{e.titulo}</Link>
                    </h3>
                    {e.resumo && <p className="text-sm text-gray-600 mb-3 line-clamp-3">{e.resumo}</p>}
                    {e.audioUrl && <audio controls preload="none" src={e.audioUrl} className="w-full mt-auto" />}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {quadros.length > 0 && (
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mb-16">
          <div>
            <Headphones className="w-8 h-8 text-escola-vermelho mb-3" />
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Os quadros</h2>
            <p className="text-gray-600 mt-2">Como num programa de rádio: cada episódio entra num quadro, e você já sabe o que vem.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 min-w-0">
            {quadros.map(q => (
              <div key={q.chave} className="border-l-4 border-escola-azul bg-white p-4">
                <p className="font-semibold text-gray-900">{q.nome}</p>
                {q.ideia && <p className="text-sm text-gray-600 mt-1">{q.ideia}</p>}
              </div>
            ))}
          </div>
        </section>
        )}

        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Quem faz</h2>
            <p className="text-gray-600 mt-2">Alunos que entrevistam, escrevem e gravam, com professores acompanhando cada episódio.</p>
          </div>
          <div className="min-w-0">
            {alunos.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mb-4">
                {alunos.map(m => <li key={m.id} className="bg-white border border-escola-cinza-claro rounded-full px-4 py-1.5 text-sm text-gray-800">{nomePublico(m.nome, m.turma)}</li>)}
              </ul>
            ) : (
              <p className="text-gray-500 mb-4">A equipe está sendo montada.</p>
            )}
            {monitores.length > 0 && (
              <p className="text-sm text-gray-500">Monitoria: {monitores.map(m => m.nome).join(', ')}</p>
            )}
            <p className="text-sm text-gray-600 mt-6">Quer entrar na equipe? Fale com um professor monitor do {NOME_PODCAST}.</p>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
