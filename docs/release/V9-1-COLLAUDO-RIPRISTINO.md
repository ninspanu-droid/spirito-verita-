# V9.1 — Collaudo del ripristino del Diario

Versione app: `1.0.27`.

## Modifiche

- Il repository applica anche durante il ripristino i limiti coerenti con l'interfaccia: titolo massimo 120 caratteri e corpo massimo 20.000 caratteri.
- Aggiunta una suite Node d'integrazione con database SQLite simulato per esercitare il percorso del repository senza dispositivo.
- I test coprono ripristino valido, archivio già popolato, ID duplicati, campi fuori limite, date non valide, interruzione di INSERT con rollback e ricontrollo dell'archivio vuoto dentro la transazione.
- Versione sincronizzata a `1.0.27`.

## Test eseguiti

```bash
npm run test:all
```

Questi test esercitano il repository con un database simulato e cifratura sostituita da uno stub. Non verificano AES-GCM/PBKDF2 reali, Expo SQLite nativo, SQLCipher o file picker su Android/iOS.

## Collaudo dispositivo ancora necessario

1. Creare un backup reale da Android.
2. Importarlo in una installazione pulita Android con chiave locale nuova.
3. Confrontare numero, ID, tipo, titolo, corpo e date delle annotazioni.
4. Ripetere su iOS.
5. Interrompere volontariamente il ripristino e verificare rollback sul database reale.
6. Provare passphrase errata, file alterato, file vuoto, file oltre 20 MB e archivio locale non vuoto.

Nessuna build nativa o prova fisica viene dichiarata in questa versione.
