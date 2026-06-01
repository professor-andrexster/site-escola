import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import { Trophy, Gamepad2, Medal } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meus Quizzes' }
export const dynamic = 'force-dynamic'

export default async function MeusQuizzesPage() {
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  const { data: participacoes } = await supabase
    .from('quiz_participantes')
    .select('*, quizzes(titulo, codigo, encerrado), quiz_respostas(correta)')
    .eq('user_id', user.id)
    .eq('concluido', true)
    .order('created_at', { ascending: false })

  const totalPontos = participacoes?.reduce((s, p) => s + p.pontuacao_total, 0) ?? 0
  const melhorPontuacao = participacoes?.reduce((max, p) => Math.max(max, p.pontuacao_total), 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meus Quizzes</h1>
      <p className="text-gray-500 text-sm mb-6">Histórico das suas participações</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-escola-azul">{participacoes?.length ?? 0}</div>
          <div className="text-xs text-gray-400 font-mono uppercase mt-1">quizzes</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-purple-600">{totalPontos}</div>
          <div className="text-xs text-gray-400 font-mono uppercase mt-1">pontos totais</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-yellow-500">{melhorPontuacao}</div>
          <div className="text-xs text-gray-400 font-mono uppercase mt-1">melhor score</div>
        </div>
      </div>

      {!participacoes || participacoes.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Gamepad2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Você ainda não participou de nenhum quiz.</p>
          <Link href="/quiz" className="inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Gamepad2 className="w-4 h-4" />
            Participar de um Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {participacoes.map((p, i) => {
            const acertos = (p.quiz_respostas as { correta: boolean }[])?.filter(r => r.correta).length ?? 0
            const total = (p.quiz_respostas as { correta: boolean }[])?.length ?? 0
            const pct = total > 0 ? Math.round((acertos / total) * 100) : 0

            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-escola-azul/10 flex items-center justify-center flex-shrink-0">
                  {i === 0 ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Medal className="w-5 h-5 text-escola-azul" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{(p.quizzes as { titulo: string } | null)?.titulo ?? 'Quiz'}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')} · {acertos}/{total} acertos ({pct}%)
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-black text-xl text-escola-azul">{p.pontuacao_total}</div>
                  <div className="text-gray-400 text-xs">pontos</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/ranking" className="font-mono text-xs uppercase tracking-widest text-escola-azul hover:underline inline-flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          Ver Ranking Geral
        </Link>
      </div>
    </div>
  )
}
