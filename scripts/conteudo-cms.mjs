/**
 * Amplia o curso Gerenciador de Conteúdo (CMS).
 *
 *   node scripts/conteudo-cms.mjs --aplicar
 *
 * É o último curso da trilha, e o mais aplicado: o aluno já sabe HTML, CSS, PHP
 * e banco — aqui ele descobre que existe uma camada pronta em cima disso, e
 * quando vale usá-la. As três aulas novas cobrem o que faz um site de CMS
 * sobreviver depois de publicado: quem pode publicar, por que ele fica lento, e
 * o que fazer quando dá problema.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'o-que-e-cms': `
<h2>O que o CMS faz por você</h2>
<p>Você já sabe montar uma página com HTML e CSS, e já sabe gravar dados com PHP e banco. Um CMS é
exatamente isso, pronto: alguém escreveu o painel, o login, o editor, a busca e a paginação — e
manteve por vinte anos.</p>
<table>
  <tr><th>Você faria</th><th>O CMS já tem</th></tr>
  <tr><td>Login com senha em hash</td><td>pronto, com recuperação por e-mail</td></tr>
  <tr><td>Painel para cadastrar conteúdo</td><td>pronto, com editor visual</td></tr>
  <tr><td>Upload de imagem validado</td><td>pronto, com redimensionamento</td></tr>
  <tr><td>Busca, categorias, paginação</td><td>pronto</td></tr>
  <tr><td>Papéis: quem publica, quem só escreve</td><td>pronto</td></tr>
</table>
<p>Somando, são meses de trabalho que você não faz — e não mantém.</p>

<h2>Quando NÃO usar CMS</h2>
<p>A pergunta certa não é "CMS é bom?", é "quem vai atualizar este site?".</p>
<table>
  <tr><th>Situação</th><th>Melhor escolha</th></tr>
  <tr><td>Página única que muda uma vez por ano</td><td>HTML e CSS, publicado na Vercel</td></tr>
  <tr><td>Alguém sem conhecimento técnico vai atualizar toda semana</td><td>CMS</td></tr>
  <tr><td>Sistema com regra própria: matrícula, estoque, notas</td><td>sistema próprio, como você fez em PHP</td></tr>
  <tr><td>Blog, portal de notícias, site institucional</td><td>CMS</td></tr>
  <tr><td>Portfólio pessoal</td><td>HTML e CSS — é mais rápido e mostra que você sabe fazer</td></tr>
</table>
<p>Um CMS para uma página estática é como usar caminhão para levar uma sacola: funciona, custa caro
de manter e ainda exige carteira especial — atualização, backup, segurança.</p>

<h2>O custo que ninguém menciona no começo</h2>
<ul>
  <li><strong>Atualização constante.</strong> Núcleo, tema e plugins recebem correção de segurança
    o tempo todo, e não atualizar é o caminho mais comum para ser invadido</li>
  <li><strong>Peso.</strong> Uma página simples em CMS costuma carregar dez vezes mais que a mesma
    em HTML puro</li>
  <li><strong>Dependência.</strong> Cada plugin é código de outra pessoa; se ele for abandonado, o
    problema é seu</li>
</ul>

<h2>Faça agora</h2>
<p>Escolha três sites que você usa e tente descobrir se são feitos em CMS. Uma pista rápida:
acrescente <code>/wp-admin</code> ao endereço e veja se aparece uma tela de login. Você vai se
surpreender com quantos são.</p>
`,

  'instalando-cms': `
<h2>Instale local primeiro</h2>
<p>Instalar direto no servidor de produção é o erro que transforma teste em problema público. O
caminho seguro:</p>
<ol>
  <li>Instale na sua máquina, com XAMPP ou o instalador local do CMS</li>
  <li>Monte o site inteiro ali: tema, conteúdo, plugins</li>
  <li>Só então publique, com o site pronto</li>
</ol>
<p>Local você pode quebrar tudo, apagar o banco e recomeçar. No servidor, cada erro fica visível — e
indexado pelo Google, às vezes por meses.</p>

<h2>O que precisa existir no servidor</h2>
<table>
  <tr><th>Requisito</th><th>Por quê</th></tr>
  <tr><td>PHP em versão recente</td><td>versão antiga não recebe correção de segurança</td></tr>
  <tr><td>MySQL ou MariaDB</td><td>é onde o conteúdo mora</td></tr>
  <tr><td>HTTPS</td><td>senha de login trafega em texto sem ele</td></tr>
  <tr><td>Espaço em disco</td><td>as imagens crescem mais rápido do que parece</td></tr>
</table>
<p>Você reconhece esses dois primeiros: são exatamente o que você usou no curso de PHP e no de banco.
O CMS não inventa nada — ele monta em cima do que você já viu por dentro.</p>

<h2>As decisões da instalação que dão trabalho depois</h2>
<ul>
  <li><strong>O usuário administrador.</strong> Nunca <code>admin</code> — é o primeiro nome que
    qualquer ataque automático tenta. Escolha outro e uma senha longa</li>
  <li><strong>O prefixo das tabelas.</strong> Trocar o padrão dificulta ataque automatizado que
    presume o nome</li>
  <li><strong>O endereço do site.</strong> Decida antes se será com ou sem <code>www</code>; mudar
    depois exige mexer no banco</li>
  <li><strong>O idioma.</strong> Trocar depois deixa restos em inglês em lugares estranhos</li>
</ul>

<h2>Depois de instalar, antes de qualquer outra coisa</h2>
<ol>
  <li>Atualize núcleo, tema e plugins</li>
  <li>Apague os temas e plugins de exemplo que vieram juntos — código não usado também é porta de
    entrada</li>
  <li>Configure o formato dos endereços para incluir o título, e não <code>?p=123</code></li>
  <li>Faça o primeiro backup, antes de haver conteúdo para perder</li>
</ol>

<h2>Faça agora</h2>
<p>Instale um CMS na sua máquina e cronometre. Depois anote quanto tempo levaria escrever, do zero,
o login e o painel de cadastro que ele já traz — você tem base para estimar, porque fez isso em PHP.</p>
`,

  'estrutura-conteudo-cms': `
<h2>Página ou post: a confusão mais comum</h2>
<table>
  <tr><th></th><th>Página</th><th>Post</th></tr>
  <tr><td>Muda com frequência</td><td>não</td><td>sim</td></tr>
  <tr><td>Tem data</td><td>irrelevante</td><td>essencial</td></tr>
  <tr><td>Entra em categoria</td><td>não</td><td>sim</td></tr>
  <tr><td>Aparece no menu</td><td>geralmente</td><td>não</td></tr>
  <tr><td>Exemplos</td><td>Sobre, Contato, A Escola</td><td>notícias, avisos, eventos</td></tr>
</table>
<p>A pergunta que decide: <em>daqui a um ano, isso ainda estará atualizado?</em> Se sim, é página. Se
vai virar registro histórico, é post.</p>
<p>Erro comum em site de escola: publicar o comunicado da matrícula como página. No ano seguinte,
alguém edita a mesma página — e o comunicado do ano passado desaparece, junto com o link que foi
compartilhado por WhatsApp.</p>

<h2>Categoria e etiqueta</h2>
<ul>
  <li><strong>Categoria</strong> — a gaveta. Poucas, hierárquicas, e todo post entra em uma:
    Notícias, Eventos, Editais</li>
  <li><strong>Etiqueta</strong> — o assunto. Muitas, sem hierarquia, atravessam categorias:
    "3º ano", "matrícula", "feira de ciências"</li>
</ul>
<p>O erro é criar categoria para tudo. Com trinta categorias e um post em cada, o site não organiza
nada — e o menu fica impossível. Regra prática: se você não consegue explicar suas categorias em
dez segundos, são categorias demais.</p>

<h2>O endereço importa</h2>
<pre><code>escola.com/?p=1234                         # não diz nada
escola.com/2026/08/24/matricula-2027       # data no meio envelhece
escola.com/noticias/matricula-2027         # bom</code></pre>
<p>O endereço aparece no Google, no WhatsApp e no cartaz impresso. Ele deve descrever o conteúdo, e
mudá-lo depois quebra todos os links já compartilhados.</p>

<h2>Campos próprios</h2>
<p>Quando o conteúdo tem estrutura — um evento com data, local e inscrição — não escreva tudo num
texto corrido. Os CMS permitem criar campos próprios, e o ganho é o mesmo que você viu em banco de
dados: dá para filtrar por data, ordenar por local, listar só os futuros.</p>
<p>É a mesma lição do campo multivalorado: <em>informação que se consulta separado precisa estar
separada</em>.</p>

<h2>Faça agora</h2>
<p>Liste dez conteúdos do site da sua escola e classifique cada um: página ou post? Depois defina no
máximo cinco categorias que cobririam todos os posts. Se você precisar de mais de cinco, revise —
provavelmente algumas são etiquetas.</p>
`,

  'temas-personalizacao': `
<h2>Nunca edite o tema direto</h2>
<p>É o erro que mais dá prejuízo em CMS: você edita o arquivo do tema, fica bonito, e na primeira
atualização o tema é sobrescrito e todo o seu trabalho some.</p>
<p>A solução é o <strong>tema filho</strong>: um tema mínimo que herda tudo do original e guarda só
as suas mudanças.</p>
<pre><code>meu-tema-filho/
  style.css      /* Template: tema-original */
  functions.php</code></pre>
<p>Com ele, o tema original atualiza normalmente e as suas alterações permanecem. É o mesmo princípio
da herança que você viu em Java: não altere a classe-mãe, estenda.</p>

<h2>Escolher um tema</h2>
<table>
  <tr><th>Confira</th><th>Por quê</th></tr>
  <tr><td>Data da última atualização</td><td>tema parado há dois anos é risco de segurança</td></tr>
  <tr><td>Quantidade de instalações</td><td>muitos usuários significa problema descoberto rápido</td></tr>
  <tr><td>Velocidade da demonstração</td><td>teste a demo no PageSpeed antes de escolher</td></tr>
  <tr><td>Quantos plugins ele exige</td><td>tema que precisa de seis plugins é armadilha</td></tr>
</table>
<p>Tema bonito e lento é escolha ruim: metade das visitas do site da escola vem de celular, muitas
vezes com internet fraca.</p>

<h2>O CSS que você já sabe continua valendo</h2>
<pre><code>/* no tema filho ou no personalizador */
:root {
  --cor-marca: #1a3a5c;
}
.site-header {
  background: var(--cor-marca);
}</code></pre>
<p>Aqui vale tudo que você aprendeu: seletor, variável, contraste medido, tipografia com
<code>max-width</code>. A diferença é só onde o CSS mora.</p>
<p>E vale a mesma checagem: rode o Lighthouse no site pronto. Tema comercial costuma reprovar em
contraste, e o conserto é a mesma linha de CSS de sempre.</p>

<h2>Faça agora</h2>
<p>Crie um tema filho, mude a cor do cabeçalho e depois atualize o tema original. Sua alteração
continua lá. Repita editando o tema original direto e atualize de novo — para ver a alteração
desaparecer.</p>
`,

  'plugins-extensoes': `
<h2>Cada plugin é uma decisão de longo prazo</h2>
<p>Plugin é código de outra pessoa rodando com acesso total ao seu site e ao seu banco. Isso não é
motivo para não usar — é motivo para escolher com critério.</p>
<table>
  <tr><th>Antes de instalar, confira</th><th>Sinal ruim</th></tr>
  <tr><td>Última atualização</td><td>mais de um ano parado</td></tr>
  <tr><td>Instalações ativas</td><td>poucas centenas</td></tr>
  <tr><td>Avaliações recentes</td><td>reclamação de quebra sem resposta</td></tr>
  <tr><td>Compatibilidade declarada</td><td>versões antigas do CMS</td></tr>
  <tr><td>Quem mantém</td><td>desenvolvedor único e sumido</td></tr>
</table>

<h2>Menos é mais rápido e mais seguro</h2>
<p>Cada plugin carrega os próprios arquivos de CSS e JavaScript em todas as páginas — inclusive nas
que não o usam. Vinte plugins produzem um site que demora cinco segundos para abrir.</p>
<p>E, em segurança, a conta é direta: quanto mais código de terceiros, maior a chance de um deles ter
falha. A maioria das invasões de sites em CMS entra por plugin desatualizado, não pelo núcleo.</p>
<blockquote>Regra: se dá para resolver com dez linhas no tema filho, não instale um plugin.</blockquote>

<h2>Os que quase sempre valem</h2>
<ul>
  <li><strong>Backup automático</strong> — o único que é inegociável</li>
  <li><strong>Segurança</strong> — limita tentativas de login e avisa de alteração em arquivo</li>
  <li><strong>SEO</strong> — cuida de título, descrição e sitemap</li>
  <li><strong>Cache</strong> — a diferença mais visível de velocidade</li>
</ul>
<p>Quatro resolvem a maior parte dos casos. Do quinto em diante, pergunte se o problema é real ou se
você está instalando por curiosidade.</p>

<h2>Antes de atualizar</h2>
<ol>
  <li>Faça backup — de arquivos e do banco</li>
  <li>Atualize um por vez, não todos de uma vez</li>
  <li>Abra o site depois de cada um</li>
</ol>
<p>Atualizar tudo junto e o site quebrar deixa você sem saber qual foi. Um por vez custa cinco
minutos e responde na hora.</p>

<h2>Faça agora</h2>
<p>Olhe a lista de plugins de um site em CMS que você tenha acesso — ou instale cinco no seu local.
Meça a velocidade com o PageSpeed antes e depois. O número costuma surpreender.</p>
`,

  'publicacao-seo-seguranca': `
<h2>O que SEO é, e o que não é</h2>
<p>SEO não é truque para enganar buscador — isso parou de funcionar há mais de uma década. É deixar
claro, para uma máquina, do que a página trata.</p>
<table>
  <tr><th>Funciona</th><th>Não funciona</th></tr>
  <tr><td>Título que descreve a página</td><td>repetir a palavra-chave vinte vezes</td></tr>
  <tr><td>Conteúdo que responde à pergunta</td><td>texto encomendado sem conteúdo</td></tr>
  <tr><td>Endereço legível</td><td>esconder texto na cor do fundo</td></tr>
  <tr><td>Site rápido e que funciona no celular</td><td>comprar links</td></tr>
  <tr><td>Imagem com <code>alt</code> descritivo</td><td>—</td></tr>
</table>
<p>Repare que quase tudo da coluna da esquerda você já aprendeu no módulo de HTML e CSS. Boa parte
do SEO é simplesmente fazer as coisas direito.</p>

<h2>O que preencher em cada conteúdo</h2>
<ul>
  <li><strong>Título</strong> — até uns 60 caracteres, com o assunto na frente</li>
  <li><strong>Descrição</strong> — uma ou duas frases; é o que aparece embaixo do link no Google</li>
  <li><strong>Endereço</strong> — curto e descritivo</li>
  <li><strong>Imagem de compartilhamento</strong> — é ela que aparece quando o link vai para o
    WhatsApp</li>
</ul>
<p>O último é o mais esquecido e o mais visível na prática: no site de uma escola, quase toda visita
vem de link compartilhado em grupo de WhatsApp.</p>

<h2>Segurança sem plugin</h2>
<ol>
  <li><strong>Atualize.</strong> É a defesa que resolve a maioria dos casos</li>
  <li><strong>Sem usuário "admin"</strong>, e senha longa e única</li>
  <li><strong>HTTPS</strong> sempre — hoje é gratuito</li>
  <li><strong>Limite tentativas de login</strong></li>
  <li><strong>Cada pessoa com o papel mínimo</strong> — quem só escreve não precisa poder instalar
    plugin</li>
  <li><strong>Backup testado</strong>, com restauração já ensaiada</li>
</ol>
<p>Nenhum desses é difícil, e juntos eliminam quase todo ataque automatizado — que é a esmagadora
maioria. Ninguém está mirando o site da sua escola especificamente: são robôs varrendo a internet
atrás de instalação desatualizada.</p>

<h2>Antes de dizer que está no ar</h2>
<table>
  <tr><th>Confira</th><th>Como</th></tr>
  <tr><td>Abre no celular sem rolagem lateral</td><td>abra no seu telefone</td></tr>
  <tr><td>Todos os links funcionam</td><td>clique em todos</td></tr>
  <tr><td>Formulário de contato chega mesmo</td><td>envie um teste e confira a caixa</td></tr>
  <tr><td>HTTPS com cadeado</td><td>olhe a barra de endereço</td></tr>
  <tr><td>Velocidade aceitável</td><td>PageSpeed acima de 70 no celular</td></tr>
  <tr><td>Aparece bem no WhatsApp</td><td>mande o link para você mesmo</td></tr>
</table>

<h2>Faça agora</h2>
<p>Pegue o site da sua escola — ou qualquer um que você conheça — e rode o PageSpeed na versão
móvel. Anote a nota e os três primeiros problemas apontados. Quase sempre o primeiro é imagem grande
demais.</p>
`,
}

const NOVAS = [
  {
    curso: 'gerenciador-de-conteudo',
    slug: 'usuarios-e-papeis',
    titulo: 'Usuários, papéis e quem publica o quê',
    min: 6, ordem: 4,
    descricao: 'Várias pessoas mexendo no mesmo site, sem uma apagar o trabalho da outra.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender os papéis padrão de um CMS</li>
  <li>Aplicar o princípio do menor privilégio</li>
  <li>Montar um fluxo editorial que funciona numa escola</li>
</ul>

<h2>O motivo de existirem papéis</h2>
<p>Num site de escola, várias pessoas publicam: a secretaria põe comunicado, o professor põe
atividade, o grêmio põe evento. Se todas tiverem acesso total, basta um clique errado para o site
sair do ar — e ninguém saberá quem foi.</p>
<p>É a mesma separação entre autenticação e autorização que você viu em PHP: <em>quem é você</em> e
<em>o que você pode fazer</em>.</p>

<h2>Os papéis padrão</h2>
<table>
  <tr><th>Papel</th><th>Pode</th><th>Na escola seria</th></tr>
  <tr><td>Administrador</td><td>tudo, inclusive instalar e apagar</td><td>uma pessoa, no máximo duas</td></tr>
  <tr><td>Editor</td><td>publicar e editar o conteúdo de todos</td><td>quem revisa o site</td></tr>
  <tr><td>Autor</td><td>publicar e editar o próprio conteúdo</td><td>coordenação, secretaria</td></tr>
  <tr><td>Colaborador</td><td>escrever, mas não publicar</td><td>professores, grêmio</td></tr>
  <tr><td>Assinante</td><td>só ler o que é restrito</td><td>raramente usado</td></tr>
</table>
<p>A regra é sempre a mesma: <strong>o menor papel que permita a pessoa fazer o trabalho dela</strong>.
Ninguém precisa ser administrador para escrever uma notícia.</p>

<h2>O fluxo que funciona</h2>
<ol>
  <li>O professor (colaborador) escreve e envia para revisão</li>
  <li>A coordenação (editor) revisa, corrige e publica</li>
  <li>O administrador cuida de atualização, backup e plugins — e não escreve conteúdo</li>
</ol>
<p>Isso resolve dois problemas de uma vez: nada vai ao ar sem revisão, e cada pessoa tem só o poder
de que precisa. É o mesmo fluxo do portfólio que existe no painel da escola — o aluno envia, o
professor aprova.</p>

<h2>Os erros comuns</h2>
<ul>
  <li><strong>Uma conta compartilhada.</strong> "A senha do site" que dez pessoas usam: ninguém sabe
    quem alterou o quê, e quando alguém sai da escola a senha continua valendo</li>
  <li><strong>Todo mundo administrador.</strong> Por comodidade, e aí um clique apaga um plugin que
    o site inteiro usava</li>
  <li><strong>Conta que fica.</strong> Professor que saiu no ano passado e continua com acesso</li>
</ul>
<p>O terceiro é o mais perigoso e o mais fácil de resolver: revise a lista de usuários a cada
semestre e remova quem não está mais na escola.</p>

<h2>Quando alguém sai</h2>
<p>Não apague a conta de imediato: o conteúdo dela pode ir junto, dependendo do CMS. O caminho
seguro é transferir a autoria do que ela publicou para outro usuário, e só então remover — ou
desativar a conta, que é o equivalente ao <code>ativo = false</code> que você viu em banco.</p>

<h2>Faça agora</h2>
<p>No seu CMS local, crie três usuários com papéis diferentes e entre com cada um. Repare no que
some do menu a cada papel. Depois tente publicar como colaborador: o botão diz "enviar para
revisão", não "publicar".</p>
`,
    desafio: {
      titulo: 'O fluxo editorial da escola',
      enunciado: `<p>Monte a estrutura de usuários de um site escolar no seu CMS local.</p>
<ul>
  <li>Crie cinco usuários: um administrador, um editor, dois colaboradores e um autor</li>
  <li>Entre com cada um e anote o que ele consegue e não consegue fazer</li>
  <li>Como colaborador, escreva um post e envie para revisão</li>
  <li>Como editor, revise e publique</li>
  <li>Como colaborador de novo, tente editar o post já publicado</li>
</ul>
<p>Entregue uma tabela com os cinco papéis e, para cada um, três coisas que ele pode e três que não
pode. Depois responda: <strong>qual papel você daria a um professor que precisa publicar avisos
urgentes sem esperar revisão?</strong> Justifique — e diga que risco você está aceitando ao dar esse
papel.</p>`,
    },
  },
  {
    curso: 'gerenciador-de-conteudo',
    slug: 'velocidade-do-site',
    titulo: 'Por que o site fica lento',
    min: 6, ordem: 6,
    descricao: 'Imagem, cache e as poucas coisas que resolvem quase todo problema de velocidade.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Medir a velocidade do site em vez de estimar</li>
  <li>Corrigir as três causas mais comuns de lentidão</li>
  <li>Entender o que o cache faz</li>
</ul>

<h2>Por que importa numa escola</h2>
<p>A maior parte das visitas ao site de uma escola vem de celular, muitas vezes com internet fraca.
Um site que demora oito segundos para abrir não é lento: para boa parte das pessoas, ele
simplesmente não abre — elas desistem antes.</p>
<p>E isso não é opinião: buscadores usam velocidade como critério de posicionamento, justamente
porque mede a experiência real.</p>

<h2>Meça antes de mexer</h2>
<p>Rode o <strong>PageSpeed Insights</strong> no endereço do site e olhe a aba <em>Celular</em>, não
a de computador. É a que representa quem visita.</p>
<p>Ele devolve uma nota e, mais importante, uma lista ordenada do que corrigir. Comece pelo primeiro
item: a lista já vem em ordem de impacto.</p>

<h2>Causa número um: imagem</h2>
<p>Em dez sites lentos, nove têm imagem grande demais. A foto sai do celular com 4000 pixels e 5 MB,
alguém sobe direto, e o CMS a exibe num espaço de 800 pixels — baixando os 5 MB inteiros.</p>
<table>
  <tr><th>Faça</th><th>Ganho</th></tr>
  <tr><td>Redimensione antes de subir: 1600px de largura basta</td><td>enorme</td></tr>
  <tr><td>Salve em WEBP</td><td>arquivo até 30% menor</td></tr>
  <tr><td>Comprima antes (TinyPNG e similares)</td><td>metade do tamanho, sem diferença visível</td></tr>
  <tr><td>Deixe o carregamento adiado ligado</td><td>a página abre sem esperar as fotos de baixo</td></tr>
</table>
<p>Só isso costuma tirar o site de oito segundos para dois.</p>

<h2>Causa número dois: plugin demais</h2>
<p>Cada plugin carrega o próprio CSS e JavaScript em <strong>todas</strong> as páginas, mesmo nas que
não o usam. Um formulário instalado para uma única página pesa no site inteiro.</p>
<p>Faça o teste: desative todos os plugins, meça, e reative um por um medindo a cada vez. Você vai
descobrir que dois ou três respondem pela maior parte do peso.</p>

<h2>Causa número três: sem cache</h2>
<p>Sem cache, cada visita repete todo o trabalho: o PHP roda, consulta o banco, monta o HTML. Para
uma página que não muda há três semanas, isso é refazer o mesmo cálculo mil vezes.</p>
<p>O plugin de cache guarda o HTML pronto e entrega direto. É a mesma ideia do
<code>revalidate</code> que existe no painel da escola: a página é recalculada de tempos em tempos,
não a cada visita.</p>
<p>Um cuidado: depois de publicar algo, limpe o cache — senão você atualiza o site e continua vendo
a versão antiga, achando que não salvou.</p>

<h2>O que quase nunca é o problema</h2>
<ul>
  <li><strong>"O servidor é ruim".</strong> Às vezes é, mas só depois de resolver imagem, plugin e
    cache — que são de graça</li>
  <li><strong>"O tema é pesado".</strong> Pode contribuir, mas raramente é o primeiro item da lista
    do PageSpeed</li>
</ul>
<p>Meça antes de trocar de hospedagem: é comum pagar mais caro e continuar lento, porque a causa era
uma foto de 8 MB na página inicial.</p>

<h2>Faça agora</h2>
<p>Rode o PageSpeed num site em CMS e anote a nota do celular e os três primeiros problemas. Depois
abra a aba Network do navegador (F12), ordene por tamanho e veja qual é o maior arquivo da página.
Aposto numa imagem.</p>
`,
    desafio: {
      titulo: 'Do lento ao rápido, com números',
      enunciado: `<p>Pegue um site em CMS — o seu local, com conteúdo, ou um que você tenha acesso — e faça um trabalho de otimização medido.</p>
<h3>Antes</h3>
<ul>
  <li>Nota do PageSpeed na versão <strong>celular</strong></li>
  <li>Peso total da página inicial (aba Network)</li>
  <li>Os três maiores arquivos, com tamanho</li>
</ul>
<h3>Corrija</h3>
<ul>
  <li>Redimensione e comprima todas as imagens acima de 300 KB</li>
  <li>Desative os plugins que não são usados</li>
  <li>Instale e configure um plugin de cache</li>
</ul>
<h3>Depois</h3>
<p>Repita as três medições e entregue a tabela com antes e depois.</p>
<p>Responda também: <strong>qual das três correções deu o maior ganho?</strong> Para saber, meça
depois de cada uma, e não só no fim — é a diferença entre saber e supor.</p>`,
    },
  },
  {
    curso: 'gerenciador-de-conteudo',
    slug: 'manutencao-e-backup',
    titulo: 'Manutenção: backup, atualização e o dia ruim',
    min: 7, ordem: 8,
    descricao: 'O que fazer toda semana, e o que fazer quando o site quebra ou é invadido.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Montar uma rotina de manutenção que cabe no dia</li>
  <li>Fazer backup que realmente serve</li>
  <li>Saber o que fazer quando o site quebra ou é invadido</li>
</ul>

<h2>Publicar é o começo, não o fim</h2>
<p>Site em CMS não é obra entregue: é jardim. Sem manutenção, em seis meses está desatualizado; em
um ano, invadido. E isso não é pessimismo — é o funcionamento normal de software conectado à
internet.</p>

<h2>A rotina</h2>
<table>
  <tr><th>Quando</th><th>O quê</th></tr>
  <tr><td>Toda semana</td><td>atualizar plugins e tema, conferir se o site abre</td></tr>
  <tr><td>Todo mês</td><td>conferir se o backup está rodando, revisar usuários</td></tr>
  <tr><td>Todo semestre</td><td><strong>restaurar</strong> o backup num ambiente de teste</td></tr>
  <tr><td>Todo ano</td><td>revisar plugins: algum foi abandonado? algum não é mais usado?</td></tr>
</table>
<p>A linha do semestre é a que quase ninguém cumpre — e é a única que prova que as outras
funcionaram.</p>

<h2>Backup que serve</h2>
<p>Um backup de CMS tem duas partes, e as duas são obrigatórias:</p>
<ul>
  <li><strong>Arquivos</strong> — tema, plugins e a pasta de uploads, que é onde estão todas as
    imagens</li>
  <li><strong>Banco de dados</strong> — todo o conteúdo: textos, páginas, usuários, configurações</li>
</ul>
<p>Só os arquivos, sem o banco, restauram um site vazio. Só o banco, sem os arquivos, restauram um
site sem nenhuma imagem.</p>
<p>E vale a regra que você viu no curso de banco: <strong>três cópias, dois lugares, uma fora</strong>.
Backup guardado no mesmo servidor do site some junto com ele.</p>

<h2>Quando o site quebra depois de uma atualização</h2>
<ol>
  <li><strong>Não entre em pânico e não atualize mais nada</strong></li>
  <li>Foi qual atualização? Se você fez uma por vez, já sabe</li>
  <li>Desative o plugin suspeito — se não conseguir entrar no painel, renomeie a pasta dele por
    FTP; o CMS o desativa sozinho</li>
  <li>Se não resolveu, troque para um tema padrão: isso descarta o tema como causa</li>
  <li>Persistindo, restaure o backup</li>
</ol>
<p>Aquele passo 3 é o truque que salva o dia: renomear a pasta do plugin é o jeito de desativá-lo
sem acesso ao painel.</p>

<h2>Quando foi invadido</h2>
<p>Sinais: propaganda estranha aparecendo, redirecionamento para outro site, usuário administrador
que você não criou, arquivos com data de modificação recente que ninguém tocou.</p>
<ol>
  <li><strong>Tire o site do ar</strong> — enquanto está invadido, ele prejudica quem visita</li>
  <li>Troque <strong>todas</strong> as senhas: painel, banco, FTP, hospedagem</li>
  <li>Restaure um backup <strong>anterior à invasão</strong> — descobrir a data é parte do trabalho</li>
  <li>Atualize tudo antes de voltar ao ar</li>
  <li>Descubra por onde entraram, ou vão entrar de novo</li>
</ol>
<p>O passo 5 é o que costuma ser pulado, e é o motivo de sites serem invadidos duas vezes no mesmo
mês. Quase sempre a porta é um plugin desatualizado.</p>

<h2>Documentar para quem vem depois</h2>
<p>Escreva um arquivo com: onde está hospedado, onde ficam os backups, que plugins são essenciais e
por quê, e quem tem acesso. Guarde fora do site.</p>
<p>Numa escola, quem cuida do site muda — o professor sai, o estagiário se forma. Sem essa anotação,
a pessoa seguinte começa do zero, e às vezes descobre da pior forma que não havia backup nenhum.</p>

<h2>Faça agora</h2>
<p>Faça o backup completo do seu CMS local — arquivos e banco. Depois apague a instalação inteira e
restaure a partir do backup. É a única forma de saber se ele funciona, e é bem melhor descobrir
agora do que no dia ruim.</p>
`,
    desafio: {
      titulo: 'Restaure do zero',
      enunciado: `<p>Este desafio tem uma exigência: você vai destruir a instalação de propósito.</p>
<ol>
  <li>Monte um site pequeno no CMS local: três páginas, três posts com imagem, dois usuários</li>
  <li>Faça o backup completo — arquivos <strong>e</strong> banco</li>
  <li>Guarde o backup <strong>fora</strong> da pasta do site</li>
  <li>Apague a instalação inteira: pasta e banco</li>
  <li>Restaure a partir do backup</li>
</ol>
<p>Entregue um relato com:</p>
<ul>
  <li>Quanto tempo levou a restauração</li>
  <li>O que deu errado no caminho — sempre dá algo</li>
  <li>O que estava faltando na primeira tentativa, se estava</li>
  <li>Um passo a passo escrito para outra pessoa conseguir repetir</li>
</ul>
<p>Escreva também o plano de manutenção do site: o que fazer toda semana, todo mês e todo semestre.
Esse documento é a entrega que mais vale — é o que fica quando você sair.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
