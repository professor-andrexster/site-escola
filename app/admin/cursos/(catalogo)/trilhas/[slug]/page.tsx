import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Play, Lock, Clock, Layers } from 'lucide-react'
import { getProfileOrRedirect } from '@/lib/profile'
import { trilhaPorSlug, progressoNaTrilha } from '@/lib/db/trilhas'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const t = await trilhaPorSlug(slug)
  return { title: t ? t.nome : 'Trilha' }
}

const CORES: Record<string, { texto: string; barra: string; anel: string }> = {
  'blue-600': { texto: 'text-blue-300', barra: 'bg-blue-400', anel: 'border-blue-400/30' },
  'orange-600': { texto: 'text-orange-300', barra: 'bg-orange-400', anel: 'border-orange-400/30' },
  'green-600': { texto: 'text-green-300', barra: 'bg-green-400', anel: 'border-green-400/30' },
  'pink-600': { texto: 'text-pink-300', barra: 'bg-pink-400', anel: 'border-pink-400/30' },
  'gray-600': { texto: 'text-white/70', barra: 'bg-white/50', anel: 'border-white/25' },
}

export default async function TrilhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { user } = await getProfileOrRedirect()

  const trilha = await trilhaPorSlug(slug)
  if (!trilha) notFound()

  const progresso = await progressoNaTrilha(trilha.cursos.map(c => c.id), user.id)
  const cor = CORES[trilha.cor ?? ''] ?? CORES['gray-600']

  const estados = trilha.cursos.map(c => {
    const p = progresso.get(c.id)
    const total = p?.total ?? 0
    const feitas = p?.feitas ?? 0
    return { curso: c, total, feitas, completo: total > 0 && feitas >= total, comecou: feitas > 0 }
  })

  const concluidos = estados.filter(e => e.completo).length
  const pct = estados.length ? Math.round((concluidos / estados.length) * 100) : 0
  // O "próximo" é o primeiro não concluído: é a resposta para "o que eu faço
  // agora", que é a pergunta que traz o aluno a esta tela.
  const proximo = estados.find(e => !e.completo)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link
        href="/admin/cursos"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Todas as trilhas
      </Link>

      <div className="flex items-start gap-4 mb-3">
        {trilha.icone && <span className="text-4xl leading-none flex-shrink-0">{trilha.icone}</span>}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-black text-white font-geom">{trilha.nome}</h1>
          <p className={`text-sm font-jetbrains ${cor.texto}`}>
            {trilha.cursos.length} cursos · {trilha.cargaTotal} horas
          </p>
        </div>
      </div>

      {trilha.descricao && (
        <p className="text-white/70 leading-relaxed max-w-2xl mb-6">{trilha.descricao}</p>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">
            {concluidos} de {trilha.cursos.length} cursos concluídos
          </span>
          <span className="text-white font-jetbrains">{pct}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-400' : cor.barra}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {proximo && (
          <Link
            href={`/admin/cursos/${proximo.curso.slug}`}
            className="inline-flex items-center gap-2 bg-curso-azul hover:bg-curso-azul-claro text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors foco-curso"
          >
            <Play className="w-4 h-4" />
            {proximo.comecou ? 'Continuar' : 'Começar'} — {proximo.curso.titulo}
          </Link>
        )}
      </div>

      <ol className="space-y-3">
        {estados.map(({ curso, total, feitas, completo }, i) => {
          // Nada é bloqueado de fato: a sequência é uma recomendação, e travar
          // um curso porque o anterior não terminou puniria quem já sabe a
          // matéria. O aviso basta.
          const anteriorPendente = i > 0 && !estados[i - 1].completo
          return (
            <li key={curso.id}>
              <Link
                href={`/admin/cursos/${curso.slug}`}
                className={`group flex items-center gap-4 bg-white/5 border rounded-2xl p-4 transition-colors ${
                  completo ? 'border-green-400/25' : `border-white/10 hover:${cor.anel}`
                }`}
              >
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-jetbrains font-bold ${
                    completo ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {completo ? <Check className="w-4 h-4" /> : i + 1}
                </span>

                {curso.capaUrl && (
                  <div className="hidden sm:block relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    <Image src={curso.capaUrl} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-curso-ciano transition-colors">
                    {curso.titulo}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-white/60 text-xs mt-1">
                    {curso.cargaHoraria != null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {curso.cargaHoraria}h
                      </span>
                    )}
                    {total > 0 && <span>{feitas}/{total} aulas</span>}
                    {curso.moduloNome && (
                      <span className="inline-flex items-center gap-1 text-white/55">
                        <Layers className="w-3 h-3" />
                        {curso.moduloNome}
                      </span>
                    )}
                  </p>
                </div>

                {anteriorPendente && !completo && (
                  <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 text-[11px] text-white/60 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Recomendado depois do anterior
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>

      <p className="text-white/60 text-sm mt-8">
        O certificado sai por <strong className="text-white/80">módulo</strong>, não por trilha — a
        trilha é o caminho, e cada curso continua valendo no módulo dele.
      </p>
    </div>
  )
}
