# SPIRITO & VERITÀ V10.1

Versione app: **1.0.37**.

Questa versione rende più precisa la diagnosi del repository: oltre a verificare il lockfile, il Project ID EAS e il secret `EXPO_TOKEN`, il report prova a risolvere singolarmente i moduli runtime essenziali (Expo, SQLite, SecureStore, Expo Crypto, Noble e base64-js) e controlla la presenza delle CLI locali Expo ed EAS. Non considera sufficiente la sola esistenza della cartella `node_modules`.

Comando: `npm run check:repository-readiness`. Per bloccare il processo quando mancano prerequisiti: `node scripts/check-repository-readiness.cjs --strict`. Per salvare un report JSON: impostare `READINESS_REPORT_PATH`.

La diagnosi è read-only: non installa pacchetti, non genera credenziali e non avvia build. In questa consegna non è stato generato un `package-lock.json`, non è stato eseguito `npm ci`, TypeScript, Expo Doctor o una build nativa. I test Node verificano la logica del report, non l'ambiente Expo nativo.
