# SPIRITO & VERITÀ — V10.6.5

Questa revisione aggiorna esclusivamente la documentazione di verifica e il passaggio operativo GitHub/EAS. La versione applicativa resta **1.0.42**: non sono state introdotte nuove funzioni nell'app.

## Verifiche eseguite in questa sessione

- `unzip -t` sul pacchetto V10.6.4: archivio integro.
- `npm run test:all`: **199 test superati, 0 falliti**.
- `npm run check:github-publish`: **2/7** controlli soddisfatti. Git disponibile e nessun file sensibile comune rilevato; repository Git, autenticazione, remote e lockfile non configurati.
- `npm run check:handoff`: **9/11** controlli superati. Mancano il vero Project ID EAS e `package-lock.json`.
- Tentativo di generazione lockfile con un solo tentativo e timeout locale di 45 secondi: terminato per timeout; nessun `package-lock.json` è stato prodotto o considerato valido.

## Passaggio necessario

Caricare il contenuto di questo archivio nella radice di un repository GitHub privato. Poi aprire **Actions → Generate and validate npm lockfile → Run workflow**. Il workflow genera il lockfile, esegue `npm ci`, test, TypeScript ed Expo Doctor, quindi apre una pull request da revisionare.

Dopo il merge della pull request, configurare il vero Project ID EAS e il secret `EXPO_TOKEN` nelle impostazioni GitHub Actions. Non inserire token nel codice o nei file `.env` committati.

## Limiti della verifica

Questi risultati non certificano una build nativa, un APK installabile, il funzionamento SQLCipher su dispositivo reale, né la pubblicazione sugli store. Non sono stati usati account GitHub o Expo in questa sessione.
