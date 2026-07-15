'use client'

import { useState, useEffect } from 'react'
import { Save, AlertCircle, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Aluno } from '@/types/database'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validarEmail(email: string): boolean {
  return REGEX_EMAIL.test(email)
}

export default function MeuPerfilForm() {
  const supabase = createClient()
  const [aluno, setAluno] = useState<Partial<Aluno> | null>(null)
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [uploadandoFoto, setUploadandoFoto] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await fetch('/api/alunos/meu-perfil')
        if (!res.ok) {
          const json = await res.json()
          setErro(json.error || 'Erro ao carregar perfil.')
          setLoading(false)
          return
        }
        const dados = await res.json() as Aluno
        setAluno(dados)
        setTelefone(dados.telefone ?? '')
        setEmail(dados.email ?? '')
        setResponsavel(dados.responsavel ?? '')
        setFotoUrl(dados.foto_url ?? '')
      } catch (err) {
        setErro('Erro ao carregar perfil.')
      } finally {
        setLoading(false)
      }
    }
    carregarPerfil()
  }, [])

  async function handleUploadFoto(file: File) {
    if (!file || !aluno?.id) return

    setUploadandoFoto(true)
    setErro('')

    try {
      const ext = file.name.split('.').pop()
      const fileName = `alunos/${aluno.id}/foto-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('alunos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        setErro('Erro ao fazer upload da foto.')
        setUploadandoFoto(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('alunos')
        .getPublicUrl(fileName)

      setFotoUrl(publicUrl)
      setUploadandoFoto(false)
    } catch (err) {
      setErro('Erro ao fazer upload da foto.')
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
          foto_url: fotoUrl || null,
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

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-3 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{erro || 'Não foi possível carregar seus dados.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 max-w-2xl">
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

      <div className="space-y-4 pb-4 border-b border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {aluno.nome}
          </div>
          <p className="text-xs text-gray-400 mt-1">Não pode ser alterado. Solicite à direção se precisar de mudanças.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Matrícula</label>
          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {aluno.matricula}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Turma</label>
          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {aluno.turma}
          </div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sua Foto</label>
        <div className="flex gap-4">
          {fotoUrl ? (
            <div className="flex flex-col gap-2">
              <img src={fotoUrl} alt={aluno?.nome} className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => setFotoUrl('')}
                disabled={uploadandoFoto}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <X className="w-4 h-4 inline mr-1" />
                Remover
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleUploadFoto(e.target.files[0])}
              disabled={uploadandoFoto}
              className="w-full"
            />
            {uploadandoFoto && <p className="text-xs text-gray-500 mt-2">Enviando...</p>}
          </div>
        </div>
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
