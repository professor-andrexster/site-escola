import type { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/components/PageLayout'
import CabecalhoJornal from '@/components/jornal/CabecalhoJornal'
import { CHECKLIST } from '@/lib/jornal/tipos'

export const metadata: Metadata = {
  title: 'Como o jornal é feito',
  description: 'As regras do JBInforma: quem escreve, quem revisa, como as fontes são ouvidas, o que o jornal não publica e como corrige erros.',
}

const REGRAS = [
  { t: 'Quem escreve', d: 'Alunos da escola, com autorização assinada pelo responsável. No site aparece só o primeiro nome e a turma.' },
  { t: 'Quem revisa', d: 'Um professor monitor lê toda matéria antes de publicar. Nada vai ao ar sem essa leitura.' },
  { t: 'Gente daqui', d: 'Toda matéria ouve pelo menos uma pessoa da escola, do bairro ou da cidade. No fim do texto está a lista de quem foi ouvido.' },
  { t: 'Checagem de boato', d: 'Só saúde, golpes, concursos e vagas, serviços públicos e prazos. O jornal não checa político, partido nem eleição.' },
  { t: 'O que não sai', d: 'Telefone, endereço e documento de ninguém. Foto de criança sem o responsável saber. Acusação sem ouvir o outro lado.' },
  { t: 'Quando erramos', d: 'O texto é corrigido e a correção fica escrita na matéria e na página Erramos.' },
]

export default function ComoFazemosPage() {
  return (
    <PageLayout>
      <CabecalhoJornal atual="outra" titulo="Como o jornal é feito" olho="JBInforma · Regras da redação" sobre="O combinado entre a equipe e quem lê." />
      <div className="container mx-auto px-4 py-12">
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] mb-14">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">Seis combinados</h2>
            <p className="text-escola-cinza mt-2">O JBInforma é um projeto pedagógico da Escola Estadual Dr. João Beraldo. Estas regras valem para toda matéria.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 min-w-0">
            {REGRAS.map(r => (
              <li key={r.t} className="bg-white border-l-4 border-escola-azul p-4">
                <p className="font-semibold text-escola-preto">{r.t}</p>
                <p className="text-sm text-escola-cinza mt-1">{r.d}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] border-t border-escola-cinza-claro pt-12">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-escola-azul">A conferência do repórter</h2>
            <p className="text-escola-cinza mt-2">Antes de mandar o texto ao monitor, o repórter marca cada item desta lista. Sem todos marcados, a matéria não sai da mesa dele.</p>
            <p className="text-sm text-escola-cinza mt-4"><Link href="/noticias/pauta" className="text-escola-azul underline">Sugerir uma pauta</Link> · <Link href="/noticias/erramos" className="text-escola-azul underline">Erramos</Link></p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 min-w-0">
            {([['materia', 'Numa matéria'], ['checagem', 'Numa checagem de boato']] as const).map(([k, nome]) => (
              <div key={k} className="bg-white border border-escola-cinza-claro p-5">
                <p className="section-label mb-3">{nome}</p>
                <ul className="space-y-2">
                  {CHECKLIST[k].map(i => <li key={i.chave} className="flex gap-2 text-sm text-escola-preto"><span className="text-green-700 font-bold" aria-hidden="true">✓</span>{i.texto}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
