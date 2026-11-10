#!/usr/bin/env bash
# Backup diário da escola: banco escola_jb + arquivos enviados pelo site.
#
# - Banco: mysqldump --single-transaction, gzip. 14 diários + 1 por mês por 13 meses.
#   O arquivo nasce .tmp e só vira definitivo depois de conferido (gzip íntegro e
#   cabeçalho do mysqldump). Permissão 600: tem nome, e-mail e matrícula de alunos.
# - Fora do VPS (Google Drive):
#   * banco + pasta PRIVADA (termos com CPF, áudios do podcast com voz de menor)
#     vão CRIPTOGRAFADOS pelo remoto rclone "escola-cripto:" (crypt sobre
#     gdrive:EscolaJB-cripto). Senhas em /root/.escola-backup-cripto: sem elas o
#     backup não abre. Guarde uma cópia fora do servidor.
#   * UPLOAD_ROOT (fotos, capas, PDFs que o site já mostra em público) vai em
#     claro para gdrive:EscolaJB-backups/uploads.
#   Cópia incremental: não duplica no disco do VPS (88% cheio em 2026-11-10).
#   Os termos (pequenos) também ganham um tar local junto do dump; os áudios não.
#
# Instalação no VPS:
#   install -m 750 deploy/backup.sh /usr/local/bin/escola-backup.sh
#   cron: 5 4 * * * /usr/local/bin/escola-backup.sh >> /var/log/escola-backup.log 2>&1
set -euo pipefail

DESTINO=${DESTINO_BACKUP:-/var/backups/escola}
BANCO=${BANCO:-escola_jb}
REMOTO=${REMOTO_BACKUP:-gdrive:EscolaJB-backups}
CRIPTO=${REMOTO_CRIPTO:-escola-cripto:}
UPLOADS=${DIR_UPLOADS:-/var/www/escola/data/uploads}
PRIVADO=${DIR_PRIVADO:-/var/www/escola/data/privado}
DIA=$(date +%F)
MES=$(date +%Y-%m)

umask 077
mkdir -p "$DESTINO/diario" "$DESTINO/mensal"
chmod 700 "$DESTINO" "$DESTINO/diario" "$DESTINO/mensal"

ARQUIVO="$DESTINO/diario/${BANCO}-${DIA}.sql.gz"
mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 "$BANCO" | gzip -6 > "${ARQUIVO}.tmp"
# head corta o zcat no meio (SIGPIPE); com pipefail isso daria falso negativo.
CABECALHO=$(zcat "${ARQUIVO}.tmp" 2>/dev/null | head -c 400 || true)
if ! gzip -t "${ARQUIVO}.tmp" 2>/dev/null || ! grep -q "MariaDB dump\|MySQL dump" <<< "$CABECALHO"; then
  rm -f "${ARQUIVO}.tmp"
  echo "$(date -Is) FALHOU: dump corrompido ou sem cabeçalho do mysqldump." >&2
  exit 1
fi
mv "${ARQUIVO}.tmp" "$ARQUIVO"

PRIV="$DESTINO/diario/privado-${DIA}.tar.gz"
if [ -d "$PRIVADO" ]; then
  tar -czf "${PRIV}.tmp" --exclude='podcast-audios' -C "$(dirname "$PRIVADO")" "$(basename "$PRIVADO")"
  mv "${PRIV}.tmp" "$PRIV"
fi

if [ ! -f "$DESTINO/mensal/${BANCO}-${MES}.sql.gz" ]; then
  cp "$ARQUIVO" "$DESTINO/mensal/${BANCO}-${MES}.sql.gz"
  [ -f "$PRIV" ] && cp "$PRIV" "$DESTINO/mensal/privado-${MES}.tar.gz"
fi

find "$DESTINO/diario" -type f -mtime +14 -delete
find "$DESTINO/mensal" -type f -mtime +400 -delete

# Cópia fora do VPS. Falha aqui não apaga o backup local, só avisa no log.
if command -v rclone >/dev/null && rclone listremotes | grep -qx "${CRIPTO%%:*}:" && rclone listremotes | grep -qx "${REMOTO%%:*}:"; then
  if rclone sync "$DESTINO" "${CRIPTO}banco" --quiet \
     && { [ ! -d "$PRIVADO" ] || rclone copy "$PRIVADO" "${CRIPTO}privado" --quiet; } \
     && rclone copy "$UPLOADS" "$REMOTO/uploads" --quiet; then REMOTA="ok"; else REMOTA="FALHOU"; fi
else
  REMOTA="sem rclone/remoto (nada saiu do VPS)"
fi

echo "$(date -Is) ok ${BANCO}-${DIA}.sql.gz $(stat -c %s "$ARQUIVO") bytes; $(ls -1 "$DESTINO/diario"/*.sql.gz | wc -l) diários, $(ls -1 "$DESTINO/mensal"/*.sql.gz | wc -l) mensais; cópia remota: $REMOTA"
