/**
 * Insere um curso completo (curso + aulas em texto + desafios) a partir de um
 * JSON gerado pelos agentes de currículo (formato do PROMPT_CURSOS.md).
 *
 * Uso: npx tsx scripts/insert-curso.ts <caminho-do-json>
 *
 * Se já existir um curso com o mesmo slug, ele é REMOVIDO (cascade em aulas,
 * desafios e progresso) e recriado do zero.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Carrega .env.local na mão (tsx não faz isso sozinho como o Next)
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não encontradas (.env.local)')
  process.exit(1)
}

interface DesafioJson {
  titulo: string
  enunciado: string
  tipo: 'quiz' | 'pratico' | 'dissertativo'
  gabarito?: string
  ordem?: number
  apos_aula_ordem?: number | null
}

interface CursoJson {
  curso: { titulo: string; slug: string; descricao: string; categoria: string; nivel: string; ordem: number }
  aulas: {
    ordem: number
    titulo: string
    slug: string
    descricao: string
    duracao_estimada_min: number
    conteudo: string
    desafios?: DesafioJson[]
  }[]
  desafios_curso: DesafioJson[]
  relatorio?: unknown
}

async function main() {
  const jsonPath = process.argv[2]
  if (!jsonPath) {
    console.error('Uso: npx tsx scripts/insert-curso.ts <caminho-do-json>')
    process.exit(1)
  }

  const dados: CursoJson = JSON.parse(readFileSync(resolve(jsonPath), 'utf8'))
  const supabase = createClient(url!, key!)

  // Remove versão anterior do curso, se houver
  const { data: existente } = await supabase.from('cursos').select('id').eq('slug', dados.curso.slug).maybeSingle()
  if (existente) {
    console.log(`Curso "${dados.curso.slug}" já existe, removendo para recriar...`)
    await supabase.from('cursos').delete().eq('id', existente.id)
  }

  const { data: curso, error: cursoError } = await supabase
    .from('cursos')
    .insert({ ...dados.curso, publicado: true })
    .select('id')
    .single()
  if (cursoError || !curso) throw new Error('Erro ao criar curso: ' + cursoError?.message)

  const aulaIdPorOrdem = new Map<number, string>()
  let totalDesafiosAula = 0

  for (const aula of dados.aulas) {
    const { desafios, ...campos } = aula
    const { data: criada, error: aulaError } = await supabase
      .from('aulas')
      .insert({ ...campos, curso_id: curso.id, publicado: true, revisado: true })
      .select('id')
      .single()
    if (aulaError || !criada) throw new Error(`Erro na aula ${aula.ordem}: ` + aulaError?.message)
    aulaIdPorOrdem.set(aula.ordem, criada.id)

    for (const d of desafios ?? []) {
      const { error } = await supabase.from('curso_desafios').insert({
        curso_id: curso.id,
        aula_id: criada.id,
        titulo: d.titulo,
        enunciado: d.enunciado,
        tipo: d.tipo,
        gabarito: d.gabarito ?? null,
        ordem: d.ordem ?? 1,
      })
      if (error) throw new Error(`Erro no desafio da aula ${aula.ordem}: ` + error.message)
      totalDesafiosAula++
    }
  }

  let totalDesafiosCurso = 0
  for (const d of dados.desafios_curso ?? []) {
    const aulaId = d.apos_aula_ordem != null ? aulaIdPorOrdem.get(d.apos_aula_ordem) ?? null : null
    const { error } = await supabase.from('curso_desafios').insert({
      curso_id: curso.id,
      aula_id: aulaId,
      titulo: d.titulo,
      enunciado: d.enunciado,
      tipo: d.tipo,
      gabarito: d.gabarito ?? null,
      ordem: d.ordem ?? 100,
    })
    if (error) throw new Error('Erro em desafio de curso: ' + error.message)
    totalDesafiosCurso++
  }

  console.log(`OK: "${dados.curso.titulo}" publicado`)
  console.log(`   aulas: ${dados.aulas.length} | desafios de aula: ${totalDesafiosAula} | desafios de curso/sprint: ${totalDesafiosCurso}`)
}

main().catch(e => { console.error(e); process.exit(1) })
