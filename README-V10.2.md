# SPIRITO & VERITÀ V10.2

Versione applicativa: **1.0.38**.

## Modifica principale

Il profilo EAS `preview` Android dichiara esplicitamente `android.buildType: "apk"` insieme a `distribution: "internal"`. L'obiettivo è ottenere un APK installabile per il collaudo interno, invece di lasciare implicito il formato dell'artefatto.

Il controllo `npm run check:release-config` ora blocca la configurazione se il profilo preview non specifica l'APK.

## Collegamento iniziale a EAS (da eseguire dal proprietario del progetto)

1. Pubblicare il contenuto di questo archivio in un repository GitHub privato o pubblico controllato dal proprietario.
2. Sul computer di sviluppo, installare le dipendenze quando la rete è disponibile: `npm ci` (richiede un `package-lock.json` validato; prima eseguire il workflow **Generate and validate npm lockfile** se ancora assente).
3. Eseguire `npx eas-cli@latest login` e poi `npx eas-cli@latest init` dalla radice del progetto. Confermare il progetto corretto e lasciare che EAS scriva il vero `extra.eas.projectId` in `app.json`.
4. Creare un token da Expo e aggiungerlo in GitHub → Settings → Secrets and variables → Actions → New repository secret, nome `EXPO_TOKEN`. Non inserirlo in `app.json`, file `.env` committati, workflow o chat.
5. Avviare manualmente **Repository readiness report**. Correggere i controlli mancanti.
6. Quando lockfile, `npm ci`, TypeScript, Expo Doctor e Project ID sono validi, avviare **Android preview build**. Il risultato atteso è un APK interno EAS; scaricarlo dagli artefatti della build e installarlo su un dispositivo di test.

## Stato di verifica di questa consegna

- Test Node locali: eseguiti con esito riportato nella consegna.
- Configurazione del profilo APK: controllata da test automatico e preflight.
- `npm ci`, TypeScript, Expo Doctor, EAS cloud build e installazione su dispositivo: **non eseguiti in questa sessione**.
- La presenza di `useSQLCipher: true` nella configurazione non dimostra da sola che SQLCipher sia attivo nella build nativa. Serve un test sul dispositivo, inclusa la verifica di `PRAGMA cipher_version` e del comportamento con chiave errata.

Nessun Project ID o token è stato inventato o inserito nel progetto.
