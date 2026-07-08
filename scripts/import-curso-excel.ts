/**
 * Importa o curso "Excel do Zero ao PROCV" a partir dos .pptx em /Cursos.
 * Roda uma única vez, localmente (usa LibreOffice instalado na máquina para
 * converter pptx -> pdf, depois rasteriza cada página em PNG). Não faz parte
 * do runtime do site — Vercel não tem LibreOffice.
 *
 * Uso: npx tsx scripts/import-curso-excel.ts
 */
import { createClient } from '@supabase/supabase-js'
import { pdfToPng } from 'pdf-to-png-converter'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const CURSOS_DIR = path.resolve(__dirname, '..', 'Cursos')
const BUCKET = 'cursos-slides'

const SOFFICE_CANDIDATES = [
  'soffice',
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
  'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
]

function findSoffice(): string {
  for (const candidate of SOFFICE_CANDIDATES) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' })
      return candidate
    } catch {
      continue
    }
  }
  throw new Error('LibreOffice (soffice) não encontrado. Instale-o para converter os .pptx.')
}

const CURSO = {
  titulo: 'Excel do Zero ao PROCV',
  slug: 'excel-do-zero',
  descricao:
    'Curso prático de planilhas (Excel / LibreOffice Calc) do Professor André Gomes — da interface básica até fórmulas avançadas como PROCV, fechando com um projeto real: o sistema da lanchonete da escola.',
  categoria: 'Tecnologia',
  nivel: 'Iniciante',
  publicado: true,
  ordem: 0,
}

const AULAS = [
  { arquivo: 'Excel_Aula1_Fundamentos (3).pptx', ordem: 1, slug: 'aula-1-fundamentos', titulo: 'Excel do Zero', descricao: 'Fundamentos, com exemplos do seu dia a dia — conheça a interface, as células e monte sua primeira planilha.' },
  { arquivo: 'Excel_Aula2_Formulas_Basicas (2).pptx', ordem: 2, slug: 'aula-2-formulas-basicas', titulo: 'Fórmulas Básicas', descricao: 'Somar, subtrair, multiplicar e dividir no Calc — divida sua conta de luz e monte um rateio de churrasco.' },
  { arquivo: 'Excel_Aula3_Funcoes_Essenciais (1).pptx', ordem: 3, slug: 'aula-3-funcoes-essenciais', titulo: 'Funções Essenciais', descricao: 'SOMA, MÉDIA, MÁXIMO e MÍNIMO — calcule sua média escolar e ache o melhor preço.' },
  { arquivo: 'Excel_Aula4_Formatacao.pptx', ordem: 4, slug: 'aula-4-formatacao', titulo: 'Formatação e Aparência', descricao: 'Deixe sua planilha limpa, clara e fácil de ler: moeda, porcentagem, cores e destaque automático.' },
  { arquivo: 'Excel_Aula5_Graficos.pptx', ordem: 5, slug: 'aula-5-graficos', titulo: 'Gráficos do Zero', descricao: 'Transforme seus números em imagem — barras, pizza e linha, e como escolher o gráfico certo.' },
  { arquivo: 'Excel_Aula6_Funcao_SE.pptx', ordem: 6, slug: 'aula-6-funcao-se', titulo: 'A função SE', descricao: 'Sua planilha começa a tomar decisões — aprovado ou reprovado? A planilha responde sozinha.' },
  { arquivo: 'Excel_Aula7_PROCV.pptx', ordem: 7, slug: 'aula-7-procv', titulo: 'PROCV', descricao: 'A planilha que procura respostas pra você — digite o nome de um produto e ache o preço numa lista com centenas de itens.' },
  { arquivo: 'Excel_MiniCurso_Lanchonete.pptx', ordem: 8, slug: 'aula-8-projeto-lanchonete', titulo: 'Projeto Final: A Lanchonete da Escola', descricao: 'Mini-curso prático: monte o sistema de uma loja de verdade — cardápio, caixa, estoque e um painel com gráficos.' },
]

async function convertPptxToPdf(soffice: string, pptxPath: string, outDir: string): Promise<string> {
  execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', outDir, pptxPath])
  const base = path.basename(pptxPath, path.extname(pptxPath))
  return path.join(outDir, `${base}.pdf`)
}

async function rasterizePdf(pdfPath: string, outDir: string): Promise<string[]> {
  const pages = await pdfToPng(pdfPath, {
    viewportScale: 2.0,
    outputFolder: outDir,
    outputFileMaskFunc: (n: number) => `slide-${String(n).padStart(2, '0')}.png`,
  })
  return pages.map((p) => p.path).sort()
}

async function uploadSlide(filePath: string, storagePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })
  if (error) throw new Error(`Upload falhou (${storagePath}): ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function main() {
  console.log('🔍 Procurando LibreOffice...')
  const soffice = findSoffice()
  console.log(`✅ LibreOffice: ${soffice}\n`)

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'curso-excel-'))

  console.log('📚 Criando curso "Excel do Zero ao PROCV"...')
  const { data: cursoExistente } = await supabase.from('cursos').select('id').eq('slug', CURSO.slug).maybeSingle()

  let cursoId: string
  if (cursoExistente) {
    cursoId = cursoExistente.id
    await supabase.from('cursos').update(CURSO).eq('id', cursoId)
    console.log(`   Curso já existia, atualizado (id ${cursoId})`)
  } else {
    const { data, error } = await supabase.from('cursos').insert(CURSO).select('id').single()
    if (error || !data) throw new Error(`Erro ao criar curso: ${error?.message}`)
    cursoId = data.id
    console.log(`   Curso criado (id ${cursoId})`)
  }

  for (const aula of AULAS) {
    console.log(`\n🎬 Aula ${aula.ordem}: ${aula.titulo}`)
    const pptxPath = path.join(CURSOS_DIR, aula.arquivo)
    if (!fs.existsSync(pptxPath)) {
      console.warn(`   ⚠️  Arquivo não encontrado, pulando: ${pptxPath}`)
      continue
    }

    const aulaTmpDir = path.join(tmpDir, aula.slug)
    fs.mkdirSync(aulaTmpDir, { recursive: true })

    console.log('   Convertendo pptx -> pdf...')
    const pdfPath = await convertPptxToPdf(soffice, pptxPath, aulaTmpDir)

    console.log('   Rasterizando pdf -> png...')
    const pngPaths = await rasterizePdf(pdfPath, aulaTmpDir)
    console.log(`   ${pngPaths.length} slides gerados`)

    console.log('   Subindo imagens para o Storage...')
    const slidesUrls: string[] = []
    for (let i = 0; i < pngPaths.length; i++) {
      const storagePath = `${CURSO.slug}/${aula.slug}/slide-${String(i + 1).padStart(2, '0')}.png`
      const url = await uploadSlide(pngPaths[i], storagePath)
      slidesUrls.push(url)
    }

    const aulaRow = {
      curso_id: cursoId,
      titulo: aula.titulo,
      slug: aula.slug,
      descricao: aula.descricao,
      ordem: aula.ordem,
      slides_urls: slidesUrls,
      duracao_estimada_min: 15,
      publicado: true,
    }

    const { data: aulaExistente } = await supabase
      .from('aulas')
      .select('id')
      .eq('curso_id', cursoId)
      .eq('slug', aula.slug)
      .maybeSingle()

    if (aulaExistente) {
      await supabase.from('aulas').update(aulaRow).eq('id', aulaExistente.id)
      console.log('   ✅ Aula atualizada')
    } else {
      await supabase.from('aulas').insert(aulaRow)
      console.log('   ✅ Aula criada')
    }
  }

  // Usa o primeiro slide da Aula 1 como capa do curso
  const { data: aula1 } = await supabase
    .from('aulas')
    .select('slides_urls')
    .eq('curso_id', cursoId)
    .eq('slug', 'aula-1-fundamentos')
    .maybeSingle()
  if (aula1?.slides_urls?.[0]) {
    await supabase.from('cursos').update({ capa_url: aula1.slides_urls[0] }).eq('id', cursoId)
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
  console.log('\n🎉 Curso "Excel do Zero ao PROCV" importado com sucesso!')
}

main().catch((err) => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
