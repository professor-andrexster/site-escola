import './certificado.css'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { certificadoPorCodigo } from '@/lib/db/cursos'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchX } from 'lucide-react'
import BotaoImprimirCertificado from '@/components/cursos/BotaoImprimirCertificado'
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

  return (
    <div className="min-h-screen bg-escola-creme flex flex-col items-center justify-center gap-6 p-4 py-10 print:p-0 print:bg-white print:block">
      {/*
        A folha é A4 DEITADA: 297 x 210 mm. De `sm` para cima, o que se vê na
        tela é a proporção que sai da impressora — sem surpresa ao imprimir.

        Mas a proporção só vale de `sm` para cima.

        Presa também no celular, ela dava uma caixa de 253 px de altura para o
        texto de um documento inteiro: o nome do aluno passava por cima do
        cabeçalho, a data por cima do rodapé, e nada se lia. Com altura livre a
        folha vira um cartão alto no telefone — deixa de parecer uma folha, mas
        se lê, e essa é a troca certa. A impressão não depende disto: o
        @media print fixa 281 x 194 mm em qualquer aparelho.
      */}
      <div className="folha-certificado relative overflow-hidden w-full max-w-[297mm] aspect-auto sm:aspect-[297/210] shadow-elevation-high print:shadow-none print:w-full print:max-w-none print:aspect-auto">
        {/* A marca da escola gravada no papel. Três cópias da mesma silhueta —
            sombra, luz e face — que juntas leem como alto-relevo. O CSS ao lado
            explica a montagem e por que o tom da sombra é o piso de contraste
            do documento. */}
        <div className="marca-relevo" aria-hidden="true">
          <i className="marca-sombra" />
          <i className="marca-luz" />
          <i className="marca-face" />
        </div>

        <div className="conteudo-certificado h-full border-[6px] border-escola-azul p-1.5">
          {/* Sem padding lateral aqui: as faixas sangram de ponta a ponta, e
              quem recua é o miolo. Com padding no pai elas ficariam com uma
              tira de papel sobrando dos dois lados. */}
          <div className="h-full border border-escola-vermelho text-center flex flex-col overflow-hidden">

            {/* Faixa de cima: o cabeçalho institucional, em branco sobre o azul
                da marca. Brasão e instituição lado a lado, porque em paisagem a
                altura é o recurso escasso e empilhar custa caro. */}
            <div className="faixa flex items-center justify-center gap-3 sm:gap-4 flex-shrink-0 px-6 sm:px-10 py-2.5 sm:py-3">
              {/* O disco claro não é enfeite: o brasão é AZUL, e sobre a faixa
                  azul ele praticamente desaparecia — o mesmo defeito de fundo e
                  figura da mesma cor que já apareceu nos cursos. O disco devolve
                  o contraste e ainda lê como um botão de brasão.

                  `contain`, e não `cover`: a marca é alta (1131x1600) e o corte
                  circular anterior comia "E.E. Doutor" em cima e "Beraldo"
                  embaixo — sobrava a faixa do meio, que sozinha não identifica
                  a escola. */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-full bg-white p-1.5 sm:p-2">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo-transparente.png"
                    alt="Brasão da E.E. Dr. João Beraldo"
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-start">
                <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.3em] text-white leading-tight">
                  E.E. Dr. João Beraldo
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.08em] sm:tracking-[0.2em] text-white/75 leading-tight">
                  Ensino Médio em Tempo Integral · Carlos Chagas, MG
                </p>
              </div>
            </div>

            {/* O miolo recua por conta própria, já que o pai não recua mais. */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-8 sm:px-16 py-5 sm:py-6">

            {/* O miolo cresce e encolhe conforme o nome e o título do curso;
                o cabeçalho e o rodapé ficam ancorados. */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8 sm:py-0">
              <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-escola-azul">
                Certificado
              </h1>
              {/* Um filete curto sob o título: dá ao bloco central um eixo
                  visível, que é o que faltava para o texto não parecer solto
                  no meio da folha. */}
              <div className="w-16 h-px bg-escola-vermelho my-3 sm:my-4" />

              <p className="font-serif text-escola-cinza text-sm mb-1">Certificamos que</p>
              <p className="font-playfair text-xl sm:text-2xl lg:text-3xl font-bold text-escola-preto mb-3 leading-snug text-balance">
                {dados.alunoNome}
              </p>

              <p className="font-serif text-escola-cinza text-sm">
                concluiu com aproveitamento o curso
              </p>
              {/* O curso ganha linha própria: ele é o assunto do documento, e
                  no parágrafo corrido sumia no meio da frase — ainda mais com
                  títulos longos como "Parte 3 — A estrutura que sustenta". */}
              <p className="font-playfair text-lg sm:text-xl lg:text-2xl font-bold text-escola-azul leading-snug text-balance max-w-3xl mx-auto mt-1 mb-3">
                {dados.cursoTitulo}
              </p>
              <p className="font-serif text-escola-cinza leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">
                com carga horária de{' '}
                <strong className="text-escola-preto">{dados.cargaExtenso}</strong>
                , obtendo nota <strong className="text-escola-preto">{cert.nota}</strong> na
                avaliação final.
              </p>
            </div>

            {/* Rodapé: data à esquerda, assinatura ao centro, validação à
                direita. Em paisagem sobra largura, e distribuir nas três
                colunas evita a pilha central que estica a folha para baixo. */}
            <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 items-end gap-5 sm:gap-6">
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
                {/* Duas assinaturas: a escola à esquerda, quem deu o curso à
                    direita. Um curso da escola é assinado pelas duas partes, e
                    o documento antes trazia só uma. Cada lado tem o nome numa
                    linha e o cargo na outra, que é como se assina papel. */}
                <div className="grid grid-cols-2 gap-4 sm:gap-8 mx-auto max-w-[420px]">
                  {dados.diretora.nome && (
                    <div className="border-t border-escola-cinza pt-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src="/logo-transparente.png"
                            alt=""
                            aria-hidden="true"
                            fill
                            sizes="20px"
                            className="object-contain"
                          />
                        </div>
                        <p className="font-serif text-[13px] text-escola-preto leading-tight">
                          {dados.diretora.nome}
                        </p>
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza">
                        {dados.diretora.cargo}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-escola-cinza pt-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {marca && (
                        // `alt` vazio de propósito: o nome vem logo ao lado, e
                        // anunciar os dois faria o leitor de tela repetir a
                        // mesma informação duas vezes.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={marca}
                          alt=""
                          aria-hidden="true"
                          className="w-5 h-5 flex-shrink-0 object-contain"
                        />
                      )}
                      <p className="font-serif text-[13px] text-escola-preto leading-tight">
                        {dados.professor.nome}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-escola-cinza">
                      {dados.professor.cargo}
                    </p>
                  </div>
                </div>
              </div>

              {/* O selo ocupa o lugar que era da validação. Ele fecha o
                  documento do lado direito e equilibra a data à esquerda, com a
                  assinatura no meio — a validação desceu para a faixa, onde
                  cabe numa linha só e some do caminho da leitura. */}
              <div className="order-3 flex justify-center sm:justify-end">
                <div className="selo" role="img" aria-label={`Selo de conclusão — curso concluído em ${anoEmissao}`}>
                  <div className="selo-disco">
                    <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-white/70">
                      Curso
                    </span>
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.04em] text-white">
                      Concluído
                    </span>
                    <span aria-hidden="true" className="block w-5 h-px bg-white/45 my-[3px]" />
                    <span className="font-mono text-[7px] tracking-[0.16em] text-white/80">
                      {anoEmissao}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Faixa de baixo: a validação, numa linha só. Fecha a folha contra
                a faixa de cima — sem ela o documento sairia com tarja apenas no
                topo, que lê como cabeçalho, não como peça acabada. */}
            <div className="faixa flex-shrink-0 px-6 sm:px-10 py-1.5 sm:py-2">
              <p className="font-mono text-[8px] sm:text-[9px] text-white/75 leading-snug">
                Código de validação{' '}
                <strong className="font-mono text-white tracking-wider">{dados.codigo}</strong>
                <span className="hidden sm:inline"> · </span>
                {/* O caminho é indivisível: o navegador quebra depois de hífen
                    por conta própria e partiria o código em "JB-" e "SS4DRGRH". */}
                <span className="block sm:inline">
                  escolaestadualdrjoaoberaldo.com<wbr />
                  <span className="whitespace-nowrap">/certificado/{dados.codigo}</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <BotaoImprimirCertificado />
    </div>
  )
}
