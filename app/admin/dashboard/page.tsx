import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect, ROLE_LABELS, ROLE_COLORS } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { quizMatchesTurma } from '@/lib/turmas'
import Link from 'next/link'
import Avatar from '@/components/admin/ui/Avatar'
import {
  Star, Inbox, Gamepad2,
  Users, Trophy, BookOpen, TrendingUp, DoorOpen, Play, UserCheck,
} from 'lucide-react'

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string; href?: string
}) {
  const content = (
    <div className="group panel-interativo p-fluid-xs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</p>
          <p className="text-fluid-3xl font-black text-gray-900 mt-1 leading-none">{value}</p>
        </div>
        <div className={`p-3 rounded-xl transition-transform duration-200 ease-out group-hover:scale-105 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { user, profile } = await getProfileOrRedirect()

  if (profile.role === 'aluno' || profile.role === 'monitor') {
    const [{ count: quizzesFeitos }, { data: ultimasRespostas }, { data: allQuizzes }, { count: cursosConcluidos }] = await Promise.all([
      supabase.from('quiz_participantes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('concluido', true),
      supabase.from('quiz_participantes')
        .select('*, quizzes(titulo, codigo)')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .order('created_at', { ascending: false })
        .limit(5),
      // Quizzes disponíveis (lobby aberto ou em andamento)
      supabase.from('quizzes')
        .select('id, titulo, codigo, turma_alvo, lobby_aberto, ativo, tempo_por_pergunta, quiz_perguntas(id)')
        .eq('encerrado', false)
        .or('lobby_aberto.eq.true,ativo.eq.true'),
      supabase.from('certificados').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    // Filtra os quizzes que são para a turma do aluno
    const quizzesDisponiveis = (allQuizzes ?? []).filter(q =>
      quizMatchesTurma(q.turma_alvo, profile.turma)
    )

    // Verifica em quais o aluno já está inscrito
    const quizIds = quizzesDisponiveis.map(q => q.id)
    const { data: participacoes } = quizIds.length > 0
      ? await supabase.from('quiz_participantes').select('id, quiz_id, concluido').eq('user_id', user.id).in('quiz_id', quizIds)
      : { data: [] }

    const participacaoMap = Object.fromEntries((participacoes ?? []).map(p => [p.quiz_id, p]))

    return (
      <div>
        <div className="flex items-center justify-between gap-4 mb-fluid-s">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar nome={profile.nome_completo} avatarUrl={profile.avatar_url} role={profile.role} tamanho="lg" className="hidden sm:flex" />
            <div className="min-w-0">
              <p className="text-gray-400 text-sm font-mono">Bem-vindo de volta,</p>
              <h1 className="text-fluid-3xl font-black text-gray-900 font-playfair truncate">{profile.nome_completo}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{profile.turma}</p>
            </div>
          </div>
          <span className={`flex-shrink-0 text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${ROLE_COLORS[profile.role]}`}>
            {ROLE_LABELS[profile.role]}
          </span>
        </div>

        {/* Quizzes disponíveis para a turma */}
        {quizzesDisponiveis.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-escola-azul" />
              Quiz da Sua Turma
            </h2>
            <div className="space-y-3">
              {quizzesDisponiveis.map(q => {
                const part = participacaoMap[q.id]
                return (
                  <div key={q.id} className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${q.ativo ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {q.ativo
                          ? <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          : <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        }
                        <p className="font-semibold text-gray-900">{q.titulo}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(q.quiz_perguntas as { id: string }[])?.length ?? 0} perguntas · {q.tempo_por_pergunta}s/pergunta
                      </p>
                      <p className="text-xs mt-1">
                        {q.ativo
                          ? <span className="text-green-700 font-semibold">Em andamento</span>
                          : <span className="text-blue-700 font-semibold">Sala aberta, aguardando início</span>
                        }
                      </p>
                    </div>
                    {part ? (
                      part.concluido ? (
                        <Link
                          href={`/quiz/${q.codigo}/${part.id}/resultado`}
                          className="px-4 py-2 bg-gray-600 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors flex-shrink-0"
                        >
                          Ver resultado
                        </Link>
                      ) : (
                        <Link
                          href={`/quiz/${q.codigo}/${part.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex-shrink-0 flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Continuar
                        </Link>
                      )
                    ) : (
                      <Link
                        href={`/quiz?codigo=${q.codigo}`}
                        className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0 flex items-center gap-1.5 ${q.ativo ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        <DoorOpen className="w-3.5 h-3.5" />
                        Entrar na Sala
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="@container mb-fluid-s">
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-5">
            <StatCard label="Quizzes Feitos" value={quizzesFeitos ?? 0} icon={Gamepad2} color="bg-escola-azul/10 text-escola-azul" href="/admin/meus-quizzes" />
            <StatCard label="Cursos Concluídos" value={cursosConcluidos ?? 0} icon={BookOpen} color="bg-escola-azul/10 text-escola-azul" href="/admin/cursos" />
          </div>
        </div>

        <div className="panel p-fluid-s">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Últimos Quizzes
          </h2>
          {ultimasRespostas && ultimasRespostas.length > 0 ? (
            <div className="space-y-3">
              {ultimasRespostas.map((p: { id: string; pontuacao_total: number; quizzes: { titulo: string; codigo: string } | null; created_at: string }) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.quizzes?.titulo ?? 'Quiz'}</p>
                    <p className="text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-escola-azul">{p.pontuacao_total} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">Você ainda não participou de nenhum quiz.</p>
          )}
          <Link href="/ranking" className="block mt-4 text-center text-escola-azul text-sm font-semibold hover:underline">
            Ver ranking geral →
          </Link>
        </div>
      </div>
    )
  }

  // Professor e gestão
  const podeAprovarAlunos = profile.role === 'professor' || isGestao(profile.role)
  const [
    { count: totalQuizzes },
    { count: totalParticipantes },
    { count: leadsNaoLidos },
    { count: usuariosPendentes },
    { count: alunosPendentes },
  ] = await Promise.all([
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_participantes').select('*', { count: 'exact', head: true }).eq('concluido', true),
    isGestao(profile.role)
      ? supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lido', false)
      : Promise.resolve({ count: 0 }),
    isGestao(profile.role)
      ? supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('aprovado', false)
      : Promise.resolve({ count: 0 }),
    podeAprovarAlunos
      ? supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'aluno').eq('aprovado', false)
      : Promise.resolve({ count: 0 }),
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-fluid-s">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar nome={profile.nome_completo} avatarUrl={profile.avatar_url} role={profile.role} tamanho="lg" className="hidden sm:flex" />
          <div className="min-w-0">
            <p className="text-gray-400 text-sm font-mono">Bem-vindo,</p>
            <h1 className="text-fluid-3xl font-black text-gray-900 font-playfair truncate">{profile.nome_completo}</h1>
            {profile.disciplina && <p className="text-gray-500 text-sm mt-0.5">{profile.disciplina}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${ROLE_COLORS[profile.role]}`}>
            {ROLE_LABELS[profile.role]}
          </span>
          {isGestao(profile.role) && usuariosPendentes! > 0 && (
            <Link href="/admin/usuarios" className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors">
              <Users className="w-3.5 h-3.5" />
              {usuariosPendentes} pendente{usuariosPendentes !== 1 ? 's' : ''}
            </Link>
          )}
          {podeAprovarAlunos && alunosPendentes! > 0 && (
            <Link href="/admin/aprovacoes" className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors">
              <UserCheck className="w-3.5 h-3.5" />
              {alunosPendentes} aluno{alunosPendentes !== 1 ? 's' : ''} aguardando
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="@container mb-fluid-s">
        <div className="grid grid-cols-2 @lg:grid-cols-4 gap-4">
          <StatCard label="Quizzes" value={totalQuizzes ?? 0} icon={Gamepad2} color="bg-escola-azul/10 text-escola-azul" href="/admin/quiz" />
          <StatCard label="Participações" value={totalParticipantes ?? 0} icon={TrendingUp} color="bg-escola-azul/10 text-escola-azul" />
          {isGestao(profile.role) && (
            <>
              <StatCard label="Leads" value={leadsNaoLidos ?? 0} icon={Inbox} color="bg-escola-azul/10 text-escola-azul" href="/admin/leads" />
              <StatCard label="Usuários Pendentes" value={usuariosPendentes ?? 0} icon={Users} color="bg-amber-50 text-amber-600" href="/admin/usuarios" />
            </>
          )}
          {!isGestao(profile.role) && podeAprovarAlunos && (
            <StatCard label="Alunos Aguardando" value={alunosPendentes ?? 0} icon={UserCheck} color="bg-amber-50 text-amber-600" href="/admin/aprovacoes" />
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="panel p-fluid-s">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/quiz/novo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-escola-azul/5 hover:shadow-elevation-low hover:-translate-y-0.5 transition-all duration-200 ease-out group">
            <Gamepad2 className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Novo Quiz</span>
          </Link>
          <Link href="/ranking" target="_blank" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-escola-azul/5 hover:shadow-elevation-low hover:-translate-y-0.5 transition-all duration-200 ease-out group">
            <Trophy className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Ver Ranking</span>
          </Link>
          {isGestao(profile.role) && (
            <Link href="/admin/usuarios" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-escola-azul/5 hover:shadow-elevation-low hover:-translate-y-0.5 transition-all duration-200 ease-out group">
              <Users className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
              <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Usuários</span>
            </Link>
          )}
          {podeAprovarAlunos && (
            <Link href="/admin/aprovacoes" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-escola-azul/5 hover:shadow-elevation-low hover:-translate-y-0.5 transition-all duration-200 ease-out group">
              <UserCheck className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
              <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Aprovações</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
