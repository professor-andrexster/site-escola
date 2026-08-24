/**
 * Amplia Cultura Digital e Gestão do Tempo.
 *
 *   node scripts/conteudo-software-1.mjs --aplicar
 *
 * Estes dois cursos NÃO foram fundidos com SO e Redes, ao contrário do que fiz
 * em hardware. O caso é diferente: lá havia duas aulas com o mesmo título no
 * mesmo nível de profundidade. Aqui, Cultura Digital apresenta o tema para quem
 * nunca viu, e SO e Redes voltam a ele tecnicamente — o que é espiral
 * pedagógico, não repetição.
 *
 * O que faltava era tornar essa fronteira explícita: cada aula introdutória
 * agora diz onde o assunto volta mais fundo.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'o-computador-por-dentro': `
<h2>Onde este assunto continua</h2>
<p>Esta aula apresenta as peças. Se você quiser abrir a máquina, escolher componente e trocar peça
com as mãos, o caminho é a trilha <strong>Hardware</strong> — ela começa exatamente onde esta aula
termina, e vai até montar e diagnosticar defeito.</p>
<p>Aqui o objetivo é outro: entender o suficiente para conversar com um técnico sem ser enganado, e
para saber o que está acontecendo quando alguém diz "sua memória é pouca".</p>

<h2>O que perguntar numa loja</h2>
<table>
  <tr><th>Vendedor diz</th><th>Você pergunta</th></tr>
  <tr><td>"Esse é bom, tem 8 GB"</td><td>8 GB de quê — memória ou armazenamento? São coisas diferentes</td></tr>
  <tr><td>"Processador de última geração"</td><td>Qual modelo exatamente? i3, i5, Ryzen 5?</td></tr>
  <tr><td>"Tem 1 TB"</td><td>É HD ou SSD? A diferença muda tudo na velocidade</td></tr>
  <tr><td>"Serve para tudo"</td><td>Serve para o que EU faço? Editar vídeo? Só internet?</td></tr>
</table>
<p>A confusão entre memória e armazenamento é a mais explorada em propaganda. Memória é a mesa de
trabalho — apaga quando desliga. Armazenamento é o armário — fica.</p>

<h2>Faça agora</h2>
<p>Descubra a configuração do computador ou celular que você usa: quanta memória, quanto
armazenamento, qual processador. No Windows, tecle Windows+Pause. No celular, procure "Sobre o
telefone". Anote — é a informação que resolve metade das dúvidas sobre lentidão.</p>
`,

  'arquivos-pastas-e-organizacao': `
<h2>Onde este assunto continua</h2>
<p>Aqui você aprende a organizar <strong>seus</strong> arquivos. No curso de
<strong>Sistemas Operacionais</strong>, o mesmo assunto volta por dentro: como o sistema guarda de
verdade, o que é caminho absoluto e relativo, e por que existe uma pasta chamada Program Files que
você não deve mexer.</p>

<h2>Um nome que funciona daqui a um ano</h2>
<pre>ruim                          bom
Documento1.docx               2026-08-24-ata-reuniao-pais.docx
foto (3).jpg                  2026-08-24-feira-ciencias-01.jpg
trabalho final FINAL2.docx    trabalho-historia-v3.docx</pre>
<p>Três regras que resolvem: <strong>data no começo em ano-mês-dia</strong>, porque assim a ordem
alfabética já é a ordem cronológica; <strong>sem espaço e sem acento</strong>, porque quebram em
sistema e em endereço da web; e <strong>o assunto no nome</strong>, não no lugar onde você salvou.</p>

<h2>A pasta que você vai agradecer</h2>
<p>Uma estrutura simples que aguenta anos:</p>
<pre>Documentos/
  2026/
    escola/
    pessoal/
  arquivo-morto/</pre>
<p>O segredo não é a estrutura perfeita: é ter <strong>uma</strong> e usar sempre. Pasta bonita que
ninguém segue é igual a não ter pasta.</p>

<h2>A regra do 3-2-1</h2>
<p>Arquivo que só existe num lugar não existe. A regra que profissionais usam:</p>
<ul>
  <li><strong>3</strong> cópias do que importa</li>
  <li>em <strong>2</strong> lugares diferentes</li>
  <li>sendo <strong>1</strong> fora de casa — nuvem serve</li>
</ul>
<p>Para um trabalho de escola parece exagero, até o pen drive quebrar na véspera da entrega.</p>

<h2>Faça agora</h2>
<p>Abra sua pasta de Downloads e conte os arquivos. Quantos você reconhece pelo nome? Escolha cinco
que importam, renomeie no padrão data-assunto e mova para uma pasta com nome de verdade. Os outros,
apague — se você não sabe o que é, não vai precisar.</p>
`,

  'pegada-digital-privacidade-senhas': `
<h2>A senha que aguenta</h2>
<p>O que faz uma senha resistir não é o símbolo estranho: é o <strong>tamanho</strong>. Um programa
testa bilhões de combinações por segundo, e cada caractere a mais multiplica o trabalho dele.</p>
<table>
  <tr><th>Senha</th><th>Por que falha</th></tr>
  <tr><td><code>Joao@2010</code></td><td>nome e ano de nascimento estão no seu perfil</td></tr>
  <tr><td><code>P@ssw0rd</code></td><td>está em todo dicionário de ataque</td></tr>
  <tr><td><code>abc123</code></td><td>testada em menos de um segundo</td></tr>
  <tr><td><code>cavalo-bateria-grampo-azul</code></td><td>funciona: longa, e você lembra</td></tr>
</table>
<p>Quatro palavras aleatórias formam uma senha mais forte que oito caracteres embaralhados — e você
consegue decorar. É a diferença entre segurança que se usa e segurança que vira bilhete no monitor.</p>

<h2>A senha repetida é o problema real</h2>
<p>Um site qualquer vaza a lista de senhas — acontece toda semana em algum lugar. Se você usa a
mesma no e-mail, quem tem a lista entra no seu e-mail. E com o e-mail, redefine a senha de tudo o
mais.</p>
<p>Por isso o e-mail principal merece três coisas: senha única, longa e verificação em duas etapas.
Ele é a chave que abre todas as outras portas.</p>

<h2>Verificação em duas etapas</h2>
<p>Mesmo com a senha correta, o serviço pede um código do seu celular. Isso torna a senha vazada
quase inútil sozinha.</p>
<p>Ative pelo menos no e-mail, no banco e nas redes sociais. Leva dois minutos por conta e é a
medida isolada que mais protege.</p>

<h2>Sua pegada, na prática</h2>
<p>Procure seu próprio nome no buscador, entre aspas. O que aparece? Agora imagine que quem está
procurando é alguém decidindo se contrata você para um estágio — porque isso acontece.</p>
<p>O que você postou aos treze anos continua lá aos vinte e três. Não é motivo para não postar: é
motivo para postar como quem sabe que fica.</p>

<h2>Faça agora</h2>
<p>Entre em <strong>haveibeenpwned.com</strong> e digite seu e-mail. O site diz em quais vazamentos
conhecidos ele apareceu. Se aparecer algum — e é provável — troque a senha daqueles serviços hoje, e
comece pelo e-mail.</p>
`,

  'golpes-e-fake-news': `
<h2>Todo golpe tem a mesma estrutura</h2>
<p>Muda a história, não o esqueleto. Reconhecer o esqueleto vale mais do que decorar golpes:</p>
<ol>
  <li><strong>Urgência</strong> — "só até hoje", "sua conta será bloqueada em 2 horas"</li>
  <li><strong>Autoridade</strong> — parece ser o banco, o chefe, a escola</li>
  <li><strong>Emoção</strong> — medo de perder, alegria de ganhar, pena de alguém</li>
  <li><strong>Canal errado</strong> — o banco pedindo senha por WhatsApp</li>
  <li><strong>Segredo</strong> — "não comente com ninguém"</li>
</ol>
<p>A pressa é o ingrediente principal: ela existe justamente para você não parar e pensar. Por isso a
defesa mais eficaz é uma só — <strong>quando for urgente demais, espere</strong>.</p>

<h2>Os três da região</h2>
<table>
  <tr><th>Golpe</th><th>Como funciona</th><th>Defesa</th></tr>
  <tr><td>WhatsApp clonado</td><td>pedem seu código de verificação, tomam a conta e pedem dinheiro aos seus contatos</td><td>ninguém precisa do seu código, nunca; ative a confirmação em duas etapas</td></tr>
  <tr><td>Boleto falso</td><td>trocam o código de barras de um boleto legítimo</td><td>confira o beneficiário no app do banco antes de pagar</td></tr>
  <tr><td>Falso parente</td><td>"mãe, mudei de número"</td><td>ligue para o número antigo antes de qualquer coisa</td></tr>
</table>

<h2>Antes de repassar</h2>
<p>Notícia falsa se espalha mais rápido que verdadeira, porque é escrita para causar reação. Três
perguntas antes de encaminhar:</p>
<ul>
  <li><strong>Quem publicou?</strong> Um jornal com nome e endereço, ou um site que você nunca viu?</li>
  <li><strong>Quando?</strong> Notícia de três anos atrás recircula como se fosse de hoje o tempo
    todo</li>
  <li><strong>Mais alguém noticiou?</strong> Se só um site tem a bomba, desconfie</li>
</ul>
<p>E a busca por imagem resolve muita coisa: clique com o botão direito na foto e procure a origem.
Foto de outro país, de outro ano, é o truque mais usado.</p>

<h2>Se cair no golpe</h2>
<ol>
  <li>Não tenha vergonha — os golpes são feitos por profissionais, e pegam gente instruída</li>
  <li>Avise seus contatos imediatamente, por outro canal</li>
  <li>Troque as senhas</li>
  <li>Se houve dinheiro, procure o banco e registre boletim de ocorrência</li>
</ol>
<p>A vergonha é aliada do golpista: ela faz a vítima demorar a avisar, e é nesse tempo que ele
aplica o golpe em mais gente usando o nome dela.</p>

<h2>Faça agora</h2>
<p>Ative a confirmação em duas etapas do seu WhatsApp agora — Configurações, Conta, Confirmação em
duas etapas. Leva um minuto e é o que impede a clonagem que mais acontece por aqui. Depois ensine
alguém da sua família a fazer o mesmo.</p>
`,

  'diagnostico-do-tempo': `
<h2>Medir antes de mudar</h2>
<p>Quase todo mundo erra a estimativa do próprio tempo — e sempre no mesmo sentido: subestima o que
gasta em telas e superestima o que gasta estudando.</p>
<p>Por isso o diagnóstico vem antes de qualquer técnica. Mudar rotina sem saber onde o tempo está
indo é tentar consertar no escuro.</p>

<h2>Como medir sem se enganar</h2>
<ul>
  <li><strong>Anote na hora</strong>, não no fim do dia — memória de tempo é péssima</li>
  <li><strong>Três dias</strong> bastam, sendo um deles fim de semana</li>
  <li><strong>Blocos de 30 minutos</strong> já dão a resolução necessária</li>
  <li><strong>Não mude nada</strong> enquanto mede: você quer o retrato real, não o desejado</li>
</ul>
<p>O celular ajuda: tanto Android quanto iPhone têm um relatório de tempo de uso por aplicativo, e
ele não depende da sua lembrança.</p>

<h2>O que você vai encontrar</h2>
<p>Três descobertas se repetem em quase todo diagnóstico:</p>
<ol>
  <li><strong>O tempo picado.</strong> Não são três horas de rede social seguidas: são quarenta
    checadas de cinco minutos, que somam mais</li>
  <li><strong>O tempo morto.</strong> Deslocamento, fila, espera — que dá para usar ou para
    descansar de propósito</li>
  <li><strong>O tempo que some.</strong> A diferença entre as 24 horas e o que você conseguiu
    anotar. Costuma ser grande, e é onde mora o problema</li>
</ol>

<h2>Faça agora</h2>
<p>Abra agora o relatório de tempo de tela do seu celular e olhe a média diária da última semana.
Multiplique por sete e depois por quatro: é o seu mês. Compare com quanto tempo você estudou no mesmo
período. O número costuma ser desconfortável — e é ele que motiva o resto do curso.</p>
`,

  'tecnica-pomodoro': `
<h2>Por que blocos funcionam</h2>
<p>Duas coisas acontecem quando se estuda por tempo fechado. A primeira é psicológica: começar é mais
fácil quando se sabe que acaba em 25 minutos — o prazo curto derruba a resistência inicial, que é o
que trava a maioria.</p>
<p>A segunda é o combinado com a distração: quando o pensamento pular para o celular, você anota
"ver isso depois" e continua. A interrupção deixa de ser desvio e vira item de lista.</p>

<h2>Onde quase todo mundo erra</h2>
<table>
  <tr><th>Erro</th><th>Conserto</th></tr>
  <tr><td>Celular na mesa, virado para baixo</td><td>em outro cômodo — perto, ele custa atenção mesmo em silêncio</td></tr>
  <tr><td>Pular a pausa "porque está rendendo"</td><td>a pausa é o que sustenta o quarto bloco</td></tr>
  <tr><td>Usar a pausa para rede social</td><td>levante, beba água, olhe longe: a pausa é para o cérebro, não para outra tela</td></tr>
  <tr><td>Começar sem saber o que fazer</td><td>defina a tarefa ANTES de ligar o cronômetro</td></tr>
</table>
<p>O último é o mais caro: sem tarefa definida, os 25 minutos viram "estudar matemática", que não
tem fim nem começo, e o bloco se dissolve.</p>

<h2>Ajuste ao seu ritmo</h2>
<p>Os 25 minutos são um ponto de partida, não uma lei. Quem tem dificuldade de concentração começa
com 15; quem já entra em ritmo pode ir a 45 ou 50. O que não muda é a estrutura: bloco fechado,
tarefa definida, pausa de verdade.</p>

<h2>Faça agora</h2>
<p>Escolha uma tarefa <strong>específica</strong> — "resolver os exercícios 1 a 10 da página 42",
não "estudar" — deixe o celular em outro cômodo e faça um bloco de 25 minutos. Ao fim, anote: quantas
vezes você quis pegar o celular? Esse número cai rápido com a prática, e vê-lo cair é o que convence.</p>
`,

  'vencendo-procrastinacao': `
<h2>Procrastinar não é preguiça</h2>
<p>Isso muda a estratégia. Adiar quase sempre é uma forma de fugir de um desconforto — medo de não
dar conta, tarefa grande demais para caber na cabeça, ou não saber por onde começar.</p>
<p>É por isso que "ter mais força de vontade" não funciona: a força de vontade não resolve nenhum dos
três. Identificar qual é resolve.</p>
<table>
  <tr><th>O que está por trás</th><th>O que destrava</th></tr>
  <tr><td>Tarefa grande demais</td><td>quebrar até a primeira parte parecer fácil demais</td></tr>
  <tr><td>Não sei por onde começar</td><td>a primeira ação concreta: abrir o arquivo, escrever o título</td></tr>
  <tr><td>Medo de fazer mal feito</td><td>combinar consigo mesmo que a primeira versão será ruim</td></tr>
  <tr><td>Tarefa chata mesmo</td><td>prazo curto e recompensa combinada depois</td></tr>
</table>

<h2>A regra dos dois minutos</h2>
<p>Se leva menos de dois minutos, faça agora. Responder a mensagem, guardar o material, anotar a
data. Essas tarefas custam mais na lista — ocupando espaço mental — do que na execução.</p>

<h2>Começar pequeno demais para dar errado</h2>
<p>O truque que funciona contra tarefa grande: combine consigo mesmo <strong>cinco minutos</strong>.
Só abrir o trabalho e escrever o título. Cinco minutos, e pode parar.</p>
<p>Na maioria das vezes você continua — porque a resistência estava em começar, não em fazer. E nas
vezes em que para mesmo, ainda assim o trabalho saiu do zero, e amanhã ele já não é uma folha em
branco.</p>

<h2>Perfeccionismo, que se disfarça de capricho</h2>
<p>Ele é uma das formas mais comuns de procrastinação, e a mais difícil de admitir: enquanto o
trabalho não começa, ele ainda pode ser perfeito. Começar é aceitar que vai ser apenas bom.</p>
<p>A saída prática é permitir-se a primeira versão ruim, de propósito. Texto ruim se melhora; página
em branco, não.</p>

<h2>Faça agora</h2>
<p>Pegue aquilo que você está adiando há mais tempo. Identifique qual dos quatro motivos da tabela é
o seu — e seja honesto. Depois faça só o primeiro passo, os cinco minutos. Anote se continuou.</p>
`,
}

const NOVAS = [
  {
    curso: 'cultura-digital',
    slug: 'inteligencia-artificial-no-dia-a-dia',
    titulo: 'Inteligência artificial no dia a dia',
    min: 7, ordem: 8,
    descricao: 'O que ela é, o que ela não é, e como usar sem terceirizar o pensamento.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender, sem tecnicismo, como essas ferramentas funcionam</li>
  <li>Reconhecer onde elas erram</li>
  <li>Usar de um jeito que ajude a aprender, em vez de substituir o aprendizado</li>
</ul>

<h2>O que essas ferramentas fazem</h2>
<p>Elas foram treinadas em uma quantidade enorme de texto e aprenderam a prever qual palavra vem a
seguir. É isso — repetido milhões de vezes, com uma escala que produz respostas surpreendentemente
boas.</p>
<p>Entender esse mecanismo explica o comportamento mais importante delas: <strong>a ferramenta não
sabe se está certa</strong>. Ela produz o texto mais provável, e o mais provável quase sempre é
verdadeiro — mas não sempre. Quando não é, ela erra com a mesma confiança com que acerta.</p>

<h2>Onde erra</h2>
<table>
  <tr><th>Erro</th><th>Como aparece</th></tr>
  <tr><td>Inventa fato</td><td>cita um livro, uma lei ou uma data que não existem</td></tr>
  <tr><td>Erra conta</td><td>matemática com vários passos costuma falhar</td></tr>
  <tr><td>Desconhece o local</td><td>o que é específico da sua cidade ou da sua escola</td></tr>
  <tr><td>Envelhece</td><td>não sabe o que aconteceu depois do treinamento</td></tr>
  <tr><td>Concorda demais</td><td>se você insistir num erro, ela tende a ceder</td></tr>
</table>
<p>O último merece atenção: discordar dela e ver se ela muda de ideia é um bom teste. Se muda sem
argumento novo, a resposta original não tinha base.</p>

<h2>Usar para aprender, e não no lugar de aprender</h2>
<table>
  <tr><th>Ajuda a aprender</th><th>Substitui o aprendizado</th></tr>
  <tr><td>"Explique isso de outro jeito, com exemplo"</td><td>"Faça meu trabalho"</td></tr>
  <tr><td>"Faça 5 perguntas para testar se eu entendi"</td><td>"Responda essas 5 perguntas"</td></tr>
  <tr><td>"Onde está o erro no meu raciocínio?"</td><td>"Me dê a resposta"</td></tr>
  <tr><td>"Que assuntos preciso estudar antes disso?"</td><td>copiar e entregar</td></tr>
</table>
<p>A diferença não é moral, é prática: na coluna da esquerda você termina sabendo. Na direita, você
termina com um texto — e sem a capacidade que a tarefa existia para construir.</p>
<p>E há a parte desconfortável: numa prova sem internet, ou numa entrevista, o que vale é o que ficou
em você.</p>

<h2>Perguntar bem muda o resultado</h2>
<pre>fraco     "fale sobre a Revolução Industrial"

melhor    "Explique a Revolução Industrial para um aluno do 3º ano
           do ensino médio, em 3 parágrafos, com um exemplo do
           impacto no trabalho de quem vivia no campo."</pre>
<p>Diga <strong>quem</strong> vai ler, <strong>quanto</strong> quer, e <strong>com que foco</strong>.
Resposta genérica quase sempre é consequência de pergunta genérica.</p>

<h2>O que nunca colocar ali</h2>
<ul>
  <li>Senha, dado bancário, documento</li>
  <li>Dado pessoal de outra pessoa — nota de aluno, ficha médica</li>
  <li>Coisa que você não gostaria de ver publicada</li>
</ul>
<p>Muitos serviços usam o que se digita para treinar versões futuras. Trate a caixa de texto como
um lugar público.</p>

<h2>Faça agora</h2>
<p>Peça a uma dessas ferramentas informações sobre a sua cidade — Carlos Chagas — ou sobre a sua
escola. Depois confira cada afirmação. Você vai encontrar coisas certas, coisas vagas e provavelmente
alguma inventada com toda a segurança do mundo. É o exercício que mais ensina a usá-las.</p>
`,
    desafio: {
      titulo: 'Cace o erro da máquina',
      enunciado: `<p>Escolha um assunto que você domina — sua cidade, seu time, uma matéria em que vai bem — e faça cinco perguntas a uma ferramenta de IA.</p>
<ul>
  <li>Anote cada resposta</li>
  <li>Confira cada afirmação em fonte confiável</li>
  <li>Classifique: <strong>certo</strong>, <strong>vago</strong> ou <strong>errado</strong></li>
  <li>Quando achar um erro, aponte para a ferramenta e anote como ela reage</li>
</ul>
<p>Depois use-a do jeito bom: peça que ela crie cinco perguntas para testar seu conhecimento no
assunto, responda sem consultar nada, e só então peça a correção.</p>
<p>Entregue as duas partes e responda: <strong>qual das duas formas de usar ensinou mais?</strong></p>`,
    },
  },
  {
    curso: 'gestao-do-tempo',
    slug: 'como-estudar-de-verdade',
    titulo: 'Como estudar: o que a pesquisa mostra',
    min: 7, ordem: 6,
    descricao: 'As técnicas que funcionam, as que só dão sensação de estudo, e por quê.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Distinguir técnica que funciona de técnica que parece funcionar</li>
  <li>Aplicar recuperação ativa e revisão espaçada</li>
  <li>Montar um plano de revisão que cabe na semana</li>
</ul>

<h2>A armadilha da fluência</h2>
<p>Reler o caderno dá uma sensação boa: o texto fica familiar, tudo parece claro, você sente que
sabe. Essa sensação chama-se fluência — e ela mede o quanto o material é <em>familiar</em>, não o
quanto você <em>aprendeu</em>.</p>
<p>É por isso que tanta gente estuda horas relendo e vai mal na prova. Na prova ninguém pede para
reconhecer: pede para <strong>lembrar sem o texto na frente</strong>, que é uma habilidade
diferente — e é essa que precisa ser treinada.</p>

<h2>O que funciona</h2>
<table>
  <tr><th>Técnica</th><th>Como se faz</th></tr>
  <tr><td><strong>Recuperação ativa</strong></td><td>fechar o material e escrever tudo que lembra; só depois conferir</td></tr>
  <tr><td><strong>Revisão espaçada</strong></td><td>rever em intervalos crescentes: 1 dia, 3 dias, 1 semana, 1 mês</td></tr>
  <tr><td><strong>Intercalação</strong></td><td>misturar assuntos numa sessão, em vez de um bloco fechado de cada</td></tr>
  <tr><td><strong>Explicar em voz alta</strong></td><td>ensinar o conteúdo para alguém, ou para a parede</td></tr>
  <tr><td><strong>Testar-se</strong></td><td>fazer exercício antes de se sentir pronto</td></tr>
</table>

<h2>O que dá menos retorno do que parece</h2>
<ul>
  <li><strong>Reler</strong> — a mais usada, e das que menos rendem</li>
  <li><strong>Grifar</strong> — quase não ajuda sozinho; vira leitura passiva com marca-texto</li>
  <li><strong>Resumir copiando</strong> — copiar frases não é processar; resumo de memória, sim</li>
  <li><strong>Maratonar na véspera</strong> — serve para passar na prova e esquecer na semana
    seguinte</li>
</ul>
<p>Nenhuma delas é inútil, mas todas são passivas. O padrão que separa as duas listas é este: as que
funcionam <strong>exigem esforço de lembrar</strong>. O desconforto é o sinal de que está funcionando
— e é justamente por ser desconfortável que as pessoas preferem reler.</p>

<h2>Por que espaçar funciona</h2>
<p>Rever quando você está <em>quase</em> esquecendo obriga o cérebro a reconstruir a informação, e é
essa reconstrução que fixa. Rever quando ainda está fresco custa tempo e rende pouco.</p>
<p>Daí os intervalos crescentes: um dia, três dias, uma semana, um mês. Cada revisão empurra o
esquecimento mais para frente.</p>

<h2>Um plano que cabe na semana</h2>
<ol>
  <li><strong>No dia da aula</strong> — 5 minutos: feche o caderno e escreva o que lembra</li>
  <li><strong>Três dias depois</strong> — 10 minutos: refaça de memória e confira</li>
  <li><strong>Fim de semana</strong> — 20 minutos: exercícios misturando as matérias da semana</li>
  <li><strong>Uma vez por mês</strong> — simulado do que já passou</li>
</ol>
<p>São menos de uma hora por semana por matéria. O que muda não é o tempo — é o tipo de esforço.</p>

<h2>Faça agora</h2>
<p>Pegue a matéria da última aula. Feche tudo e escreva por cinco minutos o que você lembra. Depois
abra o caderno e compare, marcando o que faltou. O que faltou é exatamente o que você teria errado na
prova — e agora você sabe disso antes dela.</p>
`,
    desafio: {
      titulo: 'Duas semanas, dois métodos',
      enunciado: `<p>Faça um experimento com você mesmo, comparando os dois jeitos de estudar.</p>
<p><strong>Semana 1</strong> — uma matéria estudada do jeito de sempre. Anote quanto tempo você
dedicou.</p>
<p><strong>Semana 2</strong> — outra matéria com o plano da aula: recuperação ativa no dia,
revisão em três dias, exercícios misturados no fim de semana. Anote o tempo.</p>
<p>Ao fim de cada semana, teste-se: escreva tudo que lembra da matéria, sem consultar, e conte
quantos conceitos você recuperou.</p>
<p>Entregue a comparação: tempo gasto e conceitos lembrados em cada uma. E responda com honestidade
— <strong>qual das duas semanas pareceu mais fácil enquanto acontecia?</strong> A resposta a essa
pergunta é o ponto principal da aula.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
