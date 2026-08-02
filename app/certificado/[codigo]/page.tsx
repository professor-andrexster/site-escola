import './certificado.css'
import { createAdminClient } from '@/lib/supabase/admin'
import Image from 'next/image'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import BotaoImprimirCertificado from '@/components/cursos/BotaoImprimirCertificado'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

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
  const admin = createAdminClient()

  const { data: cert } = await admin
    .from('certificados')
    .select('*')
    .eq('codigo', codigo.toUpperCase())
    .maybeSingle()

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

  const dataEmissao = new Date(cert.emitido_em).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-escola-creme flex flex-col items-center justify-center gap-6 p-4 py-10 print:p-0 print:bg-white">
      {/* Moldura no formato de folha deitada, pronta pra imprimir em A4 */}
      <div className="w-full max-w-4xl bg-white shadow-elevation-high print:shadow-none">
        <div className="border-8 border-escola-azul p-1.5">
          <div className="border border-escola-vermelho px-6 py-10 sm:px-14 sm:py-14 text-center">

            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-1 ring-escola-cinza-claro mb-4">
              <Image src="/logo.jpg" alt="Logo E.E. Dr. João Beraldo" fill sizes="80px" className="object-cover" />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-escola-cinza">
              E.E. Dr. João Beraldo
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-escola-cinza/60 mb-8">
              Ensino Médio em Tempo Integral · Carlos Chagas, MG
            </p>

            <h1 className="font-playfair text-4xl sm:text-5xl font-black text-escola-azul mb-8">
              Certificado
            </h1>

            <p className="font-serif text-escola-cinza mb-2">Certificamos que</p>
            <p className="font-playfair text-2xl sm:text-3xl font-bold text-escola-preto mb-4 leading-snug">
              {cert.aluno_nome}
            </p>
            <p className="font-serif text-escola-cinza leading-relaxed max-w-xl mx-auto mb-10">
              concluiu com aproveitamento o curso{' '}
              <strong className="text-escola-preto">{cert.curso_titulo}</strong>,
              com carga horária de <strong className="text-escola-preto">{cert.carga_horaria} hora{cert.carga_horaria === 1 ? '' : 's'}</strong>,
              obtendo nota <strong className="text-escola-preto">{cert.nota}</strong> na avaliação final.
            </p>

            <div className="flex items-end justify-center gap-12 sm:gap-20 mb-10">
              <div className="text-center">
                <div className="w-44 border-t border-escola-cinza pt-2">
                  <p className="font-serif text-sm text-escola-preto">{cert.autor_nome ?? 'E.E. Dr. João Beraldo'}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza/60">
                    {cert.autor_nome ? 'Responsável pelo curso' : 'Instituição'}
                  </p>
                </div>
              </div>
            </div>

            <p className="font-serif text-sm text-escola-cinza mb-6">Carlos Chagas, {dataEmissao}.</p>

            <p className="font-mono text-[10px] text-escola-cinza/60 leading-relaxed">
              Código de validação: <strong className="text-escola-cinza">{cert.codigo}</strong>
              <br />
              Confira a autenticidade em escolaestadualdrjoaoberaldo.com/certificado/{cert.codigo}
            </p>
          </div>
        </div>
      </div>

      <BotaoImprimirCertificado />
    </div>
  )
}
