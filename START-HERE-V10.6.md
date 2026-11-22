# SPIRITO & VERITÀ V10.6 — Inizia da qui

Versione app: **1.0.42**.

Questa versione non è un APK: prepara il passaggio operativo a GitHub ed Expo e aggiunge un preflight locale non distruttivo.

## 1. Prima di caricare

- Estrai lo ZIP. Carica su GitHub il contenuto della cartella `spirito_verita_v10_6` (non la cartella contenitore).
- Crea un repository **Private** su GitHub. Puoi usare GitHub Desktop, GitHub CLI o il caricamento web.
- Non caricare `.env`, chiavi `.jks`/`.keystore`, file di credenziali o segreti. Il `.gitignore` esclude già `.env`, `node_modules`, `.expo` e keystore comuni; controlla comunque manualmente i file.

## 2. Controllo locale (facoltativo)

Dalla cartella del progetto, esegui:

```bash
npm run check:github-publish
```

Il controllo verifica Git/GitHub CLI, autenticazione, remote, lockfile e file sensibili comuni. È informativo: non crea repository, non carica file e non gestisce credenziali. Puoi usare GitHub Desktop anche se GitHub CLI non è installata.

## 3. Generare il lockfile su GitHub

1. Apri il repository e la scheda **Actions**.
2. Se GitHub lo richiede, abilita i workflow.
3. Seleziona **Generate and validate npm lockfile** e premi **Run workflow**.
4. Attendi il completamento di `npm ci`, test, TypeScript ed Expo Doctor.
5. Se il workflow apre una pull request, controllala e integrala solo se tutti i controlli sono verdi.

## 4. Collegare Expo EAS

1. Accedi al tuo account Expo e crea/seleziona il progetto corretto.
2. Dalla cartella del progetto, esegui `npx eas-cli init` e segui la procedura. Usa il Project ID assegnato da Expo; non inventarne uno.
3. Crea un token dal tuo account Expo.
4. In GitHub vai a **Settings → Secrets and variables → Actions → New repository secret**. Nome: `EXPO_TOKEN`; valore: il token Expo.
5. Non inviare il token in chat, non inserirlo nel codice e non committarlo.

## 5. Avviare la build APK

Dopo aver integrato il lockfile e collegato EAS, apri **Actions → Android preview build → Run workflow**. Il workflow esegue i controlli, genera il progetto nativo e invia la build ad EAS. L'APK sarà disponibile nella pagina della build EAS solo se la compilazione termina con successo.

## 6. Cosa resta da collaudare

- installazione dell'APK su un dispositivo Android reale;
- apertura/chiusura database SQLCipher, persistenza e migrazione;
- recupero in caso di perdita della chiave SecureStore;
- backup cifrato e ripristino su un secondo dispositivo;
- permessi, notifiche e comportamento offline.

I test locali non sostituiscono la build EAS e il collaudo su dispositivo.
