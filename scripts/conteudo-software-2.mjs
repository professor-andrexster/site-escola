/**
 * Amplia Sistemas Operacionais e Redes de Computadores.
 *
 *   node scripts/conteudo-software-2.mjs --aplicar
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'processos-e-memoria-por-que-o-pc-trava': `
<h2>Ler o Gerenciador de Tarefas</h2>
<p>Ctrl+Shift+Esc abre a ferramenta que responde "por que está lento" — desde que você saiba qual
coluna olhar.</p>
<table>
  <tr><th>Está em 100%</th><th>Significa</th><th>O que fazer</th></tr>
  <tr><td>CPU</td><td>algum programa consumindo processamento</td><td>ordene por CPU e veja quem é</td></tr>
  <tr><td>Memória</td><td>faltou espaço de trabalho</td><td>feche abas; considere mais memória</td></tr>
  <tr><td>Disco</td><td>fila de leitura e escrita</td><td>em HD, é normal; se for SSD, suspeite do disco</td></tr>
  <tr><td>Rede</td><td>download ou atualização em andamento</td><td>veja qual processo</td></tr>
</table>
<p>Disco em 100% constante num HD antigo é o caso mais comum de "computador travando", e a troca por
SSD resolve — não adianta trocar processador.</p>

<h2>Memória virtual: quando a mesa acaba</h2>
<p>Quando a RAM enche, o sistema usa um pedaço do disco como memória de emergência. Funciona, e é
centenas de vezes mais lento — daí aquela lentidão em que tudo demora, o mouse trava por instantes e
o disco não para.</p>
<p>Por isso a diferença entre 4 GB e 8 GB de memória é tão sentida: não é 4 GB a mais de espaço, é
deixar de recorrer ao disco o tempo todo.</p>

<h2>Encerrar processo com critério</h2>
<p>"Finalizar tarefa" mata o programa na hora, sem salvar. Antes disso:</p>
<ol>
  <li>Espere de verdade — 30 segundos, não 3</li>
  <li>Tente fechar pelo próprio programa</li>
  <li>Só então finalize</li>
</ol>
<p>E nunca finalize o que você não reconhece: processos do sistema com nomes estranhos costumam ser
essenciais, e derrubá-los pode reiniciar a máquina no meio do seu trabalho.</p>

<h2>Faça agora</h2>
<p>Abra o Gerenciador de Tarefas, vá em Desempenho e deixe aberto enquanto usa a máquina
normalmente por dois minutos. Depois abra dez abas do navegador e olhe a memória. Você vai ver onde
o seu computador aperta.</p>
`,

  'linha-de-comando-parte-1-prompt-windows': `
<h2>Por que aprender linha de comando</h2>
<p>Parece retrocesso, e não é. Três coisas que só ela faz bem:</p>
<ul>
  <li><strong>Repetir</strong> — renomear 200 arquivos com um comando</li>
  <li><strong>Acessar sem interface</strong> — servidor, máquina com problema, acesso remoto</li>
  <li><strong>Registrar</strong> — o comando é o próprio manual: quem repetir, faz igual</li>
</ul>
<p>É por isso que ela não desapareceu: quem administra sistema trabalha assim quase o tempo todo.</p>

<h2>Os comandos que resolvem o dia</h2>
<table>
  <tr><th>Comando</th><th>Faz</th></tr>
  <tr><td><code>cd pasta</code></td><td>entra na pasta</td></tr>
  <tr><td><code>cd ..</code></td><td>volta uma</td></tr>
  <tr><td><code>dir</code></td><td>lista o conteúdo</td></tr>
  <tr><td><code>mkdir nome</code></td><td>cria pasta</td></tr>
  <tr><td><code>copy a b</code></td><td>copia</td></tr>
  <tr><td><code>del arquivo</code></td><td>apaga — <strong>sem lixeira</strong></td></tr>
  <tr><td><code>ipconfig</code></td><td>mostra a configuração de rede</td></tr>
  <tr><td><code>cls</code></td><td>limpa a tela</td></tr>
</table>
<p>Aquele <code>del</code> merece atenção: o que se apaga por linha de comando não vai para a
lixeira. Não há desfazer.</p>

<h2>Dois atalhos que economizam muito</h2>
<ul>
  <li><strong>Tab</strong> completa nome de arquivo e pasta. Digite as primeiras letras e aperte —
    além de mais rápido, evita erro de digitação</li>
  <li><strong>Seta para cima</strong> traz o comando anterior. Para repetir com uma pequena
    alteração, é o caminho</li>
</ul>
<p>Quem digita tudo por extenso demora dez vezes mais e erra mais.</p>

<h2>Onde eu estou</h2>
<p>O prompt sempre mostra a pasta atual antes do sinal — <code>C:\\Users\\Ana&gt;</code>. Todo comando
age <strong>a partir dali</strong>, e é a origem do erro mais comum de quem começa: rodar o comando
na pasta errada e não entender por que "o arquivo não existe".</p>
<p>Antes de qualquer comando que altere alguma coisa, olhe a linha do prompt.</p>

<h2>Faça agora</h2>
<p>Abra o prompt e navegue até sua pasta de Documentos usando só <code>cd</code> e <code>dir</code>,
sem o mouse. Depois crie uma pasta, entre nela e volte. São cinco comandos, e é o suficiente para a
linha de comando deixar de intimidar.</p>
`,

  'usuarios-e-permissoes-quem-manda': `
<h2>Por que não se usa administrador o tempo todo</h2>
<p>Com conta de administrador, tudo que você executa também é administrador — inclusive o programa
que você baixou sem querer. É a diferença entre um vírus poder mexer nos seus arquivos e poder mexer
no sistema inteiro.</p>
<p>Numa escola, é ainda mais direto: aluno com conta de administrador instala o que quiser, e o
laboratório vira outra coisa em uma semana.</p>

<h2>O aviso que todo mundo clica sem ler</h2>
<p>Aquela janela pedindo confirmação para o programa fazer alterações existe por um motivo: ela
aparece <strong>quando algo pede poder de administrador</strong>.</p>
<p>Se ela aparece sem que você tenha pedido nada, essa é a informação importante — algo está tentando
alterar o sistema por conta própria. Ler antes de clicar em "sim" é a defesa mais barata que existe.</p>

<h2>Permissão de arquivo</h2>
<table>
  <tr><th>Permissão</th><th>Permite</th></tr>
  <tr><td>Ler</td><td>abrir e copiar</td></tr>
  <tr><td>Escrever</td><td>alterar e salvar por cima</td></tr>
  <tr><td>Executar</td><td>rodar, no caso de programa</td></tr>
</table>
<p>É por isso que "acesso negado" acontece: não é defeito, é o sistema fazendo o trabalho dele. E é
por isso também que a pasta de outro usuário não abre — cada conta tem a sua área.</p>

<h2>O princípio que atravessa a informática</h2>
<p>Dê a cada um o <strong>menor</strong> poder que permita fazer o trabalho. Você viu isso no CMS,
com os papéis; em PHP, com a autorização; no banco, com o usuário que não tem DELETE. É o mesmo
princípio, em quatro lugares diferentes — e ele resume boa parte da segurança prática.</p>

<h2>Faça agora</h2>
<p>Veja quais contas existem na máquina que você usa e qual é o tipo de cada uma. Se a sua é
administrador, considere criar uma conta comum para o uso diário. Depois tente instalar algo com ela
e observe o pedido de senha aparecer — é a proteção funcionando.</p>
`,

  'manutencao-do-sistema': `
<h2>O que realmente deixa a máquina rápida de novo</h2>
<p>Em ordem de impacto, e a ordem contraria o senso comum:</p>
<ol>
  <li><strong>Programas que iniciam junto com o sistema</strong> — cada um consome memória desde o
    boot, e a maioria não precisa estar lá</li>
  <li><strong>Espaço em disco</strong> — abaixo de 15% livre, o sistema perde desempenho</li>
  <li><strong>Atualizações pendentes</strong> — incluem correções de desempenho</li>
  <li><strong>Poeira e temperatura</strong> — máquina quente reduz a própria velocidade</li>
</ol>
<p>Repare no que <strong>não</strong> está na lista: programas de "otimização" e limpeza de registro.
Eles prometem muito, entregam pouco e alguns pioram — vários são propaganda disfarçada.</p>

<h2>Desfragmentar: só em HD</h2>
<p>Em disco mecânico, os pedaços de um arquivo se espalham e a cabeça de leitura precisa ir e voltar.
Desfragmentar reorganiza, e ajuda.</p>
<p>Em <strong>SSD não se desfragmenta</strong>: não há peça mecânica, não há ganho, e a operação
gasta ciclos de gravação, que são finitos. O Windows moderno já reconhece o tipo e faz a coisa certa
sozinho — não force.</p>

<h2>Limpar de verdade</h2>
<ul>
  <li><strong>Limpeza de Disco</strong> do próprio Windows, incluindo arquivos de sistema</li>
  <li>Pasta <strong>Downloads</strong> — costuma guardar gigabytes de instaladores já usados</li>
  <li><strong>Lixeira</strong> — ela ocupa espaço até ser esvaziada</li>
  <li><strong>Programas que não se usa</strong> — desinstalar pelo painel, não apagando a pasta</li>
</ul>

<h2>O ponto de restauração</h2>
<p>Antes de instalar driver, mexer em configuração do sistema ou fazer uma atualização grande, crie
um ponto de restauração. É gratuito, leva um minuto e permite voltar ao estado anterior se algo der
errado.</p>
<p>Não substitui backup — ele restaura o sistema, não seus arquivos. São duas proteções diferentes,
e você precisa das duas.</p>

<h2>Faça agora</h2>
<p>Abra o Gerenciador de Tarefas na aba Inicializar e olhe a lista de programas que sobem com o
sistema, ordenada por impacto. Desative os que você não precisa que abram sozinhos. Reinicie e
cronometre — a diferença costuma ser de vários segundos.</p>
`,

  'fundamentos-redes-osi': `
<h2>Por que existe um modelo em camadas</h2>
<p>Cada camada resolve um problema e entrega o resultado para a de cima, sem que uma precise saber
como a outra funciona. É o que permite trocar o wi-fi por cabo sem reescrever o navegador.</p>
<table>
  <tr><th>Camada</th><th>Responde por</th><th>Exemplo</th></tr>
  <tr><td>Aplicação</td><td>o que o programa fala</td><td>HTTP, e-mail</td></tr>
  <tr><td>Transporte</td><td>entregar inteiro e na ordem</td><td>TCP</td></tr>
  <tr><td>Rede</td><td>achar o caminho</td><td>IP</td></tr>
  <tr><td>Enlace / Física</td><td>o sinal de fato</td><td>cabo, wi-fi</td></tr>
</table>

<h2>Para que serve saber isso</h2>
<p>Para diagnosticar. Quando "a internet não funciona", a camada em que o problema está determina o
que fazer — e testar de baixo para cima resolve rápido:</p>
<ol>
  <li>O cabo está conectado? A luz da placa acende? <em>(física)</em></li>
  <li>A máquina pegou endereço IP? <em>(rede)</em></li>
  <li>Consegue chegar ao roteador? <em>(rede)</em></li>
  <li>Consegue resolver nome de site? <em>(aplicação, DNS)</em></li>
  <li>O site abre? <em>(aplicação)</em></li>
</ol>
<p>Cada resposta elimina camadas inteiras de suspeita. É o mesmo raciocínio de dividir para achar que
você viu em diagnóstico de hardware e de programa.</p>

<h2>Faça agora</h2>
<p>Numa máquina conectada, rode <code>ipconfig</code> (ou <code>ip addr</code> no Linux) e anote:
qual o endereço IP, qual o gateway. Depois <code>ping</code> no gateway e <code>ping 8.8.8.8</code>.
Os quatro resultados juntos já dizem em que camada está tudo funcionando.</p>
`,

  'seguranca-rede': `
<h2>O wi-fi da escola e o wi-fi do shopping</h2>
<p>Rede aberta significa que o tráfego pode ser observado por quem estiver por perto. Hoje isso pesa
menos do que já pesou, porque quase todo site usa HTTPS — mas continua valendo cuidado.</p>
<table>
  <tr><th>Em rede pública</th><th>Por quê</th></tr>
  <tr><td>Confira o cadeado antes de digitar senha</td><td>sem HTTPS, o que você digita trafega em texto</td></tr>
  <tr><td>Evite banco e compra</td><td>não é impossível, é desnecessário</td></tr>
  <tr><td>Desconfie de rede com nome parecido</td><td>"Escola_WiFi_2" pode ser de outra pessoa</td></tr>
  <tr><td>Desligue conexão automática</td><td>o aparelho conecta sozinho em rede que imita uma conhecida</td></tr>
</table>

<h2>A senha do roteador, que ninguém troca</h2>
<p>Todo roteador vem com uma senha de administração padrão — e a lista dessas senhas está publicada
na internet, por modelo. Quem entra ali pode redirecionar todo o tráfego da rede.</p>
<p>Duas senhas diferentes, e as duas importam: a do wi-fi (para conectar) e a do painel do roteador
(para configurar). Trocar a segunda é o passo que quase todo mundo pula.</p>

<h2>Firewall, em uma frase</h2>
<p>Ele decide o que entra e o que sai. O do sistema, ligado, já resolve a maior parte para uma
máquina de casa ou escola. Desligar "porque um programa não funciona" é trocar um problema pequeno
por um grande — o certo é liberar aquele programa.</p>

<h2>Faça agora</h2>
<p>Entre no painel do seu roteador — geralmente 192.168.0.1 ou 192.168.1.1 — e veja: a senha de
administração ainda é a padrão? Que dispositivos estão conectados? Você reconhece todos? A lista de
conectados costuma revelar surpresas.</p>
`,
}

const NOVAS = [
  {
    curso: 'sistemas-operacionais',
    slug: 'maquina-virtual',
    titulo: 'Máquina virtual: testar sem medo',
    min: 7, ordem: 10,
    descricao: 'Rodar outro sistema dentro do seu, para aprender sem risco.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Entender o que é virtualização</li>
  <li>Criar uma máquina virtual e instalar um sistema nela</li>
  <li>Usar snapshots para testar sem medo de quebrar</li>
</ul>

<h2>Um computador dentro do computador</h2>
<p>Uma máquina virtual é um computador de mentira rodando dentro do seu: tem processador, memória e
disco próprios — todos emprestados da máquina real — e roda um sistema operacional completo, que não
sabe que está numa caixa.</p>
<p>O que isso resolve para quem está aprendendo:</p>
<ul>
  <li><strong>Testar Linux</strong> sem formatar nada</li>
  <li><strong>Praticar instalação</strong> quantas vezes quiser</li>
  <li><strong>Abrir arquivo suspeito</strong> longe do sistema de verdade</li>
  <li><strong>Errar à vontade</strong> — quebrou, apaga e cria outra</li>
</ul>

<h2>O que é preciso</h2>
<table>
  <tr><th>Requisito</th><th>Mínimo razoável</th></tr>
  <tr><td>Memória</td><td>8 GB na máquina real (4 para ela, 4 para a virtual)</td></tr>
  <tr><td>Disco</td><td>30 GB livres</td></tr>
  <tr><td>Virtualização na BIOS</td><td>ligada — procure VT-x ou AMD-V</td></tr>
  <tr><td>Programa</td><td>VirtualBox, gratuito</td></tr>
</table>
<p>Aquele item da BIOS é a causa mais comum de "criei a máquina e ela não liga": o recurso vem
desligado de fábrica em muitos computadores. Se o VirtualBox reclamar, é lá que se resolve.</p>

<h2>Quanto dar a ela</h2>
<p>A regra que evita travar tudo: <strong>no máximo metade</strong> da memória real, e nunca mais que
metade dos núcleos. A máquina virtual não cria recurso — ela divide o que existe.</p>
<p>Dar 7 dos 8 GB para a virtual trava o hospedeiro, e as duas ficam inutilizáveis.</p>

<h2>Snapshot: o superpoder</h2>
<p>É uma fotografia do estado inteiro da máquina virtual — sistema, arquivos, programas abertos. A
qualquer momento você volta para ela em segundos.</p>
<p>Como usar na prática:</p>
<ol>
  <li>Instale o sistema, atualize, deixe pronto</li>
  <li>Tire um snapshot chamado "limpo"</li>
  <li>Faça a experiência: instale algo, quebre, mexa onde não devia</li>
  <li>Volte para "limpo" e comece de novo</li>
</ol>
<p>É o que permite praticar formatação, linha de comando e permissões sem medo — e sem depender de
uma segunda máquina física.</p>

<h2>O que ela não substitui</h2>
<ul>
  <li><strong>Desempenho</strong> — sempre mais lenta que a máquina real</li>
  <li><strong>Placa de vídeo</strong> — jogos e edição pesada não funcionam bem</li>
  <li><strong>Hardware de verdade</strong> — não dá para praticar montagem numa VM</li>
</ul>
<p>Para tudo que é software, porém, ela é o laboratório ideal — e é assim que profissionais testam
antes de mexer em servidor de produção.</p>

<h2>Faça agora</h2>
<p>Instale o VirtualBox e crie uma máquina com 2 GB de memória e 20 GB de disco. Baixe uma imagem do
Ubuntu e instale. Vai levar meia hora, e você vai poder repetir o processo quantas vezes quiser — que
é exatamente o ponto.</p>
`,
    desafio: {
      titulo: 'Seu laboratório em uma caixa',
      enunciado: `<p>Monte uma máquina virtual e use-a como laboratório.</p>
<ul>
  <li>Instale um Linux, atualize e tire um snapshot chamado "limpo"</li>
  <li>Pratique dez comandos de terminal do curso e anote o resultado de cada um</li>
  <li>Crie um segundo usuário, sem privilégios de administrador</li>
  <li>Com esse usuário, tente instalar um programa e tente abrir a pasta do outro usuário — anote o que acontece</li>
  <li>Quebre alguma coisa de propósito: apague uma pasta de sistema, por exemplo</li>
  <li>Volte para o snapshot e confirme que está tudo de volta</li>
</ul>
<p>Entregue o relato com o que você fez em cada passo e quanto tempo levou a restauração.</p>
<p>Responda também: <strong>o que você testaria numa máquina virtual que jamais testaria no seu
computador?</strong> A resposta a essa pergunta é o valor da ferramenta.</p>`,
    },
  },
  {
    curso: 'redes-de-computadores',
    slug: 'diagnostico-de-rede',
    titulo: 'Quando a internet não funciona',
    min: 7, ordem: 7,
    descricao: 'Os comandos que dizem exatamente onde a conexão está falhando.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Diagnosticar falha de rede por eliminação</li>
  <li>Usar ping, ipconfig, tracert e nslookup</li>
  <li>Distinguir problema da máquina, da rede local e do provedor</li>
</ul>

<h2>"A internet caiu" quase nunca é a internet</h2>
<p>O problema pode estar em cinco lugares diferentes, e o teste certo elimina cada um em segundos.
A ordem é sempre do mais perto para o mais longe.</p>

<h2>Os quatro testes, em ordem</h2>
<pre>1. ipconfig            tenho endereço IP?
2. ping 127.0.0.1      minha placa de rede funciona?
3. ping [gateway]      chego ao roteador?
4. ping 8.8.8.8        chego à internet?
5. ping google.com     o DNS está resolvendo nomes?</pre>
<table>
  <tr><th>Falhou em</th><th>O problema está</th><th>O que fazer</th></tr>
  <tr><td>1</td><td>na configuração da máquina</td><td>IP começando com 169.254 = não pegou endereço; reinicie a conexão</td></tr>
  <tr><td>2</td><td>na placa de rede ou no driver</td><td>raro; reinstale o driver</td></tr>
  <tr><td>3</td><td>entre a máquina e o roteador</td><td>cabo, wi-fi, senha errada</td></tr>
  <tr><td>4</td><td>do roteador para fora</td><td>provedor, ou o roteador</td></tr>
  <tr><td>5</td><td>no DNS</td><td>troque para 8.8.8.8 ou 1.1.1.1</td></tr>
</table>
<p>O caso mais interessante é o 5: <strong>a internet funciona, mas nenhum site abre pelo nome</strong>.
O <code>ping 8.8.8.8</code> responde e o <code>ping google.com</code> não. É DNS, e a troca do
servidor resolve em trinta segundos — sem chamar o provedor.</p>

<h2>O IP que denuncia</h2>
<p>Se o <code>ipconfig</code> mostra um endereço começando com <strong>169.254</strong>, a máquina
não conseguiu falar com o roteador e inventou um endereço para si. É sinal claro de cabo solto, wi-fi
não conectado ou servidor de endereços fora do ar.</p>

<h2>Tracert: ver o caminho</h2>
<pre><code>tracert google.com</code></pre>
<p>Mostra cada equipamento por onde o pacote passa até o destino, com o tempo de cada salto. Serve
para responder a pergunta que o cliente sempre faz: <em>o problema é aqui ou é do provedor?</em></p>
<ul>
  <li>Trava no primeiro salto → seu roteador</li>
  <li>Trava no segundo ou terceiro → seu provedor</li>
  <li>Trava lá adiante → problema no caminho ou no destino, e não há o que fazer localmente</li>
</ul>

<h2>Lento não é o mesmo que fora</h2>
<p>Quando conecta mas está lento, o suspeito muda:</p>
<ul>
  <li><strong>Wi-fi fraco</strong> — teste com cabo; se resolver, é sinal</li>
  <li><strong>Muita gente na mesma rede</strong> — comum em laboratório de escola</li>
  <li><strong>Download em segundo plano</strong> — atualização do sistema consumindo tudo</li>
  <li><strong>Canal do wi-fi congestionado</strong> — vários roteadores vizinhos no mesmo canal</li>
</ul>
<p>O teste de velocidade sozinho não diz muito: rode com uma máquina só conectada e depois com a
rede cheia. A diferença é o diagnóstico.</p>

<h2>Faça agora</h2>
<p>Rode os cinco testes na máquina que você está usando e anote todos os resultados, mesmo os que
derem certo. Depois desconecte o wi-fi e rode de novo: veja exatamente em que passo a sequência
quebra. Essa comparação é o que treina o olho.</p>
`,
    desafio: {
      titulo: 'Laudo de rede',
      enunciado: `<p>Faça o diagnóstico de rede em duas situações diferentes: uma rede funcionando e uma com problema — que você pode provocar.</p>
<p><strong>Rede boa:</strong> rode os cinco testes e monte a tabela de referência com os resultados normais, incluindo os tempos de resposta.</p>
<p><strong>Rede com problema:</strong> peça a alguém que provoque uma falha sem você ver — tirar o cabo, mudar o DNS para um endereço inválido, desligar o wi-fi, digitar senha errada. Então:</p>
<ul>
  <li>Rode os testes na ordem</li>
  <li>Anote em qual deles a sequência quebrou</li>
  <li>Diga qual era o problema, antes de perguntar</li>
  <li>Corrija</li>
</ul>
<p>Repita três vezes, com falhas diferentes. Entregue as tabelas e responda: <strong>quantas vezes
você acertou o diagnóstico antes de confirmar?</strong></p>
<p>Faça também um <code>tracert</code> para um site e conte quantos saltos existem entre a sua
escola e ele. É uma boa noção de quão longe fica "a internet".</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
