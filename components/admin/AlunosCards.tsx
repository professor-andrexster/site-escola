'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, CheckCircle2, XCircle, UserCheck, AlertTriangle, Edit, Key } from 'lucide-react'
import type { Aluno } from '@/types/database'
import { TURMAS } from '@/lib/turmas'

interface AlunosCardsProps {
  alunos: Aluno[]
}

export default function AlunosCards({ alunos }: AlunosCardsProps) {
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [turma, setTurma] = useState('Todas')
  const [status, setStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')

  const handleBusca = (value: string) => {
    setBusca(value)
    const t = setTimeout(() => setBuscaDebounced(value.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }

  const filtrados = useMemo(() => {
    return alunos.filter(a => {
      if (turma !== 'Todas' && a.turma !== turma) return false
      if (status === 'ativo' && !a.ativo) return false
      if (status === 'inativo' && a.ativo) return false
      if (buscaDebounced) {
        const alvo = `${a.nome} ${a.matricula}`.toLowerCase()
        if (!alvo.includes(buscaDebounced)) return false
      }
      return true
    })
  }, [alunos, turma, status, buscaDebounced])

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            placeholder="Buscar por nome ou matrícula..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        <select
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-escola-azul/30 bg-white"
        >
          <option value="Todas">Todas as turmas</option>
          {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'todos' | 'ativo' | 'inativo')}
          className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-escola-azul/30 bg-white"
        >
          <option value="todos">Ativos e inativos</option>
          <option value="ativo">Somente ativos</option>
          <option value="inativo">Somente inativos</option>
        </select>
      </div>

      {filtrados.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">
            {alunos.length === 0 ? 'Nenhum aluno cadastrado ainda.' : 'Nenhum aluno encontrado com esses filtros.'}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {filtrados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(a => (
            <Link
              key={a.id}
              href={`/admin/alunos/${a.id}`}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-escola-azul/50 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-escola-azul transition-colors">
                    {a.nome}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Matrícula {a.matricula}</p>
                </div>
                {a.ativo ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Turma:</span> {a.turma}
                </p>
                {a.email && (
                  <p className="text-xs text-gray-600 truncate">
                    <span className="font-medium">Email:</span> {a.email}
                  </p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {a.user_id ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-1 rounded">
                    <UserCheck className="w-3 h-3" />
                    Tem conta
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    Sem conta
                  </span>
                )}
                {!a.cpf && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Falta CPF
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // Editar será feito pelo link
                  }}
                  className="flex-1 flex items-center justify-center gap-1 bg-escola-azul/10 text-escola-azul hover:bg-escola-azul/20 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
                {a.user_id && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      // Resetar senha
                    }}
                    className="flex items-center justify-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                    title="Resetar senha"
                  >
                    <Key className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
