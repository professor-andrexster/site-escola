-- ========================================
-- INSERIR CURSO HTML - PROFESSOR ANDRÉ GOMES
-- ========================================

-- 1. INSERIR CURSO
INSERT INTO public.cursos (
  titulo,
  slug,
  descricao,
  categoria,
  area,
  autor_nome,
  nivel,
  publicado,
  ordem,
  created_at,
  updated_at
) VALUES (
  'HTML — Estrutura da Web',
  'html-estrutura-da-web',
  'Aprenda os fundamentos de HTML: tags semânticas, estrutura de documentos e boas práticas. Crie páginas web estruturadas e acessíveis.',
  'Web Development',
  'web',
  'Professor André Gomes',
  'Iniciante',
  false,
  2,
  NOW(),
  NOW()
) RETURNING id INTO @curso_id;

-- Capturar ID do curso (executar separadamente)
-- SELECT id INTO @curso_id FROM public.cursos WHERE slug = 'html-estrutura-da-web' LIMIT 1;

-- ========================================
-- 2. INSERIR AULAS
-- ========================================

-- Aula 1: HTML Fundamentos
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'HTML Fundamentos',
  'html-fundamentos',
  'Entender o que é HTML, doctype, estrutura básica de um documento',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar um documento HTML5 válido</li>
  <li>Entender a função do DOCTYPE</li>
  <li>Estruturar head e body corretamente</li>
</ul>

<h2>O que é HTML?</h2>
<p>HTML (HyperText Markup Language) é uma linguagem de <strong>marcação</strong> que define a estrutura de páginas web. Ela usa tags (etiquetas) para indicar o significado e a estrutura do conteúdo.</p>

<p><strong>HTML5</strong> é a versão atual do HTML, lançada em 2014. Ela trouxe:</p>
<ul>
  <li>Tags semânticas (article, section, nav, etc)</li>
  <li>Suporte a vídeo e áudio nativos</li>
  <li>APIs modernas (localStorage, geolocation, etc)</li>
  <li>Melhor acessibilidade</li>
</ul>

<h2>Estrutura Básica de um Documento HTML</h2>
<p>Todo documento HTML deve seguir essa estrutura:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="pt-BR"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;Título da Página&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Bem-vindo!&lt;/h1&gt;
    &lt;p&gt;Conteúdo da página aqui.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<h3>Explicação de cada parte:</h3>
<ul>
  <li><code>&lt;!DOCTYPE html&gt;</code> — Declara que é HTML5</li>
  <li><code>&lt;html&gt;</code> — Elemento raiz (abraça tudo)</li>
  <li><code>&lt;head&gt;</code> — Informações sobre o documento (não visível)</li>
  <li><code>&lt;meta charset&gt;</code> — Define encoding (UTF-8 = caracteres especiais)</li>
  <li><code>&lt;meta viewport&gt;</code> — Responsividade em mobile</li>
  <li><code>&lt;title&gt;</code> — Título da aba do navegador</li>
  <li><code>&lt;body&gt;</code> — Conteúdo visível da página</li>
</ul>

<h2>Resumo</h2>
<p>HTML é uma linguagem de marcação, HTML5 é a versão atual, e a estrutura correta é essencial para que sua página funcione bem em todos os navegadores e dispositivos.</p>',
  1,
  false,
  false,
  NOW(),
  NOW()
);

-- Aula 2: Elementos HTML Essenciais
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'Elementos HTML Essenciais',
  'elementos-html-essenciais',
  'Dominar tags de texto e estrutura (h1-h6, p, br, hr, strong, em)',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Usar headings (h1-h6) corretamente</li>
  <li>Estruturar texto com parágrafos</li>
  <li>Aplicar ênfase semântica (strong, em)</li>
</ul>

<h2>Headings (Títulos e Subtítulos)</h2>
<p>Use h1 para o título principal, h2 para subtítulos, e assim por diante:</p>

<pre><code>&lt;h1&gt;Título Principal&lt;/h1&gt;
&lt;h2&gt;Subtítulo&lt;/h2&gt;
&lt;h3&gt;Sub-subtítulo&lt;/h3&gt;</code></pre>

<p><strong>Regra de ouro:</strong> Use uma única &lt;h1&gt; por página. Não pule níveis (não vá direto de h1 para h3).</p>

<h2>Parágrafos</h2>
<p>Use &lt;p&gt; para blocos de texto:</p>

<pre><code>&lt;p&gt;Este é um parágrafo com conteúdo textual.&lt;/p&gt;
&lt;p&gt;Este é outro parágrafo.&lt;/p&gt;</code></pre>

<h2>Ênfase Semântica</h2>
<ul>
  <li><code>&lt;strong&gt;</code> — Importância forte (renderiza bold)</li>
  <li><code>&lt;em&gt;</code> — Ênfase (renderiza itálico)</li>
</ul>

<pre><code>&lt;p&gt;Este texto é &lt;strong&gt;muito importante&lt;/strong&gt;.&lt;/p&gt;
&lt;p&gt;E este texto está &lt;em&gt;enfatizado&lt;/em&gt;.&lt;/p&gt;</code></pre>

<h2>Resumo</h2>
<p>Headings organizam o conteúdo, parágrafos estruturam texto, e ênfase semântica melhora acessibilidade.</p>',
  2,
  false,
  false,
  NOW(),
  NOW()
);

-- Aula 3: Listas e Links
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'Listas e Links',
  'listas-e-links',
  'Criar listas (ul, ol, dl) e links navegáveis (a, href)',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar listas não-ordenadas (ul)</li>
  <li>Criar listas ordenadas (ol)</li>
  <li>Adicionar links com href e atributos</li>
</ul>

<h2>Listas Não-Ordenadas</h2>
<p>Use &lt;ul&gt; para itens sem ordem específica:</p>

<pre><code>&lt;ul&gt;
  &lt;li&gt;Maçã&lt;/li&gt;
  &lt;li&gt;Banana&lt;/li&gt;
  &lt;li&gt;Laranja&lt;/li&gt;
&lt;/ul&gt;</code></pre>

<h2>Listas Ordenadas</h2>
<p>Use &lt;ol&gt; para passos ou itens numerados:</p>

<pre><code>&lt;ol&gt;
  &lt;li&gt;Abra o navegador&lt;/li&gt;
  &lt;li&gt;Digite a URL&lt;/li&gt;
  &lt;li&gt;Pressione Enter&lt;/li&gt;
&lt;/ol&gt;</code></pre>

<h2>Links</h2>
<p>Use &lt;a href&gt; para conectar páginas:</p>

<pre><code>&lt;a href="https://www.google.com"&gt;Ir para Google&lt;/a&gt;
&lt;a href="pagina-local.html"&gt;Página Local&lt;/a&gt;
&lt;a href="#secao-1"&gt;Ir para Seção 1&lt;/a&gt;</code></pre>

<h2>Atributos de Links</h2>
<ul>
  <li><code>href</code> — URL de destino (obrigatório)</li>
  <li><code>target="_blank"</code> — Abre em nova aba</li>
  <li><code>title</code> — Dica ao passar o mouse</li>
</ul>

<h2>Resumo</h2>
<p>Listas organizam conteúdo e links conectam as páginas da web.</p>',
  3,
  false,
  false,
  NOW(),
  NOW()
);

-- Aula 4: Imagens e Multimídia
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'Imagens e Multimídia',
  'imagens-e-multimedia',
  'Inserir imagens (img, alt), vídeos (video) e áudio (audio)',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Inserir imagens com alt text acessível</li>
  <li>Incorporar vídeos responsivos</li>
  <li>Usar áudio em páginas</li>
</ul>

<h2>Imagens</h2>
<p>Use &lt;img&gt; com <strong>alt text obrigatório</strong>:</p>

<pre><code>&lt;img src="foto.jpg" alt="Minha foto pessoal" width="200" height="150"&gt;</code></pre>

<p><strong>O atributo alt é ESSENCIAL:</strong></p>
<ul>
  <li>Ajuda leitores de tela (acessibilidade)</li>
  <li>Exibe texto se imagem não carregar</li>
  <li>Melhora SEO</li>
</ul>

<h2>Formatos de Imagem</h2>
<ul>
  <li><strong>JPG</strong> — Fotos naturais (comprimido, sem transparência)</li>
  <li><strong>PNG</strong> — Gráficos e ícones (sem compressão, com transparência)</li>
  <li><strong>WebP</strong> — Moderno (menor tamanho, melhor qualidade)</li>
</ul>

<h2>Vídeos</h2>
<p>Use &lt;video&gt; para incorporar vídeos:</p>

<pre><code>&lt;video width="400" height="300" controls&gt;
  &lt;source src="video.mp4" type="video/mp4"&gt;
  Seu navegador não suporta vídeo.
&lt;/video&gt;</code></pre>

<h2>Áudio</h2>
<p>Use &lt;audio&gt; para incorporar áudio:</p>

<pre><code>&lt;audio controls&gt;
  &lt;source src="musica.mp3" type="audio/mpeg"&gt;
  Seu navegador não suporta áudio.
&lt;/audio&gt;</code></pre>

<h2>Resumo</h2>
<p>Alt text é essencial para acessibilidade, escolha o formato correto de imagem, e use video/audio com fallback.</p>',
  4,
  false,
  false,
  NOW(),
  NOW()
);

-- Aula 5: Formulários HTML
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'Formulários HTML',
  'formularios-html',
  'Criar formulários interativos (form, input, textarea, select)',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Criar formulários com &lt;form&gt;</li>
  <li>Usar diferentes tipos de input</li>
  <li>Validar dados com atributos nativos</li>
</ul>

<h2>Estrutura Básica de Formulário</h2>
<pre><code>&lt;form action="/enviar" method="POST"&gt;
  &lt;label for="nome"&gt;Nome:&lt;/label&gt;
  &lt;input type="text" id="nome" name="nome" required&gt;

  &lt;button type="submit"&gt;Enviar&lt;/button&gt;
&lt;/form&gt;</code></pre>

<h2>Tipos de Input</h2>
<ul>
  <li><code>type="text"</code> — Texto simples</li>
  <li><code>type="email"</code> — Email (validação nativa)</li>
  <li><code>type="password"</code> — Senha (mascara caracteres)</li>
  <li><code>type="number"</code> — Números</li>
  <li><code>type="checkbox"</code> — Caixa de seleção</li>
  <li><code>type="radio"</code> — Botão de opção</li>
</ul>

<h2>Atributos Importantes</h2>
<ul>
  <li><code>required</code> — Campo obrigatório</li>
  <li><code>placeholder</code> — Texto de dica</li>
  <li><code>value</code> — Valor padrão</li>
  <li><code>name</code> — Identificador do campo (importante!)</li>
</ul>

<h2>Textarea e Select</h2>
<pre><code>&lt;textarea name="mensagem" rows="5" cols="40"&gt;&lt;/textarea&gt;

&lt;select name="pais"&gt;
  &lt;option value="br"&gt;Brasil&lt;/option&gt;
  &lt;option value="pt"&gt;Portugal&lt;/option&gt;
&lt;/select&gt;</code></pre>

<h2>Resumo</h2>
<p>Formulários coletam dados de usuários, tipos de input definem a validação nativa, e labels melhoram acessibilidade.</p>',
  5,
  false,
  false,
  NOW(),
  NOW()
);

-- Aula 6: Semântica e Acessibilidade
INSERT INTO public.aulas (
  curso_id,
  titulo,
  slug,
  descricao,
  conteudo,
  ordem,
  publicado,
  revisado,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  'Semântica e Acessibilidade',
  'semantica-e-acessibilidade',
  'Usar tags semânticas (section, article, nav, aside, header, footer) para estrutura acessível',
  '<h2>Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Usar tags semânticas corretamente</li>
  <li>Estruturar páginas com landmarks</li>
  <li>Melhorar acessibilidade com ARIA básica</li>
</ul>

<h2>O que é Semântica?</h2>
<p>Semântica significa usar tags que <strong>descrevem o significado</strong> do conteúdo, não apenas sua aparência.</p>

<pre><code>&lt;!-- ❌ Não semantic (div spaghetti) --&gt;
&lt;div&gt;
  &lt;div&gt;Logo&lt;/div&gt;
  &lt;div&gt;Menu&lt;/div&gt;
&lt;/div&gt;

&lt;!-- ✅ Semantic --&gt;
&lt;header&gt;
  &lt;h1&gt;Logo&lt;/h1&gt;
  &lt;nav&gt;Menu&lt;/nav&gt;
&lt;/header&gt;</code></pre>

<h2>Tags Semânticas Principais</h2>
<ul>
  <li><code>&lt;header&gt;</code> — Cabeçalho da página ou seção</li>
  <li><code>&lt;nav&gt;</code> — Navegação</li>
  <li><code>&lt;main&gt;</code> — Conteúdo principal (uma por página)</li>
  <li><code>&lt;article&gt;</code> — Artigo ou post (conteúdo independente)</li>
  <li><code>&lt;section&gt;</code> — Seção temática</li>
  <li><code>&lt;aside&gt;</code> — Barra lateral ou conteúdo relacionado</li>
  <li><code>&lt;footer&gt;</code> — Rodapé</li>
</ul>

<h2>Exemplo de Layout Semântico</h2>
<pre><code>&lt;header&gt;
  &lt;h1&gt;Meu Blog&lt;/h1&gt;
  &lt;nav&gt;
    &lt;a href="/"&gt;Home&lt;/a&gt;
    &lt;a href="/sobre"&gt;Sobre&lt;/a&gt;
  &lt;/nav&gt;
&lt;/header&gt;

&lt;main&gt;
  &lt;article&gt;
    &lt;h2&gt;Título do Post&lt;/h2&gt;
    &lt;p&gt;Conteúdo do artigo...&lt;/p&gt;
  &lt;/article&gt;

  &lt;aside&gt;
    &lt;h3&gt;Posts Recentes&lt;/h3&gt;
  &lt;/aside&gt;
&lt;/main&gt;

&lt;footer&gt;
  &lt;p&gt;© 2024 Meu Blog&lt;/p&gt;
&lt;/footer&gt;</code></pre>

<h2>Acessibilidade com ARIA</h2>
<p>Para casos complexos, use atributos ARIA:</p>

<pre><code>&lt;button aria-label="Fechar menu"&gt;✕&lt;/button&gt;
&lt;div role="alert"&gt;Erro ao enviar formulário!&lt;/div&gt;</code></pre>

<h2>Resumo</h2>
<p>Semântica melhora acessibilidade, SEO e manutenibilidade. Use tags que descrevem o significado, não apenas a aparência.</p>',
  6,
  false,
  false,
  NOW(),
  NOW()
);

-- ========================================
-- 3. INSERIR DESAFIOS
-- ========================================

-- Desafio 1: Seu Primeiro HTML
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'html-fundamentos' LIMIT 1),
  'Seu Primeiro HTML',
  'Crie um documento HTML5 válido com:<br><br>1. DOCTYPE<br>2. Meta charset UTF-8<br>3. Título da página (no título da aba)<br>4. Um heading principal (h1)<br>5. Um parágrafo de boas-vindas',
  'pratico',
  'Verifique se sua estrutura tem todos esses elementos:<br>- &lt;!DOCTYPE html&gt;<br>- &lt;meta charset=\"UTF-8\"&gt;<br>- &lt;title&gt; com um título descritivo<br>- &lt;h1&gt; com o título principal<br>- &lt;p&gt; com boas-vindas<br><br>Abra seu arquivo no navegador e veja se está correto!',
  1,
  NOW()
);

-- Desafio 2: Artigo Estruturado
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'elementos-html-essenciais' LIMIT 1),
  'Artigo Estruturado',
  'Pegue um texto qualquer (sobre um tópico que te interessa) e estruture-o em HTML com:<br><br>1. Um h1 como título<br>2. Parágrafos com &lt;p&gt;<br>3. Palavras importantes em &lt;strong&gt;<br>4. Palavras enfatizadas em &lt;em&gt;<br><br>Não use &lt;b&gt; ou &lt;i&gt; — use apenas tags semânticas!',
  'pratico',
  'Verifique:<br>- Apenas um &lt;h1&gt;<br>- Parágrafos separados em &lt;p&gt;<br>- &lt;strong&gt; para importância, não &lt;b&gt;<br>- &lt;em&gt; para ênfase, não &lt;i&gt;<br>- Texto legível e bem organizado',
  2,
  NOW()
);

-- Desafio 3: Menu Navegável
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'listas-e-links' LIMIT 1),
  'Menu Navegável',
  'Crie um menu de navegação com:<br><br>1. Uma &lt;nav&gt; semântica<br>2. Uma lista não-ordenada &lt;ul&gt; com links<br>3. Pelo menos 4 links para diferentes páginas ou âncoras<br><br>Links de exemplo: Home, Sobre, Contato, Blog',
  'pratico',
  'Verifique:<br>- Tag &lt;nav&gt; englobando o menu<br>- &lt;ul&gt; e &lt;li&gt; para cada item<br>- Links com href válidos<br>- Texto claro no link (não apenas "clique aqui")<br>- Menu deve estar clicável',
  3,
  NOW()
);

-- Desafio 4: Galeria com Alt Text
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'imagens-e-multimedia' LIMIT 1),
  'Galeria com Alt Text',
  'Crie uma galeria simples com:<br><br>1. Um heading "Minha Galeria"<br>2. 3+ imagens<br>3. CADA imagem com alt text descritivo<br>4. Opcional: Um parágrafo descrevendo cada imagem<br><br>Use imagens da web ou suas próprias fotos.',
  'pratico',
  'Verifique:<br>- &lt;h2&gt; ou &lt;h3&gt; com título da galeria<br>- Cada &lt;img&gt; tem SRC e ALT<br>- ALT text é descritivo (não vazio!)<br>- ALT text não repete "imagem de..."<br>- Todas as imagens carregam<br>- Layout organizado (em linha ou grid)',
  4,
  NOW()
);

-- Desafio 5: Formulário de Contato
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'formularios-html' LIMIT 1),
  'Formulário de Contato',
  'Crie um formulário de contato com:<br><br>1. Campo de Nome (text, obrigatório)<br>2. Campo de Email (email, obrigatório)<br>3. Campo de Assunto (text)<br>4. Campo de Mensagem (textarea)<br>5. Botão de Envio<br><br>IMPORTANTE: Use &lt;label&gt; para CADA campo!',
  'pratico',
  'Verifique:<br>- &lt;form&gt; envolvendo tudo<br>- &lt;label for=""&gt; associada a cada input<br>- input type="email" para email<br>- Atributo required nos campos obrigatórios<br>- &lt;textarea&gt; para mensagem<br>- &lt;button type="submit"&gt;<br>- Campos legíveis e bem espaçados',
  5,
  NOW()
);

-- Desafio Final: Página Pessoal Integrada
INSERT INTO public.curso_desafios (
  curso_id,
  aula_id,
  titulo,
  enunciado,
  tipo,
  gabarito,
  ordem,
  created_at
) VALUES (
  (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web'),
  (SELECT id FROM public.aulas WHERE slug = 'semantica-e-acessibilidade' LIMIT 1),
  'Página Pessoal Integrada',
  'Crie uma página pessoal COMPLETA que integre TUDO que aprendeu:<br><br>1. &lt;header&gt; com logo/nome e &lt;nav&gt; semântica<br>2. &lt;main&gt; com seção sobre você<br>3. Imagens com alt text<br>4. Lista de habilidades ou projetos<br>5. Formulário de contato<br>6. &lt;footer&gt; com informações<br><br>Use HTML SEMÂNTICO! Sem divs spaghetti!',
  'pratico',
  'Verifique:<br>- Estrutura semântica: header, nav, main, article/section, aside?, footer<br>- Cada imagem tem alt text<br>- Links funcionais no menu<br>- Formulário com labels<br>- Texto bem organizado (h1, h2, h3, p)<br>- Sem erros ao abrir no navegador<br>- Responsivo em mobile (bônus!)',
  6,
  NOW()
);

-- ========================================
-- FIM DA INSERÇÃO
-- ========================================

-- Para executar este script:
-- 1. Copie o conteúdo
-- 2. Abra o Supabase SQL Editor
-- 3. Cole e execute
-- 4. Verifique que as aulas e desafios foram inseridos

-- Verificar inserção:
-- SELECT * FROM public.cursos WHERE slug = 'html-estrutura-da-web';
-- SELECT * FROM public.aulas WHERE curso_id = (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web');
-- SELECT * FROM public.curso_desafios WHERE curso_id = (SELECT id FROM public.cursos WHERE slug = 'html-estrutura-da-web');
