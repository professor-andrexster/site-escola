'use client'

import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RegistroLog {
  id: string
  user_id: string | null
  acao: string
  detalhes: Record<string, unknown> | null
  ip: string | null
  criado_em: string
  nome: string | null
}

const ACAO_LABELS: Record<string, { label: string; cor: string }> = {
  cadastro_aluno: { label: 'Cadastro de aluno', cor: 'bg-green-100 text-green-700' },
  cadastro_professor: { label: 'Cadastro de professor', cor: 'bg-blue-100 text-blue-700' },
  cadastro_recusado: { label: 'Cadastro recusado', cor: 'bg-red-100 text-red-700' },
  login_ok: { label: 'Login', cor: 'bg-gray-100 text-gray-600' },
  login_falha: { label: 'Login falhou', cor: 'bg-orange-100 text-orange-700' },
  senha_redefinida_cpf: { label: 'Senha redefinida (CPF)', cor: 'bg-purple-100 text-purple-700' },
  senha_redefinida_admin: { label: 'Senha redefinida (direção)', cor: 'bg-purple-100 text-purple-700' },
  recuperacao_recusada: { label: 'Recuperação recusada', cor: 'bg-red-100 text-red-700' },
  usuario_criado_direcao: { label: 'Usuário criado (direção)', cor: 'bg-blue-100 text-blue-700' },
}

const FILTROS = [
  { id: 'todos', label: 'Tudo' },
  { id: 'cadastros', label: 'Cadastros', acoes: ['cadastro_aluno', 'cadastro_professor', 'usuario_criado_direcao'] },
  { id: 'recusados', label: 'Tentativas recusadas', acoes: ['cadastro_recusado', 'recuperacao_recusada', 'login_falha'] },
  { id: 'senhas', label: 'Senhas', acoes: ['senha_redefinida_cpf', 'senha_redefinida_admin'] },
] as const

function detalheLegivel(detalhes: Record<string, unknown> | null): string {
  if (!detalhes) return ''
  const partes: string[] = []
  if (detalhes.matricula) partes.push(`matrícula ${detalhes.matricula}`)
  if (detalhes.turma) partes.push(`turma ${detalhes.turma}`)
  if (detalhes.identificador) partes.push(String(detalhes.identificador))
  if (detalhes.motivo) partes.push(`motivo: ${String(detalhes.motivo).replace(/_/g, ' ')}`)
  return partes.join(' · ')
}

export default function AtividadeLog({ registros }: { registros: RegistroLog[] }) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['id']>('todos')

  const visiveis = useMemo(() => {
    const def = FILTROS.find(f => f.id === filtro)
    if (!def || !('acoes' in def)) return registros
    return registros.filter(r => (def.acoes as readonly string[]).includes(r.acao))
  }, [registros, filtro])

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Atividade Recente
      </h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
              filtro === f.id
                ? 'bg-escola-azul text-white border-escola-azul'
                : 'bg-white text-gray-500 border-gray-200 hover:border-escola-azul/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Nenhuma atividade registrada ainda.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
          {visiveis.map(r => {
            const cfg = ACAO_LABELS[r.acao] ?? { label: r.acao, cor: 'bg-gray-100 text-gray-600' }
            const detalhe = detalheLegivel(r.detalhes)
            return (
              <div key={r.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <span className={cn('flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.cor)}>
                  {cfg.label}
                </span>
                <span className="text-gray-700 truncate">
                  {r.nome ?? ''}
                  {r.nome && detalhe ? ' · ' : ''}
                  <span className="text-gray-400">{detalhe}</span>
                </span>
                <span className="ml-auto flex-shrink-0 text-xs text-gray-400 font-mono">
                  {new Date(r.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
