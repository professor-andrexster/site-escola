import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Award, Check, Lock, Trophy } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import {
  moduloPorSlug, desafioDoModulo, progressoDoModulo, certificadoDoModulo,
} from '@/lib/db/modulos'
import { envioDoAluno } from '@/lib/db/desafio-curso'
import DesafioFinal from '@/components/cursos/DesafioFinal'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = await moduloPorSlug(slug)
  return { title: m ? `${m.nome} — Módulo` : 'Módulo' }
}

const CORES: Record<string, string> = {
  'Fácil': 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  'Médio': 'text-amber-300 border-amber-400/30 bg-amber-400/10',
  'Difícil': 'text-rose-300 border-rose-400/30 bg-rose-400/10',
}

export default async function ModuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { user } = await getProfileOrRedirect()

  const modulo = await moduloPorSlug(slug)
  if (!modulo) notFound()

  const [desafio, progresso, certificado] = await Promise.all([
    desafioDoModulo(modulo.id),
    progressoDoModulo(modulo.id, user.id),
    certificadoDoModulo(modulo.id, user.id),
  ])
  const envio = desafio ? await envioDoAluno(desafio.id, user.id) : null

  const pct = progresso.totalAulas
    ? Math.round((progresso.aulasConcluidas / progresso.totalAulas) * 100)
    : 0

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link
        href="/admin/modulos"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Todos os módulos
      </Link>

      <span className={`inline-block text-[11px] font-jetbrains uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${CORES[modulo.nivel] ?? ''}`}>
        {modulo.nivel} · {modulo.carga_horaria}h
      </span>

      <h1 className="text-2xl md:text-3xl font-black text-white font-geom mb-2">{modulo.nome}</h1>
      <p className="text-white/50 leading-relaxed mb-8 max-w-2xl">{modulo.descricao}</p>

      {/* ------------------------------------------------------ os cursos */}
      <h2 className="text-white font-black text-lg font-geom mb-4">
        Cursos deste módulo
      </h2>

      <div className="space-y-3 mb-6">
        {modulo.cursos.map((cu, i) => {
          const p = progresso.cursos.find(x => x.id === cu.id)
          return (
            <Link
              key={cu.id}
              href={`/admin/cursos/${cu.slug}`}
              className="group flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/25 transition-colors"
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-jetbrains font-bold ${
                  p?.completo ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-white/50'
                }`}
              >
                {p?.completo ? <Check className="w-4 h-4" /> : i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate group-hover:text-curso-ciano transition-colors">
                  {cu.titulo}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {p ? `${p.concluidas} de ${p.aulas} aulas` : `${cu.carga_horaria}h`}
                  {' · '}{cu.carga_horaria}h
                </p>
              </div>

              <span className="text-white/30 text-xs font-jetbrains flex-shrink-0">
                {p?.completo ? 'concluído' : 'continuar'}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">
            Progresso do módulo — {progresso.cursosCompletos} de {progresso.cursos.length} cursos
          </span>
          <span className="text-white font-jetbrains">{pct}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-400' : 'bg-curso-ciano'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* -------------------------------------- o projeto grande do módulo */}
      <section>
        <h2 className="text-white font-black text-lg font-geom flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Projeto do módulo
        </h2>

        {!desafio ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/50 text-sm">
              O projeto deste módulo está sendo preparado. Enquanto isso, cada curso tem o seu
              desafio final com certificado próprio.
            </p>
          </div>
        ) : progresso.completo || envio || certificado ? (
          <>
            <p className="text-white/50 text-sm mb-4">
              Este projeto vale o <strong className="text-white/80">certificado de {modulo.carga_horaria}h
              do módulo {modulo.nome}</strong>, e é somado aos certificados de cada curso.
            </p>
            <DesafioFinal
              desafio={desafio}
              envioInicial={
                envio ? { ...envio, enviado_em: envio.enviado_em.toISOString() } : null
              }
              certificadoCodigo={certificado?.codigo ?? null}
            />
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-3">
            <Lock className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white/60 text-sm">
                Conclua as aulas dos {progresso.cursos.length} cursos para liberar o projeto do
                módulo.
              </p>
              <p className="text-white/35 text-xs mt-1">
                Faltam {progresso.totalAulas - progresso.aulasConcluidas} aulas.
              </p>
            </div>
          </div>
        )}
      </section>

      {certificado && (
        <div className="mt-6 bg-white/5 border border-green-400/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start">
            <p className="text-white font-bold font-geom">Módulo concluído</p>
            <p className="text-white/50 text-sm mt-0.5">
              Certificado de {certificado.carga_horaria}h emitido em seu nome.
            </p>
          </div>
          <Link
            href={`/certificado/${certificado.codigo}`}
            className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors flex-shrink-0"
          >
            <Award className="w-4 h-4" />
            Ver Certificado
          </Link>
        </div>
      )}
    </div>
  )
}
