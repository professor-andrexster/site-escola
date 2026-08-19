import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import { ArrowLeft, User, Award, Layers, BookOpen, Printer } from 'lucide-react'
import MeuPerfilForm from '@/components/admin/MeuPerfilForm'
import StaffPerfilForm from '@/components/admin/StaffPerfilForm'
import { certificadosDoAluno } from '@/lib/db/modulos'
import { buscarPorUsuario } from '@/lib/db/alunos'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu Perfil, Painel Escolar' }
export const dynamic = 'force-dynamic'

export default async function MeuPerfilPage() {
  const { user, profile } = await getProfileOrRedirect()

  return (
    <div>
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-escola-azul mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para dashboard
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <User className="w-6 h-6 text-escola-azul" />
        Meu Perfil
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {profile.role === 'aluno' ? 'Atualize seus dados de contato e responsável' : 'Atualize sua foto e seus dados'}
      </p>

      {profile.role === 'aluno' ? <PerfilDoAluno userId={user.id} /> : <StaffPerfilForm profile={profile} />}

      {/* Os certificados moram aqui porque é onde o aluno volta para procurar:
          "meu perfil" é o lugar dos documentos dele. Na página do curso o
          certificado também aparece, mas espalhado — um por curso. */}
      <MeusCertificados userId={user.id} />
    </div>
  )
}

/**
 * Busca a ficha no servidor e entrega pronta ao formulário.
 *
 * Sem isto o formulário abria vazio e buscava sozinho, piscando "Carregando..."
 * em toda visita — sendo que o servidor já sabe quem está logado.
 */
async function PerfilDoAluno({ userId }: { userId: string }) {
  const aluno = await buscarPorUsuario(userId)

  if (!aluno) {
    return (
      <div className="panel p-5">
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Sua conta ainda não está ligada a uma ficha de aluno. Procure a secretaria para completar
          seu cadastro.
        </p>
      </div>
    )
  }

  return <MeuPerfilForm aluno={aluno} />
}

/** Certificados de curso e de módulo do aluno, do mais recente ao mais antigo. */
async function MeusCertificados({ userId }: { userId: string }) {
  const certificados = await certificadosDoAluno(userId)

  return (
    <section className="mt-8">
      <h2 className="font-playfair text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <Award className="w-5 h-5 text-escola-azul" />
        Meus Certificados
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        {certificados.length > 0
          ? `${certificados.length} ${certificados.length === 1 ? 'certificado emitido' : 'certificados emitidos'} · ${certificados.reduce((s, c) => s + c.carga_horaria, 0)}h no total`
          : 'Conclua o projeto final de um curso ou de um módulo para receber o primeiro.'}
      </p>

      {certificados.length === 0 ? (
        <div className="empty-state p-8 text-center">
          <Award className="w-9 h-9 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Você ainda não tem certificados.</p>
          <Link href="/admin/modulos" className="inline-block text-escola-azul text-sm mt-2 hover:underline">
            Ver os módulos disponíveis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {certificados.map(c => (
            <div key={c.codigo} className="panel p-4 flex flex-wrap items-center gap-3">
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border ${
                  c.modulo_id
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}
              >
                {c.modulo_id ? <Layers className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                {c.modulo_id ? 'Módulo' : 'Curso'}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.curso_titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c.carga_horaria}h · código <span className="font-mono">{c.codigo}</span>
                  {c.emitido_em && ` · emitido em ${new Date(c.emitido_em).toLocaleDateString('pt-BR')}`}
                </p>
              </div>

              <Link
                href={`/certificado/${c.codigo}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul/90 transition-colors flex-shrink-0"
              >
                <Printer className="w-4 h-4" />
                Ver e imprimir
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
