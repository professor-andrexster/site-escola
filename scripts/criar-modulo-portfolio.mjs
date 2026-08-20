/**
 * Cria o módulo "Portfólio na Web" — a sequência de HTML e CSS.
 *
 *   node scripts/criar-modulo-portfolio.mjs            simula
 *   node scripts/criar-modulo-portfolio.mjs --aplicar  grava
 *
 * O aluno termina HTML e CSS sabendo montar uma página e sem ter onde colocá-la.
 * Este módulo fecha essa lacuna: versionar com Git, publicar no GitHub, subir na
 * Vercel e montar um portfólio que existe num endereço de verdade — que é o que
 * ele mostra quando alguém pergunta o que sabe fazer.
 *
 * Idempotente: rodar duas vezes não duplica nada. O que já existe é atualizado.
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
  slug: 'portfolio-na-web',
  nome: 'Portfólio na Web',
  nivel: 'Médio',
  carga: 15,
  descricao:
    'Você já sabe montar uma página. Agora ela vai para a internet. Versionar com Git, publicar no GitHub, colocar no ar pela Vercel e reunir tudo num portfólio com endereço próprio — o link que você manda quando alguém pergunta o que você sabe fazer.',
}

const CURSO = {
  slug: 'do-codigo-ao-ar',
  titulo: 'Do Código ao Ar: Git, GitHub e Vercel',
  categoria: 'Web Development',
  carga: 15,
  descricao:
    'Tirar o projeto da pasta do computador e colocar num endereço que qualquer pessoa abre. Git para não perder trabalho, GitHub para guardar e mostrar, Vercel para publicar, e um portfólio para reunir tudo.',
}

/**
 * As aulas. O conteúdo NÃO leva cor nem fundo próprios: quem decide isso é o
 * tema do player (`proseAula`). Foi exatamente o contrário disso que deixou
 * quatro cursos ilegíveis quando o player virou escuro.
 */
const AULAS = [
  {
    slug: 'por-que-versionar',
    titulo: 'Git: parar de perder trabalho',
    min: 45,
    descricao: 'O que Git resolve, e os quatro comandos que você vai usar todo dia.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Explicar o que o Git resolve, com suas palavras</li>
  <li>Iniciar um repositório e gravar seu primeiro commit</li>
  <li>Ver o histórico e voltar para uma versão anterior</li>
</ul>

<h2>O problema, antes da solução</h2>
<p>Você já fez isso: <code>trabalho.html</code>, <code>trabalho-final.html</code>,
<code>trabalho-final-AGORA-VAI.html</code>. Uma semana depois ninguém sabe qual é qual, e a versão
que funcionava sumiu porque você salvou por cima.</p>
<p>Git é a resposta para isso. Ele guarda <strong>fotografias</strong> do seu projeto ao longo do
tempo. Cada fotografia tem data, autor e um recado seu dizendo o que mudou. Você pode voltar para
qualquer uma delas a qualquer momento, e nenhum arquivo precisa mudar de nome.</p>

<h2>Repositório: a pasta que tem memória</h2>
<p>Um <strong>repositório</strong> é uma pasta comum que ganhou memória. Você avisa o Git uma vez,
e a partir dali ele acompanha tudo que acontece ali dentro.</p>
<pre><code>cd meu-projeto
git init</code></pre>
<p>Pronto. Apareceu uma pasta escondida <code>.git</code> — é ali que a memória mora. Apagou essa
pasta, perdeu o histórico; o resto continua sendo arquivo normal.</p>

<h2>Os quatro comandos do dia a dia</h2>
<table>
  <tr><th>Comando</th><th>O que faz</th></tr>
  <tr><td><code>git status</code></td><td>O que mudou desde a última fotografia</td></tr>
  <tr><td><code>git add .</code></td><td>Escolhe o que entra na próxima fotografia</td></tr>
  <tr><td><code>git commit -m "recado"</code></td><td>Tira a fotografia</td></tr>
  <tr><td><code>git log --oneline</code></td><td>Lista as fotografias já tiradas</td></tr>
</table>
<p>Repare que <code>add</code> e <code>commit</code> são passos separados. Isso é de propósito: você
pode ter mexido em cinco arquivos e querer registrar só três agora.</p>

<h2>O recado do commit importa</h2>
<p>O recado é para você daqui a três meses, não para o computador. Compare:</p>
<pre><code>git commit -m "alteracoes"          # inútil
git commit -m "coloca o menu no topo e arruma o espaçamento"   # útil</code></pre>
<p>Escreva o que mudou e por quê. Quando precisar voltar atrás, é por esse recado que você acha a
versão certa.</p>

<h2>Voltando no tempo</h2>
<p>Cada commit tem um código. Com ele você olha como o projeto estava naquele momento:</p>
<pre><code>git log --oneline
# a1b2c3d coloca o menu no topo
# 9f8e7d6 primeira versão da página

git checkout 9f8e7d6     # volta para aquele ponto
git checkout main        # e retorna para o presente</code></pre>
<p>Nada se perde nessa viagem. É por isso que dá para experimentar sem medo — e experimentar sem
medo é metade de aprender a programar.</p>
`,
    desafio: {
      titulo: 'Cinco commits na sua página',
      enunciado: `<p>Pegue a página que você fez no curso de HTML e CSS e transforme em repositório Git.</p>
<ul>
  <li>Rode <code>git init</code> na pasta do projeto</li>
  <li>Faça <strong>cinco commits</strong>, cada um com uma mudança de verdade e um recado que explique o que mudou</li>
  <li>Rode <code>git log --oneline</code> e leia a lista: dá para entender a história do projeto só por ela?</li>
</ul>
<p>Se algum recado não disser nada ("ajustes", "mudanças"), reescreva mentalmente o que ele deveria dizer. É esse hábito que o exercício está treinando.</p>`,
    },
  },
  {
    slug: 'github-seu-codigo-online',
    titulo: 'GitHub: seu código na internet',
    min: 45,
    descricao: 'Conta, repositório, push — e o README que apresenta o projeto.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Criar conta e repositório no GitHub</li>
  <li>Enviar seu projeto local para lá</li>
  <li>Escrever um README que explique o projeto para quem chega</li>
</ul>

<h2>Git e GitHub não são a mesma coisa</h2>
<p>Confusão comum, e vale resolver agora. <strong>Git</strong> é o programa que roda na sua máquina
e guarda o histórico. <strong>GitHub</strong> é um site onde você guarda uma cópia desse histórico
na internet.</p>
<p>Dá para usar Git sem GitHub a vida inteira. Mas o GitHub resolve três coisas que sozinho você não
resolve: seu código sobrevive se o computador morrer, outra pessoa consegue ver, e a Vercel — que é
a próxima aula — pega o projeto direto de lá.</p>

<h2>Criando o repositório</h2>
<p>No GitHub: <strong>New repository</strong>, dê um nome, deixe público. Não marque nenhuma opção
de inicialização — seu projeto já tem histórico, e criar arquivo lá agora só daria conflito.</p>
<p>A tela seguinte mostra os comandos. São estes:</p>
<pre><code>git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main</code></pre>
<p><code>origin</code> é só um apelido para o endereço, para você não digitá-lo toda vez.
<code>push</code> é o verbo que importa: empurrar o que está aqui para lá.</p>

<h2>A partir daí, o ciclo</h2>
<pre><code>git add .
git commit -m "o que mudou"
git push</code></pre>
<p>Três linhas, todo dia. O <code>-u origin main</code> da primeira vez é que permite os
<code>push</code> seguintes serem curtos assim.</p>

<h2>O README é a porta de entrada</h2>
<p>Um arquivo <code>README.md</code> na raiz aparece formatado na página do repositório. É a primeira
coisa que alguém lê — e um repositório sem README parece abandonado.</p>
<pre><code># Meu Portfólio

Página pessoal feita com HTML e CSS, sem framework.

## O que tem aqui
- Página inicial com meus projetos
- Layout que funciona no celular

## No ar em
https://meu-portfolio.vercel.app</code></pre>
<p>Isso é Markdown: <code>#</code> vira título, <code>-</code> vira lista. Três minutos escrevendo
isso mudam completamente a impressão de quem abre seu repositório.</p>

<h2>Cuidado que vale para a vida</h2>
<p>Repositório público é <strong>público</strong>. Nunca suba senha, chave de API ou dado pessoal de
ninguém. E apagar depois não resolve: o histórico do Git guarda o que já esteve lá.</p>
`,
    desafio: {
      titulo: 'Seu projeto no GitHub, com README',
      enunciado: `<p>Suba no GitHub o repositório da aula anterior.</p>
<ul>
  <li>Crie o repositório público e faça o <code>push</code></li>
  <li>Escreva um <code>README.md</code> com: o que é o projeto, o que tem nele e que tecnologias usou</li>
  <li>Confira na página do repositório se o README aparece formatado</li>
  <li>Passe os olhos nos arquivos enviados: tem alguma senha ou dado pessoal ali? Se tiver, tire antes de continuar</li>
</ul>`,
    },
  },
  {
    slug: 'publicando-na-vercel',
    titulo: 'Vercel: colocando no ar',
    min: 40,
    descricao: 'Do repositório ao endereço público, e o que fazer quando não sobe.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Publicar seu projeto num endereço acessível de qualquer lugar</li>
  <li>Entender por que cada <code>push</code> atualiza o site sozinho</li>
  <li>Ler o log quando a publicação falha</li>
</ul>

<h2>O que a Vercel faz</h2>
<p>Um site precisa de um computador ligado o tempo todo servindo os arquivos. A Vercel é esse
computador, de graça para projeto de estudo, e ela se conecta ao seu GitHub.</p>
<p>O acordo é simples: você dá <code>push</code>, ela percebe, pega a versão nova e publica. Você
nunca mais "envia o site" — você só programa, e a publicação é consequência.</p>

<h2>Publicando</h2>
<ol>
  <li>Entre em vercel.com com sua conta do GitHub</li>
  <li><strong>Add New… → Project</strong></li>
  <li>Escolha o repositório e clique em <strong>Deploy</strong></li>
</ol>
<p>Para uma página de HTML e CSS não há nada a configurar. Em menos de um minuto você recebe um
endereço parecido com <code>seu-projeto.vercel.app</code>. Abra no celular: está no ar de verdade,
para qualquer pessoa.</p>

<h2>A partir daí</h2>
<pre><code>git add .
git commit -m "troca a foto da capa"
git push</code></pre>
<p>Sem mais nenhum passo. Em segundos o endereço mostra a versão nova. Cada publicação fica
guardada, então dá para voltar para a anterior pelo painel se algo quebrar.</p>

<h2>Quando não sobe</h2>
<p>Vai acontecer, e o painel diz o motivo. Os três casos mais comuns:</p>
<table>
  <tr><th>Sintoma</th><th>Causa provável</th></tr>
  <tr><td>Página em branco</td><td>O arquivo não se chama <code>index.html</code>, ou não está na raiz</td></tr>
  <tr><td>Site no ar, mas sem estilo</td><td>Caminho do CSS errado — <code>/style.css</code> quando deveria ser <code>style.css</code></td></tr>
  <tr><td>Imagem quebrada só no ar</td><td>Diferença de maiúscula no nome: <code>Foto.PNG</code> e <code>foto.png</code> são a mesma coisa no Windows e coisas diferentes no servidor</td></tr>
</table>
<p>O terceiro pega todo mundo uma vez. Depois dessa, você escreve nome de arquivo em minúsculas
para sempre.</p>
`,
    desafio: {
      titulo: 'Seu primeiro endereço na internet',
      enunciado: `<p>Publique na Vercel o repositório da aula anterior.</p>
<ul>
  <li>Conecte a Vercel ao seu GitHub e publique o projeto</li>
  <li>Abra o endereço <strong>no celular</strong>, com os dados móveis — se abrir, está no ar mesmo</li>
  <li>Faça uma alteração pequena, dê <code>push</code> e cronometre quanto tempo leva até aparecer</li>
  <li>Guarde o endereço: ele vai para o seu portfólio no fim do módulo</li>
</ul>`,
    },
  },
  {
    slug: 'o-que-e-um-portfolio',
    titulo: 'O que é um portfólio, e o que colocar nele',
    min: 40,
    descricao: 'Como apresentar um projeto para quem não estava lá quando você fez.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender o que um portfólio precisa responder</li>
  <li>Descrever um projeto seu de forma que outra pessoa entenda</li>
  <li>Escolher o que entra e o que fica de fora</li>
</ul>

<h2>Para que serve</h2>
<p>Currículo diz o que você estudou. Portfólio <strong>mostra</strong> o que você fez. Para quem
está começando, o segundo vale mais: não há experiência para listar, mas há coisa pronta para abrir
e olhar.</p>
<p>Quem abre seu portfólio está com três perguntas na cabeça, e leva menos de um minuto decidindo:
quem é essa pessoa, o que ela já fez, e como falo com ela.</p>

<h2>Cada projeto precisa de cinco coisas</h2>
<table>
  <tr><th>Item</th><th>Por quê</th></tr>
  <tr><td>Título claro</td><td>"Página da Pizzaria do Bairro" diz mais que "Projeto 3"</td></tr>
  <tr><td>Imagem</td><td>É o que faz alguém parar. Uma captura da tela pronta basta</td></tr>
  <tr><td>Descrição curta</td><td>Duas ou três linhas: o que é e que problema resolve</td></tr>
  <tr><td>Link do site no ar</td><td>Sem isso é promessa. Com isso é prova</td></tr>
  <tr><td>Link do código</td><td>Mostra <em>como</em> você fez, não só o resultado</td></tr>
</table>

<h2>Descrever é mais difícil que fazer</h2>
<p>O erro comum é descrever a tecnologia em vez do projeto:</p>
<blockquote>Site feito em HTML5 e CSS3 com Flexbox e media queries.</blockquote>
<p>Isso não diz o que o site é. Compare:</p>
<blockquote>Página para a pizzaria da minha rua, que só tinha um perfil no Instagram. Mostra o
cardápio, o horário e um botão que abre o WhatsApp já com a mensagem pronta. Feita com HTML e CSS,
sem framework.</blockquote>
<p>A segunda versão tem a mesma informação técnica, no fim, onde ela pertence — e começa pelo que
importa para quem lê.</p>

<h2>Três bons, não dez fracos</h2>
<p>Quem avalia olha o pior projeto da lista para decidir o seu nível. Um portfólio com três projetos
bem acabados vale mais que um com dez pela metade. Exercício de aula não entra: entra o que você
terminou e colocou no ar.</p>

<h2>O que sempre falta</h2>
<ul>
  <li><strong>Como falar com você</strong> — e-mail que você lê, ou link do GitHub</li>
  <li><strong>Quem é você</strong> — duas linhas: o que estuda, onde, o que está aprendendo agora</li>
  <li><strong>Funcionar no celular</strong> — é onde a maioria vai abrir</li>
</ul>
`,
    desafio: {
      titulo: 'Descreva três projetos seus',
      enunciado: `<p>Escolha três coisas que você já fez — dos cursos, da escola ou por conta própria.</p>
<p>Para cada uma, escreva num documento:</p>
<ul>
  <li><strong>Título</strong> que diga o que é, sem usar a palavra "projeto"</li>
  <li><strong>Duas ou três linhas</strong> explicando o que é e para que serve, começando pelo problema e não pela tecnologia</li>
  <li>Que <strong>tecnologias</strong> usou, no fim da descrição</li>
</ul>
<p>Depois releia como se não conhecesse o projeto. Alguém que nunca viu entenderia?</p>`,
    },
  },
  {
    slug: 'montando-a-pagina-do-portfolio',
    titulo: 'Montando a página do portfólio',
    min: 50,
    descricao: 'HTML e CSS aplicados: estrutura, cartões de projeto e celular.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Estruturar a página do portfólio com HTML semântico</li>
  <li>Montar a grade de projetos com CSS Grid</li>
  <li>Fazer a página funcionar no celular</li>
</ul>

<h2>A estrutura</h2>
<p>Nada de novo aqui — é o HTML e o CSS que você já viu, aplicados a um caso real. Três blocos:</p>
<pre><code>&lt;header&gt;   quem é você e como falar com você
&lt;main&gt;     seus projetos
&lt;footer&gt;   links e contato</code></pre>
<p>Use as tags pelo que elas significam. <code>&lt;header&gt;</code> em vez de
<code>&lt;div class="topo"&gt;</code> ajuda o navegador, ajuda quem usa leitor de tela e ajuda você
a se achar no próprio código daqui a um mês.</p>

<h2>O cartão de um projeto</h2>
<pre><code>&lt;article class="projeto"&gt;
  &lt;img src="imagens/pizzaria.png" alt="Tela inicial do site da pizzaria"&gt;
  &lt;h3&gt;Página da Pizzaria do Bairro&lt;/h3&gt;
  &lt;p&gt;Cardápio, horário e botão de WhatsApp para uma pizzaria que só
     tinha Instagram. HTML e CSS, sem framework.&lt;/p&gt;
  &lt;a href="https://pizzaria.vercel.app"&gt;Ver no ar&lt;/a&gt;
  &lt;a href="https://github.com/usuario/pizzaria"&gt;Ver o código&lt;/a&gt;
&lt;/article&gt;</code></pre>
<p>Repare no <code>alt</code> da imagem. Ele descreve o que se vê — é o que uma pessoa cega ouve, e
o que aparece se a imagem não carregar. <code>alt="imagem"</code> não serve para nada.</p>

<h2>A grade</h2>
<pre><code>.projetos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}</code></pre>
<p>Esta é a linha que faz o trabalho. O <code>auto-fit</code> com <code>minmax</code> diz: cada
cartão tem no mínimo 280px, e caiba quantos couberem. Numa tela larga dá três colunas; num celular,
uma. Sem escrever nenhuma media query.</p>

<h2>Antes de publicar, confira</h2>
<ul>
  <li>Abriu no celular? Precisa da linha
    <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> no
    <code>&lt;head&gt;</code> — sem ela o celular finge que é um computador e tudo fica minúsculo</li>
  <li>As imagens têm <code>alt</code> que descreve a imagem?</li>
  <li>Todos os links abrem? Link quebrado em portfólio é pior do que não ter o link</li>
  <li>Dá para ler? Texto cinza-claro sobre fundo branco não se lê — e essa é a maneira mais rápida
    de alguém fechar a sua página</li>
</ul>
`,
    desafio: {
      titulo: 'A página do portfólio, no ar',
      enunciado: `<p>Monte a página do seu portfólio e publique.</p>
<ul>
  <li>Cabeçalho com seu nome e uma frase sobre você</li>
  <li>Os três projetos que você descreveu na aula anterior, cada um com imagem, título, descrição e os dois links</li>
  <li>Rodapé com contato</li>
  <li>Grade que vira uma coluna no celular</li>
  <li>Publicado na Vercel, com o endereço funcionando</li>
</ul>
<p>Abra no celular de um colega antes de considerar pronto.</p>`,
    },
  },
  {
    slug: 'cadastrando-no-portfolio-da-escola',
    titulo: 'Publicando no portfólio da escola',
    min: 30,
    descricao: 'Cadastrar seus projetos no sistema para aparecerem na vitrine.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Cadastrar um projeto no portfólio da escola</li>
  <li>Escolher a imagem que representa o projeto</li>
  <li>Entender o que acontece depois que você envia</li>
</ul>

<h2>Duas vitrines, propósitos diferentes</h2>
<p>Você tem agora sua página pessoal na Vercel — ela é sua, você leva para onde for. E tem o
portfólio da escola, dentro deste sistema, que reúne o trabalho de todo mundo e aparece no site
público da João Beraldo.</p>
<p>Uma não substitui a outra. A sua mostra você; a da escola mostra que você faz parte de um grupo
que produz — e é ela que alguém de fora encontra ao procurar pela escola.</p>

<h2>Cadastrando</h2>
<p>No menu lateral, <strong>Meu Portfólio</strong>. Em <strong>Novo projeto</strong>, você preenche:</p>
<table>
  <tr><th>Campo</th><th>O que colocar</th></tr>
  <tr><td>Título</td><td>O nome do projeto, claro e curto</td></tr>
  <tr><td>Descrição</td><td>As duas ou três linhas que você já escreveu</td></tr>
  <tr><td>Imagem</td><td>Uma captura da tela do projeto funcionando</td></tr>
  <tr><td>Link do site</td><td>O endereço da Vercel</td></tr>
  <tr><td>Link do código</td><td>O repositório no GitHub</td></tr>
</table>

<h2>A imagem faz o trabalho</h2>
<p>Na vitrine, é a imagem que faz alguém parar. Vale o cuidado:</p>
<ul>
  <li>Capture a tela com o projeto <strong>pronto e com conteúdo de verdade</strong>, nunca com
    "Lorem ipsum" ou campos vazios</li>
  <li>Prefira a tela inicial inteira à parte de uma tela</li>
  <li>Não fotografe o monitor com o celular — use a captura de tela do próprio computador</li>
</ul>

<h2>Depois de enviar</h2>
<p>O projeto fica <strong>aguardando revisão</strong>. Um professor confere e aprova; só então ele
aparece na vitrine pública. Isso protege você também: link quebrado ou texto pela metade não vai
para o site da escola com o seu nome.</p>
<p>Se voltar para correção, vem escrito o motivo. Corrija e reenvie — não é reprovação, é revisão.</p>
`,
    desafio: {
      titulo: 'Seus projetos no portfólio da escola',
      enunciado: `<p>Cadastre em <strong>Meu Portfólio</strong> os três projetos do seu portfólio pessoal.</p>
<ul>
  <li>Cada um com título, descrição, imagem, link do site e link do código</li>
  <li>Confira cada link antes de enviar, abrindo numa aba anônima — assim você testa como um visitante, não como você</li>
  <li>Envie para revisão</li>
</ul>`,
    },
  },
]

/** O projeto final do módulo: é ele que vale o certificado. */
const DESAFIO_DO_MODULO = {
  titulo: 'Portfólio no ar, com três projetos publicados',
  enunciado: `
<p>O projeto que fecha o módulo reúne tudo: versionar, publicar e apresentar.</p>

<h3>O que entregar</h3>
<ul>
  <li><strong>Um portfólio publicado na Vercel</strong>, com endereço funcionando</li>
  <li><strong>Três projetos</strong> nele, cada um com imagem, título, descrição, link do site no ar e link do código</li>
  <li><strong>Repositório no GitHub</strong> com pelo menos 10 commits de recados legíveis e um README explicando o projeto</li>
  <li><strong>Os três projetos cadastrados</strong> em Meu Portfólio, aqui no sistema</li>
</ul>

<h3>Como será avaliado</h3>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>Está no ar</td><td>O endereço abre, em qualquer máquina, sem link quebrado</td></tr>
  <tr><td>Funciona no celular</td><td>Sem rolagem lateral, texto legível sem aumentar o zoom</td></tr>
  <tr><td>Descrições</td><td>Começam pelo que o projeto é, não pela tecnologia</td></tr>
  <tr><td>Histórico</td><td>Os commits contam a história do trabalho</td></tr>
  <tr><td>Legibilidade</td><td>Contraste suficiente entre texto e fundo</td></tr>
</table>

<h3>Como enviar</h3>
<p>Mande o <strong>endereço do portfólio na Vercel</strong> e o <strong>endereço do repositório no
GitHub</strong>. Não precisa anexar arquivo: o trabalho está no ar, e é assim que ele deve ser
avaliado.</p>
`,
  instrucoes: 'Envie os dois endereços: o portfólio na Vercel e o repositório no GitHub.',
}

// ---------------------------------------------------------------- execução

const url = new URL(env.DATABASE_URL)
const pool = mariadb.createPool({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), connectionLimit: 2, bigIntAsNumber: true,
})
const c = await pool.getConnection()

const acao = m => console.log(`${APLICAR ? '  ok  ' : ' sim  '} ${m}`)

try {
  // 1. o módulo entra como o 5º, entre "Por Dentro do Computador" (Fácil) e
  //    "Lógica e Programação" (Médio) — é onde ele cabe na progressão.
  const [existente] = await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug])
  let moduloId = existente?.id

  if (!moduloId) {
    acao(`abrir espaço: módulos de ordem >= 5 vão uma casa para frente`)
    if (APLICAR) await c.query('UPDATE modulos SET ordem = ordem + 1 WHERE ordem >= 5')
    acao(`criar módulo "${MODULO.nome}" (${MODULO.nivel}, ${MODULO.carga}h) na ordem 5`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO modulos (id, nome, slug, descricao, nivel, ordem, carga_horaria, publicado, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, 5, ?, 1, NOW(), NOW())`,
        [MODULO.nome, MODULO.slug, MODULO.descricao, MODULO.nivel, MODULO.carga]
      )
      moduloId = (await c.query('SELECT id FROM modulos WHERE slug = ?', [MODULO.slug]))[0].id
    }
  } else {
    acao(`módulo "${MODULO.nome}" já existe — atualizando descrição e carga`)
    if (APLICAR) {
      await c.query('UPDATE modulos SET nome=?, descricao=?, nivel=?, carga_horaria=?, atualizado_em=NOW() WHERE id=?',
        [MODULO.nome, MODULO.descricao, MODULO.nivel, MODULO.carga, moduloId])
    }
  }

  // 2. o curso, dentro do módulo e na trilha de Programação, logo depois do CSS
  const [trilha] = await c.query("SELECT id FROM trilhas WHERE slug = 'programacao'")
  const [cursoExistente] = await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug])
  let cursoId = cursoExistente?.id

  if (!cursoId) {
    acao(`empurrar a trilha: quem está em 3 ou depois anda uma casa`)
    if (APLICAR && trilha) {
      await c.query('UPDATE cursos SET ordem_na_trilha = ordem_na_trilha + 1 WHERE trilha_id = ? AND ordem_na_trilha >= 3',
        [trilha.id])
    }
    acao(`criar curso "${CURSO.titulo}" — módulo ${MODULO.nome}, trilha Programação posição 3`)
    if (APLICAR) {
      await c.query(
        `INSERT INTO cursos (id, titulo, slug, descricao, categoria, nivel, autor_nome, publicado,
                             ordem, carga_horaria, modulo_id, ordem_no_modulo, trilha_id, ordem_na_trilha,
                             created_at, updated_at, criado_em, atualizado_em)
         VALUES (UUID(), ?, ?, ?, ?, 'Médio', 'André Gomes', 1, 100, ?, ?, 1, ?, 3, NOW(), NOW(), NOW(), NOW())`,
        [CURSO.titulo, CURSO.slug, CURSO.descricao, CURSO.categoria, CURSO.carga, moduloId, trilha?.id ?? null]
      )
      cursoId = (await c.query('SELECT id FROM cursos WHERE slug = ?', [CURSO.slug]))[0].id
    }
  } else {
    acao(`curso "${CURSO.titulo}" já existe — atualizando`)
    if (APLICAR) {
      await c.query('UPDATE cursos SET titulo=?, descricao=?, carga_horaria=?, modulo_id=?, atualizado_em=NOW() WHERE id=?',
        [CURSO.titulo, CURSO.descricao, CURSO.carga, moduloId, cursoId])
    }
  }

  // 3. aulas e os desafios de cada uma
  for (const [i, aula] of AULAS.entries()) {
    const [ja] = APLICAR ? await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId]) : []
    acao(`aula ${i + 1}: ${aula.titulo}${ja ? ' (atualiza)' : ''}`)
    if (!APLICAR) continue

    if (ja) {
      await c.query('UPDATE aulas SET titulo=?, descricao=?, conteudo=?, ordem=?, duracao_estimada_min=?, publicado=1, updated_at=NOW() WHERE id=?',
        [aula.titulo, aula.descricao, aula.conteudo.trim(), i + 1, aula.min, ja.id])
    } else {
      await c.query(
        `INSERT INTO aulas (id, curso_id, titulo, slug, descricao, ordem, duracao_estimada_min, publicado, conteudo, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
        [cursoId, aula.titulo, aula.slug, aula.descricao, i + 1, aula.min, aula.conteudo.trim()]
      )
    }
    const [aulaId] = await c.query('SELECT id FROM aulas WHERE slug = ? AND curso_id = ?', [aula.slug, cursoId])

    const [desafioJa] = await c.query('SELECT id FROM curso_desafios WHERE aula_id = ?', [aulaId.id])
    if (desafioJa) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, ordem=? WHERE id=?',
        [aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1, desafioJa.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, curso_id, aula_id, titulo, enunciado, tipo, ordem, vale_certificado, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pratico', ?, 0, NOW())`,
        [cursoId, aulaId.id, aula.desafio.titulo, aula.desafio.enunciado.trim(), i + 1]
      )
    }
  }

  // 4. o projeto do módulo — o que vale certificado
  acao(`projeto do módulo: ${DESAFIO_DO_MODULO.titulo}`)
  if (APLICAR) {
    const [ja] = await c.query('SELECT id FROM curso_desafios WHERE modulo_id = ?', [moduloId])
    if (ja) {
      await c.query('UPDATE curso_desafios SET titulo=?, enunciado=?, instrucoes_envio=? WHERE id=?',
        [DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes, ja.id])
    } else {
      await c.query(
        `INSERT INTO curso_desafios (id, modulo_id, titulo, enunciado, tipo, ordem, vale_certificado, instrucoes_envio, created_at)
         VALUES (UUID(), ?, ?, ?, 'projeto', 99, 1, ?, NOW())`,
        [moduloId, DESAFIO_DO_MODULO.titulo, DESAFIO_DO_MODULO.enunciado.trim(), DESAFIO_DO_MODULO.instrucoes]
      )
    }
  }

  if (!APLICAR) console.log('\n(simulação — passe --aplicar para gravar)')
  else console.log(`\nmódulo, curso, ${AULAS.length} aulas e ${AULAS.length + 1} desafios no lugar`)
} finally {
  c.release()
  await pool.end()
}
