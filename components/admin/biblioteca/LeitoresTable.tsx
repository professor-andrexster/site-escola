'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, GraduationCap, BookOpen, Briefcase, Users as UsersIcon, Lock } from 'lucide-react'
import type { BibliotecaLeitor } from '@/types/database'

const TIPO_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  aluno: { label: 'Aluno', icon: GraduationCap },
  professor: { label: 'Professor', icon: BookOpen },
  funcionario: { label: 'Funcionário', icon: Briefcase },
  comunidade: { label: 'Comunidade', icon: UsersIcon },
}

const SITUACAO_COR: Record<string, string> = {
  ativo: 'bg-green-50 text-green-700 border-green-200',
  inativo: 'bg-gray-50 text-gray-500 border-gray-200',
  bloqueado: 'bg-red-50 text-red-700 border-red-200',
}

export default function LeitoresTable({ leitores }: { leitores: BibliotecaLeitor[] }) {
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('Todos')
  const [situacao, setSituacao] = useState('Todas')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return leitores.filter(l => {
      if (tipo !== 'Todos' && l.tipo_leitor !== tipo) return false
      if (situacao !== 'Todas' && l.situacao !== situacao) return false
      if (termo) {
        const alvo = `${l.nome_completo} ${l.matricula ?? ''} ${l.turma ?? ''}`.toLowerCase()
        if (!alvo.includes(termo)) return false
      }
      return true
    })
  }, [leitores, tipo, situacao, busca])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, matrícula ou turma..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30"
          />
        </div>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 bg-white">
          <option value="Todos">Todos os tipos</option>
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
          <option value="funcionario">Funcionário</option>
          <option value="comunidade">Comunidade</option>
        </select>
        <select value={situacao} onChange={(e) => setSituacao(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2.5 bg-white">
          <option value="Todas">Todas as situações</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-gray-400 text-sm">
            {leitores.length === 0 ? 'Nenhum leitor cadastrado ainda.' : 'Nenhum leitor encontrado com esses filtros.'}
          </p>
        </div>
      ) : (
        <div className="panel divide-y divide-gray-100 overflow-hidden">
          {filtrados.map(l => {
            const cfg = TIPO_CONFIG[l.tipo_leitor] ?? TIPO_CONFIG.comunidade
            const Icon = cfg.icon
            return (
              <Link
                key={l.id}
                href={`/admin/biblioteca/leitores/${l.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{l.nome_completo}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {cfg.label}{l.turma && ` · Turma ${l.turma}`}{l.matricula && ` · Matrícula ${l.matricula}`}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full border flex items-center gap-1 ${SITUACAO_COR[l.situacao]}`}>
                  {l.situacao === 'bloqueado' && <Lock className="w-3 h-3" />}
                  {l.situacao === 'ativo' ? 'Ativo' : l.situacao === 'inativo' ? 'Inativo' : 'Bloqueado'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
