import { GraduationCap } from 'lucide-react'
import type { ProgressoCurso } from '@/lib/cursosProgresso'

export default function AlunoProgressoCursos({ progresso }: { progresso: ProgressoCurso[] }) {
  const comAulas = progresso.filter(p => p.totalAulas > 0)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-escola-azul" />
        Progresso em Cursos
      </h2>

      {comAulas.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum curso publicado com aulas no momento.</p>
      ) : (
        <div className="space-y-3">
          {comAulas.map(c => (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 font-medium truncate">{c.titulo}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {c.aulasConcluidas}/{c.totalAulas} aulas · {c.percentual}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-escola-azul rounded-full transition-all"
                  style={{ width: `${c.percentual}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
