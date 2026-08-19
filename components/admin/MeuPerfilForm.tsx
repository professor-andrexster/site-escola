'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, Camera, X } from 'lucide-react'
import type { Aluno } from '@/types/database'
import { enviarArquivo } from '@/lib/enviarArquivo'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarEmail(email: string): boolean {
  return REGEX_EMAIL.test(email)
}

/**
 * Os dados chegam prontos do servidor, que ja sabe quem esta logado.
 *
 * Antes o componente montava vazio e buscava em useEffect, entao a tela
 * abria em "Carregando..." em toda visita — e o HTML entregue nao continha
 * nada do perfil, o que tambem tornava a tela impossivel de verificar sem
 * navegador.
 */
export default function MeuPerfilForm({ aluno }: { aluno: Partial<Aluno> }) {
  const [telefone, setTelefone] = useState(aluno.telefone ?? '')
  const [email, setEmail] = useState(aluno.email ?? '')
  const [responsavel, setResponsavel] = useState(aluno.responsavel ?? '')
  const [fotoUrl, setFotoUrl] = useState(aluno.foto_url ?? '')
  const [uploadandoFoto, setUploadandoFoto] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()


  /**
   * Grava a foto na hora, sem depender de um segundo clique em "Salvar".
   *
   * O servidor espelha em `profiles.avatar_url`, que é o que a sidebar e o
   * cabeçalho mostram — antes disso a foto era gravada só na ficha e o aluno
   * continuava vendo as próprias iniciais, com cara de que não salvou.
   */
  async function salvarFoto(url: string | null): Promise<boolean> {
    const res = await fetch('/api/alunos/meu-perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foto_url: url }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setErro(json.error ?? 'Erro ao salvar a foto.')
      return false
    }
    setFotoUrl(url ?? '')
    setSucesso(true)
    setTimeout(() => setSucesso(false), 3000)
    // A sidebar e o cabeçalho são renderizados no servidor: sem recarregar, o
    // avatar antigo continuaria na tela até a próxima navegação.
    router.refresh()
    return true
  }

  async function handleUploadFoto(file: File) {
    if (!file || !aluno?.id) return

    // Conferido aqui só para dar mensagem clara antes da ida ao servidor, que
    // valida de novo por conta própria.
    if (!file.type.startsWith('image/')) {
      setErro('Escolha uma imagem (JPG, PNG ou WebP).')
      return
    }
    const MAX_MB = 5
    if (file.size > MAX_MB * 1024 * 1024) {
      setErro(`A imagem tem ${(file.size / 1024 / 1024).toFixed(1)} MB. O limite é ${MAX_MB} MB — tire uma foto em resolução menor ou reduza antes de enviar.`)
      return
    }

    setUploadandoFoto(true)
    setErro('')
    setSucesso(false)

    try {
      // A confusão dos buckets acabou junto com os buckets: o servidor
      // resolve a pasta a partir da finalidade.
      const enviado = await enviarArquivo('avatar', file)
      if ('erro' in enviado) {
        setErro(enviado.erro)
        return
      }
      await salvarFoto(enviado.url)
    } catch {
      setErro('Erro ao fazer upload da foto.')
    } finally {
      setUploadandoFoto(false)
    }
  }

  async function handleRemoverFoto() {
    if (!confirm('Remover sua foto de perfil?')) return
    setUploadandoFoto(true)
    setErro('')
    try {
      await salvarFoto(null)
    } finally {
      setUploadandoFoto(false)
    }
  }

  async function handleSalvar() {
    setErro('')
    setSucesso(false)

    if (email.trim() && !validarEmail(email)) {
      setErro('E-mail inválido. Insira um e-mail válido (ex: aluno@escola.com).')
      return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/alunos/meu-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          telefone: telefone || null,
          responsavel: responsavel || null,
          // A foto NAO vai aqui: ela tem gravacao propria e imediata. Reenviar
          // junto faria o botao Salvar sobrescrever a foto com o que estivesse
          // na tela, desfazendo uma troca feita em outra aba.
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setErro(json.error ?? 'Erro ao salvar.')
        return
      }

      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro('Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="panel p-5 space-y-4 max-w-2xl">
      {erro && (
        <div className="flex items-start gap-3 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{erro}</p>
        </div>
      )}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Perfil atualizado com sucesso!
        </div>
      )}

      {/* Cartão de identificação: foto, nome e os dados que a secretaria
          controla. A foto vem primeiro porque é o que a pessoa entra aqui para
          mexer — antes ela estava no fim, depois de três campos de texto. */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-gray-200">
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={aluno.nome}
              className="w-28 h-28 rounded-full object-cover border-2 border-white shadow-elevation-low"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-escola-azul/10 border-2 border-dashed border-escola-azul/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-escola-azul/60 font-playfair">
                {(aluno.nome ?? '?')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          )}

          <label
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              uploadandoFoto
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-escola-azul text-white hover:bg-escola-azul/90 cursor-pointer'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {uploadandoFoto ? 'Enviando...' : fotoUrl ? 'Trocar foto' : 'Enviar foto'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadandoFoto}
              onChange={e => e.target.files?.[0] && handleUploadFoto(e.target.files[0])}
            />
          </label>

          {fotoUrl && (
            <button
              type="button"
              onClick={handleRemoverFoto}
              disabled={uploadandoFoto}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <X className="w-3 h-3 inline mr-0.5" />
              Remover
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-start">
          <p className="font-playfair text-xl font-bold text-gray-900">{aluno.nome}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-sm">
            <span className="text-gray-500">
              Matrícula <span className="font-mono text-gray-700">{aluno.matricula}</span>
            </span>
            <span className="text-gray-500">
              Turma <span className="font-semibold text-gray-700">{aluno.turma}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Nome, matrícula e turma são mantidos pela secretaria. Se algum estiver errado, fale com
            a direção. A foto salva sozinha, sem precisar clicar em Salvar.
          </p>
        </div>
      </div>

      <h2 className="font-semibold text-gray-900 text-sm">Dados que você pode atualizar</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(xx) 9xxxx-xxxx"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@escola.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          placeholder="Nome do responsável"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className={`flex items-center gap-2 bg-escola-azul text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            salvando ? 'opacity-60 cursor-not-allowed' : 'hover:bg-escola-azul/90 cursor-pointer'
          }`}
        >
          <Save className="w-4 h-4" />
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
