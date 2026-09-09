#!/usr/bin/env bash
# Publica a escola no VPS. Roda AQUI, no servidor, de dentro de /srv/escola/src:
#
#   bash deploy/deploy.sh
#
# O código vem do GitHub por `git pull` (foi a forma escolhida): a fonte da
# verdade é o repositório, não este disco nem o desktop. Rollback é voltar para
# um commit anterior e rodar de novo.
#
# Modelado no deploy/deploy.sh do casabrisa, que já roda neste servidor —
# inclusive a checagem de segredo no bundle e o rollback automático.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
APP=/srv/escola/app
PORTA=3004
SERVICO=escola

cd "$SRC"

# --------------------------------------------------------------- pré-checagem
if [ ! -f .env ]; then
  echo "ERRO: crie $SRC/.env com as variáveis de produção." >&2
  echo "      Precisa de: DATABASE_URL, UPLOAD_ROOT, RESEND_API_KEY," >&2
  echo "      RESEND_FROM_EMAIL. Opcional: AUTH_SESSION_DAYS." >&2
  exit 1
fi

# Os arquivos enviados pelo site vivem FORA do app: o deploy troca /srv/escola/app
# inteiro, e o que estivesse lá dentro se perderia.
UPLOADS="$(grep -m1 '^UPLOAD_ROOT=' .env | cut -d= -f2- | tr -d '"'"'"'')"
if [ -z "$UPLOADS" ]; then
  echo "ERRO: UPLOAD_ROOT não está no .env. Sem isso o próximo deploy apaga" >&2
  echo "      as fotos e os anexos enviados pelo site." >&2
  exit 1
fi
case "$UPLOADS" in
  "$APP"*) echo "ERRO: UPLOAD_ROOT ($UPLOADS) está dentro de $APP e seria apagado no deploy." >&2; exit 1 ;;
esac
mkdir -p "$UPLOADS"
chown -R escola: "$UPLOADS"

echo "== Trazendo o código do GitHub =="
git pull --ff-only
echo "   commit: $(git log --oneline -1)"

echo "== Instalando dependências e buildando =="
# `npm ci` puro era morto pelo OOM killer aqui. Não é folga de disco: este VPS
# tem 3,8 G de RAM dividida entre seis servidores Next, o Docker do CRM e o
# MariaDB, e a swap vive cheia. O `npm ci` apaga o node_modules ANTES de
# instalar, então o kill deixava a árvore pela metade e o build seguinte nem
# começava — foi preciso reinstalar à mão duas vezes para descobrir isso.
#
# `--maxsockets 2` é o que resolve: o pico vem da extração em paralelo, não do
# tamanho da árvore. Custa ~3 min em vez de ~1, e termina.
npm ci --no-audit --no-fund --maxsockets 2
npx prisma generate
npm run build

echo "== Checando segredo vazado no bundle do cliente =="
# A senha do banco nunca pode aparecer no JavaScript que vai para o navegador.
SENHA_BANCO="$(grep -m1 '^DATABASE_URL=' .env | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')"
if [ -n "$SENHA_BANCO" ] && grep -rIq -- "$SENHA_BANCO" .next/static; then
  echo "ERRO: a senha do banco apareceu no bundle do cliente. Deploy abortado." >&2
  exit 1
fi

echo "== Publicando =="
rm -rf "$APP.nova"
cp -r .next/standalone "$APP.nova"
cp -r .next/static "$APP.nova/.next/static"
cp -r public "$APP.nova/public"
cp .env "$APP.nova/.env"
chown -R escola: "$APP.nova"

if [ -d "$APP" ]; then rm -rf "$APP.antiga"; mv "$APP" "$APP.antiga"; fi
mv "$APP.nova" "$APP"

systemctl restart "$SERVICO"
sleep 3

# ------------------------------------------------------------------ conferência
# Vale a resposta HTTP, não o "active" do systemd: o serviço pode subir e a
# aplicação estar quebrada (banco fora, variável faltando).
if curl -fsS -o /dev/null --max-time 20 "http://127.0.0.1:$PORTA/"; then
  echo "OK: no ar em $PORTA. Limpando a versão anterior."
  rm -rf "$APP.antiga"
else
  echo "FALHA: não respondeu. Voltando para a versão anterior." >&2
  if [ -d "$APP.antiga" ]; then
    rm -rf "$APP"
    mv "$APP.antiga" "$APP"
    systemctl restart "$SERVICO"
    echo "Versão anterior restaurada." >&2
  else
    echo "Não havia versão anterior para restaurar — este era o primeiro deploy." >&2
  fi
  exit 1
fi
