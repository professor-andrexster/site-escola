import { createClient } from '@/lib/supabase/server'
import { getProfileOrRedirect, ROLE_LABELS, ROLE_COLORS } from '@/lib/profile'
import Link from 'next/link'
import {
  Newspaper, Eye, Star, Plus, Inbox, Gamepad2,
  Users, Trophy, BookOpen, TrendingUp,
} from 'lucide-react'

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string; href?: string
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
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

  if (profile.role === 'aluno') {
    const [{ count: quizzesFeitos }, { data: ultimasRespostas }] = await Promise.all([
      supabase.from('quiz_participantes').select('*', { count: 'exact', head: true }).eq('nome', profile.nome_completo).eq('concluido', true),
      supabase.from('quiz_participantes')
        .select('*, quizzes(titulo, codigo)')
        .eq('concluido', true)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-400 text-sm font-mono">Bem-vindo de volta,</p>
            <h1 className="text-3xl font-black text-gray-900 font-playfair">{profile.nome_completo}</h1>
          </div>
          <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${ROLE_COLORS[profile.role]}`}>
            {ROLE_LABELS[profile.role]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <StatCard label="Quizzes Feitos" value={quizzesFeitos ?? 0} icon={Gamepad2} color="bg-purple-50 text-purple-600" href="/admin/meus-quizzes" />
          <StatCard label="Minha Turma" value={0} icon={BookOpen} color="bg-green-50 text-green-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
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
          <Link href="/quiz" className="block mt-4 text-center text-escola-azul text-sm font-semibold hover:underline">
            Participar de um quiz →
          </Link>
        </div>
      </div>
    )
  }

  // Professor e Direção
  const [
    { count: totalNoticias },
    { count: noticiasPublicadas },
    { count: totalQuizzes },
    { count: totalParticipantes },
    { count: leadsNaoLidos },
    { count: usuariosPendentes },
  ] = await Promise.all([
    supabase.from('noticias').select('*', { count: 'exact', head: true }),
    supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('publicado', true),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_participantes').select('*', { count: 'exact', head: true }).eq('concluido', true),
    profile.role === 'direcao'
      ? supabase.from('leads').select('*', { count: 'exact', head: true }).eq('lido', false)
      : Promise.resolve({ count: 0 }),
    profile.role === 'direcao'
      ? supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('aprovado', false)
      : Promise.resolve({ count: 0 }),
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-gray-400 text-sm font-mono">Bem-vindo,</p>
          <h1 className="text-3xl font-black text-gray-900 font-playfair">{profile.nome_completo}</h1>
          {profile.disciplina && <p className="text-gray-500 text-sm mt-0.5">{profile.disciplina}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${ROLE_COLORS[profile.role]}`}>
            {ROLE_LABELS[profile.role]}
          </span>
          {usuariosPendentes! > 0 && (
            <Link href="/admin/usuarios" className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors">
              <Users className="w-3.5 h-3.5" />
              {usuariosPendentes} pendente{usuariosPendentes !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Notícias" value={totalNoticias ?? 0} icon={Newspaper} color="bg-blue-50 text-escola-azul" href="/admin/noticias" />
        <StatCard label="Publicadas" value={noticiasPublicadas ?? 0} icon={Eye} color="bg-green-50 text-green-600" href="/admin/noticias" />
        <StatCard label="Quizzes" value={totalQuizzes ?? 0} icon={Gamepad2} color="bg-purple-50 text-purple-600" href="/admin/quiz" />
        <StatCard label="Participações" value={totalParticipantes ?? 0} icon={TrendingUp} color="bg-orange-50 text-orange-600" />
        {profile.role === 'direcao' && (
          <>
            <StatCard label="Leads" value={leadsNaoLidos ?? 0} icon={Inbox} color="bg-indigo-50 text-indigo-600" href="/admin/leads" />
            <StatCard label="Usuários Pendentes" value={usuariosPendentes ?? 0} icon={Users} color="bg-yellow-50 text-yellow-600" href="/admin/usuarios" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/noticias/nova" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-escola-azul hover:bg-blue-50 transition-all group">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-escola-azul" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-escola-azul text-center">Nova Notícia</span>
          </Link>
          <Link href="/admin/quiz/novo" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group">
            <Gamepad2 className="w-6 h-6 text-gray-400 group-hover:text-purple-600" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-purple-600 text-center">Novo Quiz</span>
          </Link>
          <Link href="/ranking" target="_blank" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all group">
            <Trophy className="w-6 h-6 text-gray-400 group-hover:text-yellow-600" />
            <span className="text-xs font-semibold text-gray-500 group-hover:text-yellow-600 text-center">Ver Ranking</span>
          </Link>
          {profile.role === 'direcao' && (
            <Link href="/admin/usuarios" className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
              <Users className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
              <span className="text-xs font-semibold text-gray-500 group-hover:text-green-600 text-center">Usuários</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
