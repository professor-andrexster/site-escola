import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, FileDown, Megaphone } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import CartaoMateria, { Etiqueta } from '@/components/jornal/CartaoMateria'
import { CATEGORIAS, type CategoriaKey } from '@/lib/categorias'
import { assinaturas, publicadas, quadroPublico, servicosVigentes, ultimaEdicao } from '@/lib/jornal/dados'
import { EDITORIAS, dataCurta, ehEditoria, periodoDaEdicao, type Editoria } from '@/lib/jornal/tipos'
import { COR_EDITORIA, COR_VEREDITO } from '@/components/jornal/estilos'

export const metadata: Metadata = {
  title: 'JBInforma',
  description: 'O jornal feito pelos alunos da Escola Estadual Dr. João Beraldo, em Carlos Chagas (MG): notícias da escola, do bairro e da cidade, checagem de boatos e edição da semana.',
}
export const revalidate = 60

const ASSUNTOS = Object.keys(CATEGORIAS) as CategoriaKey[]
const chip = (ativo: boolean, cor = 'bg-escola-azul text-white border-escola-azul') =>
  `flex-shrink-0 font-mono text-xs uppercase tracking-widest px-4 py-1.5 border transition-colors ${ativo ? cor : 'bg-white text-escola-cinza border-escola-cinza-claro hover:border-escola-azul hover:text-escola-azul'}`

export default async function NoticiasPage({ searchParams }: { searchParams: Promise<{ categoria?: string; editoria?: string }> }) {
  const sp = await searchParams
  const editoria: Editoria | null = ehEditoria(sp.editoria) ? sp.editoria : null
  const categoria = !editoria && ASSUNTOS.includes(sp.categoria as CategoriaKey) ? (sp.categoria as CategoriaKey) : null
  const filtrando = Boolean(editoria || categoria)

  const materias = await publicadas({ editoria, categoria })
  const [nomes, edicao, servicos, quadro] = await Promise.all([
    assinaturas(materias.map(m => m.autorId)),
    filtrando ? null : ultimaEdicao(),
    filtrando ? [] : servicosVigentes(3),
    filtrando ? [] : quadroPublico(),
  ])
  const quem = (id: string | null) => (id ? nomes.get(id)?.nome ?? null : null)

  const checagens = filtrando ? [] : materias.filter(m => m.tipo === 'checagem').slice(0, 3)
  const noticias = filtrando ? materias : materias.filter(m => m.tipo === 'materia' || m.tipo === 'memoria')
  const [manchete, ...resto] = noticias
  const primeiras = filtrando ? noticias : resto.slice(0, 6)
  const demais = filtrando ? [] : resto.slice(6)

  return (
    <PageLayout>
      <CabecalhoJornal atual="ultimas" sobre="O jornal feito pelos alunos. Toda matéria ouve gente daqui." />

      <div className="bg-white border-b border-escola-cinza-claro sticky top-[104px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            <Link href="/noticias" className={chip(!filtrando)}>Todas</Link>
            {(Object.keys(EDITORIAS) as Editoria[]).map(k => (
              <Link key={k} href={`/noticias?editoria=${k}`} className={chip(editoria === k, COR_EDITORIA[k])}>{EDITORIAS[k].nome}</Link>
            ))}
            <span className="flex-shrink-0 w-px h-5 bg-escola-cinza-claro mx-1" aria-hidden="true" />
            {ASSUNTOS.map(k => (
              <Link key={k} href={`/noticias?categoria=${k}`} className={chip(categoria === k, `${CATEGORIAS[k].bg} ${CATEGORIAS[k].text} ${CATEGORIAS[k].border}`)}>{CATEGORIAS[k].label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {edicao && (
          <section className="mb-10 border-y-2 border-escola-azul bg-white px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex-1 min-w-[16rem]">
              <p className="section-label mb-1">Edição da semana · nº {edicao.numero}</p>
              <p className="font-playfair text-xl md:text-2xl font-bold text-escola-azul">{edicao.titulo}</p>
              <p className="font-mono text-xs text-escola-cinza mt-1">{periodoDaEdicao(edicao)}</p>
            </div>
            <Link href={`/noticias/edicao/${edicao.numero}`} className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors">Ler a edição</Link>
            <a href={`/noticias/edicao/${edicao.numero}/pdf`} className="inline-flex items-center gap-2 border border-escola-azul text-escola-azul px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul hover:text-white transition-colors"><FileDown className="w-4 h-4" /> Folha para imprimir</a>
          </section>
        )}

        {noticias.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-escola-cinza text-lg">
              {editoria ? `Nenhuma matéria de ${EDITORIAS[editoria].nome} ainda.` : categoria ? `Nenhuma notícia em ${CATEGORIAS[categoria].label} ainda.` : 'Nenhuma notícia publicada ainda.'}
            </p>
            {filtrando && <Link href="/noticias" className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors mt-4 inline-block">Ver todas as notícias →</Link>}
          </div>
        ) : (
          <>
            {!filtrando && manchete && <div className="mb-10"><CartaoMateria m={manchete} assinatura={quem(manchete.autorId)} grande /></div>}
            {filtrando && editoria && <p className="font-serif text-escola-cinza mb-6">{EDITORIAS[editoria].desc}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {primeiras.map(m => <CartaoMateria key={m.id} m={m} assinatura={quem(m.autorId)} />)}
            </div>
          </>
        )}

        {!filtrando && (
          <>
            <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mt-16 pt-12 border-t border-escola-cinza-claro">
              <div>
                <BadgeCheck className="w-8 h-8 text-escola-vermelho mb-3" />
                <h2 className="font-playfair text-2xl font-bold text-escola-azul">É verdade?</h2>
                <p className="text-escola-cinza mt-2">Chegou no grupo e ninguém sabe se é verdade? A equipe confere com quem sabe e mostra o passo a passo.</p>
                <Link href="/noticias/e-verdade" className="font-mono text-xs uppercase tracking-widest text-escola-vermelho hover:text-escola-azul transition-colors mt-4 inline-block">Todas as checagens →</Link>
              </div>
              <div className="min-w-0">
                {checagens.length > 0 ? (
                  <ul className="space-y-3">
                    {checagens.map(c => (
                      <li key={c.id}>
                        <Link href={`/noticias/${c.slug}`} className={`block bg-white border-l-4 ${c.veredito ? COR_VEREDITO[c.veredito].borda : 'border-slate-600'} p-4 card-lift`}>
                          <Etiqueta m={c} />
                          <p className="font-playfair font-bold text-lg text-escola-preto mt-2">{c.titulo}</p>
                          {c.boato && <p className="text-sm text-escola-cinza mt-1 line-clamp-2">O que diziam: {c.boato}</p>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-white border border-dashed border-escola-cinza-claro p-6">
                    <p className="font-semibold text-escola-preto">A primeira checagem está sendo apurada.</p>
                    <p className="text-escola-cinza mt-1">Viu um boato sobre saúde, golpe, concurso ou prazo de serviço público? <Link href="/noticias/pauta" className="text-escola-azul underline">Mande para a redação</Link>.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mt-16 pt-12 border-t border-escola-cinza-claro">
              <div>
                <Megaphone className="w-8 h-8 text-escola-vermelho mb-3" />
                <h2 className="font-playfair text-2xl font-bold text-escola-azul">Mande sua pauta</h2>
                <p className="text-escola-cinza mt-2">O jornal é da escola e da cidade. Diga o que a equipe deveria investigar e acompanhe até a matéria sair.</p>
                <Link href="/noticias/pauta" className="inline-flex items-center gap-2 bg-escola-azul text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-escola-azul-medio transition-colors mt-4">Sugerir um assunto</Link>
              </div>
              <div className="min-w-0 grid gap-4 sm:grid-cols-2">
                <div className="bg-white border border-escola-cinza-claro p-5">
                  <p className="section-label mb-2">Na fila e em apuração</p>
                  {quadro.length > 0 ? (
                    <ul className="space-y-2">{quadro.slice(0, 4).map(p => <li key={p.id} className="text-sm text-escola-preto"><span className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza mr-2">{p.coluna === 'apurando' ? 'apurando' : 'na fila'}</span>{p.titulo}</li>)}</ul>
                  ) : <p className="text-sm text-escola-cinza">Nenhuma pauta aberta agora. A sua pode ser a primeira.</p>}
                </div>
                <div className="bg-white border border-escola-cinza-claro p-5">
                  <p className="section-label mb-2">Serviço: vale esta semana</p>
                  {servicos.length > 0 ? (
                    <ul className="space-y-2">{servicos.map(s => <li key={s.id} className="text-sm"><Link href={`/noticias/${s.slug}`} className="text-escola-preto hover:text-escola-azul">{s.titulo}</Link>{s.validoAte && <span className="block font-mono text-[10px] uppercase tracking-wider text-escola-cinza">até {dataCurta(s.validoAte)}</span>}</li>)}</ul>
                  ) : <p className="text-sm text-escola-cinza">Nenhum aviso com prazo no momento. <Link href="/noticias/servico" className="text-escola-azul underline">Ver o mural</Link>.</p>}
                </div>
              </div>
            </section>

            {demais.length > 0 && (
              <section className="mt-16 pt-12 border-t border-escola-cinza-claro">
                <h2 className="font-playfair text-2xl font-bold text-escola-azul mb-6">Mais notícias</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demais.map(m => <CartaoMateria key={m.id} m={m} assinatura={quem(m.autorId)} />)}
                </div>
              </section>
            )}

            <p className="text-center text-sm text-escola-cinza mt-16">
              <Link href="/noticias/como-fazemos" className="underline hover:text-escola-azul">Como o jornal é feito</Link> · <Link href="/noticias/erramos" className="underline hover:text-escola-azul">Erramos</Link> · <Link href="/noticias/edicoes" className="underline hover:text-escola-azul">Edições anteriores</Link>
            </p>
          </>
        )}
      </div>
    </PageLayout>
  )
}
