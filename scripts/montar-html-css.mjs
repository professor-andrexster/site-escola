/**
 * Monta o módulo "HTML e CSS — A Página na Web" em seis partes.
 *
 *   node scripts/montar-html-css.mjs            simula
 *   node scripts/montar-html-css.mjs --aplicar  grava
 *
 * A decisão pedagógica, e por quê:
 *
 * A Parte 1 é HTML PURO, sem uma linha de CSS. Isso é de propósito, e é o que
 * freeCodeCamp e The Odin Project fazem no começo dos cursos deles — o primeiro
 * projeto sai sem estilo nenhum. O motivo é o que Kevin Powell repete: muitos
 * problemas de CSS são, na verdade, problemas de HTML. Quem estiliza antes de
 * entender estrutura acaba com `<div>` para tudo e CSS remendado em cima.
 *
 * Da Parte 2 em diante os dois andam JUNTOS, integrados por entrega: cada parte
 * termina com uma peça que o aluno vê funcionando. Alternar rigidamente uma
 * aula de HTML e uma de CSS seria artificial, porque os assuntos não fazem par —
 * Grid e responsividade não têm equivalente em HTML, e formulário tem muito
 * HTML e pouco CSS.
 *
 * As aulas que já existem são REAPROVEITADAS, com o mesmo id: elas só mudam de
 * curso. Assim o progresso de quem já estudou continua valendo, e os quatro
 * certificados emitidos continuam apontando para conteúdo que existe.
 */
import { readFileSync } from 'node:fs'
import mariadb from '../node_modules/mariadb/promise.js'

const APLICAR = process.argv.includes('--aplicar')

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')] })
)

const MODULO = {
  slug: 'a-primeira-pagina',
  nome: 'HTML e CSS — A Página na Web',
  nivel: 'Fácil',
  descricao:
    'Do primeiro parágrafo ao site publicado. Seis partes: você monta a estrutura, dá aparência a ela, aprende a organizar o layout, faz funcionar no celular e coloca no ar — cada parte terminando com uma peça pronta que dá para mostrar.',
}

/**
 * As seis partes. `reaproveita` lista os slugs de aula que já existem e mudam
 * de curso; `novas` são as que este script escreve.
 */
const PARTES = [
  {
    slug: 'html-css-1-a-pagina-existe',
    titulo: 'Parte 1 — A página existe',
    descricao: 'HTML puro: estrutura, texto, listas, links e imagens. Sem estilo nenhum, de propósito.',
    reaproveita: ['html-fundamentos', 'elementos-html-essenciais', 'listas-e-links', 'imagens-e-multimedia'],
    desafio: {
      titulo: 'Sua página pessoal, só em HTML',
      enunciado: `<p>Monte uma página sobre você usando <strong>apenas HTML</strong>. Nenhum CSS — nem no arquivo, nem no atributo <code>style</code>.</p>
<p>Ela precisa ter:</p>
<ul>
  <li>Um título principal com seu nome e um subtítulo dizendo o que você estuda</li>
  <li>Dois ou três parágrafos sobre você, com pelo menos uma palavra em <code>&lt;strong&gt;</code> e uma em <code>&lt;em&gt;</code> — usadas pelo significado, não pela aparência</li>
  <li>Uma lista com três coisas que você quer aprender</li>
  <li>Uma imagem sua ou de algo que goste, com <code>alt</code> que descreva o que se vê</li>
  <li>Um link para uma página externa, abrindo em nova aba</li>
</ul>
<p>Abra no navegador. Vai estar feia — e é para estar. O que você deve conferir é outra coisa: <strong>lendo só o HTML, dá para entender a página sem abrir o navegador?</strong> Se dá, a estrutura está certa, e é sobre ela que o CSS da Parte 2 vai trabalhar.</p>`,
    },
  },
  {
    slug: 'html-css-2-a-pagina-ganha-cara',
    titulo: 'Parte 2 — A página ganha cara',
    descricao: 'CSS entra: seletores, cores, tipografia e o box model. A mesma página, agora apresentável.',
    reaproveita: ['css-fundamentos', 'propriedades-essenciais', 'box-model-e-layout'],
    desafio: {
      titulo: 'A mesma página, agora com cara',
      enunciado: `<p>Pegue a página da Parte 1 — sem mexer no HTML — e escreva um arquivo <code>style.css</code> para ela.</p>
<ul>
  <li>Uma fonte legível para o texto e outra para os títulos</li>
  <li>Uma paleta de três cores no máximo, e contraste suficiente para ler sem forçar a vista</li>
  <li>Espaçamento que separe os blocos: nada colado na borda</li>
  <li>Largura máxima no texto, para a linha não atravessar a tela inteira</li>
</ul>
<p>A regra do exercício é essa: <strong>o HTML não muda</strong>. Se você precisar mexer nele para o CSS funcionar, pare e pergunte-se se a estrutura da Parte 1 estava mesmo certa — essa é a lição que o exercício quer ensinar.</p>`,
    },
  },
  {
    slug: 'html-css-3-estrutura-que-sustenta',
    titulo: 'Parte 3 — A estrutura que sustenta',
    descricao: 'HTML semântico e Flexbox: cabeçalho, menu e blocos que se alinham sozinhos.',
    reaproveita: ['semantica-e-acessibilidade', 'flexbox'],
    desafio: {
      titulo: 'Cabeçalho e menu que funcionam',
      enunciado: `<p>Acrescente à sua página um cabeçalho de verdade.</p>
<ul>
  <li><code>&lt;header&gt;</code> com o seu nome à esquerda e um <code>&lt;nav&gt;</code> com três links à direita</li>
  <li>Alinhados com Flexbox — nada de <code>float</code> ou de espaços em branco no HTML</li>
  <li>Troque as <code>&lt;div&gt;</code> que sobraram por <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code> e <code>&lt;footer&gt;</code> onde fizer sentido</li>
</ul>
<p>Teste sem enxergar: navegue pela página só com a tecla Tab. Os links recebem foco na ordem em que aparecem? Dá para ver onde o foco está? Se não dá, o problema é de estrutura, não de estilo.</p>`,
    },
  },
  {
    slug: 'html-css-4-layout-completo',
    titulo: 'Parte 4 — Layout completo',
    descricao: 'CSS Grid e responsividade: a página em duas dimensões, funcionando no celular.',
    reaproveita: ['css-grid', 'responsividade'],
    desafio: {
      titulo: 'A página no celular',
      enunciado: `<p>Monte uma grade de cartões — projetos, hobbies, o que preferir — e faça a página funcionar em qualquer tela.</p>
<ul>
  <li>Grade com CSS Grid: três colunas no computador, uma no celular</li>
  <li>Sem rolagem lateral em nenhuma largura</li>
  <li>Texto legível no celular sem precisar dar zoom</li>
  <li>A tag <code>&lt;meta name="viewport"&gt;</code> no <code>&lt;head&gt;</code></li>
</ul>
<p>Teste arrastando a janela do navegador de larga a estreita, devagar. Em que largura a página quebra? É lá que entra a media query — e não num número redondo escolhido de antemão.</p>`,
    },
  },
  {
    slug: 'html-css-5-formularios',
    titulo: 'Parte 5 — Formulários',
    descricao: 'Campos, rótulos e validação: a parte do HTML que mais aparece em trabalho de verdade.',
    reaproveita: ['formularios-html'],
    desafio: {
      titulo: 'Formulário de contato que qualquer um consegue preencher',
      enunciado: `<p>Acrescente à página um formulário de contato com nome, e-mail, assunto e mensagem.</p>
<ul>
  <li>Todo campo com <code>&lt;label&gt;</code> ligado a ele pelo <code>for</code></li>
  <li>Tipos certos: <code>type="email"</code>, <code>type="tel"</code> — no celular o teclado muda sozinho</li>
  <li><code>required</code> no que for obrigatório</li>
  <li>Estilo consistente, e um estado de foco visível em cada campo</li>
</ul>
<p>Teste clicando no <strong>texto</strong> do rótulo: o cursor tem de pular para o campo. Se não pula, o <code>for</code> está errado — e quem usa leitor de tela não vai saber o que aquele campo pede.</p>`,
    },
  },
  {
    slug: 'html-css-6-no-ar',
    titulo: 'Parte 6 — No ar',
    descricao: 'Acessibilidade, revisão e publicação: a página sai da sua máquina.',
    reaproveita: ['publicando-no-github-pages', 'projeto-integrador-pagina-de-um-negocio-real'],
    desafio: {
      titulo: 'Publicada e revisada',
      enunciado: `<p>Publique a página e faça a revisão final.</p>
<ul>
  <li>No ar, com endereço que abre em qualquer máquina</li>
  <li>Toda imagem com <code>alt</code> que descreve o que se vê</li>
  <li>Contraste suficiente entre texto e fundo</li>
  <li>Navegável só pelo teclado, do começo ao fim</li>
  <li><code>&lt;title&gt;</code> que diz de quem é a página — é o que aparece na aba e no resultado de busca</li>
</ul>
<p>Mande o endereço para alguém que não acompanhou o processo e peça uma coisa só: que essa pessoa diga, em uma frase, de quem é a página e o que você faz. Se ela não conseguir, o problema não é técnico.</p>`,
    },
  },
]

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()
const acao = m => console.log(`${APLICAR ? '  ok  ' : ' sim  '} ${m}`)

try {
  const [modulo] = await c.query('SELECT id, nome FROM modulos WHERE slug = ?', [MODULO.slug])
  if (!modulo) throw new Error('módulo a-primeira-pagina não encontrado')

  acao(`módulo "${modulo.nome}" → "${MODULO.nome}"`)
  if (APLICAR) {
    await c.query('UPDATE modulos SET nome = ?, descricao = ?, atualizado_em = NOW() WHERE id = ?',
      [MODULO.nome, MODULO.descricao, modulo.id])
  }

  const [trilha] = await c.query("SELECT id FROM trilhas WHERE slug = 'programacao'")
  // As partes ocupam as posições 1 a 6 da trilha; o que vinha depois é
  // empurrado uma vez só, na primeira execução.
  const [jaTem] = await c.query('SELECT id FROM cursos WHERE slug = ?', [PARTES[0].slug])
  if (!jaTem && trilha) {
    acao('abrir espaço na trilha: os cursos a partir da 3ª posição andam 4 casas')
    if (APLICAR) {
      await c.query('UPDATE cursos SET ordem_na_trilha = ordem_na_trilha + 4 WHERE trilha_id = ? AND ordem_na_trilha >= 3',
        [trilha.id])
    }
  }

  for (const [i, parte] of PARTES.entries()) {
    const [existe] = await c.query('SELECT id FROM cursos WHERE slug = ?', [parte.slug])
    let cursoId = existe?.id

    acao(`${existe ? 'atualizar' : 'criar'} "${parte.titulo}"`)
    if (APLICAR) {
      if (existe) {
        await c.query(
          `UPDATE cursos SET titulo=?, descricao=?, modulo_id=?, ordem_no_modulo=?, trilha_id=?,
                             ordem_na_trilha=?, publicado=1, atualizado_em=NOW() WHERE id=?`,
          [parte.titulo, parte.descricao, modulo.id, i + 1, trilha?.id ?? null, i + 1, cursoId]
        )
      } else {
        await c.query(
          `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                               ordem, carga_horaria, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                               created_at, updated_at, criado_em, atualizado_em)
           VALUES (UUID(), ?, ?, ?, 'Web Development', 'Fácil', 'André Gomes', 1, ?, 1, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
          [parte.titulo, parte.slug, parte.descricao, 10 + i, modulo.id, i + 1, trilha?.id ?? null, i + 1]
        )
        cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [parte.slug]))[0].id
      }
    }
    if (!APLICAR) continue

    // As aulas existentes mudam de curso, mantendo o id — e com ele o progresso
    // de quem já estudou.
    let ordem = 1
    for (const slugAula of parte.reaproveita) {
      const [aula] = await c.query('SELECT id, titulo FROM aulas WHERE slug = ?', [slugAula])
      if (!aula) { console.log(`       ! aula não encontrada: ${slugAula}`); continue }
      await c.query('UPDATE aulas SET curso_id = ?, ordem = ?, publicado = 1 WHERE id = ?', [cursoId, ordem, aula.id])
      await c.query('UPDATE progresso_aulas SET curso_id = ? WHERE aula_id = ?', [cursoId, aula.id])
      await c.query('UPDATE curso_desafios SET curso_id = ? WHERE aula_id = ?', [cursoId, aula.id])
      console.log(`       ${ordem}. ${aula.titulo}  (mantida, progresso preservado)`)
      ordem++
    }

    // O desafio da parte: um por curso, valendo como fecho da etapa.
    const [desafioJa] = await c.query(
      'SELECT id FROM curso_desafios WHERE curso_id = ? AND aula_id IS NULL AND vale_certificado = 0', [cursoId]
    )
    if (desafioJa) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=? WHERE id=?',
        [parte.desafio.titulo, parte.desafio.enunciado.trim(), desafioJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, titulo, enunciado, tipo, ordem, vale_certificado, created_at)
         VALUES (UUID(), ?, ?, ?, 'pratico', 90, 0, NOW())`,
        [cursoId, parte.desafio.titulo, parte.desafio.enunciado.trim()]
      )
    }
  }

  // Os dois cursos antigos ficam sem aula nenhuma: saem do ar, mas continuam no
  // banco porque há certificado emitido apontando para eles.
  for (const antigo of ['html-estrutura-da-web', 'css-estilo-e-layout']) {
    acao(`despublicar "${antigo}" (esvaziado; certificados emitidos seguem apontando para ele)`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET publicado = 0, modulo_id = NULL, trilha_id = NULL WHERE slug = ?', [antigo])
    }
  }

  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
