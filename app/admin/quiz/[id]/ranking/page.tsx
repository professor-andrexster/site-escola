import { buscarPorId as buscarQuiz, participantesComRespostas, contarPerguntas } from '@/lib/db/quiz'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await buscarQuiz(id)
  return { title: data ? `Ranking: ${data.titulo}` : 'Ranking' }
}

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [quiz, participantesRaw, numPerguntas] = await Promise.all([
    buscarQuiz(id),
    participantesComRespostas(id),
    contarPerguntas(id),
  ])

  if (!quiz) notFound()

  // Pontuação calculada direto das respostas (fonte da verdade), sem depender
  // do celular do aluno ter finalizado o quiz
  type Resp = { correta: boolean; pontos_obtidos: number }
  const participantes = participantesRaw
    .map(p => {
      const respostas = (p.quiz_respostas ?? []) as Resp[]
      return {
        ...p,
        pontuacao_calculada: respostas.reduce((s, r) => s + (r.pontos_obtidos ?? 0), 0),
        total_respostas: respostas.length,
      }
    })
    .filter(p => p.total_respostas > 0)
    .sort((a, b) => b.pontuacao_calculada - a.pontuacao_calculada)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/quiz/${id}`} className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Ranking — {quiz.titulo}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Código: <span className="font-mono font-bold text-escola-azul">{quiz.codigo}</span>
            {' · '}
            {numPerguntas} perguntas
            {' · '}
            {participantes?.length ?? 0} participantes
          </p>
        </div>
      </div>

      {participantes.length === 0 ? (
        <div className="panel p-12 text-center text-gray-500">
          Nenhum aluno respondeu este quiz ainda.
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 w-16">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Turma</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Acertos</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Pontuação</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participantes.map((p, i) => {
                  const acertos = p.quiz_respostas?.filter((r: { correta: boolean }) => r.correta).length ?? 0
                  const medalColor = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-amber-700' : 'text-gray-300'

                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${i < 3 ? 'font-semibold' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        {i < 3 ? (
                          <Medal className={`w-5 h-5 mx-auto ${medalColor}`} />
                        ) : (
                          <span className="text-gray-500">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{p.nome}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{p.turma}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${acertos === numPerguntas ? 'text-green-600' : 'text-gray-700'}`}>
                          {acertos}/{numPerguntas}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-escola-azul text-base">{p.pontuacao_calculada}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs hidden md:table-cell">
                        {new Date(p.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
