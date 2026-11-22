# V9.5 — Preflight Android locale

La V9.5 aggiunge `npm run check:android-local`, un comando aggregato e di sola lettura. Esegue in sequenza i controlli già presenti per lockfile riproducibile, export crittografici installati, prerequisiti nativi Android e identificatori dell'app. Riporta tutti i blocchi in un unico riepilogo e restituisce codice di uscita diverso da zero se almeno un controllo fallisce.

Il comando non installa pacchetti, non genera lockfile, non avvia prebuild e non avvia build EAS. È intenzionalmente fail-closed: non sostituisce prerequisiti mancanti con valori ipotetici.

## Stato di questa consegna

- Suite `npm run test:all`: eseguita sulla copia sorgente prima delle modifiche V9.5; i 143 test della V9.4 sono risultati superati.
- Dopo le modifiche V9.5 è necessario ripetere la suite; il risultato è riportato nel riepilogo della consegna.
- `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`: tentativo eseguito, terminato per timeout dopo 120 secondi.
- Di conseguenza non sono disponibili `package-lock.json` e `node_modules`; non è possibile dichiarare verificati gli export Noble nell'installazione reale, eseguire `tsc`, `expo prebuild` o una build Android.

## Passi per chi dispone dell'ambiente di build

1. Eseguire `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` con accesso al registry npm.
2. Eseguire `npm run verify:lockfile` e `npm run check:reproducible-install`.
3. Eseguire `npm ci --no-audit --no-fund`.
4. Eseguire `npm run check:android-local`, `npm run test:ci` e `npx expo-doctor`.
5. Solo dopo i controlli, eseguire `npx expo prebuild --platform android` e una build custom; collaudare SQLCipher e il ripristino su dispositivo/emulatore.

Il workflow GitHub Actions `Generate and validate npm lockfile` rimane il percorso automatizzato previsto per generare e validare il lockfile e aprire una pull request, senza scrivere direttamente sul branch principale.
