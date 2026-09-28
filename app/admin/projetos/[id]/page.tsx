import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, FileDown, Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import { getProfileOrRedirect } from '@/lib/profile'
import { isGestao } from '@/lib/roles'
import { alunoDoUsuario } from '@/lib/db/portfolio'
import {
  alunosSemEnvio, avaliacoesDoEnvio, buscarTrabalho, envioDoAluno, enviosDoTrabalho, pastaDaSerie, slugDaSerie,
} from '@/lib/db/projetos-turma'
import { proseAula } from '@/components/cursos/proseAula'
import EnvioAlunoForm from '@/components/admin/projetos/EnvioAlunoForm'
import PainelEnvios from '@/components/admin/projetos/PainelEnvios'
import CronogramaTabela from '@/components/admin/projetos/CronogramaTabela'
import CriteriosLista from '@/components/admin/projetos/CriteriosLista'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Projeto' }
export const dynamic = 'force-dynamic'

/**
 * Pagina do projeto. Briefing, cronograma e criterios para todo mundo;
 * embaixo, o aluno ve o proprio envio e a devolutiva, e o professor ve a
 * turma inteira com os links e o formulario de avaliacao.
 */
export default async function ProjetoPage({ params }: Props) {
  const { id } = await params
  const { user, profile } = await getProfileOrRedirect()
  const equipe = profile.role === 'professor' || isGestao(profile.role)

  const trabalho = await buscarTrabalho(id)
  if (!trabalho) notFound()
  if (!equipe && !trabalho.publicado) notFound()

  let corpo: React.ReactNode
  let etapaDoAluno: number | null = null
  let marcasDoAluno = null
  if (equipe) {
    const [envios, semEnvio] = await Promise.all([enviosDoTrabalho(id), alunosSemEnvio(id, trabalho.serie)])
    corpo = <PainelEnvios cronograma={trabalho.cronograma} criterios={trabalho.criterios} enviosIniciais={envios} semEnvio={semEnvio} />
  } else {
    const aluno = await alunoDoUsuario(user.id)
    const minha = await pastaDaSerie(aluno?.serie ?? null)
    if (!minha || minha.id !== trabalho.pastaId) redirect('/admin/projetos')
    const envio = await envioDoAluno(id, user.id)
    const historico = envio ? await avaliacoesDoEnvio(envio.id) : []
    etapaDoAluno = envio?.etapa ?? null
    marcasDoAluno = envio?.marcas ?? null
    corpo = (
      <EnvioAlunoForm
        trabalhoId={id}
        pedeLinkGrupo={trabalho.pedeLinkGrupo}
        cronograma={trabalho.cronograma}
        criterios={trabalho.criterios}
        envioInicial={envio}
        historico={historico}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/admin/projetos/pasta/${slugDaSerie(trabalho.serie)}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Pasta {trabalho.serie}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-escola-azul">{trabalho.serie}</span>
            {!trabalho.publicado && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Rascunho</span>}
          </div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900">{trabalho.titulo}</h1>
          {trabalho.resumo && <p className="text-gray-500 mt-1">{trabalho.resumo}</p>}
        </div>
        {equipe && (
          <Link href={`/admin/projetos/${id}/editar`} className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:border-escola-azul transition-colors flex-shrink-0 foco-painel">
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      {equipe ? (
        <>
          {corpo}
          <div className="h-8" />
        </>
      ) : null}

      {trabalho.arquivoUrl && (
        <a
          href={trabalho.arquivoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="panel-interativo p-4 flex items-center gap-3 mb-6"
        >
          <FileDown className="w-6 h-6 text-escola-azul flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Baixar o trabalho em PDF</p>
            <p className="text-xs text-gray-500">O documento completo, para ler com calma ou imprimir.</p>
          </div>
        </a>
      )}

      <CronogramaTabela
        cronograma={trabalho.cronograma}
        etapaDoAluno={etapaDoAluno}
        podeEditar={equipe}
        editarHref={`/admin/projetos/${id}/editar`}
      />

      {trabalho.briefing && (
        <section className="panel p-6 md:p-8 mb-8">
          <div className={proseAula} dangerouslySetInnerHTML={{ __html: trabalho.briefing }} />
        </section>
      )}

      <CriteriosLista criterios={trabalho.criterios} marcas={marcasDoAluno} />

      {!equipe ? corpo : null}
    </div>
  )
}
