#!/usr/bin/env node

/**
 * Script para inserir curso de Redes de Computadores
 * Uso: node inserir-cursos-redes.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// DADOS DO CURSO REDES
// ========================================

const cursoRedes = {
  titulo: 'Redes de Computadores',
  slug: 'redes-de-computadores',
  descricao: 'Compreenda arquitetura de redes, protocolos TCP/IP, endereçamento IP, topologias, segurança básica e administração de redes. Do modelo OSI até wireless.',
  categoria: 'Network',
  autor_nome: 'Professor André Gomes',
  nivel: 'Intermediário',
  publicado: false,
  ordem: 5,
};

const aulasRedes = [
  {
    titulo: 'Fundamentos de Redes e Modelo OSI',
    slug: 'fundamentos-redes-osi',
    descricao: 'Entender conceitos básicos de redes e as 7 camadas do modelo OSI',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Definir o que é uma rede de computadores</li>
  <li>Entender o modelo OSI e suas 7 camadas</li>
  <li>Identificar equipamentos de rede (roteador, switch, hub)</li>
</ul>

<h2 style="color: #0066cc;">O que é uma Rede de Computadores?</h2>
<p>Uma rede é um conjunto de computadores conectados para compartilhar dados e recursos. Podem ser <strong>locais (LAN)</strong> em um prédio ou <strong>amplas (WAN)</strong> entre cidades.</p>

<h2 style="color: #0066cc;">Modelo OSI: 7 Camadas</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc; background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px;">Camada</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Nome</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Função</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Exemplos</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>7</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Aplicação</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Serviços para usuários</td>
    <td style="border: 1px solid #ccc; padding: 8px;">HTTP, SMTP, FTP</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>6</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Apresentação</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Formato dos dados</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Criptografia, compressão</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>5</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Sessão</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Gerencia conexões</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Mantém diálogo</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>4</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Transporte</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Entrega confiável</td>
    <td style="border: 1px solid #ccc; padding: 8px;">TCP, UDP</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>3</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Rede</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Roteamento de pacotes</td>
    <td style="border: 1px solid #ccc; padding: 8px;">IP, ICMP</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>2</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Enlace</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Transmissão física</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Ethernet, MAC</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>1</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">Física</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Meio físico</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Cabos, fibra, wireless</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Equipamentos de Rede</h2>
<ul>
  <li><strong>Hub:</strong> Repete sinal para todas as portas (obsoleto)</li>
  <li><strong>Switch:</strong> Conecta máquinas locais, mais inteligente que hub</li>
  <li><strong>Roteador:</strong> Conecta redes diferentes, roteia pacotes na internet</li>
  <li><strong>Modem:</strong> Converte sinal do ISP para digital</li>
  <li><strong>Firewall:</strong> Filtra tráfego, bloqueia acessos não autorizados</li>
  <li><strong>Access Point:</strong> Fornece conexão wireless (WiFi)</li>
</ul>

<h2 style="color: #0066cc;">Topologias de Rede</h2>
<ul>
  <li><strong>Estrela:</strong> Todos conectados a um switch central (mais comum)</li>
  <li><strong>Barramento:</strong> Todos compartilham um cabo (obsoleto)</li>
  <li><strong>Anel:</strong> Dados circulam em círculo (raro)</li>
  <li><strong>Malha:</strong> Múltiplas conexões entre nós (redundância)</li>
</ul>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Redes conectam computadores. OSI tem 7 camadas: Física até Aplicação. Switches e roteadores conectam máquinas e redes. Topologia define como cabos estão dispostos.</p>`,
    ordem: 1,
  },
  {
    titulo: 'Protocolos TCP/IP',
    slug: 'protocolos-tcp-ip',
    descricao: 'Entender TCP, UDP, IP e como funcionam na prática',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Explicar TCP e UDP e suas diferenças</li>
  <li>Entender IP (versão 4 e 6)</li>
  <li>Conhecer portas e sockets</li>
</ul>

<h2 style="color: #0066cc;">TCP vs UDP</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc; background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px;">TCP</th>
    <th style="border: 1px solid #ccc; padding: 8px;">UDP</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Conexão orientada</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Sem conexão</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Confiável (sem perda)</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Rápido, pode perder dados</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Mais lento</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Mais rápido</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;">Email, HTTP, FTP</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Vídeo, VoIP, jogos</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Three-Way Handshake TCP</h2>
<p>Para estabelecer conexão TCP:</p>
<ol>
  <li><strong>SYN:</strong> Cliente envia sinal de sincronização</li>
  <li><strong>SYN-ACK:</strong> Servidor responde com reconhecimento</li>
  <li><strong>ACK:</strong> Cliente confirma</li>
</ol>
<p>Depois de trocarem dados, FIN/ACK encerra a conexão.</p>

<h2 style="color: #0066cc;">Endereçamento IP</h2>
<p><strong>IPv4:</strong> 32 bits, notação decimal (192.168.1.1)</p>
<p><strong>IPv6:</strong> 128 bits, notação hexadecimal (2001:0db8::1)</p>

<pre><code>Estrutura IPv4:
192.168.1.100
│   │   │  └─ Dispositivo
│   │   └──── Rede local
│   └─────── Rede privada (classe C)
└──────────── Classe A</code></pre>

<h2 style="color: #0066cc;">Classes de IP Privado</h2>
<ul>
  <li><strong>Classe A:</strong> 10.0.0.0 até 10.255.255.255</li>
  <li><strong>Classe B:</strong> 172.16.0.0 até 172.31.255.255</li>
  <li><strong>Classe C:</strong> 192.168.0.0 até 192.168.255.255</li>
</ul>

<h2 style="color: #0066cc;">Portas de Rede</h2>
<p>Portas identificam serviços em uma máquina. Vão de 0 a 65535.</p>
<ul>
  <li>HTTP: porta 80</li>
  <li>HTTPS: porta 443</li>
  <li>SSH: porta 22</li>
  <li>SMTP (email): porta 25</li>
  <li>FTP: porta 21</li>
  <li>DNS: porta 53</li>
</ul>

<p>Um <strong>socket</strong> é a combinação de IP + porta (exemplo: 192.168.1.100:8080)</p>

<h2 style="color: #0066cc;">Resumo</h2>
<p>TCP é confiável, UDP é rápido. IP identifica máquinas, portas identificam serviços. IPv4 usa pontos decimais, IPv6 usa hexadecimal.</p>`,
    ordem: 2,
  },
  {
    titulo: 'Endereçamento e Sub-redes',
    slug: 'enderecamento-subredes',
    descricao: 'Calcular IPs, máscaras de rede e divisão de sub-redes',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Calcular endereços de rede e broadcast</li>
  <li>Entender máscaras de sub-rede</li>
  <li>Dividir redes em sub-redes</li>
</ul>

<h2 style="color: #0066cc;">Máscara de Rede</h2>
<p>A máscara define qual parte do IP é a rede e qual é o dispositivo.</p>

<pre><code>IP:       192.168.1.100
Máscara:  255.255.255.0

Rede:     192.168.1.0
Broadcast: 192.168.1.255
Dispositivos: 192.168.1.1 até 192.168.1.254 (252 IPs)</code></pre>

<h2 style="color: #0066cc;">Notação CIDR</h2>
<p>CIDR (Classless Inter-Domain Routing) simplifica a notação.</p>

<pre><code>192.168.1.0/24  = máscara 255.255.255.0 (256 IPs, 252 utilizáveis)
192.168.0.0/16  = máscara 255.255.0.0 (65536 IPs)
10.0.0.0/8      = máscara 255.0.0.0 (16M IPs)</code></pre>

<h2 style="color: #0066cc;">Cálculo de Sub-redes</h2>
<p>Dividir uma rede em sub-redes menores para organizar máquinas.</p>

<pre><code>Rede original: 192.168.1.0/24 (256 IPs)

Dividir em 4 sub-redes:
1. 192.168.1.0/26   (192.168.1.0 até 192.168.1.63)
2. 192.168.1.64/26  (192.168.1.64 até 192.168.1.127)
3. 192.168.1.128/26 (192.168.1.128 até 192.168.1.191)
4. 192.168.1.192/26 (192.168.1.192 até 192.168.1.255)

Cada sub-rede tem 64 IPs (62 dispositivos)</code></pre>

<h2 style="color: #0066cc;">Cálculo Prático de Endereços</h2>
<pre><code>Dado: 192.168.10.0/24

Máscara: 255.255.255.0
Primeiro IP (Rede): 192.168.10.0
Primeiro Dispositivo: 192.168.10.1
Último Dispositivo: 192.168.10.254
Último IP (Broadcast): 192.168.10.255

Total de IPs: 256
IPs utilizáveis: 254</code></pre>

<h2 style="color: #0066cc;">DHCP: Atribuição Automática</h2>
<p>DHCP (Dynamic Host Configuration Protocol) atribui IPs automaticamente.</p>
<ul>
  <li>Servidor DHCP tem um pool de IPs disponíveis</li>
  <li>Cliente pede IP quando se conecta</li>
  <li>IP é arrendado por um tempo (lease)</li>
  <li>Sem DHCP, você configura manualmente (IP estático)</li>
</ul>

<h2 style="color: #0066cc;">DNS: Nomes em vez de IPs</h2>
<p>DNS traduz nomes de domínio para IPs.</p>

<pre><code>google.com  → 142.251.32.46
github.com  → 140.82.113.3

Cliente faz query ao servidor DNS:
1. Qual é o IP de google.com?
2. DNS responde: 142.251.32.46
3. Navegador se conecta a este IP</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Máscaras definem tamanho da rede. CIDR simplifica notação. Sub-redes dividem redes grandes. DHCP atribui IPs, DNS traduz nomes.</p>`,
    ordem: 3,
  },
  {
    titulo: 'Protocolos Aplicação: HTTP, FTP, SMTP',
    slug: 'protocolos-aplicacao',
    descricao: 'HTTP, FTP, SMTP, IMAP e como funcionam na prática',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender HTTP e HTTPS</li>
  <li>Conhecer FTP para transferência de arquivos</li>
  <li>Usar SMTP, POP3 e IMAP para email</li>
</ul>

<h2 style="color: #0066cc;">HTTP: HyperText Transfer Protocol</h2>
<p>HTTP é usado para transferir páginas web (camada 7, aplicação).</p>

<h3>Métodos HTTP</h3>
<ul>
  <li><strong>GET:</strong> Buscar dados (URL visível)</li>
  <li><strong>POST:</strong> Enviar dados (corpo oculto)</li>
  <li><strong>PUT:</strong> Substituir recurso</li>
  <li><strong>DELETE:</strong> Deletar recurso</li>
  <li><strong>HEAD:</strong> GET sem corpo</li>
</ul>

<h3>Códigos de Resposta</h3>
<ul>
  <li><strong>2xx:</strong> Sucesso (200 OK, 201 Criado)</li>
  <li><strong>3xx:</strong> Redirecionamento (301 Movido permanentemente)</li>
  <li><strong>4xx:</strong> Erro cliente (404 Não encontrado, 403 Proibido)</li>
  <li><strong>5xx:</strong> Erro servidor (500 Erro interno)</li>
</ul>

<h2 style="color: #0066cc;">HTTPS: HTTP Seguro</h2>
<p>HTTPS criptografa dados com TLS/SSL.</p>

<pre><code>HTTP:  http://example.com (não-seguro)
HTTPS: https://example.com (seguro)

Benefícios:
- Dados criptografados
- Autenticação do servidor (certificado)
- Integridade dos dados</code></pre>

<h2 style="color: #0066cc;">FTP: File Transfer Protocol</h2>
<p>Transferência de arquivos entre computadores (porta 21).</p>

<pre><code>Comandos FTP:
- USER/PASS: Autenticação
- LIST: Listar arquivos
- GET/RETR: Baixar arquivo
- PUT/STOR: Enviar arquivo
- CD: Mudar diretório
- QUIT: Desconectar</code></pre>

<h2 style="color: #0066cc;">SFTP: FTP Seguro</h2>
<p>FTP criptografado sobre SSH (porta 22). Preferir ao FTP comum.</p>

<h2 style="color: #0066cc;">SMTP, POP3 e IMAP: Email</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc; background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px;">Protocolo</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Porta</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Função</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>SMTP</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">25, 587, 465</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Enviar email</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>POP3</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">110, 995</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Baixar e remover</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>IMAP</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">143, 993</td>
    <td style="border: 1px solid #ccc; padding: 8px;">Sincronizar (recomendado)</td>
  </tr>
</table>

<p><strong>POP3:</strong> Baixa email e remove do servidor (bom para 1 dispositivo)</p>
<p><strong>IMAP:</strong> Sincroniza, mantém no servidor (múltiplos dispositivos)</p>

<h2 style="color: #0066cc;">Request/Response HTTP Prático</h2>
<pre><code>REQUEST:
GET /usuarios HTTP/1.1
Host: api.example.com
Content-Type: application/json

RESPONSE:
HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "nome": "João"},
  {"id": 2, "nome": "Maria"}
]</code></pre>

<h2 style="color: #0066cc;">Resumo</h2>
<p>HTTP transporta páginas, HTTPS as criptografa. FTP/SFTP transferem arquivos. SMTP envia email, POP3/IMAP recebem. Portas identificam serviços.</p>`,
    ordem: 4,
  },
  {
    titulo: 'Segurança de Rede',
    slug: 'seguranca-rede',
    descricao: 'Firewalls, criptografia, ataques comuns e defesa',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender firewalls e sua configuração</li>
  <li>Reconhecer ataques comuns na rede</li>
  <li>Implementar práticas de segurança básica</li>
</ul>

<h2 style="color: #0066cc;">Firewalls</h2>
<p>Firewall filtra tráfego de rede, bloqueando ou liberando pacotes.</p>

<h3>Tipos de Firewall</h3>
<ul>
  <li><strong>Firewall de Rede:</strong> Protege rede inteira (roteador)</li>
  <li><strong>Firewall de Host:</strong> Protege um computador (Windows Defender, ufw)</li>
  <li><strong>Firewall Stateful:</strong> Lembra conexões anteriores</li>
  <li><strong>Firewall Stateless:</strong> Analisa cada pacote isoladamente</li>
</ul>

<h3>Configuração Básica</h3>
<pre><code>Bloquear tudo por padrão, permitir apenas serviços necessários:

Permiti:
- Porta 80 (HTTP)
- Porta 443 (HTTPS)
- Porta 22 (SSH) de IPs específicos

Bloquear:
- Tudo mais</code></pre>

<h2 style="color: #0066cc;">Ataques Comuns</h2>

<h3>DDoS (Distributed Denial of Service)</h3>
<p>Enviar tantos pacotes que servidor cai.</p>
<p><strong>Defesa:</strong> Limitar taxa de requisições, usar CDN, serviço de mitigação</p>

<h3>Man-in-the-Middle (MITM)</h3>
<p>Interceptar comunicação entre dois pontos.</p>
<p><strong>Defesa:</strong> Usar HTTPS (criptografia), verificar certificados</p>

<h3>Spoofing</h3>
<p>Falsificar IP de origem.</p>
<p><strong>Defesa:</strong> Filtrar IPs privados (RFC1918), validar origem</p>

<h3>Scanning de Porta</h3>
<p>Verificar quais portas estão abertas (reconhecimento de ataque).</p>
<p><strong>Defesa:</strong> Fechar portas desnecessárias, usar IDS/IPS</p>

<h2 style="color: #0066cc;">Criptografia</h2>
<p><strong>Simétrica:</strong> Mesma chave para criptografar/descriptografar (rápida, mas chave pode ser roubada)</p>
<p><strong>Assimétrica:</strong> Chave pública/privada (lenta, mas mais segura). Usado em HTTPS.</p>

<pre><code>HTTPS usa:
1. Assimétrica para trocar chaves (hello, certificado)
2. Simétrica para dados (mais rápido)</code></pre>

<h2 style="color: #0066cc;">VPN: Rede Privada Virtual</h2>
<p>Encapsula tráfego e roteia via servidor VPN remoto.</p>
<ul>
  <li>Criptografa dados</li>
  <li>Oculta IP real (aparece como IP do servidor VPN)</li>
  <li>Útil em WiFi público</li>
</ul>

<h2 style="color: #0066cc;">Autenticação 802.1X</h2>
<p>Autenticação para acesso a rede (ex: WiFi corporativa).</p>
<ul>
  <li>Usuário entra com login/senha ou certificado</li>
  <li>Servidor RADIUS valida</li>
  <li>Se OK, dispositivo ganha acesso</li>
</ul>

<h2 style="color: #0066cc;">Checklist de Segurança</h2>
<ul>
  <li>Firewall ligado e configurado</li>
  <li>Portas desnecessárias fechadas</li>
  <li>HTTPS em vez de HTTP</li>
  <li>Senhas fortes (mínimo 12 caracteres)</li>
  <li>Atualizações de segurança aplicadas</li>
  <li>Monitoramento de tráfego</li>
  <li>Backup regularmente</li>
</ul>

<h2 style="color: #0066cc;">Resumo</h2>
<p>Firewalls filtram tráfego. Criptografia protege dados. Ataques comuns: DDoS, MITM, spoofing. Use HTTPS, VPN em WiFi público, feche portas desnecessárias.</p>`,
    ordem: 5,
  },
  {
    titulo: 'Redes Wireless e Administração',
    slug: 'wireless-administracao',
    descricao: 'WiFi, segurança wireless e administração básica de redes',
    conteudo: `<h2 style="color: #0066cc;">Objetivo de Aprendizagem</h2>
<p>Ao fim desta aula você será capaz de:</p>
<ul>
  <li>Entender tecnologias wireless (802.11)</li>
  <li>Configurar WiFi com segurança</li>
  <li>Administrar redes básicas</li>
</ul>

<h2 style="color: #0066cc;">Padrões WiFi 802.11</h2>
<table style="border-collapse: collapse; width: 100%;">
  <tr style="border: 1px solid #ccc; background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px;">Padrão</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Frequência</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Velocidade Máxima</th>
    <th style="border: 1px solid #ccc; padding: 8px;">Alcance</th>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>802.11g</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">2.4 GHz</td>
    <td style="border: 1px solid #ccc; padding: 8px;">54 Mbps</td>
    <td style="border: 1px solid #ccc; padding: 8px;">~30m (obsoleto)</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>802.11n</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">2.4/5 GHz</td>
    <td style="border: 1px solid #ccc; padding: 8px;">300 Mbps</td>
    <td style="border: 1px solid #ccc; padding: 8px;">~40m</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>802.11ac</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">5 GHz</td>
    <td style="border: 1px solid #ccc; padding: 8px;">1.3 Gbps</td>
    <td style="border: 1px solid #ccc; padding: 8px;">~30m</td>
  </tr>
  <tr style="border: 1px solid #ccc;">
    <td style="border: 1px solid #ccc; padding: 8px;"><strong>802.11ax (Wi-Fi 6)</strong></td>
    <td style="border: 1px solid #ccc; padding: 8px;">2.4/5/6 GHz</td>
    <td style="border: 1px solid #ccc; padding: 8px;">9.6 Gbps</td>
    <td style="border: 1px solid #ccc; padding: 8px;">~40m (ATUAL)</td>
  </tr>
</table>

<h2 style="color: #0066cc;">Segurança WiFi</h2>

<h3>WEP (Obsoleto)</h3>
<p>Fraco, quebrado em minutos. NUNCA use.</p>

<h3>WPA/WPA2</h3>
<p>Mais seguro. WPA2 é padrão atual.</p>

<h3>WPA3 (Mais Recente)</h3>
<p>Criptografia mais forte, resistência a brute-force.</p>

<h2 style="color: #0066cc;">Configurar WiFi Seguro</h2>
<pre><code>1. Conectar ao roteador (admin padrão: 192.168.1.1)
2. Mudar senha do admin
3. Ativar WPA3 (ou WPA2 se não houver)
4. Definir SSID (nome da rede) único
5. Senha forte (mínimo 12 caracteres, letras+números+símbolos)
6. Desabilitar WPS (vulnerável)
7. Esconder broadcast SSID (opcional, aumenta segurança)</code></pre>

<h2 style="color: #0066cc;">Ferramentas de Administração de Rede</h2>

<h3>Linha de Comando</h3>
<ul>
  <li><strong>ipconfig / ifconfig:</strong> Ver configuração de rede</li>
  <li><strong>ping:</strong> Testar conectividade</li>
  <li><strong>tracert / traceroute:</strong> Ver caminho do pacote</li>
  <li><strong>netstat:</strong> Ver conexões ativas</li>
  <li><strong>nslookup / dig:</strong> Consultar DNS</li>
  <li><strong>nmap:</strong> Scan de porta</li>
</ul>

<h3>Ferramentas Gráficas</h3>
<ul>
  <li><strong>Wireshark:</strong> Analisador de tráfego</li>
  <li><strong>Nagios/Zabbix:</strong> Monitoramento</li>
  <li><strong>Cisco Packet Tracer:</strong> Simulador de redes</li>
</ul>

<h2 style="color: #0066cc;">Monitoramento de Rede</h2>
<ul>
  <li>Verificar uso de banda passante</li>
  <li>Monitorar latência</li>
  <li>Alertas de desempenho</li>
  <li>Log de acessos</li>
  <li>Detecção de anomalias</li>
</ul>

<h2 style="color: #0066cc;">Backup de Configuração</h2>
<p>Sempre fazer backup da configuração do roteador:</p>
<ul>
  <li>Acessar interface web do roteador</li>
  <li>Procurar "Backup" ou "System"</li>
  <li>Salvar arquivo de configuração localmente</li>
  <li>Em caso de problema, restaurar do backup</li>
</ul>

<h2 style="color: #0066cc;">Resumo</h2>
<p>WiFi 6 (802.11ax) é atual. Sempre use WPA3 ou WPA2 com senha forte. Monitore rede com ferramentas de diagnóstico. Faça backup de configuração.</p>`,
    ordem: 6,
  },
];

const desafiosRedes = [
  {
    titulo: 'Identificar Camadas OSI',
    enunciado: 'Dado um cenário (ex: "usuário acessa site"), identifique qual camada OSI está envolvida e cite exemplos de protocolos/equipamentos em cada.',
    tipo: 'quiz',
    gabarito: 'Camada 1 (física): cabos. Camada 2 (enlace): switches, MAC. Camada 3 (rede): IP, roteador. Camada 7 (aplicação): HTTP.',
    ordem: 1,
    aula_index: 0,
  },
  {
    titulo: 'Diferença TCP e UDP',
    enunciado: 'Explique em que situações usar TCP e em quais usar UDP. Dê exemplos reais (aplicações que usam cada um).',
    tipo: 'dissertativo',
    gabarito: 'TCP: Email, WWW (confiabilidade importa). UDP: Vídeo, VoIP (velocidade importa mais que perfeição).',
    ordem: 2,
    aula_index: 1,
  },
  {
    titulo: 'Calcular Sub-redes',
    enunciado: 'Dada rede 192.168.0.0/24, divida em 4 sub-redes. Para cada uma, informe: faixa de IPs, primeiro dispositivo, último dispositivo e broadcast.',
    tipo: 'pratico',
    gabarito: '/26 em cada: 192.168.0.0-63, 64-127, 128-191, 192-255. Broadcasts: .63, .127, .191, .255.',
    ordem: 3,
    aula_index: 2,
  },
  {
    titulo: 'Protocolos e Portas',
    enunciado: 'Liste 8 protocolos diferentes (HTTP, HTTPS, SSH, FTP, DNS, SMTP, IMAP, ICMP) e suas portas. Classifique em camadas OSI.',
    tipo: 'quiz',
    gabarito: 'HTTP:80 (camada 7), HTTPS:443 (7), SSH:22 (7), DNS:53 (7), TCP/UDP são camada 4, IP é camada 3.',
    ordem: 4,
    aula_index: 3,
  },
  {
    titulo: 'Ataques e Defesa',
    enunciado: 'Descreva 3 ataques de rede (DDoS, MITM, spoofing) e a defesa correspondente para cada um.',
    tipo: 'dissertativo',
    gabarito: 'DDoS > limitar taxa. MITM > HTTPS. Spoofing > filtrar IPs privados, validar origem.',
    ordem: 5,
    aula_index: 4,
  },
  {
    titulo: 'Configurar WiFi Seguro',
    enunciado: 'Liste passos para configurar rede WiFi de forma segura. O que NÃO fazer? Qual padrão de criptografia usar?',
    tipo: 'pratico',
    gabarito: 'Mudar senha admin, ativar WPA3, senha forte, desabilitar WPS, não usar WEP.',
    ordem: 6,
    aula_index: 5,
  },
];

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function inserirCurso() {
  try {
    console.log('🚀 Inserindo Curso Redes de Computadores...\n');

    // 1. Inserir curso
    console.log('📚 Inserindo curso...');
    const { data: curso, error: eroCurso } = await supabase
      .from('cursos')
      .insert([cursoRedes])
      .select();

    if (eroCurso) throw new Error(`Erro ao inserir curso: ${eroCurso.message}`);
    const cursoId = curso[0].id;
    console.log(`✅ Curso inserido com ID: ${cursoId}\n`);

    // 2. Inserir aulas
    console.log('📖 Inserindo aulas...');
    const aulasComCursoId = aulasRedes.map((aula) => ({
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
    const desafiosComIds = desafiosRedes.map((desafio) => ({
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
    console.log('✅ CURSO REDES INSERIDO COM SUCESSO!');
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
