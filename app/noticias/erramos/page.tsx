import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { todasAsCorrecoes } from '@/lib/jornal/dados'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Erramos',
  description: 'Todas as correções feitas pelo JBInforma em matérias já publicadas. Quando o jornal erra, corrige e avisa.',
}
export const revalidate = 60

export default async function ErramosPage() {
  const correcoes = await todasAsCorrecoes()
  return (
    <PageLayout>
      <CabecalhoJornal atual="outra" titulo="Erramos" olho="JBInforma · Correções" sobre="Quando o jornal erra, corrige e avisa aqui." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Por que esta página existe</h2>
            <p className="text-escola-cinza mt-2">Jornal sério não apaga o erro escondido. Arruma o texto, escreve o que mudou e deixa registrado.</p>
            <p className="text-sm text-escola-cinza mt-4">Achou um erro? <Link href="/noticias/pauta" className="text-escola-azul underline">Avise a redação</Link>.</p>
          </div>
          <div className="min-w-0">
            {correcoes.length === 0 ? (
              <div className="bg-white border border-dashed border-escola-cinza-claro p-6">
                <p className="font-semibold text-escola-preto">Nenhuma correção registrada até agora.</p>
                <p className="text-escola-cinza mt-1">Quando houver, ela aparece aqui e dentro da própria matéria.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {correcoes.map(c => (
                  <li key={c.id} className="bg-white border-l-4 border-amber-500 p-4">
                    <time className="font-mono text-[11px] text-escola-cinza">{formatDate(c.criadoEm)}</time>
                    <p className="text-escola-preto mt-1">{c.texto}</p>
                    <Link href={`/noticias/${c.slug}`} className="text-sm text-escola-azul hover:underline mt-2 inline-block">Matéria: {c.titulo}</Link>
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
