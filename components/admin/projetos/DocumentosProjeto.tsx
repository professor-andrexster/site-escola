'use client'

import { useRef, useState } from 'react'
import { FileText, Paperclip, Trash2, Upload } from 'lucide-react'
import type { Documento } from '@/lib/projetos-turma-tipos'

interface Props {
  trabalhoId: string
  documentosIniciais: Documento[]
  podeEditar: boolean
}

const CAMPO = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30'

const tamanho = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/**
 * Documentos do projeto: PDFs de instrucao. O aluno ve e baixa; o professor
 * envia e remove ali mesmo, sem passar pelo formulario de edicao.
 *
 * Se o envio falhar, o arquivo escolhido e o titulo ficam no formulario — o
 * professor so aperta Enviar de novo.
 */
export default function DocumentosProjeto({ trabalhoId, documentosIniciais, podeEditar }: Props) {
  const [documentos, setDocumentos] = useState(documentosIniciais)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const campoArquivo = useRef<HTMLInputElement>(null)

  if (!podeEditar && documentos.length === 0) return null

  async function enviar() {
    if (!arquivo) { setErro('Escolha um PDF.'); return }
    if (!/\.pdf$/i.test(arquivo.name) && arquivo.type !== 'application/pdf') { setErro('Envie um arquivo PDF.'); return }
    if (arquivo.size > 20 * 1024 * 1024) { setErro('O PDF passa de 20 MB. Diminua o arquivo e tente de novo.'); return }
    setOcupado(true)
    setErro('')
    setAviso('')
    try {
      const form = new FormData()
      form.append('arquivo', arquivo)
      form.append('titulo', titulo)
      const res = await fetch(`/api/projetos-turma/trabalhos/${trabalhoId}/documentos`, { method: 'POST', body: form })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok || !dados?.ok) {
        setErro(`${dados?.error ?? 'Não foi possível enviar o PDF.'} O arquivo continua selecionado, tente de novo.`)
        return
      }
      setDocumentos(dados.documentos)
      setArquivo(null)
      setTitulo('')
      if (campoArquivo.current) campoArquivo.current.value = ''
      setAviso('Documento adicionado. Os alunos já conseguem abrir.')
    } catch {
      setErro('Sem conexão com o servidor. O arquivo continua selecionado, tente de novo quando a internet voltar.')
    } finally {
      setOcupado(false)
    }
  }

  async function remover(docId: string) {
    setOcupado(true)
    setErro('')
    setAviso('')
    try {
      const res = await fetch(`/api/projetos-turma/trabalhos/${trabalhoId}/documentos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId }),
      })
      const dados = await res.json().catch(() => ({}))
      if (!res.ok || !dados?.ok) { setErro(dados?.error ?? 'Não foi possível remover o documento.'); return }
      setDocumentos(dados.documentos)
      setConfirmando(null)
    } catch {
      setErro('Sem conexão com o servidor. Nada foi removido.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <section className="panel p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Paperclip className="w-5 h-5 text-escola-azul" />
        <h2 className="font-geom text-lg font-bold text-gray-900">Documentos do projeto</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {podeEditar ? 'PDFs de instruções. Os alunos da série veem e baixam aqui.' : 'Instruções do trabalho. Abra para ler ou imprimir.'}
      </p>

      {documentos.length > 0 ? (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg mb-4">
          {documentos.map(d => (
            <li key={d.id} className="flex items-center gap-3 p-3">
              <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-escola-azul truncate">{d.titulo}</p>
                <p className="text-xs text-gray-500">PDF · {tamanho(d.tamanho)} · {dia(d.enviadoEm)}</p>
              </a>
              {podeEditar && (confirmando === d.id ? (
                <span className="flex items-center gap-2 text-xs flex-shrink-0">
                  <span className="text-gray-600">Remover?</span>
                  <button type="button" disabled={ocupado} onClick={() => remover(d.id)} className="font-semibold text-red-600 hover:underline disabled:opacity-50">Sim</button>
                  <button type="button" disabled={ocupado} onClick={() => setConfirmando(null)} className="text-gray-500 hover:underline">Não</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmando(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 flex-shrink-0" aria-label={`Remover ${d.titulo}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 mb-4">Nenhum documento ainda.</p>
      )}

      {podeEditar && (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Arquivo PDF (até 20 MB)</span>
            <input
              ref={campoArquivo}
              type="file"
              accept="application/pdf,.pdf"
              onChange={e => { setArquivo(e.target.files?.[0] ?? null); setErro('') }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-escola-azul"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Título (opcional)</span>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={140} placeholder="Ex.: Instruções da etapa 2" className={CAMPO} />
          </label>
          <button
            type="button"
            onClick={enviar}
            disabled={ocupado || !arquivo}
            className="inline-flex items-center justify-center gap-2 bg-escola-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-escola-azul-medio transition-colors disabled:opacity-50 foco-painel"
          >
            <Upload className="w-4 h-4" />
            {ocupado ? 'Enviando…' : 'Adicionar PDF'}
          </button>
        </div>
      )}

      {erro && <p className="text-sm text-red-600 mt-3" role="alert">{erro}</p>}
      {aviso && <p className="text-sm text-green-700 mt-3">{aviso}</p>}
    </section>
  )
}
