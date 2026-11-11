import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { publicadas } from '@/lib/jornal/dados'
import { TEMAS, VEREDITOS, type Veredito } from '@/lib/jornal/tipos'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'É verdade? Checagem de boatos',
  description: 'Os alunos do JBInforma conferem boatos que circulam em Carlos Chagas sobre saúde, golpes, concursos e serviços públicos, e mostram o passo a passo.',
}
export const revalidate = 60

export default async function EVerdadePage() {
  const checagens = await publicadas({ tipo: 'checagem' })
  return (
    <PageLayout>
      <CabecalhoJornal atual="e-verdade" titulo="É verdade?" olho="JBInforma · Checagem de boatos" sobre="Chegou no grupo? Antes de repassar, a gente confere com quem sabe." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mb-14">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Os quatro selos</h2>
            <p className="text-escola-cinza mt-2">Toda checagem termina com um selo e com os passos que a equipe seguiu. Qualquer leitor pode refazer.</p>
            <p className="text-sm text-escola-cinza mt-4">O jornal checa saúde, golpes, concursos e vagas, serviços públicos e prazos. Não checa político, partido nem eleição.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 min-w-0">
            {(Object.keys(VEREDITOS) as Veredito[]).map(k => (
              <li key={k} className={`bg-white border-l-4 ${VEREDITOS[k].borda} p-4`}>
                <span className={`inline-block font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${VEREDITOS[k].cor}`}>{VEREDITOS[k].nome}</span>
                <p className="text-sm text-escola-preto mt-2">{VEREDITOS[k].frase}</p>
              </li>
            ))}
          </ul>
        </section>

        {checagens.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-escola-cinza-claro bg-white">
            <p className="font-playfair text-2xl font-bold text-escola-azul">A primeira checagem está sendo apurada</p>
            <p className="text-escola-cinza mt-2">Recebeu uma mensagem estranha sobre vacina, vaga de emprego, matrícula ou benefício?</p>
            <Link href="/noticias/pauta" className="inline-block bg-escola-azul text-white px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors mt-5">Mandar para a redação</Link>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {checagens.map(c => {
              const v = c.veredito ? VEREDITOS[c.veredito] : null
              return (
                <li key={c.id}>
                  <Link href={`/noticias/${c.slug}`} className={`block h-full bg-white border-l-4 ${v?.borda ?? 'border-slate-600'} p-5 card-lift`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${v?.cor ?? 'bg-slate-600 text-white'}`}>{v?.nome ?? 'Checagem'}</span>
                      {c.tema && <span className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza">{TEMAS[c.tema]}</span>}
                      <time className="font-mono text-[11px] text-escola-cinza">{formatDate(c.publicadoEm ?? c.criadoEm)}</time>
                    </div>
                    <h2 className="font-playfair text-xl font-bold text-escola-preto mt-2">{c.titulo}</h2>
                    {c.boato && <p className="text-sm text-escola-cinza mt-2 line-clamp-3">O que diziam: “{c.boato}”</p>}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PageLayout>
  )
}
