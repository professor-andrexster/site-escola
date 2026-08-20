import { getProfileOrRedirect } from '@/lib/profile'
import Link from 'next/link'
import { ArrowLeft, User, Award, Layers, BookOpen, Printer, FolderGit2, ExternalLink, Github, Clock, RotateCcw, FileEdit, Check } from 'lucide-react'
import MeuPerfilForm from '@/components/admin/MeuPerfilForm'
import StaffPerfilForm from '@/components/admin/StaffPerfilForm'
import { certificadosDoAluno } from '@/lib/db/modulos'
import { buscarPorUsuario } from '@/lib/db/alunos'
import { alunoDoUsuario, projetosDoAluno, type StatusProjeto } from '@/lib/db/portfolio'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu Perfil, Painel Escolar' }
export const dynamic = 'force-dynamic'

export default async function MeuPerfilPage() {
  const { user, profile } = await getProfileOrRedirect()

  return (
    <div>
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-escola-azul mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para dashboard
      </Link>

      <h1 className="font-playfair text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <User className="w-6 h-6 text-escola-azul" />
        Meu Perfil
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {profile.role === 'aluno' ? 'Atualize seus dados de contato e responsável' : 'Atualize sua foto e seus dados'}
      </p>

      {profile.role === 'aluno' ? <PerfilDoAluno userId={user.id} /> : <StaffPerfilForm profile={profile} />}

      {/* Os certificados moram aqui porque é onde o aluno volta para procurar:
          "meu perfil" é o lugar dos documentos dele. Na página do curso o
          certificado também aparece, mas espalhado — um por curso. */}
      <MeusCertificados userId={user.id} />

      {/* O portfólio fica junto dos certificados pelo mesmo motivo: os dois são
          o que o aluno mostra quando alguém pergunta o que ele sabe fazer. */}
      {profile.role === 'aluno' && <MeuPortfolio userId={user.id} />}
    </div>
  )
}

/**
 * Os projetos do aluno, com o estado de cada um.
 *
 * Aparecem aqui inclusive os que ainda não foram aprovados — este é o perfil
 * DELE, não a vitrine. Esconder o que está em revisão faria o aluno achar que o
 * envio se perdeu.
 */
async function MeuPortfolio({ userId }: { userId: string }) {
  const aluno = await alunoDoUsuario(userId)
  if (!aluno) return null

  const projetos = await projetosDoAluno(aluno.id)
  const publicados = projetos.filter(p => p.status === 'aprovado').length

  const ESTADO: Record<StatusProjeto, { rotulo: string; classe: string; Icone: typeof Check }> = {
    rascunho: { rotulo: 'Rascunho', classe: 'bg-gray-100 text-gray-600 border-gray-200', Icone: FileEdit },
    pendente: { rotulo: 'Em revisão', classe: 'bg-amber-50 text-amber-800 border-amber-200', Icone: Clock },
    aprovado: { rotulo: 'Publicado', classe: 'bg-green-50 text-green-800 border-green-200', Icone: Check },
    recusado: { rotulo: 'Para corrigir', classe: 'bg-red-50 text-red-800 border-red-200', Icone: RotateCcw },
  }

  return (
    <section className="mt-8">
      <h2 className="font-playfair text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
        <FolderGit2 className="w-5 h-5 text-escola-azul" />
        Meu Portfólio
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {projetos.length > 0
          ? `${projetos.length} ${projetos.length === 1 ? 'projeto' : 'projetos'} · ${publicados} na vitrine da escola`
          : 'Publique um projeto e ele aparece aqui e na vitrine da escola.'}
      </p>

      {projetos.length === 0 ? (
        <div className="empty-state p-8 text-center">
          <FolderGit2 className="w-9 h-9 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Você ainda não cadastrou nenhum projeto.</p>
          <Link href="/admin/meu-portfolio" className="inline-block text-escola-azul text-sm mt-2 hover:underline">
            Cadastrar meu primeiro projeto
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {projetos.map(p => {
              const e = ESTADO[p.status]
              return (
                <div key={p.id} className="panel p-4 flex flex-wrap items-center gap-3">
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border ${e.classe}`}>
                    <e.Icone className="w-3 h-3" />
                    {e.rotulo}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.titulo}</p>
                    <p className="text-xs text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-3">
                      {p.linkSite && (
                        <a href={p.linkSite} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-escola-azul hover:underline foco-painel rounded">
                          <ExternalLink className="w-3 h-3" /> site
                        </a>
                      )}
                      {p.linkRepo && (
                        <a href={p.linkRepo} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-escola-azul hover:underline foco-painel rounded">
                          <Github className="w-3 h-3" /> código
                        </a>
                      )}
                      {p.criadoEm && <span>criado em {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span>}
                    </p>
                  </div>

                  <Link
                    href="/admin/meu-portfolio"
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 foco-painel"
                  >
                    Gerenciar
                  </Link>
                </div>
              )
            })}
          </div>
          <Link href="/admin/meu-portfolio" className="inline-block text-escola-azul text-sm mt-3 hover:underline">
            Abrir Meu Portfólio
          </Link>
        </>
      )}
    </section>
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
      <p className="text-sm text-gray-500 mb-4">
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
                <p className="text-xs text-gray-500 mt-0.5">
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
