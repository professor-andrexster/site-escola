'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Upload, X, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BibliotecaObra } from '@/types/database'

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

interface OpcaoNome {
  id: string
  nome: string
}

interface ObraFormProps {
  obra?: BibliotecaObra
  autoresIniciais?: OpcaoNome[]
  editoraNomeInicial?: string | null
  categoriaNomeInicial?: string | null
}

async function buscarOuCriar(caminho: 'autores' | 'editoras' | 'categorias', nome: string): Promise<OpcaoNome> {
  const busca = await fetch(`/api/biblioteca/${caminho}?q=${encodeURIComponent(nome)}`)
  const json = await busca.json()
  const lista: OpcaoNome[] = json[caminho] ?? []
  const existente = lista.find(o => o.nome.toLowerCase() === nome.trim().toLowerCase())
  if (existente) return existente

  const criar = await fetch(`/api/biblioteca/${caminho}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: nome.trim() }),
  })
  const jsonCriado = await criar.json()
  const chave = caminho === 'autores' ? 'autor' : caminho === 'editoras' ? 'editora' : 'categoria'
  if (!criar.ok) throw new Error(jsonCriado.error ?? `Erro ao criar ${chave}.`)
  return jsonCriado[chave]
}

export default function ObraForm({ obra, autoresIniciais = [], editoraNomeInicial, categoriaNomeInicial }: ObraFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [titulo, setTitulo] = useState(obra?.titulo ?? '')
  const [subtitulo, setSubtitulo] = useState(obra?.subtitulo ?? '')
  const [isbn, setIsbn] = useState(obra?.isbn ?? '')
  const [anoPublicacao, setAnoPublicacao] = useState(obra?.ano_publicacao?.toString() ?? '')
  const [edicao, setEdicao] = useState(obra?.edicao ?? '')
  const [idioma, setIdioma] = useState(obra?.idioma ?? 'Português')
  const [numeroPaginas, setNumeroPaginas] = useState(obra?.numero_paginas?.toString() ?? '')
  const [sinopse, setSinopse] = useState(obra?.sinopse ?? '')
  const [palavrasChave, setPalavrasChave] = useState<string[]>(obra?.palavras_chave ?? [])
  const [palavraChaveInput, setPalavraChaveInput] = useState('')
  const [publicoIndicado, setPublicoIndicado] = useState(obra?.publico_indicado ?? '')
  const [areaConhecimento, setAreaConhecimento] = useState(obra?.area_conhecimento ?? '')
  const [classificacaoCatalogacao, setClassificacaoCatalogacao] = useState(obra?.classificacao_catalogacao ?? '')
  const [observacoesInternas, setObservacoesInternas] = useState(obra?.observacoes_internas ?? '')
  const [capaUrl, setCapaUrl] = useState(obra?.capa_url ?? '')
  const [uploadandoCapa, setUploadandoCapa] = useState(false)

  const [editoraNome, setEditoraNome] = useState(editoraNomeInicial ?? '')
  const [categoriaNome, setCategoriaNome] = useState(categoriaNomeInicial ?? '')
  const [opcoesEditoras, setOpcoesEditoras] = useState<OpcaoNome[]>([])
  const [opcoesCategorias, setOpcoesCategorias] = useState<OpcaoNome[]>([])

  const [autores, setAutores] = useState<OpcaoNome[]>(autoresIniciais)
  const [autorInput, setAutorInput] = useState('')
  const [adicionandoAutor, setAdicionandoAutor] = useState(false)

  const [buscandoIsbn, setBuscandoIsbn] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch('/api/biblioteca/editoras').then(r => r.json()).then(j => setOpcoesEditoras(j.editoras ?? []))
    fetch('/api/biblioteca/categorias').then(r => r.json()).then(j => setOpcoesCategorias(j.categorias ?? []))
  }, [])

  async function adicionarAutor() {
    const nome = autorInput.trim()
    if (!nome) return
    if (autores.some(a => a.nome.toLowerCase() === nome.toLowerCase())) {
      setAutorInput('')
      return
    }
    setAdicionandoAutor(true)
    setErro('')
    try {
      const autor = await buscarOuCriar('autores', nome)
      setAutores(prev => [...prev, autor])
      setAutorInput('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao adicionar autor.')
    }
    setAdicionandoAutor(false)
  }

  function removerAutor(id: string) {
    setAutores(prev => prev.filter(a => a.id !== id))
  }

  async function buscarIsbn() {
    if (!isbn.trim()) return
    setBuscandoIsbn(true)
    setErro('')
    const res = await fetch(`/api/biblioteca/isbn/${encodeURIComponent(isbn.trim())}`)
    const json = await res.json()
    if (!res.ok) {
      setErro(json.error ?? 'Não encontramos esse ISBN.')
      setBuscandoIsbn(false)
      return
    }
    const dados = json.dados
    if (dados.titulo) setTitulo(dados.titulo)
    if (dados.subtitulo) setSubtitulo(dados.subtitulo)
    if (dados.anoPublicacao) setAnoPublicacao(String(dados.anoPublicacao))
    if (dados.numeroPaginas) setNumeroPaginas(String(dados.numeroPaginas))
    if (dados.editora) setEditoraNome(dados.editora)
    for (const nomeAutor of dados.autores ?? []) {
      try {
        const autor = await buscarOuCriar('autores', nomeAutor)
        setAutores(prev => (prev.some(a => a.id === autor.id) ? prev : [...prev, autor]))
      } catch {
        // segue sem travar o preenchimento se um autor falhar
      }
    }
    setBuscandoIsbn(false)
  }

  async function uploadCapa(file: File) {
    setUploadandoCapa(true)
    setErro('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `capas/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('biblioteca').upload(fileName, file, { upsert: true })
      if (uploadError) throw new Error('Erro ao enviar a capa.')
      const { data: { publicUrl } } = supabase.storage.from('biblioteca').getPublicUrl(fileName)
      setCapaUrl(publicUrl)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar a capa.')
    }
    setUploadandoCapa(false)
  }

  async function handleSalvar() {
    if (!titulo.trim()) { setErro('Informe o título da obra.'); return }
    setSalvando(true)
    setErro('')

    try {
      let editoraId: string | null = null
      if (editoraNome.trim()) editoraId = (await buscarOuCriar('editoras', editoraNome)).id

      let categoriaId: string | null = null
      if (categoriaNome.trim()) categoriaId = (await buscarOuCriar('categorias', categoriaNome)).id

      const corpo = {
        titulo: titulo.trim(),
        subtitulo: subtitulo || null,
        anoPublicacao: anoPublicacao ? parseInt(anoPublicacao, 10) : null,
        edicao: edicao || null,
        isbn: isbn || null,
        idioma,
        numeroPaginas: numeroPaginas ? parseInt(numeroPaginas, 10) : null,
        sinopse: sinopse || null,
        palavrasChave,
        publicoIndicado: publicoIndicado || null,
        areaConhecimento: areaConhecimento || null,
        classificacaoCatalogacao: classificacaoCatalogacao || null,
        capaUrl: capaUrl || null,
        observacoesInternas: observacoesInternas || null,
        editoraId,
        categoriaId,
        autorIds: autores.map(a => a.id),
      }

      const res = await fetch(obra ? `/api/biblioteca/obras/${obra.id}` : '/api/biblioteca/obras', {
        method: obra ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao salvar a obra.')

      if (obra) {
        router.refresh()
      } else {
        router.push(`/admin/biblioteca/acervo/${json.obra.id}`)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar a obra.')
    }
    setSalvando(false)
  }

  return (
    <div className="panel p-5 space-y-4">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{erro}</div>}

      <div>
        <label className={labelClass}>ISBN</label>
        <div className="flex gap-2">
          <input value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="978..." className={inputClass} />
          <button
            type="button"
            onClick={buscarIsbn}
            disabled={buscandoIsbn}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            {buscandoIsbn ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Busca online preenche os campos abaixo, sempre editáveis antes de salvar.</p>
      </div>

      <div>
        <label className={labelClass}>Título *</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Subtítulo</label>
        <input value={subtitulo} onChange={e => setSubtitulo(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Autores</label>
        <div className="flex gap-2">
          <input
            value={autorInput}
            onChange={e => setAutorInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarAutor() } }}
            placeholder="Nome do autor"
            className={inputClass}
          />
          <button
            type="button"
            onClick={adicionarAutor}
            disabled={adicionandoAutor}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            Adicionar
          </button>
        </div>
        {autores.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {autores.map(a => (
              <span key={a.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {a.nome}
                <X className="w-3 h-3 cursor-pointer" onClick={() => removerAutor(a.id)} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Editora</label>
          <input value={editoraNome} onChange={e => setEditoraNome(e.target.value)} list="editoras-lista" className={inputClass} />
          <datalist id="editoras-lista">
            {opcoesEditoras.map(o => <option key={o.id} value={o.nome} />)}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <input value={categoriaNome} onChange={e => setCategoriaNome(e.target.value)} list="categorias-lista" className={inputClass} />
          <datalist id="categorias-lista">
            {opcoesCategorias.map(o => <option key={o.id} value={o.nome} />)}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Ano de publicação</label>
          <input type="number" value={anoPublicacao} onChange={e => setAnoPublicacao(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Edição</label>
          <input value={edicao} onChange={e => setEdicao(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Número de páginas</label>
          <input type="number" value={numeroPaginas} onChange={e => setNumeroPaginas(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Idioma</label>
          <input value={idioma} onChange={e => setIdioma(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Público indicado</label>
          <input value={publicoIndicado} onChange={e => setPublicoIndicado(e.target.value)} placeholder="Infantil, juvenil, adulto" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Área de conhecimento</label>
          <input value={areaConhecimento} onChange={e => setAreaConhecimento(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Classificação de catalogação</label>
        <input value={classificacaoCatalogacao} onChange={e => setClassificacaoCatalogacao(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Sinopse</label>
        <textarea value={sinopse} onChange={e => setSinopse(e.target.value)} rows={3} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Palavras chave</label>
        <div className="flex gap-2">
          <input
            value={palavraChaveInput}
            onChange={e => setPalavraChaveInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const valor = palavraChaveInput.trim()
                if (valor && !palavrasChave.includes(valor)) setPalavrasChave(prev => [...prev, valor])
                setPalavraChaveInput('')
              }
            }}
            placeholder="Digite e aperte Enter"
            className={inputClass}
          />
        </div>
        {palavrasChave.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {palavrasChave.map(p => (
              <span key={p} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {p}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPalavrasChave(prev => prev.filter(x => x !== p))} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Capa</label>
        <div className="flex gap-4 items-start">
          {capaUrl ? (
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capaUrl} alt={titulo} className="w-20 h-28 rounded-lg object-cover border border-gray-200" />
              <button type="button" onClick={() => setCapaUrl('')} className="text-xs text-red-600 hover:text-red-700">
                <X className="w-4 h-4 inline mr-1" />
                Remover
              </button>
            </div>
          ) : (
            <div className="w-20 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0">
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && uploadCapa(e.target.files[0])}
              disabled={uploadandoCapa}
              className="w-full text-sm"
            />
            {uploadandoCapa && <p className="text-xs text-gray-500 mt-2">Enviando...</p>}
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Observações internas</label>
        <textarea value={observacoesInternas} onChange={e => setObservacoesInternas(e.target.value)} rows={2} className={inputClass} />
        <p className="text-xs text-gray-400 mt-1">Só a equipe da biblioteca vê isso, não aparece na consulta pública.</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !salvando && handleSalvar()}
        onKeyDown={e => { if (e.key === 'Enter' && !salvando) handleSalvar() }}
        className={`inline-flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer hover:bg-escola-azul/90 ${salvando ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <Save className="w-4 h-4" />
        {salvando ? 'Salvando...' : 'Salvar Obra'}
      </div>
    </div>
  )
}
