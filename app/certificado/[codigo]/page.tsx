import './certificado.css'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { certificadoPorCodigo } from '@/lib/db/cursos'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX } from 'lucide-react'
import BotaoImprimirCertificado from '@/components/cursos/BotaoImprimirCertificado'
import QRCode from 'qrcode'
import type { Metadata } from 'next'
import { dadosDoCertificado } from '@/lib/certificado/dados'

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

/**
 * A marca pessoal de quem responde pelo curso, ao lado do nome dele.
 *
 * Mesma convenção da assinatura, e pelo mesmo motivo: o arquivo é por
 * responsável (`marcas/<nome-em-slug>.png`), fica no UPLOAD_ROOT e trocar é
 * copiar um PNG. Fixar a marca de um professor no código faria todo
 * certificado sair com o símbolo dele, inclusive os de curso de outra pessoa.
 *
 * Sem arquivo, não aparece nada — o rodapé continua com a linha e o nome.
 */
function marcaDe(nome: string | null): string | null {
  if (!nome) return null
  const base = slugDoNome(nome)
  for (const ext of ['png', 'webp', 'jpg']) {
    if (existsSync(path.join(RAIZ_UPLOADS, 'marcas', `${base}.${ext}`))) {
      return `/arquivos/marcas/${base}.${ext}`
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
  const marca = marcaDe(cert.autor_nome ?? null)

  /**
   * Tudo o que o documento imprime, já formatado e sem traço, vem daqui.
   *
   * A tela não formata mais nada por conta própria: é essa camada que o
   * desenho novo vai consumir quando entrar no lugar deste, e mantê-la em uso
   * agora garante que ela está certa antes de a arte mudar.
   */
  const dados = await dadosDoCertificado(cert.codigo)
  if (!dados) notFound()

  const dataEmissao = dados.dataConclusao
  // O ano do selo sai da MESMA data que o rodapé imprime: se um dia a emissão
  // for retroativa, os dois contam a mesma história.
  const anoEmissao = dados.anoConclusao

  /**
   * QR de validação, em SVG gerado no servidor. Aponta para esta mesma
   * página: quem escaneia o papel cai no registro que o gerou. É vetor, não
   * imagem: imprime nítido a 300 dpi e não pesa a página.
   */
  const qrSvg = await QRCode.toString(`https://${dados.urlValidacao}`, {
    type: 'svg', margin: 0, errorCorrectionLevel: 'M',
    color: { dark: '#1a3a5c', light: '#0000' },
  })

  return (
    <div className="min-h-screen bg-escola-creme flex flex-col items-center justify-center gap-6 p-4 py-10 print:p-0 print:bg-white print:block">
      {/*
        Desenho de 2026-09-21, no lugar do clássico de faixas e moldura dupla.
        O que muda, e por quê:

        - Painel azul à ESQUERDA em vez de faixas em cima e embaixo. É o traço
          mais comum dos certificados modernos pesquisados (painel lateral,
          texto alinhado à esquerda): a folha ganha um eixo vertical e o miolo
          deixa de ser uma pilha centralizada.
        - Texto alinhado à esquerda, hierarquia por TAMANHO e PESO, não por
          ornamento. Duas famílias: Geom (títulos, a fonte da marca) e DM Sans
          (corpo). O Playfair saiu: serifa pesada é o que faz o documento
          parecer diploma antigo.
        - Formas geométricas em baixa opacidade (dois discos) no lugar da marca
          em relevo. Estruturam a folha sem competir com o texto.
        - Os dados que valem (carga, nota, data) viram três etiquetas em linha,
          em vez de frase corrida.
        - QR de validação no painel: escaneou, abriu o registro.

        A folha é A4 DEITADA de `sm` para cima; no celular o painel vira uma
        faixa no topo e a altura fica livre (o motivo está na versão anterior:
        proporção presa no telefone esmagava o texto). A impressão fixa
        281 x 194 mm no CSS ao lado.
      */}
      <div className="folha-certificado relative overflow-hidden w-full max-w-[297mm] aspect-auto sm:aspect-[297/210] shadow-elevation-high print:shadow-none print:w-full print:max-w-none print:aspect-auto">
        <div className="conteudo-certificado h-full flex flex-col sm:flex-row">

          {/* ------------------------------------------------ painel da marca */}
          <aside className="painel flex sm:flex-col items-center sm:items-start justify-between gap-4 px-6 py-4 sm:px-7 sm:py-8 sm:w-[26%] flex-shrink-0">
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-4">
              {/* Disco branco: o brasão é azul e sumia sobre o painel azul. */}
              <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-full bg-white p-2">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo-transparente.png"
                    alt="Brasão da E.E. Dr. João Beraldo"
                    fill
                    sizes="72px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="font-geom text-white font-bold text-[15px] sm:text-[17px] leading-tight">
                  E.E. Dr. João Beraldo
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-white/65 leading-snug mt-1">
                  Ensino Médio em<br className="hidden sm:inline" /> Tempo Integral
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-white/65 leading-snug">
                  Carlos Chagas · MG
                </p>
              </div>
            </div>

            {/* Validação: QR + código. No celular só o código, à direita. */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3">
              <div
                className="qr hidden sm:block w-[76px] h-[76px] p-1.5 bg-white rounded-md"
                role="img"
                aria-label={`QR code de validação: ${dados.urlValidacao}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <div className="text-end sm:text-start">
                <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.16em] text-white/55">
                  Validação
                </p>
                <p className="font-mono text-[12px] sm:text-[13px] font-medium text-white tracking-[0.08em] leading-tight">
                  {dados.codigo}
                </p>
                <p className="font-mono text-[8px] sm:text-[8.5px] text-white/55 leading-snug mt-0.5 hidden sm:block">
                  escolaestadualdrjoaoberaldo.com<wbr />
                  <span className="whitespace-nowrap">/certificado/{dados.codigo}</span>
                </p>
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------------- miolo */}
          <main className="miolo relative flex-1 min-w-0 flex flex-col px-7 py-7 sm:px-12 sm:py-9 overflow-hidden">
            {/* Formas: dois discos em baixa opacidade, cortados pela borda.
                Decoração pura; leitor de tela não precisa saber deles. */}
            <span aria-hidden="true" className="disco disco-a" />
            <span aria-hidden="true" className="disco disco-b" />

            <div className="relative flex-1 flex flex-col">
              {/* Sobrelinha: o que é este papel. */}
              <div className="flex items-center gap-3">
                <span className="block w-8 h-[3px] bg-escola-vermelho rounded-full" />
                <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-escola-azul">
                  Certificado de conclusão
                </p>
              </div>

              {/* O bloco principal cresce e encolhe conforme o nome e o título;
                  cabeçalho e rodapé ficam ancorados. */}
              <div className="flex-1 flex flex-col justify-center py-7 sm:py-4 min-h-0">
                <p className="font-sans text-escola-cinza text-[14px] sm:text-[15px]">
                  Certificamos que
                </p>
                <h1 className="font-geom font-bold text-escola-preto leading-[1.05] tracking-[-0.01em] text-[30px] sm:text-[38px] lg:text-[46px] mt-1 text-balance">
                  {dados.alunoNome}
                </h1>
                <p className="font-sans text-escola-cinza text-[14px] sm:text-[15px] mt-4 sm:mt-5">
                  concluiu com aproveitamento o curso
                </p>
                <p className="font-geom font-semibold text-escola-azul leading-[1.15] text-[20px] sm:text-[24px] lg:text-[28px] mt-1 max-w-[30ch] text-balance">
                  {dados.cursoTitulo}
                </p>

                {/* Etiquetas: os três números do documento, em linha. */}
                <dl className="flex flex-wrap gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                  <div className="etiqueta">
                    <dt>Carga horária</dt>
                    <dd>{dados.cargaExtenso}</dd>
                  </div>
                  <div className="etiqueta">
                    <dt>Nota final</dt>
                    <dd>{cert.nota}</dd>
                  </div>
                  <div className="etiqueta">
                    <dt>Emitido em</dt>
                    <dd>{dataEmissao}</dd>
                  </div>
                </dl>
              </div>

              {/* Rodapé: assinaturas à esquerda, selo à direita. */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-8">
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 w-full sm:w-auto">
                  {dados.diretora.nome && (
                    <div className="assinatura">
                      <div className="h-10 sm:h-11" />
                      <div className="border-t border-escola-preto/70 pt-1.5 min-w-[150px]">
                        <p className="font-sans font-semibold text-escola-preto text-[13px] leading-tight">
                          {dados.diretora.nome}
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-escola-cinza mt-0.5">
                          {dados.diretora.cargo}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="assinatura">
                    {/* Altura fixa: o espaço da assinatura digitalizada existe
                        com ou sem arquivo, para o rodapé não se mexer. */}
                    <div className="h-10 sm:h-11 flex items-end">
                      {assinatura && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assinatura}
                          alt={`Assinatura de ${cert.autor_nome ?? 'responsável pelo curso'}`}
                          className="max-h-10 sm:max-h-11 w-auto object-contain"
                        />
                      )}
                    </div>
                    <div className="border-t border-escola-preto/70 pt-1.5 min-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        {marca && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={marca} alt="" aria-hidden="true" className="w-4 h-4 flex-shrink-0 object-contain" />
                        )}
                        <p className="font-sans font-semibold text-escola-preto text-[13px] leading-tight">
                          {dados.professor.nome}
                        </p>
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-escola-cinza mt-0.5">
                        {dados.professor.cargo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selo: anel fino, sem serrilha. O ano sai da mesma data que a
                    etiqueta "Emitido em" imprime. */}
                <div className="selo self-end sm:self-auto" role="img" aria-label={`Selo de conclusão — ${dados.tipo === 'modulo' ? 'módulo' : 'curso'} concluído em ${anoEmissao}`}>
                  <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-escola-azul/70">
                    {dados.tipo === 'modulo' ? 'Módulo' : 'Curso'}
                  </span>
                  <span className="font-geom text-[11px] font-bold uppercase tracking-[0.06em] text-escola-azul leading-none">
                    Concluído
                  </span>
                  <span aria-hidden="true" className="block w-5 h-[2px] bg-escola-vermelho my-1 rounded-full" />
                  <span className="font-mono text-[9px] tracking-[0.16em] text-escola-azul">
                    {anoEmissao}
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <BotaoImprimirCertificado />
    </div>
  )
}
