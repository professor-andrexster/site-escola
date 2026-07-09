'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { TURMAS } from '@/lib/turmas'

interface FaseForm { titulo: string; descricao: string; entregavel_instrucoes: string; pontos_max: string; semana_sugerida: string }
interface PapelForm { nome: string; descricao: string }

const FASE_VAZIA: FaseForm = { titulo: '', descricao: '', entregavel_instrucoes: '', pontos_max: '10', semana_sugerida: '' }
const PAPEL_VAZIO: PapelForm = { nome: '', descricao: '' }

const MODELO_CTRLALTCHAGAS = {
  titulo: 'CTRL + ALT + CHAGAS',
  subtitulo: 'o combo que vai reiniciar a assistência técnica da nossa cidade',
  briefing: 'Em equipe, vocês vão montar do zero uma empresa de manutenção de computador pra Carlos Chagas. Cinco etapas, uma de cada vez — só libera a próxima depois que a equipe enviar a anterior.',
  fases: [
    { titulo: 'Etapa 1 — Pesquisa de mercado', descricao: 'Conversem com pessoas reais sobre os perrengues com computador na cidade. Mapeiem, com exemplos concretos: a Dor (o problema que incomoda), a Lacuna (o que falta ou é ruim hoje), o Gargalo (o que trava o atendimento atual — demora, preço, falta de gente) e a Inovação (o que vocês fariam diferente).', entregavel_instrucoes: 'Documento com Dor, Lacuna, Gargalo e Inovação, cada um com um exemplo real levantado na pesquisa.', pontos_max: '20', semana_sugerida: '1' },
    { titulo: 'Etapa 2 — Pesquisa INPI', descricao: 'Pesquisem o nome da empresa no INPI (busca.inpi.gov.br, modo Radical, Classe 37 ou 42) pra garantir que ninguém já registrou um nome parecido.', entregavel_instrucoes: 'Print salvo da busca no INPI mostrando o nome livre, mais o nome final escolhido.', pontos_max: '15', semana_sugerida: '2' },
    { titulo: 'Etapa 3 — Identidade visual da empresa', descricao: 'Logotipo, paleta de cores e tipografia da marca.', entregavel_instrucoes: 'Arquivo ou imagens com o logotipo, a paleta (com os códigos) e a tipografia escolhida.', pontos_max: '20', semana_sugerida: '3' },
    { titulo: 'Etapa 4 — Site no ar', descricao: 'Publiquem a landing page da empresa (pode ser Google Sites, Canva, HTML simples — o que der pra deixar no ar de verdade).', entregavel_instrucoes: 'Link do site publicado e funcionando.', pontos_max: '20', semana_sugerida: '4' },
    { titulo: 'Etapa 5 — Relatórios dos consertos', descricao: 'Atendam casos reais de manutenção (família, escola, vizinhos) e documentem cada um: equipamento, defeito, o que foi feito.', entregavel_instrucoes: 'Relatório de pelo menos um conserto real, com equipamento, diagnóstico e solução aplicada.', pontos_max: '25', semana_sugerida: '5' },
  ],
  papeis: [
    { nome: 'Sócio-fundador(a) / CEO', descricao: 'Conduz a pesquisa, decide nome e posicionamento, garante o prazo.' },
    { nome: 'Suporte Nível 1', descricao: 'Recebe o chamado, faz a triagem e registra no relatório.' },
    { nome: 'Suporte Nível 2', descricao: 'Investiga a fundo, resolve (ou simula a solução) e fecha o relatório do conserto.' },
    { nome: 'Designer / Identidade Visual', descricao: 'Cria nome, logo, paleta e a cara da marca em todo material.' },
    { nome: 'Redator(a)', descricao: 'Junta o que o time produziu e escreve os relatórios e a documentação final.' },
  ],
}

export default function DesafioForm({ professorId }: { professorId: string }) {
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [briefing, setBriefing] = useState('')
  const [turmaAlvo, setTurmaAlvo] = useState('')
  const [anoLetivo, setAnoLetivo] = useState('2026')
  const [publicado, setPublicado] = useState(false)
  const [fases, setFases] = useState<FaseForm[]>([{ ...FASE_VAZIA }])
  const [papeis, setPapeis] = useState<PapelForm[]>([{ ...PAPEL_VAZIO }])
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const pontosTotal = fases.reduce((acc, f) => acc + (parseInt(f.pontos_max, 10) || 0), 0)

  function usarModelo() {
    setTitulo(MODELO_CTRLALTCHAGAS.titulo)
    setSubtitulo(MODELO_CTRLALTCHAGAS.subtitulo)
    setBriefing(MODELO_CTRLALTCHAGAS.briefing)
    setFases(MODELO_CTRLALTCHAGAS.fases.map((f) => ({ ...f })))
    setPapeis(MODELO_CTRLALTCHAGAS.papeis.map((p) => ({ ...p })))
  }

  function atualizarFase(i: number, campo: keyof FaseForm, valor: string) {
    setFases((prev) => prev.map((f, idx) => idx === i ? { ...f, [campo]: valor } : f))
  }
  function atualizarPapel(i: number, campo: keyof PapelForm, valor: string) {
    setPapeis((prev) => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p))
  }

  async function salvar() {
    if (!titulo.trim()) { setErro('Dê um título ao desafio.'); return }
    if (fases.some((f) => !f.titulo.trim())) { setErro('Toda fase precisa de um título.'); return }
    setSaving(true)
    setErro('')

    const { data: desafio, error: errDesafio } = await supabase
      .from('desafios')
      .insert({
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim() || null,
        briefing: briefing.trim() || null,
        professor_id: professorId,
        turma_alvo: turmaAlvo || null,
        ano_letivo: anoLetivo,
        pontos_total: pontosTotal || 100,
        publicado,
      })
      .select('id')
      .single()

    if (errDesafio || !desafio) { setErro('Erro ao criar desafio: ' + errDesafio?.message); setSaving(false); return }

    const { error: errFases } = await supabase.from('desafio_fases').insert(
      fases.map((f, i) => ({
        desafio_id: desafio.id,
        ordem: i + 1,
        titulo: f.titulo.trim(),
        descricao: f.descricao.trim() || null,
        entregavel_instrucoes: f.entregavel_instrucoes.trim() || null,
        pontos_max: parseInt(f.pontos_max, 10) || 0,
        semana_sugerida: f.semana_sugerida ? parseInt(f.semana_sugerida, 10) : null,
      }))
    )
    if (errFases) { setErro('Desafio criado, mas houve erro nas fases: ' + errFases.message); setSaving(false); return }

    const papeisValidos = papeis.filter((p) => p.nome.trim())
    if (papeisValidos.length > 0) {
      await supabase.from('desafio_papeis').insert(
        papeisValidos.map((p) => ({ desafio_id: desafio.id, nome: p.nome.trim(), descricao: p.descricao.trim() || null }))
      )
    }

    router.push(`/admin/desafios/${desafio.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{erro}</div>}

      <button
        onClick={usarModelo}
        className="inline-flex items-center gap-2 text-sm font-semibold text-escola-azul bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Usar modelo CTRL + ALT + CHAGAS
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input type="text" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Briefing</label>
          <textarea value={briefing} onChange={(e) => setBriefing(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma alvo</label>
            <select value={turmaAlvo} onChange={(e) => setTurmaAlvo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-escola-azul">
              <option value="">Todas</option>
              {TURMAS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano letivo</label>
            <input type="text" value={anoLetivo} onChange={(e) => setAnoLetivo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Fases <span className="text-gray-400 font-normal">— total {pontosTotal} pts</span></h2>
          <button onClick={() => setFases((p) => [...p, { ...FASE_VAZIA }])} className="inline-flex items-center gap-1 text-xs font-semibold text-escola-azul hover:underline">
            <Plus className="w-3.5 h-3.5" /> Adicionar fase
          </button>
        </div>
        <div className="space-y-4">
          {fases.map((f, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 flex-shrink-0">#{i + 1}</span>
                <input type="text" value={f.titulo} onChange={(e) => atualizarFase(i, 'titulo', e.target.value)}
                  placeholder="Título da fase"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
                <input type="number" value={f.pontos_max} onChange={(e) => atualizarFase(i, 'pontos_max', e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-escola-azul/30" title="Pontos" />
                <input type="number" value={f.semana_sugerida} onChange={(e) => atualizarFase(i, 'semana_sugerida', e.target.value)}
                  placeholder="sem." className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-escola-azul/30" title="Semana sugerida" />
                {fases.length > 1 && (
                  <button onClick={() => setFases((p) => p.filter((_, idx) => idx !== i))} className="p-1.5 text-gray-300 hover:text-escola-vermelho">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea value={f.descricao} onChange={(e) => atualizarFase(i, 'descricao', e.target.value)} rows={2}
                placeholder="O 'mão na massa' desta fase"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 resize-none" />
              <textarea value={f.entregavel_instrucoes} onChange={(e) => atualizarFase(i, 'entregavel_instrucoes', e.target.value)} rows={2}
                placeholder="O que a equipe precisa entregar"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30 resize-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Papéis da equipe</h2>
          <button onClick={() => setPapeis((p) => [...p, { ...PAPEL_VAZIO }])} className="inline-flex items-center gap-1 text-xs font-semibold text-escola-azul hover:underline">
            <Plus className="w-3.5 h-3.5" /> Adicionar papel
          </button>
        </div>
        <div className="space-y-2.5">
          {papeis.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={p.nome} onChange={(e) => atualizarPapel(i, 'nome', e.target.value)}
                placeholder="Nome do papel"
                className="w-56 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              <input type="text" value={p.descricao} onChange={(e) => atualizarPapel(i, 'descricao', e.target.value)}
                placeholder="O que esse papel faz"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-escola-azul/30" />
              {papeis.length > 1 && (
                <button onClick={() => setPapeis((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 text-gray-300 hover:text-escola-vermelho">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setPublicado(!publicado)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${publicado ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${publicado ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Publicado (visível para alunos e monitores)</span>
        </label>
      </div>

      <button
        onClick={salvar}
        disabled={saving || !titulo.trim()}
        className="px-5 py-2 bg-escola-azul text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Criando...' : 'Criar Desafio'}
      </button>
    </div>
  )
}
