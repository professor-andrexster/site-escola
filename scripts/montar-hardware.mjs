/**
 * Monta o módulo "O Computador por Dentro" em cinco partes.
 *
 *   node scripts/montar-hardware.mjs            simula
 *   node scripts/montar-hardware.mjs --aplicar  grava
 *
 * Os três cursos de hardware se sobrepunham: a aula "Manutenção Preventiva"
 * existia com o MESMO título em dois deles, diagnóstico aparecia duas vezes, e
 * os 19 termos técnicos de Arquitetura apareciam todos em Montagem. Quem fizesse
 * os três estudaria a mesma coisa duas vezes.
 *
 * A fusão segue a ordem do trabalho real de quem conserta computador: conhecer
 * as peças, montar, dar o primeiro boot, manter e diagnosticar, e por fim
 * instalar o sistema. Cada parte termina numa entrega.
 *
 * As aulas duplicadas: fica a mais completa de cada par, e a outra é
 * despublicada — não apagada. Nenhuma delas tinha conclusão de aluno, então não
 * há progresso a preservar nesse ponto.
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
  slug: 'por-dentro-do-computador',
  nome: 'O Computador por Dentro',
  nivel: 'Fácil',
  descricao:
    'Da peça na mão ao sistema instalado. Cinco partes na ordem de quem trabalha com isso: conhecer os componentes, montar com segurança, dar o primeiro boot, manter e achar defeito, e entregar a máquina pronta.',
}

/** Duplicatas: fica a de conteúdo maior, sai a outra. */
const DESPUBLICAR = [
  'conhecendo-as-pecas',       // repete "Componentes Principais", que é maior
  'diagnostico-de-defeitos',   // repete "Diagnóstico de Problemas Comuns"
  'montagem-desmontagem',      // repete "Montagem Parte 1" e "Parte 2" juntas
]
/** A "Manutenção Preventiva" duplicada: sai a do curso de Montagem (3k). */
const DESPUBLICAR_POR_CURSO = [
  { slug: 'manutencao-preventiva', curso: 'montagem-e-manutencao' },
]

const PARTES = [
  {
    slug: 'hw-1-as-pecas',
    titulo: 'Parte 1 — As peças e o que fazem',
    descricao: 'Cada componente, para que serve e como escolher. Antes de encostar na chave de fenda.',
    reaproveita: ['componentes-principais', 'plataformas-ddr3-ddr5', 'fonte-alimentacao'],
    desafio: {
      titulo: 'A configuração que cabe no orçamento',
      enunciado: `<p>Monte, no papel, três configurações de computador para a escola, com preços reais de hoje:</p>
<ul>
  <li><strong>Uso básico</strong> — laboratório de digitação e internet</li>
  <li><strong>Uso intermediário</strong> — edição de vídeo simples e programação</li>
  <li><strong>Reaproveitamento</strong> — o que dá para melhorar numa máquina antiga que a escola já tem</li>
</ul>
<p>Para cada uma, liste processador, memória, armazenamento, fonte e placa-mãe, com o preço de cada
peça e o total.</p>
<p>E responda a pergunta que separa quem entende de quem só lista peça: <strong>na configuração
básica, qual foi o componente em que você economizou, e o que essa economia custa na prática?</strong>
Fonte barata e SSD pequeno têm consequências diferentes — diga quais.</p>`,
    },
  },
  {
    slug: 'hw-2-a-bancada',
    titulo: 'Parte 2 — A bancada e a montagem',
    descricao: 'Ferramenta certa, segurança elétrica e a montagem passo a passo.',
    reaproveita: ['ferramentas-e-seguranca', 'montagem-parte-1', 'montagem-parte-2'],
    desafio: {
      titulo: 'Montagem documentada',
      enunciado: `<p>Monte uma máquina — real, no laboratório, ou desmonte e remonte uma que já existe.</p>
<ul>
  <li>Fotografe cada etapa: placa-mãe fora do gabinete, processador encaixado, cooler, memória, fonte, cabos</li>
  <li>Anote a ordem em que você fez e por quê</li>
  <li>Registre o momento do primeiro boot</li>
</ul>
<p>No relatório, responda três coisas: que precaução contra estática você tomou; qual foi o cabo mais
difícil de encaixar e como você percebeu que estava certo; e o que você faria diferente na próxima.</p>
<p>Se a máquina não ligou de primeira, <strong>isso é conteúdo, não fracasso</strong>: descreva o que
estava errado e como você descobriu. É o relato mais valioso que essa entrega pode ter.</p>`,
    },
  },
  {
    slug: 'hw-3-primeiro-boot',
    titulo: 'Parte 3 — O primeiro boot',
    descricao: 'O que acontece ao apertar o botão, a BIOS e o que fazer quando não liga.',
    reaproveita: ['bios-uefi-e-boot'],
    desafio: {
      titulo: 'Do botão à tela',
      enunciado: `<p>Documente o processo de partida de uma máquina real, do botão até o sistema.</p>
<ul>
  <li>Entre na BIOS/UEFI e anote: versão, processador reconhecido, memória reconhecida e ordem de boot</li>
  <li>Confira se a memória está sendo reconhecida na frequência correta — muitas vezes não está</li>
  <li>Mude a ordem de boot para o pendrive e volte ao original depois</li>
  <li>Anote quanto tempo leva do botão até a tela de login</li>
</ul>
<p>Depois provoque uma falha de propósito: desligue da tomada, retire um pente de memória e ligue.
Anote o que acontece — quantos bipes, se acende luz, se dá imagem. Esse comportamento é o que vai
lhe dizer o defeito quando ele for de verdade.</p>`,
    },
  },
  {
    slug: 'hw-4-manutencao-e-defeito',
    titulo: 'Parte 4 — Manutenção e diagnóstico',
    descricao: 'Limpeza, pasta térmica, e o método para achar o componente culpado.',
    reaproveita: ['manutencao-preventiva', 'diagnostico-problemas', 'notebooks-upgrades-e-cuidados'],
    desafio: {
      titulo: 'Um laudo de verdade',
      enunciado: `<p>Pegue uma máquina com problema — do laboratório, de casa, de um vizinho — e escreva o laudo.</p>
<ul>
  <li><strong>Sintoma</strong> descrito como o dono contou, com as palavras dele</li>
  <li><strong>O que você observou</strong> ao ligar: som, luz, imagem, tempo</li>
  <li><strong>Testes feitos</strong>, na ordem, com o resultado de cada um</li>
  <li><strong>Diagnóstico</strong>: qual componente, e como você tem certeza</li>
  <li><strong>Solução</strong> e o custo estimado</li>
  <li><strong>Vale a pena?</strong> — o conserto custa mais que a máquina vale?</li>
</ul>
<p>O último item é o que diferencia um técnico de alguém que troca peça: às vezes a resposta certa é
"não conserte, essa máquina já entregou o que tinha".</p>`,
    },
  },
  {
    slug: 'hw-5-sistema-e-entrega',
    titulo: 'Parte 5 — Sistema e entrega',
    descricao: 'Formatar, instalar, configurar e entregar a máquina funcionando.',
    reaproveita: [
      'antes-de-formatar', 'pendrive-de-instalacao', 'instalando-o-windows',
      'pos-instalacao-drivers', 'linux-para-maquinas-antigas', 'problemas-comuns-formatacao',
      'reaproveitamento-descarte',
    ],
    desafio: {
      titulo: 'Máquina entregue',
      enunciado: `<p>Formate e entregue uma máquina, do backup ao usuário usando.</p>
<ul>
  <li>Backup conferido <strong>antes</strong> de formatar — com a lista do que foi salvo, aprovada pelo dono</li>
  <li>Instalação limpa do sistema</li>
  <li>Drivers, atualizações e os programas que a pessoa usa</li>
  <li>Restauração dos arquivos</li>
  <li>Checklist de entrega assinado</li>
</ul>
<p>O checklist é a parte que se esquece e a que evita discussão: som funciona, wi-fi conecta,
impressora imprime, os arquivos estão lá, a pessoa consegue entrar na conta dela. Confira item por
item <strong>com o dono presente</strong>.</p>
<p>Entregue o checklist preenchido e uma anotação do que deu trabalho — é o que você vai consultar
da próxima vez.</p>`,
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
  if (!modulo) throw new Error('módulo por-dentro-do-computador não encontrado')

  acao(`módulo "${modulo.nome}" → "${MODULO.nome}"`)
  if (APLICAR) {
    await c.query('UPDATE modulos SET nome=?, descricao=?, atualizado_em=NOW() WHERE id=?',
      [MODULO.nome, MODULO.descricao, modulo.id])
  }

  for (const slug of DESPUBLICAR) {
    acao(`despublicar aula duplicada: ${slug}`)
    if (APLICAR) await c.query('UPDATE aulas SET publicado = 0 WHERE slug = ?', [slug])
  }
  for (const { slug, curso } of DESPUBLICAR_POR_CURSO) {
    acao(`despublicar aula duplicada: ${slug} (do curso ${curso})`)
    if (APLICAR) {
      await c.query(
        'UPDATE aulas SET publicado = 0 WHERE slug = ? AND curso_id = (SELECT id FROM cursos WHERE slug = ?)',
        [slug, curso]
      )
    }
  }

  const [trilha] = await c.query("SELECT id FROM trilhas WHERE slug = 'hardware'")

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
           VALUES (UUID(), ?, ?, ?, 'Hardware', 'Fácil', 'André Gomes', 1, ?, 1, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())`,
          [parte.titulo, parte.slug, parte.descricao, 20 + i, modulo.id, i + 1, trilha?.id ?? null, i + 1]
        )
        cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [parte.slug]))[0].id
      }
    }
    if (!APLICAR) continue

    let ordem = 1
    for (const slugAula of parte.reaproveita) {
      const [aula] = await c.query('SELECT id, titulo FROM aulas WHERE slug = ? AND publicado = 1', [slugAula])
      if (!aula) { console.log(`       ! não encontrada ou já despublicada: ${slugAula}`); continue }
      await c.query('UPDATE aulas SET curso_id = ?, ordem = ? WHERE id = ?', [cursoId, ordem, aula.id])
      await c.query('UPDATE progresso_aulas SET curso_id = ? WHERE aula_id = ?', [cursoId, aula.id])
      await c.query('UPDATE curso_desafios SET curso_id = ? WHERE aula_id = ?', [cursoId, aula.id])
      console.log(`       ${ordem}. ${aula.titulo}`)
      ordem++
    }

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

  // Os três cursos antigos ficam vazios e saem do ar.
  for (const antigo of ['arquitetura-e-manutencao', 'montagem-e-manutencao', 'formatacao-de-computadores']) {
    acao(`despublicar "${antigo}" (esvaziado)`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET publicado = 0, modulo_id = NULL, trilha_id = NULL WHERE slug = ?', [antigo])
    }
  }

  // O módulo que perdeu o curso de Montagem passa a se chamar pelo que sobrou.
  acao('módulo "Sistemas, Redes e Manutenção" → "Sistemas e Redes"')
  if (APLICAR) {
    await c.query("UPDATE modulos SET nome = 'Sistemas e Redes' WHERE slug = 'sistemas-redes-e-manutencao'")
  }

  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
} finally {
  c.release()
  await pool.end()
}
