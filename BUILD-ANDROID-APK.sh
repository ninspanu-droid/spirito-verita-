#!/usr/bin/env bash
set -Eeuo pipefail

# SPIRITO & VERITÀ — preparazione e build APK Android (EAS Preview)
# Eseguire dalla cartella principale del progetto su un computer con Internet.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

command -v node >/dev/null 2>&1 || { echo "ERRORE: Node.js non trovato."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERRORE: npm non trovato."; exit 1; }

printf '\n== 1/7 — Generazione lockfile e installazione dipendenze ==\n'
npm install --no-audit --no-fund
npm run verify:lockfile

printf '\n== 2/7 — Accesso Expo ==\n'
npx eas-cli@latest login
npx eas-cli@latest whoami

printf '\n== 3/7 — Collegamento progetto EAS ==\n'
if ! node scripts/check-eas-project.cjs; then
  npx eas-cli@latest init
fi
node scripts/check-eas-project.cjs

printf '\n== 4/7 — Installazione riproducibile ==\n'
npm ci --no-audit --no-fund

printf '\n== 5/7 — Test e TypeScript ==\n'
npm run test:all
npm run typecheck

printf '\n== 6/7 — Controlli configurazione e build ==\n'
npm run check:app-identifiers
npm run check:release-config
npm run check:release-readiness

printf '\n== 7/7 — Build APK Android su EAS ==\n'
npx eas-cli@latest build --platform android --profile preview

printf '\nRichiesta build inviata. Segui il link EAS mostrato sopra per monitorare e scaricare l’APK quando la build termina con successo.\n'
