'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, CheckCircle2, Clock, Upload, XCircle } from 'lucide-react'
import { enviarArquivo } from '@/lib/enviarArquivo'

type Desafio = {
  id: string
  titulo: string
  enunciado: string
  formatos_aceitos: string | null
  instrucoes_envio: string | null
}

type Envio = {
  status: string
  arquivo_url: string | null
  link_url: string | null
  comentario: string | null
  feedback_professor: string | null
  enviado_em: string
}

/**
 * Envio do desafio final do curso.
 *
 * A tela muda com o estado, porque as três situações pedem coisas diferentes:
 * quem ainda não enviou precisa do enunciado inteiro; quem está esperando
 * precisa saber que está esperando; e quem foi recusado precisa ler a
 * devolutiva ANTES do formulário, senão reenvia sem corrigir.
 */
export default function DesafioFinal({
  desafio,
  envioInicial,
  certificadoCodigo,
}: {
  desafio: Desafio
  envioInicial: Envio | null
  certificadoCodigo: string | null
}) {
  const [envio, setEnvio] = useState(envioInicial)
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(envioInicial?.arquivo_url ?? null)
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [linkUrl, setLinkUrl] = useState(envioInicial?.link_url ?? '')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [subindo, setSubindo] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const aprovado = envio?.status === 'aprovado'
  const aguardando = envio?.status === 'entregue'
  const recusado = envio?.status === 'recusado'

  async function subirArquivo(file: File) {
    setSubindo(true)
    setErro('')
    const r = await enviarArquivo('desafio-curso', file)
    if ('erro' in r) setErro(r.erro)
    else { setArquivoUrl(r.url); setNomeArquivo(file.name) }
    setSubindo(false)
  }

  async function enviar() {
    if (!arquivoUrl && !linkUrl.trim()) {
      setErro('Envie o arquivo do seu projeto ou cole o link onde ele está publicado.')
      return
    }
    setEnviando(true)
    setErro('')
    const res = await fetch('/api/cursos/desafio-final', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        desafioId: desafio.id,
        arquivoUrl,
        linkUrl: linkUrl.trim() || null,
        comentario: comentario.trim() || null,
      }),
    })
    const json = await res.json().catch(() => ({}))
    setEnviando(false)
    if (!res.ok) { setErro(json.error ?? 'Erro ao enviar.'); return }
    setEnvio(json.envio)
    router.refresh()
  }

  // ------------------------------------------------------------- aprovado
  if (aprovado) {
    return (
      <section className="panel p-6 border-2 border-green-200 bg-green-50/40">
        <div className="flex items-start gap-3">
          <Award className="w-7 h-7 text-green-600 flex-shrink-0" />
          <div>
            <h2 className="font-playfair text-xl font-bold text-gray-900">Desafio aprovado</h2>
            <p className="text-sm text-gray-600 mt-1">
              Seu projeto foi aceito pelo professor e o certificado foi emitido.
            </p>
            {envio?.feedback_professor && (
              <p className="text-sm text-gray-700 mt-3 bg-white border border-green-100 rounded-lg p-3">
                <strong className="block text-xs uppercase tracking-wider text-green-700 mb-1">
                  O que o professor escreveu
                </strong>
                {envio.feedback_professor}
              </p>
            )}
            {certificadoCodigo && (
              <a
                href={`/certificado/${certificadoCodigo}`}
                className="inline-flex items-center gap-2 mt-4 bg-escola-azul text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-escola-azul-medio transition-colors"
              >
                <Award className="w-4 h-4" />
                Ver meu certificado
              </a>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="panel p-6">
      <div className="flex items-center gap-2 mb-1">
        <Award className="w-5 h-5 text-escola-azul" />
        <h2 className="font-playfair text-xl font-bold text-gray-900">{desafio.titulo}</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Este é o desafio final: quando o professor aprovar, seu certificado é emitido.
      </p>

      {aguardando && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-4">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Enviado. Aguardando a correção do professor — você pode reenviar até ele avaliar.</span>
        </div>
      )}

      {/* A devolutiva vem ANTES do formulário: reenviar sem ler o que foi
          pedido é o erro mais provável. */}
      {recusado && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <XCircle className="w-4 h-4" /> O professor pediu correções
          </p>
          {envio?.feedback_professor && (
            <p className="text-sm text-red-800 mt-2 whitespace-pre-line">{envio.feedback_professor}</p>
          )}
          <p className="text-xs text-red-600 mt-2">Corrija e envie de novo abaixo.</p>
        </div>
      )}

      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-5">
        {desafio.enunciado}
      </div>

      {desafio.instrucoes_envio && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5">
          <strong className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Como entregar</strong>
          {desafio.instrucoes_envio}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Arquivo do projeto
            {desafio.formatos_aceitos && (
              <span className="normal-case font-normal text-gray-500"> — {desafio.formatos_aceitos}</span>
            )}
          </label>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-escola-azul hover:text-escola-azul cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            {subindo ? 'Enviando...' : arquivoUrl ? 'Trocar arquivo' : 'Escolher arquivo'}
            <input
              type="file"
              className="hidden"
              disabled={subindo || enviando}
              onChange={e => e.target.files?.[0] && subirArquivo(e.target.files[0])}
            />
          </label>
          {arquivoUrl && (
            <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {nomeArquivo || 'arquivo anexado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Ou o link onde publicou
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://seu-usuario.github.io/seu-projeto"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-escola-azul transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Quer contar algo para o professor? <span className="normal-case font-normal text-gray-500">(opcional)</span>
          </label>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
            placeholder="Ex.: escolhi a padaria da minha avó; a parte de formulário foi a mais difícil."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-escola-azul transition-colors resize-none"
          />
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>
        )}

        <button
          onClick={() => void enviar()}
          disabled={enviando || subindo}
          className="w-full bg-escola-azul text-white font-semibold py-3 rounded-xl hover:bg-escola-azul-medio transition-colors disabled:opacity-50 text-sm"
        >
          {enviando ? 'Enviando...' : aguardando || recusado ? 'Reenviar projeto' : 'Enviar projeto'}
        </button>
      </div>
    </section>
  )
}
