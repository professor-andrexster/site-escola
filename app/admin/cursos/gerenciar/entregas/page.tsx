import Link from 'next/link'
import { Award, Inbox } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { painelDeEntregas } from '@/lib/db/modulos'
import TabelaEntregas from '@/components/admin/TabelaEntregas'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Entregas e Certificados' }
export const dynamic = 'force-dynamic'

/**
 * Um lugar só para ver toda entrega de desafio final — de curso e de módulo —
 * e chegar no certificado de quem foi aprovado.
 *
 * Antes disso era preciso abrir curso por curso para descobrir se havia algo
 * esperando correção, e não existia tela nenhuma que listasse os certificados
 * emitidos.
 */
export default async function EntregasPage() {
  const { user, profile } = await getProfileOrRedirect()

  // Gestão vê tudo; professor vê o que avalia.
  const entregas = await painelDeEntregas(
    isGestao(profile.role) ? {} : { userId: user.id }
  )

  const pendentes = entregas.filter(e => e.status === 'entregue')
  const aprovadas = entregas.filter(e => e.status === 'aprovado')
  const recusadas = entregas.filter(e => e.status === 'recusado')

  return (
    <div className="max-w-5xl">
      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <Award className="w-6 h-6 text-escola-azul" />
        Entregas e Certificados
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Todos os projetos finais entregues — de curso e de módulo. Aprovar emite o certificado na
        hora; a coluna da direita leva ao documento para imprimir.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { rotulo: 'Esperando correção', valor: pendentes.length, cor: 'text-amber-700 bg-amber-50 border-amber-200' },
          { rotulo: 'Aprovadas', valor: aprovadas.length, cor: 'text-green-700 bg-green-50 border-green-200' },
          { rotulo: 'Devolvidas', valor: recusadas.length, cor: 'text-gray-600 bg-gray-50 border-gray-200' },
        ].map(c => (
          <div key={c.rotulo} className={`border rounded-xl px-4 py-3 ${c.cor}`}>
            <p className="text-2xl font-bold font-mono">{c.valor}</p>
            <p className="text-xs mt-0.5">{c.rotulo}</p>
          </div>
        ))}
      </div>

      {entregas.length === 0 ? (
        <div className="empty-state p-10 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Nenhuma entrega ainda. Quando um aluno enviar o projeto final de um curso ou de um
            módulo, ele aparece aqui.
          </p>
          <Link
            href="/admin/cursos/gerenciar"
            className="inline-block text-escola-azul text-sm mt-3 hover:underline"
          >
            Ver os cursos
          </Link>
        </div>
      ) : (
        <TabelaEntregas entregas={entregas} />
      )}
    </div>
  )
}
