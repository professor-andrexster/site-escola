import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import FormularioPauta from '@/components/jornal/FormularioPauta'
import { publicadas, quadroPublico } from '@/lib/jornal/dados'
import { prisma } from '@/lib/db'
import { VINCULOS } from '@/lib/jornal/tipos'

export const metadata: Metadata = {
  title: 'Mande sua pauta',
  description: 'Sugira um assunto para o JBInforma investigar e acompanhe no quadro público até a matéria sair. Aberto a alunos, famílias e moradores de Carlos Chagas.',
}
export const revalidate = 60

export default async function PautaPage() {
  const quadro = await quadroPublico()
  // Pautas que ja viraram materia no ar: as ultimas, para fechar o ciclo com quem sugeriu.
  const feitas = (await publicadas({ limite: 200 })).filter(m => m.pautaId).slice(0, 6)
  const origem = feitas.length
    ? await prisma.jornal_pautas.findMany({ where: { id: { in: feitas.map(m => m.pautaId!) } }, select: { id: true, titulo: true } })
    : []
  const colunas = [
    { chave: 'sugerida', nome: 'Na fila', vazio: 'Nenhuma pauta esperando.' },
    { chave: 'apurando', nome: 'Apurando', vazio: 'Ninguém apurando agora.' },
  ] as const

  return (
    <PageLayout>
      <CabecalhoJornal atual="pauta" titulo="Mande sua pauta" olho="JBInforma · Pauta aberta" sobre="Você diz o assunto. A equipe apura. Todo mundo acompanha." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Como funciona</h2>
            <ol className="mt-4 space-y-3 text-escola-preto">
              {['Você escreve o assunto aqui, sem cadastro.', 'A redação lê e, se der matéria, coloca no quadro.', 'Um repórter pega a pauta e vai ouvir as pessoas.', 'O professor monitor revisa e a matéria sai no jornal.'].map((t, i) => (
                <li key={t} className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-escola-azul text-white text-xs font-bold flex items-center justify-center">{i + 1}</span><span className="text-sm">{t}</span></li>
              ))}
            </ol>
            <p className="text-sm text-escola-cinza mt-5">Vale assunto da escola, do bairro e da cidade. Também vale boato para o <Link href="/noticias/e-verdade" className="text-escola-azul underline">É verdade?</Link> e erro que você achou em matéria nossa.</p>
            <p className="text-sm text-escola-cinza mt-3">Denúncia grave ou caso de urgência não é com o jornal: procure a direção da escola ou o Conselho Tutelar.</p>
          </div>
          <div className="min-w-0"><FormularioPauta /></div>
        </section>

        <section className="mt-16 pt-12 border-t border-escola-cinza-claro">
          <h2 className="font-playfair text-2xl font-bold text-escola-azul mb-6 text-center">Quadro de pautas</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {colunas.map(c => {
              const lista = quadro.filter(p => p.coluna === c.chave)
              return (
                <div key={c.chave} className="bg-white border border-escola-cinza-claro p-5">
                  <p className="section-label mb-3">{c.nome} ({lista.length})</p>
                  {lista.length === 0 ? <p className="text-sm text-escola-cinza">{c.vazio}</p> : (
                    <ul className="space-y-3">
                      {lista.map(p => (
                        <li key={p.id} className="border-l-2 border-escola-azul pl-3">
                          <p className="text-sm font-semibold text-escola-preto">{p.titulo}</p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza mt-0.5">
                            {p.origem === 'equipe' ? 'sugestão da equipe' : `sugestão de ${p.nome ?? 'leitor'}${p.vinculo ? ` · ${VINCULOS[p.vinculo]}` : ''}`}
                            {p.responsavelNome ? ` · com ${p.responsavelNome}` : ''}
                          </p>
                          {p.resposta && <p className="text-sm text-escola-cinza mt-1">Redação: {p.resposta}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
            <div className="bg-white border border-escola-cinza-claro p-5">
              <p className="section-label mb-3">Virou matéria ({feitas.length})</p>
              {feitas.length === 0 ? <p className="text-sm text-escola-cinza">As primeiras pautas ainda estão a caminho.</p> : (
                <ul className="space-y-3">
                  {feitas.map(m => (
                    <li key={m.id} className="border-l-2 border-green-700 pl-3">
                      <Link href={`/noticias/${m.slug}`} className="text-sm font-semibold text-escola-preto hover:text-escola-azul">{m.titulo}</Link>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza mt-0.5">pauta: {origem.find(o => o.id === m.pautaId)?.titulo ?? 'sugestão de leitor'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
