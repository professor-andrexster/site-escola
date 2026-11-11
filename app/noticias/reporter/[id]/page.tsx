import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import CartaoMateria from '@/components/jornal/CartaoMateria'
import { reporterPublico } from '@/lib/jornal/dados'

export const revalidate = 60
interface Props { params: Promise<{ id: string }> }

const carregar = (id: string) => (/^[0-9a-f-]{36}$/i.test(id) ? reporterPublico(id) : null)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await carregar((await params).id)
  // Pagina de estudante menor de idade: fica fora dos buscadores.
  return r ? { title: `${r.nome}, repórter do JBInforma`, robots: { index: false, follow: true } } : { title: 'Repórter não encontrado' }
}

/** Página do repórter: só primeiro nome e turma, e só enquanto o termo do responsável vale. */
export default async function ReporterPage({ params }: Props) {
  const r = await carregar((await params).id)
  if (!r) notFound()
  const checagens = r.materias.filter(m => m.tipo === 'checagem').length
  const numeros = [
    { n: r.materias.length, rotulo: r.materias.length === 1 ? 'matéria publicada' : 'matérias publicadas' },
    { n: checagens, rotulo: checagens === 1 ? 'checagem de boato' : 'checagens de boato' },
    { n: r.episodios, rotulo: r.episodios === 1 ? 'episódio do podcast' : 'episódios do podcast' },
    { n: r.materias.reduce((s, m) => s + m.fontes.length, 0), rotulo: 'pessoas e fontes ouvidas' },
  ]
  return (
    <PageLayout>
      <CabecalhoJornal atual="outra" titulo={r.nome} olho="JBInforma · Repórter" sobre="Estudante da Escola Estadual Dr. João Beraldo e repórter do jornal." />
      <div className="container mx-auto px-4 py-12">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {numeros.map(x => (
            <li key={x.rotulo} className="bg-white border border-escola-cinza-claro p-5 text-center">
              <p className="font-playfair text-4xl font-black text-escola-azul">{x.n}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-escola-cinza mt-1">{x.rotulo}</p>
            </li>
          ))}
        </ul>
        {r.materias.length === 0 ? (
          <p className="text-center text-escola-cinza">A primeira matéria ainda está na redação. <Link href="/noticias" className="text-escola-azul underline">Ver o jornal</Link>.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {r.materias.map(m => <CartaoMateria key={m.id} m={m} />)}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
