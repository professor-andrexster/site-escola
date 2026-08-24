/**
 * Amplia o curso P.O.O com Java.
 *
 *   node scripts/conteudo-java.mjs --aplicar
 *
 * O curso cobria bem a sequência clássica de POO. Faltavam três coisas:
 * interface (que completa o polimorfismo), exceções (que são marca registrada
 * de Java e aparecem em qualquer código real) e um projeto que junte tudo.
 */
import { aplicar } from './lib-conteudo.mjs'

const AMPLIACOES = {
  'do-pseudocodigo-ao-java-primeiro-programa': `
<h2>Compilar e executar são dois passos</h2>
<pre><code>javac Programa.java     # compila: gera Programa.class
java Programa           # executa (sem o .class no fim)</code></pre>
<p>Diferente de Python e JavaScript, que leem e executam direto, Java traduz antes para uma forma
intermediária. Isso muda uma coisa importante no dia a dia: <strong>erro de digitação aparece na
compilação</strong>, antes de o programa rodar. Em Python, você só descobre quando a linha executa.</p>
<p>É por isso que Java é considerado mais chato no começo e mais seguro em projeto grande: ele
reclama cedo.</p>

<h2>O nome do arquivo não é escolha</h2>
<pre><code>// em Aluno.java
public class Aluno { … }     // OK

// em aluno.java
public class Aluno { … }     // erro: class Aluno is public, should be declared in Aluno.java</code></pre>
<p>Classe pública tem que estar num arquivo com o mesmo nome, maiúscula inclusive. É a primeira
mensagem de erro que quase todo mundo recebe.</p>

<h2>A linha que assusta</h2>
<pre><code>public static void main(String[] args)</code></pre>
<table>
  <tr><th>Parte</th><th>Quer dizer</th></tr>
  <tr><td><code>public</code></td><td>qualquer um pode chamar</td></tr>
  <tr><td><code>static</code></td><td>pertence à classe, não a um objeto — dá para chamar sem criar nada</td></tr>
  <tr><td><code>void</code></td><td>não devolve valor</td></tr>
  <tr><td><code>main</code></td><td>o nome que a máquina virtual procura para começar</td></tr>
  <tr><td><code>String[] args</code></td><td>o que veio da linha de comando</td></tr>
</table>
<p>O <code>static</code> é o que mais confunde no começo, e a explicação curta é esta: quando o
programa começa, ainda não existe objeto nenhum — então o ponto de partida não pode depender de um.</p>

<h2>Os erros do primeiro dia</h2>
<table>
  <tr><th>Mensagem</th><th>Quer dizer</th></tr>
  <tr><td><code>cannot find symbol</code></td><td>nome escrito diferente de onde foi declarado</td></tr>
  <tr><td><code>';' expected</code></td><td>faltou ponto e vírgula — a linha indicada ou a anterior</td></tr>
  <tr><td><code>incompatible types</code></td><td>tentou pôr um tipo em variável de outro</td></tr>
  <tr><td><code>could not find or load main class</code></td><td>rodou <code>java Programa.class</code> em vez de <code>java Programa</code></td></tr>
</table>

<h2>Faça agora</h2>
<p>Escreva o "Olá" em Java, compile e execute. Depois renomeie o arquivo para minúscula e tente
compilar; troque <code>main</code> por <code>Main</code> e tente executar. Ler as duas mensagens
economiza o susto quando elas aparecerem de verdade.</p>
`,

  'variaveis-tipos-e-decisoes-em-java': `
<h2>O erro mais clássico de Java</h2>
<pre><code>String a = "abc";
String b = "abc";
a == b          // pode dar true — mas por acidente

String c = new String("abc");
a == c          // false!

a.equals(c)     // true — este é o certo</code></pre>
<p>O <code>==</code> em objeto compara <strong>se são o mesmo objeto na memória</strong>, não se têm
o mesmo conteúdo. Para texto, use sempre <code>.equals()</code>.</p>
<p>O que torna isso traiçoeiro: com literais curtos, Java reaproveita o mesmo objeto e o
<code>==</code> dá <code>true</code> — o código passa nos seus testes. Aí chega uma string lida do
teclado ou de um arquivo, e ele para de funcionar.</p>
<pre><code>// e para evitar quebrar quando o texto for nulo:
"sim".equals(resposta)      // seguro
resposta.equals("sim")      // NullPointerException se resposta for null</code></pre>

<h2>Tipo primitivo e classe embrulho</h2>
<table>
  <tr><th>Primitivo</th><th>Classe</th><th>Diferença</th></tr>
  <tr><td><code>int</code></td><td><code>Integer</code></td><td>o primitivo não pode ser nulo</td></tr>
  <tr><td><code>double</code></td><td><code>Double</code></td><td>a classe cabe em coleções</td></tr>
  <tr><td><code>boolean</code></td><td><code>Boolean</code></td><td>a classe tem métodos</td></tr>
</table>
<p>Use o primitivo por padrão: é mais rápido e não corre risco de ser nulo. A classe entra quando
você precisa guardar em <code>ArrayList</code> ou representar "sem valor".</p>
<p>E cuidado com o mesmo problema do <code>==</code>: <code>Integer</code> acima de 127 comparado com
<code>==</code> dá <code>false</code> mesmo com valores iguais.</p>

<h2>Divisão que descarta o resto</h2>
<pre><code>int resultado = 7 / 2;         // 3, não 3.5
double certo = 7 / 2;          // 3.0 — a conta já foi feita com inteiros!
double agora = 7 / 2.0;        // 3.5</code></pre>
<p>Divisão entre dois inteiros dá inteiro, e o resto é jogado fora antes de qualquer atribuição. O
segundo caso engana muita gente: declarar a variável como <code>double</code> não conserta, porque o
estrago aconteceu na conta.</p>

<h2>Faça agora</h2>
<p>Leia dois textos do teclado com <code>Scanner</code> e compare-os com <code>==</code> e com
<code>.equals()</code>. Digite a mesma palavra nas duas vezes: o <code>==</code> dá
<code>false</code>. É a demonstração que fixa a regra.</p>
`,

  'por-que-a-orientacao-a-objetos-existe': `
<h2>O que a POO organiza</h2>
<p>Um programa de 3.000 linhas em funções soltas tem um problema estrutural: qualquer função pode
mexer em qualquer dado. Quando um valor sai errado, o suspeito é o programa inteiro.</p>
<p>A POO junta o dado com quem pode mexer nele. A nota mora dentro do objeto Aluno, e só os métodos
do Aluno a alteram — o que reduz o suspeito de 3.000 linhas para 30.</p>

<h2>Os quatro pilares, em uma linha cada</h2>
<table>
  <tr><th>Pilar</th><th>É</th><th>Resolve</th></tr>
  <tr><td>Abstração</td><td>representar só o que importa</td><td>o Aluno do sistema escolar não tem cor de olho</td></tr>
  <tr><td>Encapsulamento</td><td>esconder o interior</td><td>ninguém altera a nota por fora, sem passar pela regra</td></tr>
  <tr><td>Herança</td><td>aproveitar o que já existe</td><td>Professor e Aluno compartilham o que é de Pessoa</td></tr>
  <tr><td>Polimorfismo</td><td>o mesmo comando, respostas diferentes</td><td>chamar <code>calcularSalario()</code> sem saber o cargo</td></tr>
</table>

<h2>Quando POO não é a melhor escolha</h2>
<p>Nem todo programa precisa de classe. Um script de vinte linhas que lê um CSV e imprime um total
fica pior com três classes do que com uma função.</p>
<p>Vale POO quando: o sistema tem várias entidades com dados e comportamento próprios; a mesma coisa
aparece em vários lugares; e o programa vai crescer. Em Java a discussão é meio teórica — a
linguagem exige classe para tudo — mas a pergunta continua valendo: <em>essa classe representa
alguma coisa, ou é só um lugar para pôr funções?</em></p>

<h2>Faça agora</h2>
<p>Liste as entidades do sistema de biblioteca da escola: o que tem dado e comportamento próprios?
Para cada uma, escreva dois atributos e dois métodos. Se alguma tiver só atributos e nenhum método,
pergunte-se se ela é mesmo um objeto ou apenas um registro.</p>
`,

  'classes-e-objetos-o-primeiro-molde': `
<h2>A variável guarda o endereço, não o objeto</h2>
<pre><code>Aluno a = new Aluno("Ana");
Aluno b = a;              // outro nome para o MESMO objeto
b.setNome("Bruno");
System.out.println(a.getNome());   // "Bruno"</code></pre>
<p>É o mesmo comportamento do objeto em JavaScript e da lista em Python: a variável guarda uma
referência. Copiar a variável não copia o objeto.</p>
<pre><code>Aluno c = new Aluno(a.getNome());   // agora sim, outro objeto</code></pre>

<h2>O null e a exceção que todo mundo encontra</h2>
<pre><code>Aluno a = null;
a.getNome();     // NullPointerException</code></pre>
<p>Objeto declarado e não criado vale <code>null</code>. Chamar método em nulo é o erro mais comum
da linguagem — a ponto de o criador do conceito de referência nula tê-lo chamado publicamente de
"meu erro de um bilhão de dólares".</p>
<p>A defesa é criar o objeto na declaração sempre que possível, e conferir antes de usar o que pode
não existir.</p>

<h2>Static: da classe, não do objeto</h2>
<pre><code>public class Aluno {
    private static int total = 0;    // um só, compartilhado
    private String nome;             // um por objeto

    public Aluno(String nome) {
        this.nome = nome;
        total++;
    }

    public static int getTotal() { return total; }
}

new Aluno("Ana");
new Aluno("Bruno");
Aluno.getTotal();     // 2 — chamado na CLASSE</code></pre>
<p>Use <code>static</code> para o que é da classe inteira: um contador, uma constante, um método
utilitário. Se você está pondo <code>static</code> em tudo para não precisar criar objeto, o sinal é
outro: talvez aquilo não precisasse ser uma classe.</p>

<h2>Faça agora</h2>
<p>Crie a classe Aluno, instancie dois objetos e mostre que <code>a == b</code> é falso enquanto
<code>a == a</code> é verdadeiro. Depois faça <code>b = a</code>, altere por <code>b</code> e veja
<code>a</code> mudar junto.</p>
`,

  'atributos-e-metodos-comportamento-do-objeto': `
<h2>O que o this resolve</h2>
<pre><code>public void setNome(String nome) {
    nome = nome;          // não faz nada: o parâmetro para ele mesmo
}

public void setNome(String nome) {
    this.nome = nome;     // atributo do objeto = parâmetro
}</code></pre>
<p>Quando o parâmetro tem o mesmo nome do atributo, ele "esconde" o atributo dentro do método. O
<code>this</code> desfaz a ambiguidade — e a primeira versão é um bug silencioso: compila, roda e não
guarda nada.</p>

<h2>Métodos com o mesmo nome</h2>
<pre><code>public double media(double a, double b) { return (a + b) / 2; }
public double media(double a, double b, double c) { return (a + b + c) / 3; }</code></pre>
<p>Chama-se sobrecarga: mesmo nome, listas de parâmetros diferentes. Java escolhe pela chamada. O
que <strong>não</strong> distingue é só o tipo de retorno — dois métodos iguais que devolvem coisas
diferentes não compilam.</p>

<h2>Método que faz, e método que responde</h2>
<pre><code>public void adicionarNota(double nota) { … }   // faz, não devolve
public double getMedia() { … }                  // responde, não altera</code></pre>
<p>Boa prática que evita surpresa: método que <strong>responde</strong> não deveria alterar o estado
do objeto. Um <code>getMedia()</code> que recalcula e grava faz o programa se comportar diferente
conforme quantas vezes você o chama.</p>

<h2>toString: o objeto sabe se descrever</h2>
<pre><code>System.out.println(aluno);      // Aluno@1b6d3586 — inútil

@Override
public String toString() {
    return nome + " (" + matricula + ")";
}

System.out.println(aluno);      // Ana (2026001)</code></pre>
<p>Aquele <code>Aluno@1b6d3586</code> é o padrão herdado de <code>Object</code>. Sobrescrever
<code>toString</code> é dos ganhos mais baratos que existem: melhora a depuração de todo o programa
com quatro linhas.</p>

<h2>Faça agora</h2>
<p>Na sua classe Aluno, escreva o <code>setNome</code> sem <code>this</code> de propósito e veja o
nome nunca mudar — sem erro nenhum. Depois acrescente o <code>this</code>. E implemente
<code>toString</code> comparando o antes e o depois no <code>println</code>.</p>
`,

  'construtores-nascendo-do-jeito-certo': `
<h2>O construtor padrão desaparece</h2>
<pre><code>public class Aluno {
    private String nome;
    // sem construtor escrito: Java fornece um vazio
}
new Aluno();       // funciona

public class Aluno {
    private String nome;
    public Aluno(String nome) { this.nome = nome; }
}
new Aluno();       // ERRO: o padrão sumiu</code></pre>
<p>Assim que você escreve um construtor, Java para de fornecer o vazio. Se quiser os dois, declare
os dois.</p>

<h2>Um construtor chamando o outro</h2>
<pre><code>public Aluno(String nome, String turma) {
    this.nome = nome;
    this.turma = turma;
    this.ativo = true;
}

public Aluno(String nome) {
    this(nome, "sem turma");     // reaproveita o de cima
}</code></pre>
<p>O <code>this(...)</code> precisa ser a <strong>primeira linha</strong> do construtor. Isso evita
repetir a inicialização em cada versão — e evita o bug de acrescentar um atributo novo e esquecer de
inicializá-lo num dos construtores.</p>

<h2>Validar no nascimento</h2>
<pre><code>public Aluno(String nome, String matricula) {
    if (nome == null || nome.isBlank()) {
        throw new IllegalArgumentException("Nome é obrigatório.");
    }
    this.nome = nome;
    this.matricula = matricula;
}</code></pre>
<p>Um objeto não deveria existir num estado inválido. Validar no construtor garante que, se ele foi
criado, está consistente — e todo o resto do programa pode confiar nisso sem verificar de novo.</p>

<h2>Faça agora</h2>
<p>Escreva dois construtores para sua classe, um chamando o outro, e valide um campo obrigatório.
Depois tente criar o objeto com nome vazio e veja a exceção. Objeto que não deveria existir não
existe — é essa a ideia.</p>
`,

  'encapsulamento-private-getters-setters': `
<h2>Getter e setter para tudo não é encapsulamento</h2>
<pre><code>// isto é um atributo público com passos extras
public class Aluno {
    private double nota;
    public double getNota()          { return nota; }
    public void setNota(double n)    { this.nota = n; }
}

aluno.setNota(15);      // passou, e nota 15 não existe</code></pre>
<p>Se o setter só atribui, ele não protege nada — o atributo continua alterável por qualquer um, com
qualquer valor. Encapsular é <strong>fazer o objeto cuidar da própria regra</strong>:</p>
<pre><code>public void lancarNota(double nota) {
    if (nota &lt; 0 || nota &gt; 10) {
        throw new IllegalArgumentException("Nota deve estar entre 0 e 10.");
    }
    this.nota = nota;
}</code></pre>
<p>Repare também no nome: <code>lancarNota</code> diz o que acontece no mundo real;
<code>setNota</code> só diz que uma variável mudou.</p>

<h2>Nem todo atributo precisa de setter</h2>
<table>
  <tr><th>Atributo</th><th>Precisa de setter?</th></tr>
  <tr><td>matrícula</td><td>não — definida no construtor e nunca muda</td></tr>
  <tr><td>data de criação</td><td>não</td></tr>
  <tr><td>nota</td><td>não um setter: um método com a regra</td></tr>
  <tr><td>telefone</td><td>sim, com validação de formato</td></tr>
</table>
<p>A pergunta que decide: <em>faz sentido, no mundo real, alguém mudar isso a qualquer momento?</em>
Se não faz, não crie o setter. É mais fácil acrescentar um depois do que tirar um que meio sistema
já usa.</p>

<h2>Devolver a lista é abrir a porta</h2>
<pre><code>public List&lt;Double&gt; getNotas() {
    return notas;                          // quem recebe pode alterar!
}
aluno.getNotas().clear();                  // apagou tudo, sem passar por nenhuma regra

public List&lt;Double&gt; getNotas() {
    return Collections.unmodifiableList(notas);   // só leitura
}</code></pre>
<p>Encapsular o atributo e devolver a coleção interna intacta anula a proteção. É um furo comum, e o
conserto é uma linha.</p>

<h2>Faça agora</h2>
<p>Reescreva sua classe trocando <code>setNota</code> por <code>lancarNota</code> com validação.
Depois tente lançar 15 e veja a exceção. Compare com a versão anterior, que aceitava — e note que o
resto do programa não precisou mudar.</p>
`,

  'heranca-familia-de-classes-do-laboratorio': `
<h2>É-um ou tem-um</h2>
<p>O teste que decide entre herança e composição:</p>
<table>
  <tr><th>Frase</th><th>Faz sentido?</th><th>Use</th></tr>
  <tr><td>Professor <strong>é uma</strong> Pessoa</td><td>sim</td><td>herança</td></tr>
  <tr><td>Turma <strong>é uma</strong> lista de alunos</td><td>não</td><td>composição: a turma <em>tem</em> alunos</td></tr>
  <tr><td>Carro <strong>é um</strong> motor</td><td>não</td><td>composição</td></tr>
</table>
<p>Herdar só para aproveitar código é a armadilha: você ganha o método, e junto vem tudo o mais da
classe-mãe — inclusive o que não faz sentido na filha.</p>

<h2>Prefira composição</h2>
<pre><code>// herança forçada
public class Turma extends ArrayList&lt;Aluno&gt; { … }
turma.clear();        // qualquer um esvazia a turma

// composição
public class Turma {
    private List&lt;Aluno&gt; alunos = new ArrayList&lt;&gt;();
    public void matricular(Aluno a) { … }   // com a regra
}</code></pre>
<p>É uma recomendação repetida há décadas na literatura de POO, e o motivo é este: com herança, a
classe filha herda a interface inteira da mãe, inclusive o que você não queria expor.</p>

<h2>super: chamar a mãe</h2>
<pre><code>public class Professor extends Pessoa {
    private String disciplina;

    public Professor(String nome, String disciplina) {
        super(nome);                   // primeira linha, obrigatoriamente
        this.disciplina = disciplina;
    }

    @Override
    public String descrever() {
        return super.descrever() + ", leciona " + disciplina;
    }
}</code></pre>
<p>Se a mãe não tem construtor vazio e a filha não chama <code>super(...)</code>, não compila — Java
obriga a mãe a ser construída primeiro.</p>

<h2>Herança profunda é problema</h2>
<p>Três níveis já pedem cuidado; cinco, quase sempre indicam modelagem errada. O sintoma: para
entender o que um método faz, você precisa abrir quatro arquivos. Quando a hierarquia crescer,
pergunte se aquilo não é composição ou interface.</p>

<h2>Faça agora</h2>
<p>Monte Pessoa, Aluno e Professor com herança. Depois escreva a Turma por composição e tente
escrevê-la com <code>extends ArrayList</code>: veja como a segunda permite <code>turma.clear()</code>
por fora, sem passar por nenhuma regra sua.</p>
`,

  'polimorfismo-um-comando-muitos-comportamentos': `
<h2>@Override não é enfeite</h2>
<pre><code>public class Aluno extends Pessoa {
    @Override
    public String descrever() { … }      // o compilador confere
}</code></pre>
<p>Sem a anotação, um erro de digitação — <code>descreverr</code> — cria um método novo em vez de
sobrescrever, e ninguém avisa. O programa chama o da mãe, e você procura o problema no lugar errado.
Com <code>@Override</code>, não compila.</p>

<h2>O polimorfismo em ação</h2>
<pre><code>List&lt;Pessoa&gt; pessoas = new ArrayList&lt;&gt;();
pessoas.add(new Aluno("Ana"));
pessoas.add(new Professor("André", "Informática"));

for (Pessoa p : pessoas) {
    System.out.println(p.descrever());   // cada uma responde do seu jeito
}</code></pre>
<p>O laço não sabe nem precisa saber quem é quem. Acrescentar uma classe Funcionário amanhã não muda
uma linha aqui — e é isso que o polimorfismo compra.</p>

<h2>instanceof é sinal de alerta</h2>
<pre><code>// cheiro de modelagem errada
for (Pessoa p : pessoas) {
    if (p instanceof Aluno) {
        System.out.println("Aluno: " + ((Aluno) p).getMatricula());
    } else if (p instanceof Professor) { … }
}</code></pre>
<p>Se você precisa perguntar o tipo para decidir o comportamento, o comportamento deveria estar
dentro da classe. Cada <code>instanceof</code> numa cadeia é um lugar que você vai ter de editar
quando surgir um tipo novo — exatamente o que o polimorfismo evita.</p>

<h2>equals: comparar por conteúdo</h2>
<pre><code>Aluno a = new Aluno("Ana", "2026001");
Aluno b = new Aluno("Ana", "2026001");
a == b            // false — objetos diferentes
a.equals(b)       // false também, até você sobrescrever

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Aluno)) return false;
    return matricula.equals(((Aluno) o).matricula);
}

@Override
public int hashCode() { return matricula.hashCode(); }</code></pre>
<p>Regra que não se quebra: <strong>quem sobrescreve <code>equals</code> sobrescreve
<code>hashCode</code></strong>. Sem isso, o objeto se perde dentro de <code>HashMap</code> e
<code>HashSet</code> — você guarda e não encontra depois.</p>

<h2>Faça agora</h2>
<p>Monte a lista de Pessoa com alunos e professores e percorra chamando o mesmo método. Depois
escreva a versão com <code>instanceof</code> e compare: acrescente uma classe nova e veja quantos
lugares cada versão obriga a mexer.</p>
`,

  'arraylist-listas-de-objetos': `
<h2>Declare pela interface</h2>
<pre><code>ArrayList&lt;Aluno&gt; lista = new ArrayList&lt;&gt;();   // preso ao ArrayList
List&lt;Aluno&gt; lista = new ArrayList&lt;&gt;();        // troca a implementação numa linha</code></pre>
<p>Declarando como <code>List</code>, o resto do código passa a depender só do contrato. Trocar por
<code>LinkedList</code> vira uma alteração de uma linha.</p>

<h2>Sem o tipo entre &lt;&gt;, tudo vira Object</h2>
<pre><code>List lista = new ArrayList();      // forma antiga
lista.add("texto");
lista.add(42);                     // aceita qualquer coisa
Aluno a = (Aluno) lista.get(0);    // estoura só na execução

List&lt;Aluno&gt; lista = new ArrayList&lt;&gt;();
lista.add("texto");                // erro na COMPILAÇÃO</code></pre>
<p>O tipo entre os sinais é o que faz o compilador trabalhar por você. Sem ele, o erro só aparece
rodando — e talvez em produção.</p>

<h2>Remover durante o laço</h2>
<pre><code>for (Aluno a : alunos) {
    if (!a.isAtivo()) alunos.remove(a);      // ConcurrentModificationException
}

alunos.removeIf(a -&gt; !a.isAtivo());          // certo, e numa linha</code></pre>
<p>É o mesmo problema de Python, com uma diferença a favor de Java: aqui ele lança exceção em vez de
pular elementos em silêncio. Erro que aparece é melhor que erro que se esconde.</p>

<h2>Os métodos que resolvem o dia</h2>
<pre><code>alunos.sort(Comparator.comparing(Aluno::getNome));
alunos.sort(Comparator.comparingDouble(Aluno::getMedia).reversed());

double media = alunos.stream()
    .mapToDouble(Aluno::getMedia)
    .average()
    .orElse(0);

List&lt;Aluno&gt; aprovados = alunos.stream()
    .filter(a -&gt; a.getMedia() &gt;= 6)
    .toList();</code></pre>
<p>Os <code>streams</code> são o <code>map</code> e o <code>filter</code> que você já usou em
JavaScript e Python. A ideia é a mesma; muda a escrita.</p>

<h2>Map: quando a busca é por chave</h2>
<pre><code>Map&lt;String, Aluno&gt; porMatricula = new HashMap&lt;&gt;();
porMatricula.put("2026001", ana);
Aluno a = porMatricula.get("2026001");     // direto, sem percorrer</code></pre>
<p>Procurar numa lista de 10 mil alunos é percorrer até achar; num <code>Map</code>, é ir direto.
Quando você se pegar escrevendo um laço só para encontrar um item por identificador, é sinal de que
o <code>Map</code> era a estrutura certa.</p>

<h2>Faça agora</h2>
<p>Monte uma lista de alunos, ordene por média decrescente e filtre os aprovados com
<code>stream</code>. Depois tente remover dentro de um <code>for</code> e veja a exceção acontecer.</p>
`,
}

const NOVAS = [
  {
    curso: 'poo-java',
    slug: 'interfaces-o-contrato',
    titulo: 'Interfaces: o contrato',
    min: 7, ordem: 10,
    descricao: 'Combinar o que uma classe faz, sem dizer como.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Criar e implementar interfaces</li>
  <li>Entender a diferença entre interface e classe abstrata</li>
  <li>Programar para o contrato, e não para a implementação</li>
</ul>

<h2>O problema que a herança não resolve</h2>
<p>Java permite herdar de <strong>uma única</strong> classe. E aparece o caso: o coordenador é
professor e também é gestor. Herdar dos dois é impossível.</p>
<p>Além disso, há comportamentos que atravessam a hierarquia. "Pode ser impresso em relatório" não
descreve uma família de classes — aluno, nota fiscal e boletim não são parentes, e mesmo assim todos
precisam disso.</p>

<h2>A interface é uma promessa</h2>
<pre><code>public interface Avaliavel {
    double calcularMedia();
    boolean estaAprovado();
}</code></pre>
<p>Ela diz <strong>o que</strong> a classe faz, sem uma linha sobre <strong>como</strong>. Quem
implementa é obrigado a cumprir:</p>
<pre><code>public class Aluno implements Avaliavel {
    private List&lt;Double&gt; notas = new ArrayList&lt;&gt;();

    @Override
    public double calcularMedia() {
        return notas.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    @Override
    public boolean estaAprovado() {
        return calcularMedia() &gt;= 6;
    }
}</code></pre>
<p>Se faltar um dos métodos, não compila. É um contrato que o compilador fiscaliza.</p>

<h2>Várias interfaces, uma classe</h2>
<pre><code>public class Coordenador extends Funcionario
        implements Avaliavel, Gestor, Notificavel { … }</code></pre>
<p>Uma classe-mãe só, quantas interfaces precisar. É assim que Java resolve o caso do coordenador.</p>

<h2>Programar para o contrato</h2>
<pre><code>// preso a uma classe
public void gerarBoletim(Aluno aluno) { … }

// serve para qualquer coisa avaliável
public void gerarBoletim(Avaliavel item) {
    System.out.println(item.calcularMedia());
}</code></pre>
<p>A segunda versão funciona com Aluno, com Turma, com Curso — qualquer classe que assine o
contrato, inclusive as que ainda não existem. É por isso que a recomendação clássica diz para
<em>programar voltado à interface, não à implementação</em>.</p>
<p>Você já viu isso sem saber: declarar <code>List&lt;Aluno&gt; lista = new ArrayList&lt;&gt;()</code>
é exatamente programar para a interface.</p>

<h2>Interface ou classe abstrata</h2>
<table>
  <tr><th></th><th>Interface</th><th>Classe abstrata</th></tr>
  <tr><td>Quantas por classe</td><td>várias</td><td>uma</td></tr>
  <tr><td>Tem atributo com estado</td><td>não</td><td>sim</td></tr>
  <tr><td>Tem código pronto</td><td>só métodos default</td><td>sim</td></tr>
  <tr><td>Relação que expressa</td><td>"consegue fazer"</td><td>"é um tipo de"</td></tr>
</table>
<pre><code>public abstract class Pessoa {
    protected String nome;                       // estado compartilhado
    public String getNome() { return nome; }     // código pronto
    public abstract String descrever();          // cada filha escreve
}</code></pre>
<p>A regra prática: se as classes <strong>são</strong> variações de uma mesma coisa e compartilham
dados, classe abstrata. Se elas apenas <strong>conseguem fazer</strong> a mesma coisa, interface. E
as duas juntas é o arranjo mais comum em código real.</p>

<h2>Faça agora</h2>
<p>Crie a interface <code>Avaliavel</code> e faça Aluno e Turma implementarem — a média da turma é a
média das médias. Depois escreva um método que recebe <code>Avaliavel</code> e imprime o resultado,
e chame-o com os dois tipos.</p>
`,
    desafio: {
      titulo: 'Um contrato para três classes',
      enunciado: `<p>Modele o sistema de empréstimos da biblioteca usando interface.</p>
<ul>
  <li>Interface <code>Emprestavel</code> com <code>podeSerEmprestado()</code>, <code>emprestar(Leitor)</code> e <code>devolver()</code></li>
  <li>Três classes que a implementam: <code>Livro</code>, <code>Revista</code> e <code>Notebook</code></li>
  <li>Cada uma com regra própria: livro empresta por 15 dias, revista só para consulta local, notebook precisa de autorização</li>
  <li>Uma classe <code>Biblioteca</code> que guarda <code>List&lt;Emprestavel&gt;</code> e opera sobre todos igualmente</li>
</ul>
<p>Depois acrescente uma quarta classe — <code>Tablet</code>, por exemplo — e responda no relatório:
<strong>quantas linhas da classe Biblioteca você precisou mudar?</strong></p>
<p>Se a resposta não for zero, a Biblioteca está dependendo das classes concretas em vez do
contrato — e vale procurar onde.</p>`,
    },
  },
  {
    curso: 'poo-java',
    slug: 'excecoes-em-java',
    titulo: 'Exceções: quando algo dá errado',
    min: 7, ordem: 11,
    descricao: 'Tratar a falha em vez de deixar o programa morrer — e criar as suas.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Tratar exceções com <code>try</code> e <code>catch</code></li>
  <li>Distinguir as que o compilador obriga a tratar das que não</li>
  <li>Criar exceções próprias para as regras do seu sistema</li>
</ul>

<h2>Ler o rastro</h2>
<pre><code>Exception in thread "main" java.lang.NullPointerException:
        Cannot invoke "Aluno.getNome()" because "aluno" is null
        at Escola.imprimir(Escola.java:42)
        at Escola.main(Escola.java:12)</code></pre>
<p>Como em Python, leia de cima: o tipo e a mensagem. Depois a primeira linha do rastro, que é onde
estourou. As versões recentes de Java dizem até <em>qual</em> variável estava nula — o que economiza
muito tempo quando a linha tem três chamadas encadeadas.</p>

<h2>Tratar</h2>
<pre><code>try {
    int idade = Integer.parseInt(entrada);
    System.out.println("Ano de nascimento: " + (2026 - idade));
} catch (NumberFormatException e) {
    System.out.println("Digite apenas números.");
}</code></pre>
<p>Capture o tipo específico. <code>catch (Exception e)</code> pega tudo — inclusive o erro de
programação que você gostaria de ver.</p>

<h2>A divisão que Java faz</h2>
<table>
  <tr><th></th><th>Verificadas</th><th>Não verificadas</th></tr>
  <tr><td>O compilador obriga a tratar</td><td>sim</td><td>não</td></tr>
  <tr><td>Representam</td><td>situação externa previsível</td><td>erro de programação</td></tr>
  <tr><td>Exemplos</td><td><code>IOException</code>, <code>SQLException</code></td><td><code>NullPointerException</code>, <code>IndexOutOfBounds</code></td></tr>
</table>
<p>A lógica por trás: arquivo pode não existir por motivos fora do seu controle, e o compilador exige
que você tenha um plano. Já o acesso a índice inválido é bug — não se trata, se corrige.</p>
<p>Por isso, envolver tudo em <code>try/catch</code> para "não quebrar" costuma piorar: você esconde
o bug e ele reaparece longe da causa.</p>

<h2>Fechar o que foi aberto</h2>
<pre><code>// antigo, e fácil de errar
Scanner sc = null;
try {
    sc = new Scanner(new File("dados.txt"));
} catch (FileNotFoundException e) {
    …
} finally {
    if (sc != null) sc.close();
}

// try-with-resources: fecha sozinho, mesmo se der erro
try (Scanner sc = new Scanner(new File("dados.txt"))) {
    while (sc.hasNextLine()) { … }
} catch (FileNotFoundException e) {
    System.out.println("Arquivo não encontrado.");
}</code></pre>
<p>A segunda forma é o padrão desde o Java 7. É o equivalente ao <code>with</code> de Python e vale a
mesma regra: use sempre que houver recurso a fechar.</p>

<h2>Criar as suas</h2>
<pre><code>public class NotaInvalidaException extends IllegalArgumentException {
    public NotaInvalidaException(double nota) {
        super("Nota " + nota + " fora do intervalo de 0 a 10.");
    }
}

public void lancarNota(double nota) {
    if (nota &lt; 0 || nota &gt; 10) {
        throw new NotaInvalidaException(nota);
    }
    this.nota = nota;
}</code></pre>
<p>Vale a pena quando a regra é do seu domínio: quem captura pode tratar
<code>NotaInvalidaException</code> de um jeito e <code>AlunoNaoMatriculadoException</code> de outro.
Com <code>IllegalArgumentException</code> genérica para tudo, só resta ler a mensagem.</p>

<h2>O catch vazio</h2>
<pre><code>try {
    salvar();
} catch (Exception e) {
    // vazio
}</code></pre>
<p>É a mesma pior-prática do <code>except: pass</code> de Python. O programa segue como se tivesse
salvado, o dado se perde, e não há uma linha de log dizendo o que houve. Se realmente não há o que
fazer, ao menos registre.</p>

<h2>Faça agora</h2>
<p>Escreva um programa que lê um número do teclado e trata os dois casos: texto no lugar de número e
divisão por zero. Depois troque por <code>catch (Exception e)</code> e provoque um
<code>NullPointerException</code> de propósito — veja o bug ser engolido pelo catch genérico.</p>
`,
    desafio: {
      titulo: 'Um sistema que não morre',
      enunciado: `<p>Escreva um cadastro de alunos em memória que trate todas as falhas previsíveis.</p>
<ul>
  <li>Exceção própria <code>NotaInvalidaException</code>, lançada pela classe Aluno</li>
  <li>Exceção própria <code>MatriculaDuplicadaException</code>, lançada pela Escola</li>
  <li>Leitura de um arquivo de alunos com <code>try-with-resources</code></li>
  <li>Menu que continua funcionando depois de qualquer entrada errada</li>
</ul>
<p>Teste e descreva o resultado de cada caso:</p>
<ul>
  <li>Letra onde se espera número</li>
  <li>Nota 15</li>
  <li>Matrícula repetida</li>
  <li>Arquivo inexistente</li>
  <li>Buscar um aluno que não existe</li>
</ul>
<p>Nenhum deles pode encerrar o programa nem mostrar rastro de exceção na tela. E nenhum
<code>catch</code> pode ficar vazio — se não houver o que fazer, registre.</p>`,
    },
  },
  {
    curso: 'poo-java',
    slug: 'projeto-sistema-escolar',
    titulo: 'Projeto: um sistema com tudo junto',
    min: 8, ordem: 12,
    descricao: 'Juntar herança, interface, coleções e exceções num sistema que funciona.',
    conteudo: `
<h2>Objetivo de aprendizagem</h2>
<ul>
  <li>Organizar um projeto Java em pacotes</li>
  <li>Aplicar os quatro pilares num sistema completo</li>
  <li>Separar as camadas do programa</li>
</ul>

<h2>O problema</h2>
<p>Um sistema de notas para a escola: cadastra alunos e professores, matricula em disciplinas, lança
notas, calcula médias e emite o boletim.</p>
<p>É pequeno o bastante para caber num projeto de aula e grande o bastante para exigir tudo que o
curso ensinou.</p>

<h2>A estrutura</h2>
<pre><code>src/
  modelo/
    Pessoa.java          (abstrata)
    Aluno.java
    Professor.java
    Disciplina.java
    Matricula.java
    Avaliavel.java       (interface)
  servico/
    Escola.java          (as regras)
  excecao/
    NotaInvalidaException.java
    MatriculaDuplicadaException.java
  Main.java              (o menu)</code></pre>
<p>Três camadas, com uma regra clara de dependência: <strong>modelo não conhece serviço, e nenhum
dos dois conhece o Main</strong>. Assim, trocar o menu de texto por uma interface gráfica não toca
no resto.</p>

<h2>O modelo</h2>
<pre><code>public abstract class Pessoa {
    protected final String nome;
    protected final String cpf;

    protected Pessoa(String nome, String cpf) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório.");
        }
        this.nome = nome;
        this.cpf = cpf;
    }

    public String getNome() { return nome; }
    public abstract String getPapel();

    @Override
    public String toString() { return getPapel() + ": " + nome; }
}</code></pre>
<p>Repare no <code>final</code> nos atributos: nome e CPF são definidos no nascimento e não mudam.
Não há setter, porque não faz sentido no mundo real.</p>

<h2>A regra fica no serviço</h2>
<pre><code>public class Escola {
    private final Map&lt;String, Aluno&gt; alunos = new HashMap&lt;&gt;();

    public void matricular(Aluno aluno) {
        if (alunos.containsKey(aluno.getMatricula())) {
            throw new MatriculaDuplicadaException(aluno.getMatricula());
        }
        alunos.put(aluno.getMatricula(), aluno);
    }

    public List&lt;Aluno&gt; aprovados() {
        return alunos.values().stream()
                .filter(Aluno::estaAprovado)
                .sorted(Comparator.comparing(Aluno::getNome))
                .toList();
    }
}</code></pre>
<p>O <code>Map</code> aqui não é enfeite: buscar aluno por matrícula é a operação mais frequente do
sistema, e com lista seria percorrer tudo a cada busca.</p>

<h2>O menu só conversa</h2>
<pre><code>case 3 -&gt; {
    System.out.print("Matrícula: ");
    String mat = sc.nextLine();
    System.out.print("Nota: ");
    try {
        double nota = Double.parseDouble(sc.nextLine());
        escola.lancarNota(mat, nota);
        System.out.println("Nota lançada.");
    } catch (NumberFormatException e) {
        System.out.println("Digite um número válido.");
    } catch (NotaInvalidaException e) {
        System.out.println(e.getMessage());
    }
}</code></pre>
<p>O Main lê, chama e mostra. Ele não calcula média nem valida nota — isso é do modelo e do serviço.
O teste da separação: se você apagasse o Main inteiro, as regras continuariam lá.</p>

<h2>A ordem de construir</h2>
<ol>
  <li>As classes de modelo, com construtor e validação</li>
  <li>Um <code>main</code> provisório que cria dois objetos e imprime — para ver funcionando</li>
  <li>O serviço, com uma operação de cada vez, testando a cada uma</li>
  <li>As exceções próprias, quando a regra pedir</li>
  <li>O menu, por último</li>
</ol>
<p>Construir de baixo para cima permite testar cada peça antes de empilhar a seguinte. Começar pelo
menu é o caminho para descobrir tudo que está errado só no fim.</p>

<h2>Faça agora</h2>
<p>Crie a estrutura de pastas e a classe <code>Pessoa</code> com <code>Aluno</code> herdando dela.
Escreva um <code>main</code> de três linhas que cria um aluno e imprime. Compile e rode antes de
escrever qualquer outra coisa.</p>
`,
    desafio: {
      titulo: 'O sistema de notas completo',
      enunciado: `<p>Construa o sistema descrito na aula, com tudo que o curso ensinou.</p>
<h3>Obrigatório</h3>
<ul>
  <li><strong>Herança</strong>: <code>Pessoa</code> abstrata, com <code>Aluno</code> e <code>Professor</code></li>
  <li><strong>Interface</strong>: <code>Avaliavel</code>, implementada por <code>Aluno</code> e <code>Disciplina</code></li>
  <li><strong>Encapsulamento</strong>: nenhum atributo público; nota alterada só por método com regra</li>
  <li><strong>Polimorfismo</strong>: uma lista de <code>Pessoa</code> percorrida chamando o mesmo método</li>
  <li><strong>Coleções</strong>: <code>Map</code> para busca por matrícula, <code>List</code> para o resto</li>
  <li><strong>Exceções próprias</strong>: pelo menos duas, do domínio</li>
  <li><strong>Pacotes</strong>: modelo, serviço e exceção separados</li>
</ul>
<h3>O menu deve permitir</h3>
<ol>
  <li>Cadastrar aluno e professor</li>
  <li>Matricular aluno em disciplina</li>
  <li>Lançar nota</li>
  <li>Ver o boletim de um aluno</li>
  <li>Listar aprovados e reprovados</li>
  <li>Mostrar a média por disciplina</li>
</ol>
<h3>O que será avaliado</h3>
<table>
  <tr><th>Critério</th><th>O que se espera</th></tr>
  <tr><td>Separação</td><td>apagar o Main não levaria nenhuma regra junto</td></tr>
  <tr><td>Encapsulamento</td><td>não existe caminho para gravar nota 15</td></tr>
  <tr><td>Polimorfismo</td><td>nenhum <code>instanceof</code> decidindo comportamento</td></tr>
  <tr><td>Robustez</td><td>nenhuma entrada do usuário derruba o programa</td></tr>
  <tr><td>Nomes</td><td>métodos dizem o que fazem no domínio, não "set" e "get" para tudo</td></tr>
</table>
<p>Entregue com um README explicando como compilar e rodar, e uma lista dos testes que você fez com
entrada inválida.</p>`,
    },
  },
]

await aplicar({ AMPLIACOES, NOVAS })
