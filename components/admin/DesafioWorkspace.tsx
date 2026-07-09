'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Circle, Clock, CheckCircle2, Lock } from 'lucide-react'
import type { Desafio, DesafioFase, DesafioPapel, Equipe, EquipeMembro, Entrega } from '@/types/database'

type PerfilResumo = { nome_completo: string }
type PapelResumo = { nome: string }
type MembroComTudo = EquipeMembro & { profile: PerfilResumo | PerfilResumo[] | null; papel: PapelResumo | PapelResumo[] | null }
type EquipeComTudo = Equipe & { equipe_membros: MembroComTudo[]; entregas: Entrega[] }
type AlunoResumo = { id: string; nome_completo: string; turma: string | null }

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? v[0] ?? null : v
}

const STATUS_LABEL: Record<Entrega['status'], string> = {
  pendente: 'Pendente',
  entregue: 'Entregue — aguardando avaliação',
  avaliada: 'Avaliada',
}

export default function DesafioWorkspace({
  desafio, fases, papeis, equipesIniciais, ideiasDisponiveis, alunosDisponiveis, profileId, podeAvaliar, podeEntrarEquipe,
}: {
  desafio: Desafio
  fases: DesafioFase[]
  papeis: DesafioPapel[]
  equipesIniciais: EquipeComTudo[]
  ideiasDisponiveis: { id: string; titulo: string; status: string }[]
  alunosDisponiveis: AlunoResumo[]
  profileId: string
  podeAvaliar: boolean
  podeEntrarEquipe: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [ideiaId, setIdeiaId] = useState('')
  const [membrosSelecionados, setMembrosSelecionados] = useState<string[]>([])
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState('')

  const minhaEquipe = equipesIniciais.find((e) => e.equipe_membros.some((m) => m.profile_id === profileId)) ?? null
  const jaEmEquipe = new Set(equipesIniciais.flatMap((e) => e.equipe_membros.map((m) => m.profile_id)))
  const alunosLivres = alunosDisponiveis
    .filter((a) => !jaEmEquipe.has(a.id))
    .filter((a) => !desafio.turma_alvo || a.turma === desafio.turma_alvo)

  function toggleMembro(id: string) {
    setMembrosSelecionados((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])
  }

  async function criarEquipe() {
    setCriando(true)
    setErro('')
    const { data: equipe, error } = await supabase
      .from('equipes')
      .insert({ desafio_id: desafio.id, nome_empresa: nomeEmpresa.trim() || null, ideia_id: ideiaId || null, turma: desafio.turma_alvo })
      .select('id')
      .single()
    if (error || !equipe) { setErro('Erro ao criar equipe: ' + error?.message); setCriando(false); return }
    if (membrosSelecionados.length > 0) {
      const { error: errMembros } = await supabase
        .from('equipe_membros')
        .insert(membrosSelecionados.map((alunoId) => ({ equipe_id: equipe.id, profile_id: alunoId })))
      if (errMembros) { setErro('Equipe criada, mas houve erro ao adicionar integrantes: ' + errMembros.message); setCriando(false); return }
    }
    setCriando(false)
    setNomeEmpresa('')
    setIdeiaId('')
    setMembrosSelecionados([])
    router.refresh()
  }

  async function entrarEquipe(equipeId: string) {
    setErro('')
    const { error } = await supabase.from('equipe_membros').insert({ equipe_id: equipeId, profile_id: profileId })
    if (error) { setErro('Erro ao entrar na equipe: ' + error.message); return }
    router.refresh()
  }

  async function escolherPapel(membroId: string, papelId: string) {
    await supabase.from('equipe_membros').update({ papel_id: papelId || null }).eq('id', membroId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {!desafio.publicado && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Rascunho</span>}
          {desafio.turma_alvo && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-escola-azul">{desafio.turma_alvo}</span>}
          <span className="ml-auto text-sm font-semibold text-escola-azul">{desafio.pontos_total} pts</span>
        </div>
        <h1 className="font-playfair text-2xl font-bold text-gray-900">{desafio.titulo}</h1>
        {desafio.subtitulo && <p className="text-gray-500 mt-1">{desafio.subtitulo}</p>}
        {desafio.briefing && <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{desafio.briefing}</p>}
      </div>

      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{erro}</div>}

      {podeAvaliar && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Formar equipe</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="text" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)}
              placeholder="Nome da empresa (a equipe pode decidir depois)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
            <select value={ideiaId} onChange={(e) => setIdeiaId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul/30">
              <option value="">Sem ideia da Fábrica ainda</option>
              {ideiasDisponiveis.map((i) => <option key={i.id} value={i.id}>{i.titulo}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Integrantes (opcional agora — quem ficar de fora pode entrar depois)</p>
            {alunosLivres.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum aluno disponível{desafio.turma_alvo ? ` na turma ${desafio.turma_alvo}` : ''} (ou todos já estão em equipes).</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {alunosLivres.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggleMembro(a.id)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                      membrosSelecionados.includes(a.id) ? 'bg-escola-azul text-white border-escola-azul' : 'bg-white text-gray-600 border-gray-200 hover:border-escola-azul'
                    }`}
                  >
                    {a.nome_completo}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={criarEquipe} disabled={criando}
            className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {criando ? 'Criando...' : 'Criar equipe'}
          </button>
        </div>
      )}

      {podeEntrarEquipe && !minhaEquipe && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Entrar numa equipe</h2>
          {equipesIniciais.length === 0 ? (
            <p className="text-sm text-gray-400">O professor ainda não formou nenhuma equipe pra este desafio.</p>
          ) : (
            <div className="space-y-2">
              {equipesIniciais.map((eq) => (
                <div key={eq.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{eq.nome_empresa || 'Equipe sem nome ainda'}</p>
                    <p className="text-xs text-gray-400">{eq.equipe_membros.length} integrante(s)</p>
                  </div>
                  <button onClick={() => entrarEquipe(eq.id)} className="text-xs font-semibold text-escola-azul hover:underline flex-shrink-0">Entrar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {minhaEquipe && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{minhaEquipe.nome_empresa || 'Sua equipe'}</h2>
            <div className="space-y-2">
              {minhaEquipe.equipe_membros.map((m) => {
                const perfil = one(m.profile)
                const papel = one(m.papel)
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-700">{perfil?.nome_completo ?? 'Integrante'}</span>
                    {m.profile_id === profileId && papeis.length > 0 ? (
                      <select
                        value={m.papel_id ?? ''}
                        onChange={(e) => escolherPapel(m.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        <option value="">Escolher papel</option>
                        {papeis.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                    ) : (
                      papel && <span className="text-xs text-gray-400">{papel.nome}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            {fases.map((fase, idx) => {
              const entrega = minhaEquipe.entregas.find((e) => e.fase_id === fase.id)
              const faseAnterior = idx > 0 ? fases[idx - 1] : null
              const entregaAnterior = faseAnterior ? minhaEquipe.entregas.find((e) => e.fase_id === faseAnterior.id) : null
              const desbloqueada = idx === 0 || entregaAnterior?.status === 'entregue' || entregaAnterior?.status === 'avaliada'
              return (
                <FaseParticipante
                  key={fase.id}
                  fase={fase}
                  entrega={entrega}
                  desbloqueada={!!desbloqueada}
                  equipeId={minhaEquipe.id}
                  supabase={supabase}
                  onSaved={() => router.refresh()}
                />
              )
            })}
          </div>
        </>
      )}

      {podeAvaliar && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Avaliação — {equipesIniciais.length} equipe(s)</h2>
          {equipesIniciais.length === 0 && <p className="text-sm text-gray-400">Nenhuma equipe formada ainda.</p>}
          {equipesIniciais.map((eq) => (
            <EquipeAvaliacao key={eq.id} equipe={eq} fases={fases} supabase={supabase} onSaved={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: Entrega['status'] }) {
  if (status === 'avaliada') return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
  if (status === 'entregue') return <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
  return <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
}

function FaseParticipante({
  fase, entrega, desbloqueada, equipeId, supabase, onSaved,
}: {
  fase: DesafioFase
  entrega: Entrega | undefined
  desbloqueada: boolean
  equipeId: string
  supabase: ReturnType<typeof createClient>
  onSaved: () => void
}) {
  const [aberta, setAberta] = useState(false)
  const [conteudo, setConteudo] = useState(entrega?.conteudo ?? '')
  const [linkUrl, setLinkUrl] = useState(entrega?.link_url ?? '')
  const [arquivoUrl, setArquivoUrl] = useState(entrega?.arquivo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const status = entrega?.status ?? 'pendente'

  async function upload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${equipeId}/${fase.id}-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('desafios').upload(path, file)
    if (!error && data) {
      const { data: pub } = supabase.storage.from('desafios').getPublicUrl(data.path)
      setArquivoUrl(pub.publicUrl)
    }
    setUploading(false)
  }

  async function enviar() {
    setSaving(true)
    await supabase.from('entregas').upsert(
      {
        equipe_id: equipeId,
        fase_id: fase.id,
        conteudo: conteudo.trim() || null,
        link_url: linkUrl.trim() || null,
        arquivo_url: arquivoUrl || null,
        status: 'entregue',
        enviado_em: new Date().toISOString(),
      },
      { onConflict: 'equipe_id,fase_id' }
    )
    setSaving(false)
    onSaved()
  }

  if (!desbloqueada) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3 opacity-70">
        <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-400">{fase.titulo}</p>
          <p className="text-xs text-gray-300">Complete a etapa anterior primeiro</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setAberta(!aberta)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon status={status} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{fase.titulo}</p>
            {fase.entregavel_instrucoes && <p className="text-xs text-gray-400 mt-0.5 truncate">{fase.entregavel_instrucoes}</p>}
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {entrega?.nota != null ? `${entrega.nota}/${fase.pontos_max}` : `${fase.pontos_max} pts`}
        </span>
      </button>
      {aberta && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {fase.descricao && <p className="text-sm text-gray-600">{fase.descricao}</p>}
          <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={3}
            placeholder="Descreva o que sua equipe produziu nesta etapa"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
          <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link (site, print, drive...)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
          <label className="inline-flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-escola-azul hover:text-escola-azul cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? 'Enviando...' : arquivoUrl ? 'Trocar arquivo' : 'Anexar arquivo'}
            <input type="file" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
          {arquivoUrl && <a href={arquivoUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-escola-azul hover:underline">Ver arquivo anexado</a>}

          {entrega?.status === 'avaliada' && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
              <p className="font-semibold text-green-700">Nota: {entrega.nota}/{fase.pontos_max}</p>
              {entrega.feedback_professor && <p className="text-green-600 mt-1">{entrega.feedback_professor}</p>}
            </div>
          )}

          <button onClick={enviar} disabled={saving}
            className="px-4 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Enviando...' : 'Enviar entrega'}
          </button>
        </div>
      )}
    </div>
  )
}

function EquipeAvaliacao({
  equipe, fases, supabase, onSaved,
}: {
  equipe: EquipeComTudo
  fases: DesafioFase[]
  supabase: ReturnType<typeof createClient>
  onSaved: () => void
}) {
  const [aberta, setAberta] = useState(false)
  const somaNotas = equipe.entregas.reduce((acc, e) => acc + (e.nota ?? 0), 0)
  const nomes = equipe.equipe_membros.map((m) => one(m.profile)?.nome_completo).filter(Boolean).join(', ')

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setAberta(!aberta)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{equipe.nome_empresa || 'Equipe sem nome'}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{nomes || 'sem integrantes'}</p>
        </div>
        <span className="text-sm font-semibold text-escola-azul flex-shrink-0">{somaNotas} pts</span>
      </button>
      {aberta && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {fases.map((fase) => {
            const entrega = equipe.entregas.find((e) => e.fase_id === fase.id)
            return <FaseAvaliacao key={fase.id} fase={fase} entrega={entrega} equipeId={equipe.id} supabase={supabase} onSaved={onSaved} />
          })}
        </div>
      )}
    </div>
  )
}

function FaseAvaliacao({
  fase, entrega, equipeId, supabase, onSaved,
}: {
  fase: DesafioFase
  entrega: Entrega | undefined
  equipeId: string
  supabase: ReturnType<typeof createClient>
  onSaved: () => void
}) {
  const [nota, setNota] = useState(entrega?.nota?.toString() ?? '')
  const [feedback, setFeedback] = useState(entrega?.feedback_professor ?? '')
  const [saving, setSaving] = useState(false)

  async function salvar() {
    setSaving(true)
    await supabase.from('entregas').upsert(
      {
        equipe_id: equipeId,
        fase_id: fase.id,
        nota: nota ? parseFloat(nota) : null,
        feedback_professor: feedback.trim() || null,
        status: 'avaliada',
        avaliado_em: new Date().toISOString(),
      },
      { onConflict: 'equipe_id,fase_id' }
    )
    setSaving(false)
    onSaved()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-gray-800">{fase.titulo}</p>
        <span className="text-xs text-gray-400">{entrega ? STATUS_LABEL[entrega.status] : 'não enviado'}</span>
      </div>
      {!entrega ? (
        <p className="text-xs text-gray-300">A equipe ainda não enviou esta etapa.</p>
      ) : (
        <div className="space-y-2 text-sm">
          {entrega.conteudo && <p className="text-gray-600 whitespace-pre-line">{entrega.conteudo}</p>}
          {entrega.link_url && <a href={entrega.link_url} target="_blank" rel="noopener noreferrer" className="text-escola-azul hover:underline block">{entrega.link_url}</a>}
          {entrega.arquivo_url && <a href={entrega.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-escola-azul hover:underline block">Ver arquivo enviado</a>}
          <div className="flex items-center gap-2 pt-2">
            <input type="number" step="0.5" min="0" max={fase.pontos_max} value={nota} onChange={(e) => setNota(e.target.value)}
              placeholder={`/${fase.pontos_max}`} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
            <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
            <button onClick={salvar} disabled={saving}
              className="px-3 py-1.5 bg-escola-azul text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0">
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
