/**
 * Conteúdo do módulo O Computador por Dentro.
 *
 *   node scripts/conteudo-hardware.mjs --aplicar
 *
 * Três aulas novas e ampliação das existentes. A Parte 3 tinha uma aula só —
 * ganhou duas, porque "não liga" é o chamado mais comum de todos e merecia
 * tratamento próprio.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'componentes-principais': `
<h2>Quem faz o quê, em uma frase</h2>
<table>
  <tr><th>Peça</th><th>Função</th><th>Se for fraca</th></tr>
  <tr><td>Processador</td><td>faz as contas</td><td>tudo fica lento por igual</td></tr>
  <tr><td>Memória RAM</td><td>espaço de trabalho do momento</td><td>trava ao abrir várias coisas</td></tr>
  <tr><td>SSD / HD</td><td>guarda quando desliga</td><td>demora para ligar e abrir programa</td></tr>
  <tr><td>Placa-mãe</td><td>liga tudo e define o que cabe</td><td>limita o upgrade futuro</td></tr>
  <tr><td>Fonte</td><td>alimenta com energia estável</td><td>desliga sozinho, e pode queimar o resto</td></tr>
  <tr><td>Placa de vídeo</td><td>desenha a imagem</td><td>jogo e edição de vídeo travam</td></tr>
</table>

<h2>A analogia que ajuda, e onde ela falha</h2>
<p>A comparação clássica: a RAM é a mesa de trabalho, o SSD é o armário. Mesa pequena obriga a ficar
guardando e buscando; armário pequeno limita quanto você tem no total.</p>
<p>Onde a analogia falha: <strong>a mesa é apagada quando você desliga</strong>. Tudo que está na
RAM some ao faltar energia — é exatamente por isso que existe o "salvar", e por que uma queda de luz
leva junto o que não foi salvo.</p>

<h2>O upgrade que vale mais</h2>
<p>Numa máquina antiga e lenta, a ordem de impacto quase sempre é esta:</p>
<ol>
  <li><strong>HD para SSD</strong> — é a maior diferença que existe por esse preço. Máquina que
    levava três minutos para ligar passa a levar vinte segundos</li>
  <li><strong>Mais memória</strong> — se ela vive em 90% de uso</li>
  <li><strong>Processador</strong> — caro, exige placa compatível e costuma render menos que os
    dois anteriores</li>
</ol>
<p>Vale saber disso na hora de aconselhar alguém: muita gente troca a máquina inteira quando uma
peça de duzentos reais resolveria.</p>

<h2>Faça agora</h2>
<p>Abra o Gerenciador de Tarefas numa máquina em uso e olhe a aba Desempenho por um minuto, com o
computador fazendo o que faz normalmente. Anote o uso de CPU, memória e disco. Qual está no limite?
É essa a peça que está segurando a máquina — e não necessariamente a que você imaginava.</p>
`,

  'plataformas-ddr3-ddr5': `
<h2>Compatibilidade: o que precisa combinar</h2>
<table>
  <tr><th>Se você trocar</th><th>Precisa conferir</th></tr>
  <tr><td>Processador</td><td>o soquete da placa-mãe e a versão da BIOS</td></tr>
  <tr><td>Memória</td><td>a geração (DDR3/4/5) e o número de slots</td></tr>
  <tr><td>Placa de vídeo</td><td>o espaço no gabinete e a potência da fonte</td></tr>
  <tr><td>Armazenamento</td><td>se a placa tem M.2, e de que tipo</td></tr>
</table>
<p>As gerações de memória <strong>não</strong> são compatíveis entre si: DDR4 não entra em placa
DDR3, e o encaixe é fisicamente diferente justamente para impedir. Se você está forçando, está
errado.</p>

<h2>Dois pentes iguais, e não um grande</h2>
<p>Dois pentes de 8 GB rendem mais que um de 16 na maioria das máquinas, porque ativam o modo de
canal duplo — o processador conversa com os dois ao mesmo tempo.</p>
<p>E, para funcionar, eles precisam estar nos slots certos: quase sempre o 2 e o 4, não os dois
primeiros. O manual da placa diz, e vale a pena conferir — é comum encontrar máquina com dois pentes
nos slots errados, perdendo desempenho de graça.</p>

<h2>Onde procurar antes de comprar</h2>
<ul>
  <li><strong>O modelo exato da placa-mãe</strong> — está escrito nela, ou aparece em programas como
    o CPU-Z</li>
  <li><strong>A lista de processadores suportados</strong>, no site do fabricante da placa</li>
  <li><strong>A versão da BIOS</strong> exigida por processadores mais novos</li>
</ul>
<p>Esse último detalhe cria uma armadilha conhecida: o processador novo só funciona depois de
atualizar a BIOS — e para atualizar, muitas vezes é preciso ligar a máquina com um processador
antigo. Descobrir isso com a peça já comprada é frustrante.</p>

<h2>Faça agora</h2>
<p>Descubra a placa-mãe de uma máquina que você tem acesso e procure no site do fabricante: quantos
slots de memória tem, qual a capacidade máxima, e que processadores aceita. Depois responda: essa
máquina tem futuro de upgrade, ou já chegou no limite?</p>
`,

  'fonte-alimentacao': `
<h2>A peça em que ninguém quer gastar</h2>
<p>Fonte é o componente mais negligenciado e o único que, ao falhar mal, pode levar os outros junto.
Uma fonte genérica que promete 500 W raramente entrega 300 estáveis — e a diferença aparece como
desligamento aleatório, que todo mundo atribui ao "Windows".</p>

<h2>Os sintomas de fonte ruim</h2>
<table>
  <tr><th>Sintoma</th><th>Por que aponta para a fonte</th></tr>
  <tr><td>Desliga sozinho sob esforço</td><td>a fonte não sustenta o pico de consumo</td></tr>
  <tr><td>Reinicia sem tela azul</td><td>corte de energia, não erro de sistema</td></tr>
  <tr><td>Não liga em dia frio, liga na segunda tentativa</td><td>capacitores envelhecidos</td></tr>
  <tr><td>Cheiro de queimado</td><td>desligue da tomada agora</td></tr>
</table>
<p>Repare que os dois primeiros são idênticos a defeito de software. É por isso que a fonte entra
cedo na lista de suspeitos quando a máquina desliga sozinha.</p>

<h2>Dimensionar sem chutar</h2>
<p>Some o consumo das peças e acrescente folga de uns 30%. A placa de vídeo costuma responder pela
maior parte; processador e o resto consomem bem menos do que se imagina.</p>
<p>Folga não é desperdício: fonte trabalhando perto do limite esquenta mais, faz mais barulho e dura
menos. E o selo de eficiência (80 Plus) indica quanto da energia da tomada vira energia útil, em vez
de calor.</p>

<h2>Segurança elétrica, que não é detalhe</h2>
<ul>
  <li><strong>Sempre da tomada</strong> antes de abrir. Fonte moderna mantém a placa energizada
    mesmo com a máquina desligada</li>
  <li><strong>Aperte o botão de ligar</strong> depois de tirar da tomada, para descarregar</li>
  <li><strong>Aterramento importa.</strong> Sem ele, o gabinete pode dar choque leve — aquele
    formigamento ao encostar</li>
  <li><strong>Nunca abra a fonte.</strong> Os capacitores guardam carga por muito tempo depois de
    desligada, e o choque ali é perigoso de verdade</li>
</ul>

<h2>Faça agora</h2>
<p>Olhe a etiqueta da fonte de uma máquina: quantos watts, tem selo de eficiência, qual a marca?
Depois procure o modelo na internet e veja se ela entrega mesmo o que promete. Fonte sem marca
identificável já é uma resposta.</p>
`,

  'ferramentas-e-seguranca': `
<h2>O que realmente se usa</h2>
<table>
  <tr><th>Ferramenta</th><th>Para quê</th></tr>
  <tr><td>Chave Philips média magnética</td><td>90% dos parafusos — a ponta imantada evita perder o parafuso dentro do gabinete</td></tr>
  <tr><td>Pulseira antiestática</td><td>proteger as peças de você</td></tr>
  <tr><td>Pincel macio e ar comprimido</td><td>limpeza sem molhar</td></tr>
  <tr><td>Álcool isopropílico e pano sem fiapo</td><td>tirar pasta térmica velha</td></tr>
  <tr><td>Pote para parafusos</td><td>parece bobo, salva a montagem</td></tr>
  <tr><td>Lanterna</td><td>enxergar dentro do gabinete</td></tr>
</table>
<p>Duas que não devem entrar na bancada: <strong>aspirador comum</strong>, que gera estática, e
<strong>chave de fenda comum</strong> em parafuso Philips, que espana a cabeça.</p>

<h2>A estática é real, e é silenciosa</h2>
<p>A descarga que você sente ao encostar numa maçaneta tem milhares de volts. A que <em>não</em> se
sente — bem menor — já basta para danificar um componente.</p>
<p>E o dano costuma ser parcial: a peça continua funcionando e passa a falhar de vez em quando,
meses depois. É o pior tipo de defeito, porque ninguém liga uma coisa à outra.</p>
<p>Sem pulseira, o mínimo: encoste na parte metálica do gabinete ligado à tomada antes de tocar em
qualquer peça, e repita se tiver andado pela sala. Tapete e cadeira estofada são os piores lugares
para montar.</p>

<h2>Os hábitos que evitam retrabalho</h2>
<ol>
  <li><strong>Fotografe antes de desmontar</strong> — especialmente os cabos do painel frontal</li>
  <li><strong>Um pote por etapa</strong> — os parafusos não são todos iguais</li>
  <li><strong>Nunca force</strong> — se não entra, está no lugar errado ou na posição errada</li>
  <li><strong>Segure a placa pelas bordas</strong>, nunca pelos contatos dourados</li>
  <li><strong>Monte a placa-mãe fora do gabinete</strong> na primeira vez, para testar antes</li>
</ol>
<p>O primeiro item vale ouro. Os cabos de power, reset e LED do painel frontal são minúsculos, sem
padrão entre fabricantes, e reconectá-los de memória é onde a montagem trava.</p>

<h2>Faça agora</h2>
<p>Monte sua bancada e fotografe. Depois abra uma máquina e, antes de tirar qualquer coisa, faça as
fotos: visão geral, painel frontal, cabos da fonte. São elas que você vai consultar na hora de
fechar.</p>
`,

  'montagem-parte-1': `
<h2>A ordem que evita retrabalho</h2>
<ol>
  <li>Placa-mãe <strong>fora</strong> do gabinete, sobre a própria caixa</li>
  <li>Processador</li>
  <li>Pasta térmica e cooler</li>
  <li>Memória</li>
  <li>SSD M.2, se houver</li>
  <li>Teste rápido: fonte, monitor e teclado ligados, ainda fora do gabinete</li>
  <li><strong>Só então</strong> parafusa tudo no gabinete</li>
</ol>
<p>O passo 6 é o que separa quem já montou de quem está começando. Descobrir que a máquina não liga
com tudo parafusado e cabeado significa desmontar de novo.</p>

<h2>O processador entra sem força</h2>
<p>Existe um triângulo marcado num canto do processador e outro no soquete. Alinhados, ele
<strong>cai no lugar por gravidade</strong>. Se precisa empurrar, está errado — e pinos entortados
costumam significar peça perdida.</p>
<p>Levante a alavanca, encaixe, feche. A alavanca faz força; você não.</p>

<h2>Pasta térmica: menos é mais</h2>
<p>A pasta preenche as imperfeições microscópicas entre o processador e o cooler. Ela não é isolante
mágico nem quanto mais melhor — pasta demais escorre para fora e piora a troca de calor.</p>
<ul>
  <li>Um ponto do tamanho de um grão de ervilha, no centro</li>
  <li>A pressão do cooler espalha sozinha</li>
  <li>Cooler novo geralmente já vem com pasta aplicada — não ponha mais por cima</li>
  <li>Reaproveitar cooler: limpe a pasta velha com álcool isopropílico antes</li>
</ul>

<h2>Memória: até o clique dos dois lados</h2>
<p>O pente tem um encaixe assimétrico — só entra de um jeito. Abra as travas dos dois lados, alinhe,
e pressione firme até <strong>as duas</strong> travas fecharem sozinhas.</p>
<p>Memória mal encaixada é a causa número um de "montei e não liga": a máquina não dá imagem e, em
muitas placas, emite bipes. Pressionar de novo, com firmeza, resolve a maioria desses casos.</p>

<h2>Faça agora</h2>
<p>Se tiver uma máquina disponível, retire e recoloque um pente de memória, prestando atenção no
clique das duas travas. É o gesto que você vai repetir mais vezes na vida de técnico.</p>
`,

  'montagem-parte-2': `
<h2>Os cabos, do mais grosso ao mais fino</h2>
<table>
  <tr><th>Cabo</th><th>Vai para</th><th>Atenção</th></tr>
  <tr><td>24 pinos</td><td>placa-mãe</td><td>o maior de todos; entra com um clique</td></tr>
  <tr><td>8 pinos (EPS)</td><td>topo da placa, perto do processador</td><td>é o mais esquecido — sem ele não liga</td></tr>
  <tr><td>PCIe 6+2</td><td>placa de vídeo</td><td>use cabos separados, não o mesmo em duplo</td></tr>
  <tr><td>SATA</td><td>HD e SSD</td><td>dois cabos por unidade: dados e energia</td></tr>
  <tr><td>Painel frontal</td><td>pinos minúsculos na base da placa</td><td>o manual é obrigatório aqui</td></tr>
</table>
<p>Aquele 8 pinos do topo é responsável por boa parte dos "montei e não dá nada": tudo acende, o
cooler gira, e não há imagem — porque o processador não está sendo alimentado.</p>

<h2>O painel frontal</h2>
<p>São quatro ou cinco pares de fios de dois pinos: power switch, reset, LED de energia, LED de HD e
às vezes o alto-falante. Os LEDs têm polaridade — invertidos, apenas não acendem, sem estragar nada.
O botão de ligar não tem: funciona de qualquer lado.</p>
<p>Truque de quem monta muito: para o primeiro teste, nem conecte o painel. Encoste uma chave de
fenda nos dois pinos do power switch por um instante — a máquina liga. Isso descarta o botão do
gabinete como suspeito.</p>

<h2>Organizar cabo não é frescura</h2>
<ul>
  <li>Ar circula melhor, e a máquina esquenta menos</li>
  <li>Cabo solto pode encostar no cooler e travá-lo</li>
  <li>A próxima manutenção fica muito mais rápida</li>
</ul>
<p>Passe o que der por trás da bandeja da placa-mãe e prenda com abraçadeiras. Vale os cinco minutos.</p>

<h2>O primeiro boot</h2>
<p>Antes de fechar a tampa:</p>
<ol>
  <li>Ligue e confirme: cooler girando, LED aceso, imagem na tela</li>
  <li>Entre na BIOS e confira se processador, memória e disco aparecem</li>
  <li>Confira a temperatura em repouso — acima de 60 °C parado indica cooler mal encaixado</li>
  <li>Só então feche</li>
</ol>

<h2>Faça agora</h2>
<p>Numa máquina montada, identifique cada cabo que sai da fonte e diga para onde ele vai. Depois
localize o conector de 8 pinos do processador — o mais esquecido — e confirme que está firme.</p>
`,

  'bios-uefi-e-boot': `
<h2>O que a BIOS faz antes do sistema</h2>
<p>Ao apertar o botão, o sistema operacional ainda não existe. Quem assume é um programa gravado na
própria placa-mãe: ele testa as peças, descobre o que está conectado e procura um sistema para
carregar.</p>
<p>Esse teste inicial chama-se POST. Quando ele falha, a máquina avisa por bipes ou luzes — antes de
haver qualquer imagem na tela, porque a placa de vídeo talvez seja justamente o problema.</p>

<h2>BIOS e UEFI</h2>
<table>
  <tr><th></th><th>BIOS antiga</th><th>UEFI</th></tr>
  <tr><td>Interface</td><td>texto azul, só teclado</td><td>gráfica, com mouse</td></tr>
  <tr><td>Disco máximo</td><td>2 TB</td><td>praticamente sem limite</td></tr>
  <tr><td>Partição</td><td>MBR</td><td>GPT</td></tr>
  <tr><td>Inicialização</td><td>mais lenta</td><td>mais rápida</td></tr>
</table>
<p>Todo mundo continua chamando de "BIOS", e não há problema nisso. O que importa saber é que, ao
instalar Windows em máquina moderna, a combinação esperada é UEFI com GPT — e misturar os modos é
causa comum de "o pendrive não aparece na lista de boot".</p>

<h2>O que vale mexer</h2>
<ul>
  <li><strong>Ordem de boot</strong> — para instalar sistema pelo pendrive</li>
  <li><strong>XMP / DOCP</strong> — faz a memória rodar na velocidade que ela promete; de fábrica
    ela vem mais devagar</li>
  <li><strong>Data e hora</strong> — errada causa erro de certificado ao navegar</li>
  <li><strong>Secure Boot</strong> — às vezes precisa ser desligado para instalar Linux</li>
</ul>
<p>O XMP é o ajuste de melhor retorno: dois cliques e a memória passa a entregar o que você pagou.
Muita máquina montada roda com memória mais lenta a vida inteira porque ninguém ligou.</p>

<h2>Quando algo dá errado ali</h2>
<p>Configuração ruim que impede a máquina de ligar tem conserto físico: retire a pilha da placa-mãe
por alguns minutos, ou use o jumper de reset. A BISO volta ao padrão de fábrica.</p>
<p>É por isso que a pilha existe — ela mantém as configurações e o relógio com a máquina desligada.
Relógio que atrasa sozinho é sinal de pilha fraca, e ela custa poucos reais.</p>

<h2>Faça agora</h2>
<p>Entre na BIOS de uma máquina (F2, Del ou F10, conforme o fabricante) e explore <strong>sem
salvar</strong>. Anote: processador reconhecido, quanta memória, em que frequência, e a ordem de
boot atual. Saia com "discard changes".</p>
`,

  'manutencao-preventiva': `
<h2>Poeira é o inimigo número um</h2>
<p>Poeira acumulada nos dissipadores funciona como cobertor: o calor não sai, o processador reduz a
própria velocidade para não queimar, e a máquina fica lenta. O dono acha que "o computador ficou
velho" — e o problema é sujeira.</p>
<p>Numa escola, com giz e circulação de gente, o intervalo recomendado encurta: a cada seis meses,
não a cada ano.</p>

<h2>Como limpar sem estragar</h2>
<ol>
  <li>Desligue da tomada e aperte o botão de ligar para descarregar</li>
  <li>Leve para fora ou para uma área ventilada — a poeira vai voar</li>
  <li><strong>Segure a hélice do cooler</strong> antes de soprar. Girando em alta rotação por ar
    comprimido, ele vira um gerador e pode danificar a placa</li>
  <li>Ar comprimido em rajadas curtas, a uns dez centímetros</li>
  <li>Pincel macio no que estiver grudado</li>
  <li>Nunca use aspirador comum: gera estática</li>
</ol>

<h2>Pasta térmica: quando trocar</h2>
<p>A pasta seca com o tempo e perde eficiência. Sinais de que chegou a hora:</p>
<ul>
  <li>Temperatura alta mesmo com dissipador limpo</li>
  <li>Máquina com mais de três anos que nunca teve troca</li>
  <li>Desligamento por superaquecimento sob esforço</li>
</ul>
<p>Limpe a pasta velha dos dois lados com álcool isopropílico, deixe secar e aplique nova — o grão
de ervilha da aula de montagem.</p>

<h2>A manutenção que não é física</h2>
<table>
  <tr><th>Tarefa</th><th>Quando</th></tr>
  <tr><td>Atualizações do sistema</td><td>mensal</td></tr>
  <tr><td>Conferir espaço em disco</td><td>mensal — abaixo de 15% livre, o sistema fica lento</td></tr>
  <tr><td>Revisar programas que iniciam junto</td><td>semestral</td></tr>
  <tr><td>Verificar saúde do disco (SMART)</td><td>semestral</td></tr>
  <tr><td>Conferir se o backup está rodando</td><td>mensal</td></tr>
</table>
<p>O SMART merece atenção: ele avisa que o disco está morrendo <strong>antes</strong> de ele morrer.
Um disco com setores realocados crescendo é um disco em contagem regressiva — e dá tempo de salvar
tudo, se alguém olhar.</p>

<h2>Faça agora</h2>
<p>Instale um programa de monitoramento e olhe a temperatura de uma máquina em repouso e sob
esforço. Depois abra e olhe o dissipador. Se estiver com poeira visível, limpe e meça de novo — a
diferença costuma ser de dez graus ou mais.</p>
`,

  'diagnostico-problemas': `
<h2>Método: dividir para achar</h2>
<p>O diagnóstico é o mesmo raciocínio de achar bug em programa: em vez de trocar peça no chute,
elimine metade dos suspeitos por vez.</p>
<ol>
  <li><strong>Reproduza.</strong> O problema acontece sempre? Só em certa hora? Só com certo
    programa?</li>
  <li><strong>Simplifique.</strong> Desconecte tudo que não é essencial: deixe placa-mãe, um pente
    de memória, processador e fonte</li>
  <li><strong>Teste uma variável por vez.</strong> Trocou duas coisas juntas e funcionou? Você não
    sabe qual era</li>
  <li><strong>Troque por peça sabidamente boa</strong>, não por outra peça duvidosa</li>
</ol>

<h2>O que o sintoma já entrega</h2>
<table>
  <tr><th>Sintoma</th><th>Suspeitos, em ordem</th></tr>
  <tr><td>Não acende nada</td><td>tomada, cabo, fonte, botão do gabinete</td></tr>
  <tr><td>Liga mas sem imagem</td><td>memória mal encaixada, cabo de 8 pinos, vídeo</td></tr>
  <tr><td>Liga e desliga sozinho</td><td>superaquecimento, fonte</td></tr>
  <tr><td>Tela azul aleatória</td><td>memória, driver, disco</td></tr>
  <tr><td>Muito lento, disco em 100%</td><td>HD morrendo, ou pouca memória</td></tr>
  <tr><td>Barulho de clique no disco</td><td>HD em falência — backup agora</td></tr>
</table>
<p>O último não é diagnóstico, é urgência: disco que faz clique pode parar a qualquer momento. A
prioridade deixa de ser consertar e passa a ser salvar os dados.</p>

<h2>Software ou hardware</h2>
<p>Uma pergunta separa os dois na maioria dos casos: <em>o problema acontece antes de o sistema
carregar?</em></p>
<ul>
  <li>Não liga, não dá imagem, bipes, desliga na BIOS → <strong>hardware</strong></li>
  <li>Carrega o sistema e depois trava, lentidão, erro de programa → provavelmente
    <strong>software</strong></li>
</ul>
<p>E há um teste que resolve a dúvida: dê boot por um pendrive com Linux. Se a máquina roda bem por
ali, o hardware está bom e o problema é o sistema instalado — o que muda completamente o orçamento
do conserto.</p>

<h2>O que perguntar ao dono</h2>
<ul>
  <li>Quando começou?</li>
  <li>Mudou alguma coisa antes — instalou programa, caiu energia, mudou de lugar?</li>
  <li>Acontece sempre ou às vezes?</li>
  <li>Alguém já tentou consertar?</li>
</ul>
<p>A segunda pergunta resolve muitos casos sozinha. "Começou depois que caiu a energia" aponta para
fonte; "depois que instalei um programa" aponta para software.</p>

<h2>Faça agora</h2>
<p>Pegue uma máquina funcionando e provoque um defeito de propósito: retire um pente de memória, ou
desconecte o cabo de 8 pinos. Ligue e observe o comportamento exato. Repita com outro defeito.
Reconhecer esses sintomas com a máquina no seu controle é como se aprende a reconhecê-los quando ela
não está.</p>
`,

  'antes-de-formatar': `
<h2>Onde os arquivos se escondem</h2>
<p>Perguntar "onde estão seus arquivos?" e confiar na resposta é o caminho mais rápido para apagar
algo importante. As pastas óbvias — Documentos, Imagens, Downloads, Área de Trabalho — são só o
começo:</p>
<table>
  <tr><th>Também salve</th><th>Por quê</th></tr>
  <tr><td>Favoritos e senhas do navegador</td><td>ninguém lembra que estão lá até perder</td></tr>
  <tr><td>E-mails, se for programa instalado</td><td>ficam num arquivo local</td></tr>
  <tr><td>Pasta de programas com dados próprios</td><td>controle financeiro, jogos salvos</td></tr>
  <tr><td>Drivers específicos</td><td>impressora antiga que não tem mais site</td></tr>
  <tr><td>Chaves de licença</td><td>Windows e Office pagos</td></tr>
</table>

<h2>Backup conferido, não só feito</h2>
<p>Copiar não basta: abra alguns arquivos <strong>a partir da cópia</strong>. Pen drive com defeito
copia sem reclamar e devolve arquivo corrompido, e você só descobre quando o original já não existe.</p>
<p>E confira o tamanho total das duas pastas: números muito diferentes significam que algo ficou
para trás.</p>

<h2>Formatar resolve o quê</h2>
<table>
  <tr><th>Formatar resolve</th><th>Formatar não resolve</th></tr>
  <tr><td>sistema corrompido</td><td>HD com defeito físico</td></tr>
  <tr><td>vírus e propaganda</td><td>memória com problema</td></tr>
  <tr><td>lentidão por programa demais</td><td>superaquecimento</td></tr>
  <tr><td>máquina comprada usada</td><td>fonte fraca</td></tr>
</table>
<p>Formatar uma máquina com defeito de hardware gasta a tarde e devolve o mesmo problema — agora sem
os programas do dono. Diagnostique antes.</p>

<h2>A conversa antes</h2>
<p>Combine com o dono, por escrito se possível:</p>
<ul>
  <li>O que <strong>vai</strong> ser salvo — mostre a lista e peça confirmação</li>
  <li>Que tudo o mais será perdido</li>
  <li>Quanto tempo vai levar</li>
  <li>Que programas ele precisa de volta</li>
</ul>
<p>Cinco minutos de conversa evitam o "cadê a pasta que estava na área de trabalho?" depois de tudo
pronto — quando não há mais como voltar.</p>

<h2>Faça agora</h2>
<p>Faça o levantamento numa máquina em uso, como se fosse formatá-la: liste tudo que precisaria ser
salvo e o tamanho total. Depois pergunte ao dono o que ele acha que precisa salvar, e compare as
duas listas. A diferença é o motivo de este levantamento existir.</p>
`,
}

const NOVAS = [
  {
    curso: 'hw-3-primeiro-boot',
    slug: 'do-botao-ao-sistema',
    titulo: 'Do botão ao sistema: o que acontece',
    min: 7, ordem: 1,
    descricao: 'A sequência de partida, e por que ela importa para achar defeito.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Descrever a sequência de partida de um computador</li>
  <li>Usar essa sequência para localizar defeito</li>
  <li>Entender o que o POST está testando</li>
</ul>

<h2>A sequência, passo a passo</h2>
<ol>
  <li><strong>Botão pressionado</strong> — a placa avisa a fonte para ligar</li>
  <li><strong>A fonte estabiliza</strong> e devolve um sinal dizendo "energia pronta". Sem esse
    sinal, nada continua</li>
  <li><strong>O processador acorda</strong> e executa o programa gravado na placa-mãe</li>
  <li><strong>POST</strong> — teste rápido: processador, memória, vídeo, teclado</li>
  <li><strong>Reconhecimento</strong> — o que está conectado nas portas</li>
  <li><strong>Busca do sistema</strong> — procura, na ordem de boot, um disco com sistema</li>
  <li><strong>Entrega</strong> — carrega o carregador do sistema e sai de cena</li>
</ol>
<p>Tudo isso em poucos segundos. E a utilidade prática é esta: <strong>o ponto em que a sequência
para diz onde está o defeito</strong>.</p>

<h2>Onde parou, o que é</h2>
<table>
  <tr><th>Para em</th><th>O que se vê</th><th>Suspeito</th></tr>
  <tr><td>1</td><td>nada, nem luz</td><td>tomada, cabo, fonte, botão</td></tr>
  <tr><td>2</td><td>cooler dá um tranco e para</td><td>fonte, ou curto no gabinete</td></tr>
  <tr><td>4</td><td>liga, sem imagem, com bipes</td><td>memória ou vídeo</td></tr>
  <tr><td>6</td><td>"no bootable device"</td><td>disco, ou ordem de boot</td></tr>
  <tr><td>7</td><td>logo aparece e trava</td><td>sistema, não hardware</td></tr>
</table>
<p>Repare no último: se o logotipo do Windows apareceu, o hardware fez o trabalho dele. O problema
dali para frente é software — e isso muda o que você vai fazer e quanto vai cobrar.</p>

<h2>Os bipes falam</h2>
<p>Antes de haver imagem, a placa se comunica por som. O código varia por fabricante, mas o padrão
geral se repete:</p>
<ul>
  <li><strong>Um bipe curto</strong> — tudo certo, é o som normal de partida</li>
  <li><strong>Repetidos e longos</strong> — memória</li>
  <li><strong>Sequência de longos e curtos</strong> — vídeo</li>
  <li><strong>Contínuo</strong> — fonte ou superaquecimento</li>
</ul>
<p>Muitas placas de hoje vêm sem alto-falante, e usam luzes: um LED para CPU, outro para memória,
outro para vídeo, outro para boot. Aquele que fica aceso é o componente que falhou — informação de
graça, na própria placa.</p>

<h2>O teste da bancada mínima</h2>
<p>Quando não se sabe por onde começar, reduza ao essencial:</p>
<ol>
  <li>Placa-mãe fora do gabinete, sobre a caixa</li>
  <li>Processador e cooler</li>
  <li><strong>Um</strong> pente de memória, no slot que o manual indica</li>
  <li>Fonte, monitor</li>
  <li>Liga encostando a chave nos pinos do power switch</li>
</ol>
<p>Se ligar assim, o problema está no que você tirou — e você reconecta um por vez até reaparecer.
Se não ligar, o problema está no que sobrou, e são só quatro peças.</p>
<p>Tirar a placa do gabinete não é excesso de zelo: parafuso no lugar errado ou espaçador a mais faz
curto com a placa, e o sintoma é exatamente "não liga".</p>

<h2>Faça agora</h2>
<p>Ligue uma máquina prestando atenção nos sinais: houve bipe? quanto tempo até a primeira imagem?
que tecla entra na BIOS? Depois desligue da tomada, retire toda a memória e ligue. Anote exatamente
o que acontece — é esse comportamento que você vai reconhecer depois.</p>
`,
    desafio: {
      titulo: 'O mapa da partida',
      enunciado: `<p>Documente a sequência de partida de uma máquina real e provoque falhas controladas.</p>
<ul>
  <li>Ligue normalmente e anote cada sinal, com o tempo aproximado: LED, som, primeira imagem, logotipo, tela de login</li>
  <li>Descubra a tecla da BIOS e o que a placa mostra em caso de erro (bipe ou LED)</li>
</ul>
<p>Depois, <strong>com a máquina desligada da tomada</strong>, provoque três falhas, uma por vez, e
anote o comportamento exato de cada uma:</p>
<ol>
  <li>Sem nenhum pente de memória</li>
  <li>Sem o cabo de 8 pinos do processador</li>
  <li>Sem disco conectado</li>
</ol>
<p>Monte uma tabela com falha, sinal observado e em que passo da sequência ela parou. Recoloque tudo
e confirme que a máquina voltou ao normal.</p>
<p>Essa tabela é a sua referência de diagnóstico — e ela vale mais escrita por você, com a máquina
que você tem, do que copiada de qualquer lugar.</p>`,
    },
  },
  {
    curso: 'hw-3-primeiro-boot',
    slug: 'quando-nao-liga',
    titulo: 'Quando não liga',
    min: 7, ordem: 2,
    descricao: 'O chamado mais comum de todos, resolvido por eliminação.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Percorrer a lista de verificação na ordem certa</li>
  <li>Distinguir "não liga" de "liga e não dá imagem"</li>
  <li>Isolar o defeito sem trocar peça no chute</li>
</ul>

<h2>Primeiro, o que "não liga" significa</h2>
<p>Metade dos chamados de "não liga" não é não ligar. Antes de qualquer coisa, pergunte e observe:</p>
<table>
  <tr><th>O que acontece</th><th>Na verdade é</th></tr>
  <tr><td>Nenhuma luz, nenhum som</td><td>não liga mesmo</td></tr>
  <tr><td>Cooler gira, LED acende, tela preta</td><td>liga sem imagem — outro problema</td></tr>
  <tr><td>Liga e desliga em segundos</td><td>proteção da fonte, ou curto</td></tr>
  <tr><td>Tela com mensagem</td><td>ligou; é software ou disco</td></tr>
</table>
<p>Essa separação já corta o trabalho pela metade, e é a pergunta que o técnico experiente faz por
telefone antes de sair de casa.</p>

<h2>A lista, do mais bobo ao mais caro</h2>
<p>Siga nesta ordem. Ela não é aleatória: começa pelo que é gratuito e frequente.</p>
<ol>
  <li><strong>A tomada tem energia?</strong> Teste com outro aparelho. Régua com botão desligado é
    campeã</li>
  <li><strong>O cabo está firme dos dois lados?</strong> E a chavinha 110/220 da fonte, na posição
    certa?</li>
  <li><strong>A fonte tem chave liga/desliga atrás?</strong> Costuma estar em "O"</li>
  <li><strong>O botão do gabinete funciona?</strong> Encoste a chave nos pinos do power switch — se
    ligar assim, o defeito é o botão</li>
  <li><strong>Retire tudo que não é essencial</strong> e teste na bancada mínima</li>
  <li><strong>Teste a fonte</strong> com outra sabidamente boa</li>
  <li><strong>Retire a pilha da placa</strong> por cinco minutos, para zerar a configuração</li>
</ol>
<p>Nos itens 1 a 4 se resolve a maioria dos casos, e todos custam zero. Só depois deles vale abrir a
máquina.</p>

<h2>Liga mas não dá imagem</h2>
<p>Aqui a máquina está viva: a energia chegou. A lista muda:</p>
<ol>
  <li><strong>O monitor está ligado e na entrada certa?</strong> HDMI 1 e HDMI 2 são entradas
    diferentes</li>
  <li><strong>O cabo de vídeo está na placa de vídeo</strong>, e não na saída da placa-mãe? Com
    placa dedicada instalada, a saída da placa-mãe costuma ficar desativada</li>
  <li><strong>Reencaixe a memória.</strong> É a causa mais comum. Tire, limpe o contato com borracha
    branca, recoloque até o clique dos dois lados</li>
  <li><strong>Teste com um pente só</strong>, e depois com o outro, alternando os slots. Assim você
    descobre se é o pente ou o slot</li>
  <li><strong>Confira o cabo de 8 pinos</strong> do processador</li>
  <li><strong>Escute os bipes</strong> ou olhe os LEDs de diagnóstico</li>
</ol>
<p>O item 3 sozinho resolve um número surpreendente de casos, principalmente em máquina que foi
transportada ou que ficou parada muito tempo.</p>

<h2>O que não fazer</h2>
<ul>
  <li><strong>Não troque peça no chute.</strong> Trocar a fonte "para ver" custa dinheiro e, se
    funcionar, você ainda não sabe se era ela ou o mau contato que você desfez ao mexer</li>
  <li><strong>Não mexa em duas coisas antes de testar.</strong> Funcionou? Qual das duas era?</li>
  <li><strong>Não insista com cheiro de queimado.</strong> Desligue da tomada e pare</li>
</ul>

<h2>Quando não vale consertar</h2>
<p>Faça a conta antes de pedir peça: uma placa-mãe para máquina de dez anos custa quase o preço de
uma usada melhor. Nesses casos, a resposta profissional é dizer isso ao dono — com números — em vez
de fazer um orçamento que ninguém vai aprovar.</p>

<h2>Faça agora</h2>
<p>Escreva sua própria lista de verificação numa folha, na ordem que você seguiria, e deixe na
bancada. Depois use-a no próximo chamado, marcando cada item. Lista consultada é o que impede pular
o passo 1 e perder uma hora com a régua desligada.</p>
`,
    desafio: {
      titulo: 'O chamado de "não liga"',
      enunciado: `<p>Peça a alguém que provoque um defeito numa máquina <strong>sem você ver</strong> — desligar um cabo, tirar a memória, mudar a chave da fonte, o que for.</p>
<ul>
  <li>Percorra sua lista de verificação na ordem, anotando o resultado de cada item</li>
  <li>Anote quanto tempo levou até achar</li>
  <li>Diga em que item da lista o defeito apareceu</li>
</ul>
<p>Repita três vezes, com defeitos diferentes.</p>
<p>No relatório, responda: <strong>em algum momento você pulou um passo da lista?</strong> E se
pulou, isso custou tempo? A resposta honesta a essa pergunta é o aprendizado do exercício — a lista
existe porque a intuição erra justamente nos casos bobos.</p>`,
    },
  },
  {
    curso: 'hw-4-manutencao-e-defeito',
    slug: 'testando-peca-a-peca',
    titulo: 'Testando peça a peça',
    min: 7, ordem: 4,
    descricao: 'Os programas e os métodos que confirmam qual componente está com defeito.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Testar memória, disco e temperatura com ferramenta apropriada</li>
  <li>Ler o SMART de um disco</li>
  <li>Confirmar o diagnóstico antes de pedir peça</li>
</ul>

<h2>Por que testar, se o sintoma já indica</h2>
<p>Porque o sintoma indica, não prova. Trocar peça baseado em suspeita custa dinheiro do dono e, se
o problema continuar, você fica sem saber se errou o diagnóstico ou se havia dois defeitos.</p>
<p>Um teste que aponta o erro é o que permite dizer "é a memória" com segurança — e é o que sustenta
o orçamento.</p>

<h2>Memória</h2>
<p>Memória com defeito produz os sintomas mais confusos: telas azuis aleatórias, programas que fecham
sozinhos, arquivo que corrompe sem motivo. Confuso porque o erro aparece em lugares diferentes a cada
vez.</p>
<ul>
  <li>O Windows tem um teste próprio na inicialização</li>
  <li>O <strong>MemTest86</strong>, rodado por pendrive, é o mais confiável</li>
  <li>Deixe rodar pelo menos uma passagem completa — leva horas, e é normal</li>
  <li>Qualquer erro reportado já condena o pente</li>
</ul>
<p>Com dois pentes e erro detectado, teste um de cada vez para saber qual. E teste também trocando de
slot: o defeito pode estar no slot, não na memória.</p>

<h2>Disco: o SMART avisa antes</h2>
<p>Todo disco moderno guarda estatísticas sobre a própria saúde. Programas como CrystalDiskInfo leem
isso em segundos.</p>
<table>
  <tr><th>Indicador</th><th>Significa</th></tr>
  <tr><td>Setores realocados</td><td>áreas defeituosas já contornadas — se cresce, é contagem regressiva</td></tr>
  <tr><td>Setores pendentes</td><td>áreas com problema ainda não resolvidas</td></tr>
  <tr><td>Horas ligado</td><td>a idade real do disco</td></tr>
  <tr><td>Temperatura</td><td>acima de 50 °C encurta a vida</td></tr>
</table>
<p>Status "Cuidado" ou "Ruim" significa: <strong>backup agora</strong>. O disco pode durar mais seis
meses ou parar amanhã, e não há como saber.</p>
<p>Em SSD, olhe também a porcentagem de vida útil restante — ele tem um número finito de gravações,
e o programa mostra quanto já foi usado.</p>

<h2>Temperatura</h2>
<pre>em repouso        sob esforço        conclusão
30–45 °C          60–80 °C           normal
50–60 °C          85–95 °C           limpeza e pasta térmica
acima de 60 °C    passa de 95 °C     cooler mal encaixado ou parado</pre>
<p>Temperatura alta faz o processador reduzir a própria velocidade para se proteger. O sintoma que o
dono relata é "ficou lento", e a causa é térmica — um dos casos em que limpeza resolve o que parecia
exigir troca.</p>

<h2>Fonte</h2>
<p>É a mais difícil de testar sem equipamento. Dois caminhos:</p>
<ul>
  <li><strong>Substituição</strong> — trocar por uma sabidamente boa é o teste definitivo</li>
  <li><strong>Teste do clipe</strong> — ligar o pino verde ao preto no conector de 24 pinos faz a
    fonte ligar sozinha. Mostra que ela liga, mas <strong>não</strong> que ela sustenta carga — e é
    justamente sob carga que a fonte ruim falha</li>
</ul>
<p>Por isso a substituição continua sendo o método confiável.</p>

<h2>Anote o que testou</h2>
<p>Registre cada teste e o resultado, mesmo os que deram normal. Serve para três coisas: você não
repete, o laudo fica fundamentado, e se a máquina voltar em dois meses você sabe o que já foi
descartado.</p>

<h2>Faça agora</h2>
<p>Rode o CrystalDiskInfo em três máquinas diferentes e anote as horas ligado e o status de cada
disco. Você provavelmente vai encontrar pelo menos um em estado de alerta — e avisar o dono a tempo
é o serviço mais valioso que se presta sem cobrar nada.</p>
`,
    desafio: {
      titulo: 'Bateria de testes em três máquinas',
      enunciado: `<p>Faça um levantamento de saúde em três máquinas — do laboratório, de casa, de conhecidos.</p>
<p>Para cada uma, registre numa tabela:</p>
<ul>
  <li>Modelo do disco, horas ligado, status SMART e setores realocados</li>
  <li>Temperatura do processador em repouso e sob esforço</li>
  <li>Quantidade e frequência da memória — está rodando na velocidade nominal?</li>
  <li>Espaço livre em disco, em porcentagem</li>
</ul>
<p>Ao fim, escreva para cada máquina uma recomendação em uma frase: está bem, precisa de limpeza,
precisa de upgrade, ou precisa de backup urgente.</p>
<p>Se alguma tiver disco em alerta, <strong>avise o dono</strong> e registre a data. É a parte do
exercício que sai do papel.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
