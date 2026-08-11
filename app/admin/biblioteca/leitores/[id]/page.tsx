import { buscarLeitor, emprestimosDoLeitor } from '@/lib/db/biblioteca'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, History } from 'lucide-react'
import LeitorForm from '@/components/admin/biblioteca/LeitorForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar Leitor, Biblioteca' }
export const dynamic = 'force-dynamic'

export default async function LeitorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const leitor = await buscarLeitor(id)
  if (!leitor) notFound()

  const emprestimos = await emprestimosDoLeitor(id)

  return (
    <div className="max-w-2xl">
      <Link href="/admin/biblioteca/leitores" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para leitores
      </Link>
      <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-6">{leitor.nome_completo}</h1>

      <div className="panel p-5 mb-6">
        <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-escola-azul" />
          Histórico de Empréstimos
        </h2>
        {emprestimos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum empréstimo registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {emprestimos.map(e => {
              const obra = e.biblioteca_exemplares?.biblioteca_obras
              return (
                <div key={e.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 py-2">
                  <span className="text-gray-700">{obra?.titulo ?? 'Obra'}</span>
                  <span className="text-xs text-gray-400">{e.situacao}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <LeitorForm leitor={leitor} />
    </div>
  )
}
