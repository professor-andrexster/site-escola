import { createClient } from '@/lib/supabase/server'
import PaginasEditor from '@/components/admin/PaginasEditor'

const PAGINAS = [
  { chave: 'sobre', label: 'Sobre a Escola' },
  { chave: 'emti', label: 'O que é o EMTI' },
  { chave: 'projeto-vida', label: 'Projeto de Vida' },
  { chave: 'eletivas', label: 'Eletivas' },
  { chave: 'protagonismo', label: 'Protagonismo Juvenil' },
]

export default async function AdminPaginasPage() {
  const supabase = await createClient()
  const { data: paginas } = await supabase
    .from('paginas_conteudo')
    .select('*')
    .in('pagina', PAGINAS.map((p) => p.chave))

  const paginasMap = Object.fromEntries(
    (paginas ?? []).map((p) => [p.pagina, p])
  )

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-gray-900 mb-8">Editar Páginas</h1>
      <div className="space-y-6">
        {PAGINAS.map(({ chave, label }) => (
          <PaginasEditor
            key={chave}
            pagina={chave}
            label={label}
            initialData={paginasMap[chave]}
          />
        ))}
      </div>
    </div>
  )
}
