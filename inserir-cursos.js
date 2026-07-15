#!/usr/bin/env node

/**
 * Script para inserir cursos no banco de dados via Supabase
 * Uso: node inserir-cursos.js html
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// DADOS DO CURSO HTML
// ========================================

const cursoHTML = {
  titulo: 'HTML — Estrutura da Web',
  slug: 'html-estrutura-da-web',
  descricao: 'Aprenda os fundamentos de HTML: tags semânticas, estrutura de documentos e boas práticas. Crie páginas web estruturadas e acessíveis.',
  categoria: 'Web Development',
  autor_nome: 'Professor André Gomes',
  nivel: 'Iniciante',
  publicado: false,
  ordem: 2,
};

const aulasHTML = [
  {
    titulo: 'HTML Fundamentos',
    slug: 'html-fundamentos',
    descricao: 'Entender o que é HTML, doctype, estrutura básica de um documento',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar um documento HTML5 válido</li>
  <li>Entender a função do DOCTYPE</li>
  <li>Estruturar head e body corretamente</li>
</ul>

<h2>O que é HTML?</h2>
<p>HTML (HyperText Markup Language) é uma linguagem de <strong>marcação</strong> que define a estrutura de páginas web. Ela usa tags (etiquetas) para indicar o significado e a estrutura do conteúdo.</p>

<p><strong>HTML5</strong> é a versão atual do HTML, lançada em 2014.</p>

<h2>Estrutura Básica de um Documento HTML</h2>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="pt-BR"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width"&gt;
    &lt;title&gt;Título da Página&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Bem-vindo!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>Resumo</h2>
<p>HTML é uma linguagem de marcação, HTML5 é a versão atual, e a estrutura correta é essencial.</p>`,
    ordem: 1,
  },
  {
    titulo: 'Elementos HTML Essenciais',
    slug: 'elementos-html-essenciais',
    descricao: 'Dominar tags de texto e estrutura',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de usar headings, parágrafos e ênfase semântica.</p>

<h2>Headings (Títulos)</h2>
<pre><code>&lt;h1&gt;Título Principal&lt;/h1&gt;
&lt;h2&gt;Subtítulo&lt;/h2&gt;</code></pre>

<h2>Parágrafos e Ênfase</h2>
<pre><code>&lt;p&gt;Parágrafo com &lt;strong&gt;importância&lt;/strong&gt; e &lt;em&gt;ênfase&lt;/em&gt;.&lt;/p&gt;</code></pre>

<h2>Resumo</h2>
<p>Use tags semânticas para estruturar conteúdo corretamente.</p>`,
    ordem: 2,
  },
  {
    titulo: 'Listas e Links',
    slug: 'listas-e-links',
    descricao: 'Criar listas e links navegáveis',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Criar listas ordenadas, não-ordenadas e links.</p>

<h2>Listas</h2>
<pre><code>&lt;ul&gt;
  &lt;li&gt;Item 1&lt;/li&gt;
  &lt;li&gt;Item 2&lt;/li&gt;
&lt;/ul&gt;</code></pre>

<h2>Links</h2>
<pre><code>&lt;a href="https://exemplo.com"&gt;Clique aqui&lt;/a&gt;</code></pre>

<h2>Resumo</h2>
<p>Listas organizam conteúdo, links conectam páginas.</p>`,
    ordem: 3,
  },
  {
    titulo: 'Imagens e Multimídia',
    slug: 'imagens-e-multimedia',
    descricao: 'Inserir imagens com alt text acessível',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Inserir imagens acessíveis com alt text.</p>

<h2>Imagens</h2>
<pre><code>&lt;img src="foto.jpg" alt="Descrição da foto" width="200"&gt;</code></pre>

<h2>Alt Text é Essencial</h2>
<p><strong>Alt text é obrigatório!</strong> Ajuda leitores de tela e melhora SEO.</p>

<h2>Resumo</h2>
<p>Use alt text descritivo em todas as imagens.</p>`,
    ordem: 4,
  },
  {
    titulo: 'Formulários HTML',
    slug: 'formularios-html',
    descricao: 'Criar formulários interativos',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Criar formulários com validação nativa.</p>

<h2>Estrutura Básica</h2>
<pre><code>&lt;form action="/enviar" method="POST"&gt;
  &lt;label for="nome"&gt;Nome:&lt;/label&gt;
  &lt;input type="text" id="nome" name="nome" required&gt;
  &lt;button type="submit"&gt;Enviar&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h2>Tipos de Input</h2>
<ul>
  <li>text, email, password, number, checkbox, radio</li>
</ul>

<h2>Resumo</h2>
<p>Use labels para acessibilidade e validação nativa.</p>`,
    ordem: 5,
  },
  {
    titulo: 'Semântica e Acessibilidade',
    slug: 'semantica-e-acessibilidade',
    descricao: 'Usar tags semânticas para estrutura acessível',
    conteudo: `<h2>Objetivo de Aprendizagem</h2>
<p>Estruturar páginas com tags semânticas.</p>

<h2>Tags Semânticas</h2>
<pre><code>&lt;header&gt;Cabeçalho&lt;/header&gt;
&lt;nav&gt;Navegação&lt;/nav&gt;
&lt;main&gt;Conteúdo principal&lt;/main&gt;
&lt;footer&gt;Rodapé&lt;/footer&gt;</code></pre>

<h2>Sem Div Spaghetti</h2>
<p>Use tags semânticas em vez de divs genéricos.</p>

<h2>Resumo</h2>
<p>Semântica melhora acessibilidade, SEO e manutenibilidade.</p>`,
    ordem: 6,
  },
];

const desafiosHTML = [
  {
    titulo: 'Seu Primeiro HTML',
    enunciado: 'Crie um documento HTML5 válido com DOCTYPE, meta charset, title, h1 e parágrafo.',
    tipo: 'pratico',
    gabarito: 'Verifique se tem: <!DOCTYPE html>, <meta charset>, <title>, <h1>, <p>',
    ordem: 1,
    aula_index: 0,
  },
  {
    titulo: 'Artigo Estruturado',
    enunciado: 'Estruture um texto com h1, parágrafos, <strong> e <em>.',
    tipo: 'pratico',
    gabarito: 'Use tags semânticas, não <b> ou <i>.',
    ordem: 2,
    aula_index: 1,
  },
  {
    titulo: 'Menu Navegável',
    enunciado: 'Crie um menu com <nav>, <ul>, <li> e links.',
    tipo: 'pratico',
    gabarito: 'Menu deve estar clicável com links válidos.',
    ordem: 3,
    aula_index: 2,
  },
  {
    titulo: 'Galeria com Alt Text',
    enunciado: 'Crie galeria com 3+ imagens e alt text descritivo.',
    tipo: 'pratico',
    gabarito: 'Cada <img> tem alt text obrigatório.',
    ordem: 4,
    aula_index: 3,
  },
  {
    titulo: 'Formulário de Contato',
    enunciado: 'Crie formulário com nome, email, assunto, mensagem e botão enviar.',
    tipo: 'pratico',
    gabarito: 'Use <label> para cada campo, type="email", required.',
    ordem: 5,
    aula_index: 4,
  },
  {
    titulo: 'Página Pessoal Integrada',
    enunciado: 'Crie página completa com header, nav, main, imagens, lista, form e footer semântico.',
    tipo: 'pratico',
    gabarito: 'Estrutura semântica completa, alt text, links, form funcionando.',
    ordem: 6,
    aula_index: 5,
  },
];

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function inserirCurso() {
  try {
    console.log('🚀 Inserindo Curso HTML...\n');

    // 1. Inserir curso
    console.log('📚 Inserindo curso...');
    const { data: curso, error: eroCurso } = await supabase
      .from('cursos')
      .insert([cursoHTML])
      .select();

    if (eroCurso) throw new Error(`Erro ao inserir curso: ${eroCurso.message}`);
    const cursoId = curso[0].id;
    console.log(`✅ Curso inserido com ID: ${cursoId}\n`);

    // 2. Inserir aulas
    console.log('📖 Inserindo aulas...');
    const aulasComCursoId = aulasHTML.map((aula) => ({
      ...aula,
      curso_id: cursoId,
    }));

    const { data: aulas, error: eroAulas } = await supabase
      .from('aulas')
      .insert(aulasComCursoId)
      .select();

    if (eroAulas) throw new Error(`Erro ao inserir aulas: ${eroAulas.message}`);
    console.log(`✅ ${aulas.length} aulas inseridas\n`);

    // 3. Inserir desafios
    console.log('🎯 Inserindo desafios...');
    const desafiosComIds = desafiosHTML.map((desafio) => ({
      curso_id: cursoId,
      aula_id: aulas[desafio.aula_index]?.id || null,
      titulo: desafio.titulo,
      enunciado: desafio.enunciado,
      tipo: desafio.tipo,
      gabarito: desafio.gabarito,
      ordem: desafio.ordem,
    }));

    const { data: desafios, error: eroDesafios } = await supabase
      .from('curso_desafios')
      .insert(desafiosComIds)
      .select();

    if (eroDesafios) throw new Error(`Erro ao inserir desafios: ${eroDesafios.message}`);
    console.log(`✅ ${desafios.length} desafios inseridos\n`);

    // 4. Resumo final
    console.log('========================================');
    console.log('✅ CURSO HTML INSERIDO COM SUCESSO!');
    console.log('========================================');
    console.log(`\n📊 Resumo:`);
    console.log(`   • Curso: ${curso[0].titulo}`);
    console.log(`   • Aulas: ${aulas.length}`);
    console.log(`   • Desafios: ${desafios.length}`);
    console.log(`   • URL: /cursos/${curso[0].slug}\n`);

    console.log('🔗 Links úteis:');
    console.log(`   • Página pública: http://localhost:3000/cursos/${curso[0].slug}`);
    console.log(`   • Painel admin: http://localhost:3000/admin/cursos/gerenciar\n`);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

// Executar
inserirCurso();
