import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { servicosVigentes } from '@/lib/jornal/dados'
import { EDITORIAS, dataCurta } from '@/lib/jornal/tipos'

export const metadata: Metadata = {
  title: 'Serviço: prazos e avisos',
  description: 'Mural de serviço do JBInforma: inscrições, prazos, campanhas e horários que valem agora na escola e em Carlos Chagas, conferidos em fonte oficial.',
}
export const revalidate = 60

export default async function ServicoPage() {
  const itens = await servicosVigentes()
  return (
    <PageLayout>
      <CabecalhoJornal atual="servico" titulo="Serviço" olho="JBInforma · Mural de prazos" sobre="O que tem data para acabar: inscrição, campanha, matrícula, horário." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Vale agora</h2>
            <p className="text-escola-cinza mt-2">Cada aviso vem de fonte oficial e tem data de validade. Quando o prazo passa, ele sai do mural sozinho.</p>
            <p className="text-sm text-escola-cinza mt-4">Sabe de um prazo que a comunidade precisa conhecer? <Link href="/noticias/pauta" className="text-escola-azul underline">Avise a redação</Link>.</p>
          </div>
          <div className="min-w-0">
            {itens.length === 0 ? (
              <div className="bg-white border border-dashed border-escola-cinza-claro p-6">
                <p className="font-semibold text-escola-preto">Nenhum aviso com prazo aberto no momento.</p>
                <p className="text-escola-cinza mt-1">Volte durante a semana ou leia as <Link href="/noticias" className="text-escola-azul underline">últimas notícias</Link>.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {itens.map(s => (
                  <li key={s.id}>
                    <Link href={`/noticias/${s.slug}`} className="grid grid-cols-[5.5rem_1fr] gap-4 bg-white border border-escola-cinza-claro p-4 card-lift">
                      <div className="bg-escola-azul text-white text-center py-2 self-start">
                        <span className="block font-mono text-[10px] uppercase tracking-widest opacity-80">{s.validoAte ? 'até' : 'sem prazo'}</span>
                        {s.validoAte && <span className="block font-playfair font-bold text-sm leading-tight px-1">{dataCurta(s.validoAte)}</span>}
                      </div>
                      <div className="min-w-0">
                        {s.editoria && <span className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza">{EDITORIAS[s.editoria].nome}</span>}
                        <p className="font-playfair font-bold text-lg text-escola-preto">{s.titulo}</p>
                        {s.resumo && <p className="text-sm text-escola-cinza mt-1 line-clamp-2">{s.resumo}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
