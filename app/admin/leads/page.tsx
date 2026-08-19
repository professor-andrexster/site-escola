import { listarLeads, marcarLeadLido, removerLead } from '@/lib/db/comunidade'
import { requireGestao } from '@/lib/profile'
import { revalidatePath } from 'next/cache'
import type { Lead } from '@/types/database'

// Server actions sao endpoints publicos: quem tiver o id da action pode
// chama-la. No Supabase o RLS barrava por baixo; aqui a checagem precisa ser
// explicita, e requireGestao redireciona quem nao for gestao.
async function marcarLido(id: string) {
  'use server'
  await requireGestao()
  await marcarLeadLido(id)
  revalidatePath('/admin/leads')
}

async function deletarLead(id: string) {
  'use server'
  await requireGestao()
  await removerLead(id)
  revalidatePath('/admin/leads')
}

export default async function LeadsPage() {
  const leads = await listarLeads()
  const naoLidos = leads.filter(l => !l.lido).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">Leads</h1>
          {naoLidos > 0 && (
            <p className="text-sm text-escola-azul mt-1">{naoLidos} nova{naoLidos > 1 ? 's' : ''} mensagen{naoLidos > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-gray-500">Nenhuma mensagem recebida ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead: Lead) => (
            <div
              key={lead.id}
              className={`bg-white rounded-xl border shadow-elevation-low p-5 ${!lead.lido ? 'border-escola-azul border-l-4' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{lead.nome}</span>
                    {!lead.lido && (
                      <span className="text-xs bg-escola-azul text-white px-2 py-0.5 rounded-full">Novo</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                    <a href={`mailto:${lead.email}`} className="hover:text-escola-azul">{lead.email}</a>
                    {lead.telefone && <span>{lead.telefone}</span>}
                    <span>{new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {lead.mensagem && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{lead.mensagem}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!lead.lido && (
                    <form action={marcarLido.bind(null, lead.id)}>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-lg border border-escola-azul text-escola-azul hover:bg-escola-azul-claro transition-colors foco-painel"
                      >
                        Marcar lido
                      </button>
                    </form>
                  )}
                  <form action={deletarLead.bind(null, lead.id)}>
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors foco-painel"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
