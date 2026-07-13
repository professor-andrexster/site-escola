'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, CheckCircle2, XCircle, UserCheck, AlertTriangle } from 'lucide-react'
import type { Aluno } from '@/types/database'
import { TURMAS } from '@/lib/turmas'

interface AlunosTableProps {
  alunos: Aluno[]
}

export default function AlunosTable({ alunos }: AlunosTableProps) {
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [turma, setTurma] = useState('Todas')
  const [status, setStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [busca])

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
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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

      {/* Mobile: cards */}
      {filtrados.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtrados.map(a => (
            <Link
              key={a.id}
              href={`/admin/alunos/${a.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-escola-azul/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Matrícula {a.matricula} · {a.turma}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {a.user_id
                      ? <span className="inline-flex items-center gap-1 text-[11px] text-green-600"><UserCheck className="w-3 h-3" /> Tem conta</span>
                      : <span className="text-[11px] text-gray-300">Sem conta</span>}
                    {!a.cpf && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600"><AlertTriangle className="w-3 h-3" /> Falta CPF</span>
                    )}
                  </div>
                </div>
                {a.ativo
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Desktop: tabela */}
      {filtrados.length > 0 && (
        <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Matrícula</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Conta</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/alunos/${a.id}`} className="font-medium text-gray-900 hover:text-escola-azul">
                      {a.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.matricula}</td>
                  <td className="px-4 py-3 text-gray-500">{a.turma}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {a.user_id
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" /> Tem conta</span>
                        : <span className="text-gray-300 text-xs">Sem conta</span>}
                      {!a.cpf && (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs" title="Sem CPF o aluno não consegue criar a conta">
                          <AlertTriangle className="w-3.5 h-3.5" /> Falta CPF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {a.ativo
                      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Ativo</span>
                      : <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Inativo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
