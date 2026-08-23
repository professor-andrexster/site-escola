import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Layers, Trophy, Lock, Award } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { desafioParaTela } from '@/lib/db/trilha-desafios'
import { envioDoAluno } from '@/lib/db/desafio-curso'
import { progressoDoModulo, certificadoDoModulo } from '@/lib/db/modulos'
import { prisma } from '@/lib/db'
import DesafioFinal from '@/components/cursos/DesafioFinal'
import { proseDesafio } from '@/components/cursos/proseAula'
import type { Metadata } from 'next'
import { formatarDuracao } from '@/lib/duracao'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const d = await desafioParaTela(id)
  return { title: d ? d.titulo : 'Desafio' }
}

const CORES: Record<string, string> = {
  'Fácil': 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  'Médio': 'text-amber-300 border-amber-400/30 bg-amber-400/10',
  'Difícil': 'text-rose-300 border-rose-400/30 bg-rose-400/10',
}

export default async function DesafioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await getProfileOrRedirect()

  const d = await desafioParaTela(id)
  if (!d) notFound()

  const ehModulo = !!d.modulo_id
  const ehFinal = d.vale_certificado
  const modulo = d.modulos ?? d.cursos?.modulos ?? null
  const nivel = modulo?.nivel ?? null

  const envio = ehFinal ? await envioDoAluno(d.id, user.id) : null

  // Liberação: o projeto só abre depois das aulas. No módulo, das aulas de
  // todos os cursos dele; no curso, das aulas daquele curso. Quem já entregou
  // ou já tem certificado continua vendo, para acompanhar a correção.
  let liberado = true
  let faltam = 0
  let cargaCertificado: number | null = null
  let codigoCertificado: string | null = null

  if (ehFinal && ehModulo && d.modulos) {
    const [p, cert] = await Promise.all([
      progressoDoModulo(d.modulos.id, user.id),
      certificadoDoModulo(d.modulos.id, user.id),
    ])
    liberado = p.completo || !!envio || !!cert
    faltam = p.totalAulas - p.aulasConcluidas
    cargaCertificado = d.modulos.carga_min ?? (d.modulos.carga_horaria ?? 0) * 60
    codigoCertificado = cert?.codigo ?? null
  } else if (ehFinal && d.cursos) {
    const [aulas, feitas, cert] = await Promise.all([
      prisma.aulas.count({ where: { curso_id: d.cursos.id, publicado: true } }),
      prisma.progresso_aulas.count({
        where: { user_id: user.id, concluida: true, aulas: { curso_id: d.cursos.id, publicado: true } },
      }),
      prisma.certificados.findFirst({
        where: { user_id: user.id, curso_id: d.cursos.id },
        select: { codigo: true },
      }),
    ])
    liberado = (aulas > 0 && feitas >= aulas) || !!envio || !!cert
    faltam = Math.max(0, aulas - feitas)
    cargaCertificado = d.cursos.carga_min ?? (d.cursos.carga_horaria ?? 0) * 60
    codigoCertificado = cert?.codigo ?? null
  }

  const TipoIcone = ehModulo ? Layers : ehFinal ? Trophy : BookOpen
  const tipoRotulo = ehModulo ? 'Projeto do módulo' : ehFinal ? 'Projeto do curso' : 'Exercício de aula'

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <Link
        href="/admin/cursos/desafios"
        className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Todos os desafios
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {nivel && (
          <span className={`text-[11px] font-jetbrains uppercase tracking-widest px-2.5 py-1 rounded-full border ${CORES[nivel] ?? ''}`}>
            {nivel}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/55 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          <TipoIcone className="w-3 h-3" />
          {tipoRotulo}
        </span>
        {ehFinal && cargaCertificado && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-curso-ciano bg-curso-azul/10 border border-curso-azul/20 px-2.5 py-1 rounded-full">
            <Award className="w-3 h-3" />
            Certificado de {formatarDuracao(cargaCertificado)}
          </span>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-white font-geom mb-2">{d.titulo}</h1>

      <p className="text-white/50 text-sm mb-8">
        {ehModulo ? (
          <>Do módulo <Link href={`/admin/modulos/${d.modulos!.slug}`} className="text-curso-ciano hover:underline">{d.modulos!.nome}</Link></>
        ) : d.cursos ? (
          <>
            Do curso{' '}
            <Link href={`/admin/cursos/${d.cursos.slug}`} className="text-curso-ciano hover:underline">
              {d.cursos.titulo}
            </Link>
            {d.aulas && (
              <>
                {' · aula '}
                <Link
                  href={`/admin/cursos/${d.cursos.slug}/${d.aulas.slug}`}
                  className="text-curso-ciano hover:underline"
                >
                  {d.aulas.titulo}
                </Link>
              </>
            )}
          </>
        ) : null}
      </p>

      <article className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 mb-8">
        <div className={proseDesafio} dangerouslySetInnerHTML={{ __html: d.enunciado }} />
      </article>

      {/* Exercício de aula não tem entrega: ele se faz junto do conteúdo. */}
      {!ehFinal ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/60 text-sm">
            Este é um exercício para praticar junto da aula — não precisa entregar aqui. O projeto
            que vale certificado fica no fim do curso.
          </p>
          {d.cursos && d.aulas && (
            <Link
              href={`/admin/cursos/${d.cursos.slug}/${d.aulas.slug}`}
              className="inline-flex items-center gap-2 mt-3 bg-curso-azul hover:bg-curso-azul-claro text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors foco-curso"
            >
              Abrir a aula
            </Link>
          )}
        </div>
      ) : liberado ? (
        <DesafioFinal
          desafio={{
            id: d.id,
            titulo: d.titulo,
            enunciado: d.enunciado,
            formatos_aceitos: d.formatos_aceitos,
            instrucoes_envio: d.instrucoes_envio,
          }}
          envioInicial={envio ? { ...envio, enviado_em: envio.enviado_em.toISOString() } : null}
          certificadoCodigo={codigoCertificado}
        />
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-3">
          <Lock className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white/60 text-sm">
              Conclua as aulas {ehModulo ? 'dos cursos do módulo' : 'do curso'} para liberar a
              entrega deste projeto.
            </p>
            {faltam > 0 && (
              <p className="text-white/50 text-xs mt-1">
                {faltam === 1 ? 'Falta 1 aula.' : `Faltam ${faltam} aulas.`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
