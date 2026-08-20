import './certificado.css'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { certificadoPorCodigo } from '@/lib/db/cursos'
import Image from 'next/image'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import BotaoImprimirCertificado from '@/components/cursos/BotaoImprimirCertificado'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const RAIZ_UPLOADS = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), 'data', 'uploads')

function slugDoNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

/**
 * A assinatura digitalizada de quem responde pelo curso, se já houver arquivo.
 *
 * Fica no UPLOAD_ROOT, não no `public/`, de propósito: assim trocar a assinatura
 * é copiar um PNG, sem rebuild nem deploy. O caminho é por responsável —
 * `assinaturas/<nome-em-slug>.png` — e cai para `assinaturas/padrao.png` quando
 * não houver a específica. Hoje todos os cursos têm o mesmo autor, mas o dia em
 * que outro professor emitir certificado a assinatura não pode ir errada.
 *
 * Sem arquivo, o espaço continua reservado e a linha de assinatura fica em
 * branco — que é como o certificado sai para assinar à mão.
 */
function assinaturaDe(nome: string | null): string | null {
  const candidatos = [...(nome ? [slugDoNome(nome)] : []), 'padrao']
  for (const base of candidatos) {
    for (const ext of ['png', 'webp', 'jpg']) {
      if (existsSync(path.join(RAIZ_UPLOADS, 'assinaturas', `${base}.${ext}`))) {
        return `/arquivos/assinaturas/${base}.${ext}`
      }
    }
  }
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params
  return {
    title: `Certificado ${codigo.toUpperCase()}`,
    robots: { index: false },
  }
}

// Página pública: o próprio endereço com o código É a validação do
// certificado. Quem recebe o link (ou digita o código impresso) vê os
// mesmos dados gravados na emissão.
export default async function CertificadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const cert = await certificadoPorCodigo(codigo.toUpperCase())

  if (!cert) {
    return (
      <div className="min-h-screen bg-escola-creme flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-elevation-high p-10 text-center max-w-md">
          <SearchX className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h1 className="font-playfair text-xl font-bold text-gray-900 mb-2">Certificado não encontrado</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            O código <strong className="font-mono">{codigo.toUpperCase()}</strong> não corresponde a nenhum
            certificado emitido pela escola. Confira se digitou exatamente como está no documento.
          </p>
          <Link href="/" className="text-sm text-escola-azul font-semibold hover:underline">
            Ir para o site da escola
          </Link>
        </div>
      </div>
    )
  }

  const assinatura = assinaturaDe(cert.autor_nome ?? null)

  const dataEmissao = (cert.emitido_em ?? new Date()).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-escola-creme flex flex-col items-center justify-center gap-6 p-4 py-10 print:p-0 print:bg-white print:block">
      {/*
        A folha é A4 DEITADA: 297 x 210 mm.

        Na tela, `aspect-[297/210]` mostra exatamente a proporção que vai sair
        da impressora — o que se vê aqui é o que sai no papel, sem surpresa ao
        imprimir. Na impressão, a moldura ocupa a página inteira e a margem fica
        por conta do `@page`.
      */}
      <div className="folha-certificado w-full max-w-[297mm] aspect-[297/210] bg-white shadow-elevation-high print:shadow-none print:w-full print:max-w-none print:h-full print:aspect-auto">
        <div className="h-full border-[6px] border-escola-azul p-1.5">
          <div className="h-full border border-escola-vermelho px-8 sm:px-16 py-6 sm:py-8 text-center flex flex-col">

            {/* Cabeçalho: brasão e instituição lado a lado, porque em paisagem
                a altura é o recurso escasso e empilhar custa caro. */}
            <div className="flex items-center justify-center gap-4 flex-shrink-0">
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-1 ring-escola-cinza-claro flex-shrink-0">
                <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="56px" className="object-cover" />
              </div>
              <div className="text-start">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-escola-cinza leading-tight">
                  E.E. Dr. João Beraldo
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-escola-cinza leading-tight">
                  Ensino Médio em Tempo Integral · Carlos Chagas, MG
                </p>
              </div>
            </div>

            {/* O miolo cresce e encolhe conforme o nome e o título do curso;
                o cabeçalho e o rodapé ficam ancorados. */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              <h1 className="font-playfair text-3xl sm:text-5xl font-black text-escola-azul mb-3 sm:mb-5">
                Certificado
              </h1>

              <p className="font-serif text-escola-cinza text-sm mb-1">Certificamos que</p>
              <p className="font-playfair text-xl sm:text-3xl font-bold text-escola-preto mb-2 sm:mb-3 leading-snug text-balance">
                {cert.aluno_nome}
              </p>
              <p className="font-serif text-escola-cinza leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">
                concluiu com aproveitamento o curso{' '}
                <strong className="text-escola-preto">{cert.curso_titulo}</strong>,
                com carga horária de <strong className="text-escola-preto">{cert.carga_horaria} hora{cert.carga_horaria === 1 ? '' : 's'}</strong>,
                obtendo nota <strong className="text-escola-preto">{cert.nota}</strong> na avaliação final.
              </p>
            </div>

            {/* Rodapé: data à esquerda, assinatura ao centro, validação à
                direita. Em paisagem sobra largura, e distribuir nas três
                colunas evita a pilha central que estica a folha para baixo. */}
            <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 items-end gap-4 sm:gap-6">
              <p className="font-serif text-xs text-escola-cinza text-center sm:text-start order-2 sm:order-1">
                Carlos Chagas,<br className="hidden sm:inline" /> {dataEmissao}.
              </p>

              <div className="order-1 sm:order-2">
                {/* Altura fixa: o espaço da assinatura existe com ou sem
                    arquivo, para o resto do certificado não se mexer quando
                    ela entrar. */}
                <div className="h-14 flex items-end justify-center">
                  {assinatura && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assinatura}
                      alt={`Assinatura de ${cert.autor_nome ?? 'responsável pelo curso'}`}
                      className="max-h-14 w-auto object-contain"
                    />
                  )}
                </div>
                <div className="border-t border-escola-cinza pt-1.5 mx-auto max-w-[220px]">
                  <p className="font-serif text-sm text-escola-preto leading-tight">
                    {cert.autor_nome ?? 'E.E. Dr. João Beraldo'}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza">
                    {cert.autor_nome ? 'Responsável pelo curso' : 'Instituição'}
                  </p>
                </div>
              </div>

              <p className="font-mono text-[10px] text-escola-cinza leading-relaxed text-center sm:text-end order-3">
                Código de validação<br />
                <strong className="font-mono text-escola-cinza text-[11px]">{cert.codigo}</strong><br />
                escolaestadualdrjoaoberaldo.com/certificado/{cert.codigo}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BotaoImprimirCertificado />
    </div>
  )
}
