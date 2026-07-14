'use client'

import { useState } from 'react'
import { LayoutList, LayoutGrid } from 'lucide-react'
import AlunosTable from './AlunosTable'
import AlunosCards from './AlunosCards'
import type { Aluno } from '@/types/database'

interface AlunosViewProps {
  alunos: Aluno[]
}

type ViewMode = 'list' | 'card'

export default function AlunosView({ alunos }: AlunosViewProps) {
  const [view, setView] = useState<ViewMode>('list')

  return (
    <div>
      {/* Toggle View */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            view === 'list'
              ? 'bg-escola-azul text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          Lista
        </button>
        <button
          onClick={() => setView('card')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            view === 'card'
              ? 'bg-escola-azul text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Cards
        </button>
      </div>

      {/* View Content */}
      {view === 'list' ? (
        <AlunosTable alunos={alunos} />
      ) : (
        <AlunosCards alunos={alunos} />
      )}
    </div>
  )
}
